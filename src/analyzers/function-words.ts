/**
 * Function Word Analysis for Stylometric Fingerprinting
 * 
 * Extracts function word frequencies and calculates z-scores
 * against reference corpus for authorship attribution.
 */

import { 
  FUNCTION_WORDS, 
  GENERAL_ENGLISH_STATS,
  getFunctionWordMap,
  getFunctionWordsByTier,
  type FunctionWord 
} from '../reference/function-words.js';
import { zScore, interpretZScore, type ZScoreResult } from '../utils/zscore.js';

export interface FunctionWordFrequency {
  word: string;
  count: number;
  frequency: number;  // Per 1000 words
  category: string;
  tier: number;
  britishMarker: boolean;
}

export interface FunctionWordAnalysis {
  totalWords: number;
  functionWordCount: number;
  functionWordPercentage: number;
  frequencies: FunctionWordFrequency[];
  zScores: Record<string, ZScoreResult>;
  distinctive: FunctionWordFrequency[];  // High positive z-score
  avoided: FunctionWordFrequency[];      // High negative z-score
  britishMarkers: FunctionWordFrequency[];
  summary: {
    highlyDistinctive: number;  // z > 2.0
    distinctive: number;         // z > 1.0
    normal: number;              // -1.0 < z < 1.0
    avoided: number;             // z < -1.0
    highlyAvoided: number;       // z < -2.0
  };
}

/**
 * Extract function word frequencies from text
 */
