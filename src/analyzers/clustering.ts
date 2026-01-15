/**
 * Clustering and burstiness analysis
 * Detects patterns of variation vs uniformity in writing
 * 
 * CRITICAL for AI detection avoidance:
 * - AI writes with UNIFORM distribution (avoiding extremes)
 * - Humans write in BURSTS (clusters of similar length, then dramatic shifts)
 * - Burstiness coefficient is key metric
 */

import {
  burstiness,
  detectClusters,
  Cluster,
  entropy,
  categorizedDistribution,
  DistributionBucket
} from '../utils/advanced-statistics.js';
import { mean, standardDeviation } from '../utils/statistics.js';

export interface ClusteringAnalysis {
  sentenceLengthClusters: {
    clusters: Cluster[];
    avgClusterSize: number;
    burstiness: number; // -1 (uniform) to +1 (extremely bursty)
    distribution: DistributionBucket<string>[];
    guidance: string;
  };
  paragraphOpenings: {
    types: Record<string, number>;
    entropy: number;
    examples: Record<string, string[]>;
    guidance: string;
  };
  lengthVariation: {
    mean: number;
    stdDev: number;
    coefficientOfVariation: number;
    guidance: string;
  };
}

/**
 * Analyze clustering patterns in writing
 */
export function analyzeClusteringPatterns(text: string): ClusteringAnalysis {
  // Split into sentences and paragraphs
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // Sentence length clustering
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const lengthClusters = analyzeSentenceLengthClusters(sentences, sentenceLengths);
  
  // Paragraph opening analysis
  const openings = analyzeParagraphOpenings(paragraphs);
  
  // Length variation statistics
  const variation = analyzeLengthVariation(sentenceLengths);
  
  return {
    sentenceLengthClusters: lengthClusters,
    paragraphOpenings: openings,
    lengthVariation: variation
  };
}

/**
 * Analyze sentence length clustering (THE KEY METRIC)
 */
function analyzeSentenceLengthClusters(sentences: string[], lengths: number[]) {
  // Detect clusters of similar-length sentences
  const clusters = detectClusters(lengths, 5, 2); // threshold=5 words, min size=2
  
  const avgClusterSize = clusters.length > 0
    ? clusters.reduce((sum, c) => sum + c.size, 0) / clusters.length
    : 0;
  
  // Calculate burstiness coefficient
  const burstCoeff = burstiness(lengths);
  
  // Distribution across length categories with examples
  const itemsWithLengths = sentences.map((s, i) => ({
    value: lengths[i],
    item: s.substring(0, 80) // First 80 chars as example
  }));
  
  const distribution = categorizedDistribution(
    itemsWithLengths,
    [
      { min: 0, max: 8, label: 'Very Short (1-7)' },
      { min: 8, max: 15, label: 'Short (8-14)' },
      { min: 15, max: 25, label: 'Medium (15-24)' },
      { min: 25, max: 40, label: 'Long (25-39)' },
      { min: 40, max: Infinity, label: 'Very Long (40+)' }
    ],
    3 // max examples per bucket
  );
  
  return {
    clusters,
    avgClusterSize,
    burstiness: burstCoeff,
    distribution,
    guidance: generateClusteringGuidance(burstCoeff, clusters.length, lengths.length)
  };
}

/**
 * Analyze paragraph opening patterns
 */
function analyzeParagraphOpenings(paragraphs: string[]) {
  const openingTypes: Record<string, number> = {};
  const examples: Record<string, string[]> = {};
  
  for (const para of paragraphs) {
    const firstSentence = para.split(/[.!?]/)[0].trim();
    if (!firstSentence) continue;
    
    const type = classifyOpening(firstSentence);
    
    openingTypes[type] = (openingTypes[type] || 0) + 1;
    
    if (!examples[type]) examples[type] = [];
    if (examples[type].length < 5) {
      examples[type].push(firstSentence.substring(0, 100));
    }
  }
  
  // Calculate entropy (diversity of opening types)
  const types = Object.keys(openingTypes).flatMap(type =>
    Array(openingTypes[type]).fill(type)
  );
  const ent = entropy(types);
  
  return {
    types: openingTypes,
    entropy: ent,
    examples,
    guidance: generateOpeningGuidance(ent, openingTypes)
  };
}

/**
 * Classify paragraph opening type
 */
function classifyOpening(sentence: string): string {
  const lower = sentence.toLowerCase();
  
  if (lower.includes('?')) return 'question';
  if (/^(but|and|or|so)\s/i.test(sentence)) return 'conjunction';
  if (/^(i|we|you)\s/i.test(sentence)) return 'personal';
  if (/^(the|a|this|that)\s/i.test(sentence)) return 'article';
  if (sentence.split(/\s+/).length <= 4) return 'fragment';
  
  return 'statement';
}

