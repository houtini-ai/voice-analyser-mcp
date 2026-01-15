/**
 * Information Density Analyzer
 * 
 * Based on Dejan AI research (Dec 2025) on Google's grounding chunks.
 * 
 * PHILOSOPHY: This analyzer DESCRIBES the natural patterns of the corpus owner.
 * It does NOT prescribe an artificial "optimal" structure. Real writing has
 * natural variation - we measure that variation, not enforce uniformity.
 * 
 * Key insight: AI extracts ~15.5 word chunks on average. Understanding how
 * the writer's natural style aligns with this helps predict extractability.
 */

export interface InformationDensityAnalysis {
  // Overall corpus characteristics
  corpusProfile: {
    totalWords: number;
    totalSentences: number;
    totalParagraphs: number;
    averageArticleLength: number;
  };

  // Natural density patterns (descriptive, not prescriptive)
  naturalPatterns: {
    sentenceLengthProfile: {
      mean: number;
      median: number;
      stdDev: number;
      // How close is the mean to the 15.5 word "chunk sweet spot"?
      // This is informational, NOT a target to hit
      chunkAlignmentNote: string;
    };
    paragraphDensity: {
      meanWordsPerParagraph: number;
      meanSentencesPerParagraph: number;
      // Natural variation is GOOD - we measure it, not eliminate it
      variationCoefficient: number;
    };
  };

  // Opening patterns analysis (first 100/300 words)
  openingPatterns: {
    first100Words: {
      typicalClaimCount: number;
      typicalEntityCount: number;
      // Describes what the writer naturally does, not what they "should" do
      style: 'frontloaded' | 'building' | 'contextual' | 'varied';
    };
    first300Words: {
      typicalClaimCount: number;
      typicalEntityCount: number;
    };
    // Not a score - just a description of natural tendency
    naturalTendency: string;
  };

  // Self-containment analysis
  selfContainment: {
    // Sentences that work well as standalone chunks
    standaloneReadyPercentage: number;
    // Common dangling reference patterns (informational)
    danglingPatterns: Array<{
      pattern: string;
      frequency: number;
      example: string;
    }>;
    // This is descriptive - some writers naturally use more pronouns
    pronounReliance: 'low' | 'moderate' | 'high';
  };

  // Claim density (factual statements per 100 words)
  claimDensity: {
    overall: number;
    // Per-section breakdown if structure detected
    byPosition: {
      opening: number;    // First 20%
      middle: number;     // Middle 60%
      closing: number;    // Last 20%
    };
    // Natural distribution description
    distributionNote: string;
  };

  // AI extractability profile (informational, not prescriptive)
  extractabilityProfile: {
    // Estimated % of content AI would likely cite (based on Dejan research)
    estimatedCoverage: number;
    // Based purely on natural patterns, not artificial optimisation
    strengths: string[];
    // Areas where the natural style may be less extractable
    characteristics: string[];
    // NOT recommendations to change - just observations
    note: string;
  };
}

// Claim detection patterns (factual, quantifiable statements)
const CLAIM_PATTERNS = [
  /\d+%/,                                    // Percentages
  /\$[\d,]+/,                                // Prices
  /£[\d,]+/,                                 // British prices
  /€[\d,]+/,                                 // Euro prices
  /\d+\s*(nm|Nm|kg|mm|hz|Hz|gb|GB|mb|MB|tb|TB|mph|km\/h)/i,  // Measurements
  /\d+\s*(users|customers|companies|people|years|months|days)/i,
  /(costs?|priced?|worth|retails?)\s+(at\s+)?\$?£?€?[\d,]+/i,
  /\b\d{4}\b/,                               // Years (dates)
  /(founded|established|launched|released)\s+in\s+\d{4}/i,
];

// Entity patterns (named things)
const ENTITY_PATTERNS = [
  /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g,        // Multi-word proper nouns
  /[A-Z]{2,}/g,                              // Acronyms
  /\b(?:the\s+)?[A-Z][a-z]+\s+\d+[A-Za-z]*/g,  // Product names with numbers
];

// Dangling reference patterns
const DANGLING_PATTERNS = [
  { pattern: /\bThis\s+(?:is|was|means|shows)/gi, label: '"This is/was..."' },
  { pattern: /\bIt\s+(?:is|was|can|will|would|should)/gi, label: '"It is/was..."' },
  { pattern: /\bThey\s+(?:are|were|have|had)/gi, label: '"They are/were..."' },
  { pattern: /\bThe\s+(?:product|system|tool|solution|approach)\b/gi, label: '"The [generic]..."' },
];