function extractFunctionWordFrequencies(text: string): Map<string, number> {
  const frequencies = new Map<string, number>();
  const functionWordMap = getFunctionWordMap();
  
  // Tokenize (preserve case for now)
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  for (const word of words) {
    // Remove punctuation
    const clean = word.replace(/[^\w'-]/g, '');
    
    // Check if it's a function word
    if (functionWordMap.has(clean)) {
      frequencies.set(clean, (frequencies.get(clean) || 0) + 1);
    }
  }
  
  return frequencies;
}

/**
 * Analyze function word usage in corpus
 */
export function analyzeFunctionWords(text: string): FunctionWordAnalysis {
  // Get word counts
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  // Extract function word frequencies
  const rawFrequencies = extractFunctionWordFrequencies(text);
  const functionWordCount = Array.from(rawFrequencies.values())
    .reduce((sum, count) => sum + count, 0);
  
  // Convert to per-1000-word frequencies
  const frequencies: FunctionWordFrequency[] = [];
  const functionWordMap = getFunctionWordMap();
  
  for (const fw of FUNCTION_WORDS) {
    const count = rawFrequencies.get(fw.word) || 0;
    const frequency = totalWords > 0 ? (count / totalWords) * 1000 : 0;
    
    frequencies.push({
      word: fw.word,
      count,
      frequency,
      category: fw.category,
      tier: fw.tier,
      britishMarker: fw.britishMarker || false
    });
  }
  
  // Calculate z-scores against general English
  const zScores: Record<string, ZScoreResult> = {};
  
  for (const fw of frequencies) {
    if (GENERAL_ENGLISH_STATS[fw.word]) {
      const { mean, stdDev } = GENERAL_ENGLISH_STATS[fw.word];
      const z = zScore(fw.frequency, mean, stdDev);
      
      zScores[fw.word] = {
        value: fw.frequency,
        refMean: mean,
        refStdDev: stdDev,
        zScore: z,
        interpretation: interpretZScore(z)
      };
    }
  }
  
  // Identify distinctive words (z > 1.0)
  const distinctive = frequencies
    .filter(fw => zScores[fw.word] && zScores[fw.word].zScore > 1.0)
    .sort((a, b) => zScores[b.word].zScore - zScores[a.word].zScore);
  
  // Identify avoided words (z < -1.0)
  const avoided = frequencies
    .filter(fw => zScores[fw.word] && zScores[fw.word].zScore < -1.0)
    .sort((a, b) => zScores[a.word].zScore - zScores[b.word].zScore);
  
  // British markers used
  const britishMarkers = frequencies
    .filter(fw => fw.britishMarker && fw.count > 0)
    .sort((a, b) => b.frequency - a.frequency);
  
  // Summary statistics
  let highlyDistinctive = 0;
  let distinctiveCount = 0;
  let normal = 0;
  let avoidedCount = 0;
  let highlyAvoided = 0;
  
  for (const z of Object.values(zScores)) {
    if (z.zScore > 2.0) highlyDistinctive++;
    else if (z.zScore > 1.0) distinctiveCount++;
    else if (z.zScore > -1.0) normal++;
    else if (z.zScore > -2.0) avoidedCount++;
    else highlyAvoided++;
  }
  
  return {
    totalWords,
    functionWordCount,
    functionWordPercentage: totalWords > 0 ? (functionWordCount / totalWords) * 100 : 0,
    frequencies,
    zScores,
    distinctive,
    avoided,
    britishMarkers,
    summary: {
      highlyDistinctive,
      distinctive: distinctiveCount,
      normal,
      avoided: avoidedCount,
      highlyAvoided
    }
  };
}

/**
 * Generate human-readable summary of function word analysis
 */
export function summarizeFunctionWordAnalysis(analysis: FunctionWordAnalysis): string {
  const lines: string[] = [];
  
  lines.push('# Function Word Signature\n');
  lines.push(`**Total words analyzed:** ${analysis.totalWords.toLocaleString()}`);
  lines.push(`**Function words:** ${analysis.functionWordCount} (${analysis.functionWordPercentage.toFixed(1)}%)\n`);
  
  // Distinctive words
  if (analysis.distinctive.length > 0) {
    lines.push('## Highly Distinctive Function Words\n');
    lines.push('These words appear significantly more often than typical English:\n');
    lines.push('| Word | Frequency | Z-Score | Interpretation |');
    lines.push('|------|-----------|---------|----------------|');
    
    for (const fw of analysis.distinctive.slice(0, 10)) {
      const z = analysis.zScores[fw.word];
      lines.push(
        `| **${fw.word}** | ${fw.frequency.toFixed(2)} | ${z.zScore.toFixed(2)} | ${z.interpretation} |`
      );
    }
    lines.push('');
  }
  
  // Avoided words
  if (analysis.avoided.length > 0) {
    lines.push('## Deliberately Avoided Function Words\n');
    lines.push('These words appear significantly less often than typical English:\n');
    lines.push('| Word | Frequency | Z-Score | Interpretation |');
    lines.push('|------|-----------|---------|----------------|');
    
    for (const fw of analysis.avoided.slice(0, 10)) {
      const z = analysis.zScores[fw.word];
      lines.push(
        `| **${fw.word}** | ${fw.frequency.toFixed(2)} | ${z.zScore.toFixed(2)} | ${z.interpretation} |`
      );
    }
    lines.push('');
  }
  
  // British markers
  if (analysis.britishMarkers.length > 0) {
    lines.push('## British English Markers\n');
    lines.push('| Word | Count | Frequency (per 1000) |');
    lines.push('|------|-------|----------------------|');
    
    for (const fw of analysis.britishMarkers) {
      lines.push(`| **${fw.word}** | ${fw.count} | ${fw.frequency.toFixed(2)} |`);
    }
    lines.push('');
  }
  
  // Summary stats
  lines.push('## Stylometric Summary\n');
  lines.push(`- **Highly distinctive** (z > 2.0): ${analysis.summary.highlyDistinctive} words`);
  lines.push(`- **Distinctive** (z > 1.0): ${analysis.summary.distinctive} words`);
  lines.push(`- **Normal range**: ${analysis.summary.normal} words`);
  lines.push(`- **Avoided** (z < -1.0): ${analysis.summary.avoided} words`);
  lines.push(`- **Highly avoided** (z < -2.0): ${analysis.summary.highlyAvoided} words`);
  
  return lines.join('\n');
}