/**
 * Analyze length variation statistics
 */
function analyzeLengthVariation(lengths: number[]) {
  const avg = mean(lengths);
  const stdDev = standardDeviation(lengths);
  
  // Coefficient of variation: normalized measure of dispersion
  const coefficientOfVariation = avg > 0 ? stdDev / avg : 0;
  
  return {
    mean: avg,
    stdDev,
    coefficientOfVariation,
    guidance: generateVariationGuidance(coefficientOfVariation, stdDev)
  };
}

/**
 * Generate clustering guidance (CRITICAL)
 */
function generateClusteringGuidance(
  burstCoeff: number,
  clusterCount: number,
  totalSentences: number
): string {
  // Burstiness scale:
  // -1.0 to -0.3: Extremely uniform (AI-like)
  // -0.3 to 0.0: Somewhat uniform (still AI-like)
  // 0.0 to 0.3: Moderate variation (borderline)
  // 0.3 to 0.6: Good burstiness (human-like)
  // 0.6 to 1.0: High burstiness (very human)
  
  if (burstCoeff < -0.1) {
    return `❌ CRITICAL RISK: Burstiness ${burstCoeff.toFixed(2)} indicates UNIFORM distribution (AI pattern). 

This is the #1 detection signal. Writing shows consistent length with no clustering.

REQUIRED CHANGES:
- Write 2-3 consecutive SHORT sentences (8-12 words)
- Follow with 1-2 LONG sentences (25-40 words)
- Sprinkle in fragments (<5 words) for emphasis
- Never maintain same length for 4+ consecutive sentences

AVOID: Meeting the "average" repeatedly. Go deliberately HIGH and LOW.`;
  }
  
  if (burstCoeff < 0.2) {
    return `⚠️ MODERATE RISK: Burstiness ${burstCoeff.toFixed(2)} shows limited clustering.

Found ${clusterCount} clusters in ${totalSentences} sentences.

IMPROVEMENTS:
- Create more length clusters (bursts of 2-3 similar sentences)
- Follow clusters with dramatic length shifts
- Add occasional fragments and very long sentences
- Think in "short burst → long development → short punch" patterns`;
  }
  
  return `✅ SAFE: Burstiness ${burstCoeff.toFixed(2)} shows natural clustering (human pattern).

Found ${clusterCount} clusters. Writing exhibits natural length variation with clustering.

MAINTAIN:
- Continue burst patterns (groups of similar length)
- Keep dramatic shifts between clusters
- Preserve mix of fragments, short, and long sentences`;
}

/**
 * Generate opening guidance
 */
function generateOpeningGuidance(
  ent: number,
  types: Record<string, number>
): string {
  // Higher entropy = more diverse openings
  // AI tends toward low entropy (mostly "statement" openings)
  
  const totalOpenings = Object.values(types).reduce((sum, count) => sum + count, 0);
  const statementRatio = (types['statement'] || 0) / totalOpenings;
  
  if (ent < 1.5) {
    return `LOW DIVERSITY (entropy ${ent.toFixed(2)}): Paragraph openings are repetitive. AI typically over-uses standard statements.

VARY OPENINGS:
- Start with questions
- Use conjunctions (But, And, So)
- Begin with fragments
- Lead with personal statements (I, We)
- Mix article starts (The, A, This)`;
  }
  
  if (ent < 2.0) {
    return `MODERATE DIVERSITY (entropy ${ent.toFixed(2)}): Acceptable range but could vary more.`;
  }
  
  return `HIGH DIVERSITY (entropy ${ent.toFixed(2)}): Natural variety in paragraph openings. Strong human pattern.`;
}

/**
 * Generate variation guidance
 */
function generateVariationGuidance(
  coefficientOfVariation: number,
  stdDev: number
): string {
  // Coefficient of Variation benchmarks:
  // AI: typically 0.3-0.5 (limited variation)
  // Human: typically 0.7-1.2 (high variation)
  
  if (coefficientOfVariation < 0.5) {
    return `LOW VARIATION (CV ${coefficientOfVariation.toFixed(2)}): Length distribution is too tight. AI avoids extremes.

Standard deviation: ${stdDev.toFixed(1)} words.

INCREASE VARIATION:
- Use more very short sentences (<8 words)
- Use more very long sentences (>30 words)
- Aim for SD of 12+ words`;
  }
  
  if (coefficientOfVariation < 0.8) {
    return `MODERATE VARIATION (CV ${coefficientOfVariation.toFixed(2)}): Acceptable but could push extremes more.`;
  }
  
  return `HIGH VARIATION (CV ${coefficientOfVariation.toFixed(2)}): Strong natural variation. SD: ${stdDev.toFixed(1)} words.`;
}