/**
 * Calculate standard deviation
 */
function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Calculate median
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Count claim patterns in text
 */
function countClaims(text: string): number {
  let count = 0;
  for (const pattern of CLAIM_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Count entity patterns in text
 */
function countEntities(text: string): number {
  let count = 0;
  for (const pattern of ENTITY_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  // Deduplicate rough estimate
  return Math.floor(count * 0.7);
}

/**
 * Analyze information density patterns in corpus
 */
export function analyzeInformationDensity(
  text: string,
  articleCount: number = 1
): InformationDensityAnalysis {
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const totalSentences = sentences.length;
  
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  const totalParagraphs = paragraphs.length;
  
  // Sentence length analysis
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const meanSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
  const medianSentenceLength = median(sentenceLengths);
  const sentenceStdDev = stdDev(sentenceLengths);
  
  // Chunk alignment note (informational only)
  let chunkAlignmentNote: string;
  if (meanSentenceLength >= 12 && meanSentenceLength <= 20) {
    chunkAlignmentNote = 'Natural sentence length aligns well with typical AI extraction chunks (~15 words)';
  } else if (meanSentenceLength < 12) {
    chunkAlignmentNote = 'Tends toward shorter sentences - may result in multiple sentences per chunk';
  } else {
    chunkAlignmentNote = 'Tends toward longer sentences - chunks may split mid-sentence';
  }
  
  // Paragraph density
  const paragraphWordCounts = paragraphs.map(p => p.split(/\s+/).length);
  const paragraphSentenceCounts = paragraphs.map(p => 
    p.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  );
  const meanWordsPerParagraph = paragraphWordCounts.reduce((a, b) => a + b, 0) / paragraphWordCounts.length || 0;
  const meanSentencesPerParagraph = paragraphSentenceCounts.reduce((a, b) => a + b, 0) / paragraphSentenceCounts.length || 0;
  const paragraphVariationCV = meanWordsPerParagraph > 0 ? stdDev(paragraphWordCounts) / meanWordsPerParagraph : 0;
  
  // Opening patterns (first 100 and 300 words)
  const first100 = words.slice(0, 100).join(' ');
  const first300 = words.slice(0, 300).join(' ');
  
  const first100Claims = countClaims(first100);
  const first100Entities = countEntities(first100);
  const first300Claims = countClaims(first300);
  const first300Entities = countEntities(first300);
  
  // Determine opening style
  let openingStyle: 'frontloaded' | 'building' | 'contextual' | 'varied';
  const first100Density = first100Claims + first100Entities;
  if (first100Density >= 8) {
    openingStyle = 'frontloaded';
  } else if (first100Density >= 4) {
    openingStyle = 'building';
  } else if (first100Density >= 2) {
    openingStyle = 'contextual';
  } else {
    openingStyle = 'varied';
  }
  
  // Natural tendency description
  let naturalTendency: string;
  if (openingStyle === 'frontloaded') {
    naturalTendency = 'Naturally leads with facts and specifics - strong for AI extraction';
  } else if (openingStyle === 'building') {
    naturalTendency = 'Builds context before key claims - balanced approach';
  } else if (openingStyle === 'contextual') {
    naturalTendency = 'Establishes context first - prioritises reader orientation over immediate facts';
  } else {
    naturalTendency = 'Varied opening styles across articles - adapts to content type';
  }
  
  // Self-containment analysis
  let danglingCount = 0;
  const danglingExamples: Array<{ pattern: string; frequency: number; example: string }> = [];
  
  for (const { pattern, label } of DANGLING_PATTERNS) {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      danglingCount += matches.length;
      danglingExamples.push({
        pattern: label,
        frequency: matches.length,
        example: matches[0] || ''
      });
    }
  }
  
  // Estimate standalone-ready sentences (those without dangling references at start)
  let standaloneReady = 0;
  for (const sentence of sentences) {
    const startsWithDangling = DANGLING_PATTERNS.some(({ pattern }) => {
      const startPattern = new RegExp('^' + pattern.source.replace(/^\\b/, ''), 'i');
      return startPattern.test(sentence.trim());
    });
    if (!startsWithDangling) standaloneReady++;
  }
  const standalonePercentage = totalSentences > 0 ? (standaloneReady / totalSentences) * 100 : 0;
  
  // Pronoun reliance
  const pronounMatches = text.match(/\b(it|this|that|they|these|those)\b/gi) || [];
  const pronounDensity = (pronounMatches.length / totalWords) * 100;
  let pronounReliance: 'low' | 'moderate' | 'high';
  if (pronounDensity < 2) pronounReliance = 'low';
  else if (pronounDensity < 4) pronounReliance = 'moderate';
  else pronounReliance = 'high';
  
  // Claim density analysis
  const totalClaims = countClaims(text);
  const overallClaimDensity = (totalClaims / totalWords) * 100;
  
  // Position-based claim density
  const opening20 = words.slice(0, Math.floor(totalWords * 0.2)).join(' ');
  const middle60 = words.slice(Math.floor(totalWords * 0.2), Math.floor(totalWords * 0.8)).join(' ');
  const closing20 = words.slice(Math.floor(totalWords * 0.8)).join(' ');
  
  const openingClaims = (countClaims(opening20) / (totalWords * 0.2)) * 100;
  const middleClaims = (countClaims(middle60) / (totalWords * 0.6)) * 100;
  const closingClaims = (countClaims(closing20) / (totalWords * 0.2)) * 100;
  
  // Distribution note
  let distributionNote: string;
  if (openingClaims > middleClaims && openingClaims > closingClaims) {
    distributionNote = 'Claims concentrated in opening - frontloaded style';
  } else if (closingClaims > openingClaims) {
    distributionNote = 'Claims build toward conclusion - building style';
  } else {
    distributionNote = 'Claims distributed throughout - even density';
  }
  
  // Extractability profile (based on Dejan research curves)
  // Pages <1K words: 61% coverage, 1-2K: 35%, 2-3K: 22%, 3K+: 13%
  const avgArticleLength = totalWords / articleCount;
  let estimatedCoverage: number;
  if (avgArticleLength < 1000) {
    estimatedCoverage = 61;
  } else if (avgArticleLength < 2000) {
    estimatedCoverage = 61 - ((avgArticleLength - 1000) / 1000) * 26;
  } else if (avgArticleLength < 3000) {
    estimatedCoverage = 35 - ((avgArticleLength - 2000) / 1000) * 13;
  } else {
    estimatedCoverage = Math.max(13, 22 - ((avgArticleLength - 3000) / 2000) * 9);
  }
  
  // Identify natural strengths
  const strengths: string[] = [];
  if (meanSentenceLength >= 12 && meanSentenceLength <= 20) {
    strengths.push('Sentence length naturally aligns with AI chunk extraction');
  }
  if (standalonePercentage > 70) {
    strengths.push('High proportion of self-contained sentences');
  }
  if (overallClaimDensity > 3) {
    strengths.push('Strong factual claim density');
  }
  if (openingStyle === 'frontloaded' || openingStyle === 'building') {
    strengths.push('Natural tendency to lead with substantive content');
  }
  if (sentenceStdDev > meanSentenceLength * 0.5) {
    strengths.push('Good sentence length variation (natural, not mechanical)');
  }
  
  // Characteristics (neutral observations, not criticisms)
  const characteristics: string[] = [];
  if (pronounReliance === 'high') {
    characteristics.push('Relies on pronouns for flow - natural for readability, may reduce chunk independence');
  }
  if (avgArticleLength > 2000) {
    characteristics.push('Longer-form content - AI may only extract key sections');
  }
  if (openingStyle === 'contextual') {
    characteristics.push('Contextual openings - prioritises reader orientation');
  }
  
  return {
    corpusProfile: {
      totalWords,
      totalSentences,
      totalParagraphs,
      averageArticleLength: Math.round(avgArticleLength)
    },
    naturalPatterns: {
      sentenceLengthProfile: {
        mean: Math.round(meanSentenceLength * 10) / 10,
        median: medianSentenceLength,
        stdDev: Math.round(sentenceStdDev * 10) / 10,
        chunkAlignmentNote
      },
      paragraphDensity: {
        meanWordsPerParagraph: Math.round(meanWordsPerParagraph),
        meanSentencesPerParagraph: Math.round(meanSentencesPerParagraph * 10) / 10,
        variationCoefficient: Math.round(paragraphVariationCV * 100) / 100
      }
    },
    openingPatterns: {
      first100Words: {
        typicalClaimCount: first100Claims,
        typicalEntityCount: first100Entities,
        style: openingStyle
      },
      first300Words: {
        typicalClaimCount: first300Claims,
        typicalEntityCount: first300Entities
      },
      naturalTendency
    },
    selfContainment: {
      standaloneReadyPercentage: Math.round(standalonePercentage),
      danglingPatterns: danglingExamples.slice(0, 5),
      pronounReliance
    },
    claimDensity: {
      overall: Math.round(overallClaimDensity * 100) / 100,
      byPosition: {
        opening: Math.round(openingClaims * 100) / 100,
        middle: Math.round(middleClaims * 100) / 100,
        closing: Math.round(closingClaims * 100) / 100
      },
      distributionNote
    },
    extractabilityProfile: {
      estimatedCoverage: Math.round(estimatedCoverage),
      strengths,
      characteristics,
      note: 'These observations describe natural writing patterns. They are not recommendations to change style - authentic voice should take priority over optimisation.'
    }
  };
}

/**
 * Generate human-readable summary
 */
export function summarizeInformationDensity(analysis: InformationDensityAnalysis): string {
  const lines: string[] = [];
  
  lines.push('# Information Density Analysis');
  lines.push('');
  lines.push('*Understanding how this writing style interacts with AI extraction*');
  lines.push('');
  lines.push('> **Note:** This analysis describes natural patterns. It does not prescribe changes.');
  lines.push('> Authentic voice should always take priority over optimisation.');
  lines.push('');
  
  lines.push('## Corpus Profile');
  lines.push('');
  lines.push(`- Total words: ${analysis.corpusProfile.totalWords.toLocaleString()}`);
  lines.push(`- Total sentences: ${analysis.corpusProfile.totalSentences.toLocaleString()}`);
  lines.push(`- Average article length: ${analysis.corpusProfile.averageArticleLength.toLocaleString()} words`);
  lines.push('');
  
  lines.push('## Natural Sentence Patterns');
  lines.push('');
  lines.push(`- Mean length: ${analysis.naturalPatterns.sentenceLengthProfile.mean} words`);
  lines.push(`- Median length: ${analysis.naturalPatterns.sentenceLengthProfile.median} words`);
  lines.push(`- Variation (std dev): ±${analysis.naturalPatterns.sentenceLengthProfile.stdDev} words`);
  lines.push(`- ${analysis.naturalPatterns.sentenceLengthProfile.chunkAlignmentNote}`);
  lines.push('');
  
  lines.push('## Opening Style');
  lines.push('');
  lines.push(`- Style: **${analysis.openingPatterns.first100Words.style}**`);
  lines.push(`- First 100 words: ${analysis.openingPatterns.first100Words.typicalClaimCount} claims, ${analysis.openingPatterns.first100Words.typicalEntityCount} entities`);
  lines.push(`- First 300 words: ${analysis.openingPatterns.first300Words.typicalClaimCount} claims, ${analysis.openingPatterns.first300Words.typicalEntityCount} entities`);
  lines.push(`- ${analysis.openingPatterns.naturalTendency}`);
  lines.push('');
  
  lines.push('## Self-Containment');
  lines.push('');
  lines.push(`- Standalone-ready sentences: ${analysis.selfContainment.standaloneReadyPercentage}%`);
  lines.push(`- Pronoun reliance: ${analysis.selfContainment.pronounReliance}`);
  if (analysis.selfContainment.danglingPatterns.length > 0) {
    lines.push('- Common reference patterns:');
    for (const p of analysis.selfContainment.danglingPatterns) {
      lines.push(`  - ${p.pattern}: ${p.frequency} occurrences`);
    }
  }
  lines.push('');
  
  lines.push('## Claim Density');
  lines.push('');
  lines.push(`- Overall: ${analysis.claimDensity.overall} claims per 100 words`);
  lines.push(`- Opening (first 20%): ${analysis.claimDensity.byPosition.opening}`);
  lines.push(`- Middle (60%): ${analysis.claimDensity.byPosition.middle}`);
  lines.push(`- Closing (last 20%): ${analysis.claimDensity.byPosition.closing}`);
  lines.push(`- ${analysis.claimDensity.distributionNote}`);
  lines.push('');
  
  lines.push('## AI Extractability Profile');
  lines.push('');
  lines.push(`**Estimated coverage:** ${analysis.extractabilityProfile.estimatedCoverage}% of content likely to be cited by AI`);
  lines.push('');
  
  if (analysis.extractabilityProfile.strengths.length > 0) {
    lines.push('**Natural strengths:**');
    for (const s of analysis.extractabilityProfile.strengths) {
      lines.push(`- ✓ ${s}`);
    }
    lines.push('');
  }
  
  if (analysis.extractabilityProfile.characteristics.length > 0) {
    lines.push('**Style characteristics:**');
    for (const c of analysis.extractabilityProfile.characteristics) {
      lines.push(`- ${c}`);
    }
    lines.push('');
  }
  
  lines.push(`> ${analysis.extractabilityProfile.note}`);
  lines.push('');
  
  return lines.join('\n');
}
