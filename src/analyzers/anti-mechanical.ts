/**
 * Anti-Mechanical Analyzer
 * 
 * Detects patterns that indicate robotic/AI-generated writing:
 * - Uniform sentence lengths (lack of variation)
 * - Symmetric paragraph structures
 * - Repetitive sentence starts
 * - Clustered first-person usage
 * - Missing natural variation
 * 
 * Outputs a "naturalness score" where higher = more human-like
 */

export interface AntiMechanicalAnalysis {
  sentenceLengthVariation: {
    mean: number;
    stdDev: number;
    coefficientOfVariation: number;  // CV = stdDev/mean, higher = more varied
    distribution: {
      short: number;      // 1-8 words
      medium: number;     // 9-20 words
      long: number;       // 21-40 words
      veryLong: number;   // 40+ words
    };
    hasNaturalVariation: boolean;  // CV > 0.5 indicates natural
  };
  
  paragraphAsymmetry: {
    meanSentences: number;
    stdDev: number;
    symmetryScore: number;  // Lower = more varied (good)
    singleSentenceParagraphs: number;
    longParagraphs: number;  // 5+ sentences
  };
  
  firstPersonDistribution: {
    totalCount: number;
    sentenceStartCount: number;
    sentenceStartRatio: number;  // % of first-person at sentence starts
    consecutiveIStart: number;   // Max consecutive "I" starts
    isBalanced: boolean;         // Good distribution (ratio < 0.3)
  };
  
  repetitiveStarts: {
    maxConsecutiveSameStart: number;
    problematicPatterns: string[];
    hasRepetitionProblem: boolean;
  };
  
  // Overall scores
  naturalness: {
    sentenceVariationScore: number;    // 0-25
    paragraphVariationScore: number;   // 0-25
    firstPersonScore: number;          // 0-25
    repetitionScore: number;           // 0-25
    totalScore: number;                // 0-100, higher = more natural
    interpretation: 'mechanical' | 'somewhat_mechanical' | 'natural' | 'very_natural';
  };
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate mean
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Get first word of a sentence
 */
function getFirstWord(sentence: string): string {
  const trimmed = sentence.trim();
  const match = trimmed.match(/^["']?(\w+)/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Analyze text for mechanical patterns
 */
export function analyzeAntiMechanical(text: string): AntiMechanicalAnalysis {
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Split into paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // ============ SENTENCE LENGTH VARIATION ============
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const meanLength = calculateMean(sentenceLengths);
  const stdDevLength = calculateStdDev(sentenceLengths);
  const cv = meanLength > 0 ? stdDevLength / meanLength : 0;
  
  const distribution = {
    short: sentenceLengths.filter(l => l >= 1 && l <= 8).length,
    medium: sentenceLengths.filter(l => l >= 9 && l <= 20).length,
    long: sentenceLengths.filter(l => l >= 21 && l <= 40).length,
    veryLong: sentenceLengths.filter(l => l > 40).length
  };
  
  // Natural writing has CV > 0.5 (high variation)
  const hasNaturalVariation = cv > 0.5;
  
  // ============ PARAGRAPH ASYMMETRY ============
  const paragraphSentenceCounts = paragraphs.map(p => {
    return p.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  });
  
  const meanParagraphSentences = calculateMean(paragraphSentenceCounts);
  const stdDevParagraph = calculateStdDev(paragraphSentenceCounts);
  
  // Symmetry score: lower variance = more symmetric (bad)
  const symmetryScore = meanParagraphSentences > 0 
    ? stdDevParagraph / meanParagraphSentences 
    : 0;
  
  const singleSentenceParagraphs = paragraphSentenceCounts.filter(c => c === 1).length;
  const longParagraphs = paragraphSentenceCounts.filter(c => c >= 5).length;
  
  // ============ FIRST-PERSON DISTRIBUTION ============
  const firstPersonPattern = /\b(I|I'm|I've|I'd|I'll|I was|I am|I have|I would)\b/gi;
  let totalFirstPerson = 0;
  let sentenceStartFirstPerson = 0;
  
  for (const sentence of sentences) {
    const matches = sentence.match(firstPersonPattern) || [];
    totalFirstPerson += matches.length;
    
    // Check if sentence starts with first-person
    const firstWord = getFirstWord(sentence);
    if (firstWord === 'i') {
      sentenceStartFirstPerson++;
    }
  }
  
  const sentenceStartRatio = sentences.length > 0 
    ? sentenceStartFirstPerson / sentences.length 
    : 0;
  
  // Find max consecutive sentences starting with "I"
  let maxConsecutiveI = 0;
  let currentConsecutiveI = 0;
  
  for (const sentence of sentences) {
    const firstWord = getFirstWord(sentence);
    if (firstWord === 'i') {
      currentConsecutiveI++;
      maxConsecutiveI = Math.max(maxConsecutiveI, currentConsecutiveI);
    } else {
      currentConsecutiveI = 0;
    }
  }
  
  // Balanced if less than 30% of sentences start with "I"
  const isBalanced = sentenceStartRatio < 0.3;
  
  // ============ REPETITIVE STARTS ============
  const firstWords = sentences.map(getFirstWord);
  let maxConsecutiveSame = 0;
  let currentConsecutive = 1;
  let currentWord = firstWords[0];
  const problematicPatterns: string[] = [];
  
  for (let i = 1; i < firstWords.length; i++) {
    if (firstWords[i] === currentWord && currentWord.length > 0) {
      currentConsecutive++;
      if (currentConsecutive >= 3 && !problematicPatterns.includes(currentWord)) {
        problematicPatterns.push(currentWord);
      }
    } else {
      maxConsecutiveSame = Math.max(maxConsecutiveSame, currentConsecutive);
      currentConsecutive = 1;
      currentWord = firstWords[i];
    }
  }
  maxConsecutiveSame = Math.max(maxConsecutiveSame, currentConsecutive);
  
  const hasRepetitionProblem = maxConsecutiveSame >= 3;
  
  // ============ CALCULATE SCORES ============
  
  // Sentence variation score (0-25)
  // CV of 0.8+ = 25 points, CV of 0 = 0 points
  let sentenceVariationScore = Math.min(25, cv * 31.25);
  // Bonus for having all four length categories represented
  const categoriesPresent = [
    distribution.short > 0,
    distribution.medium > 0,
    distribution.long > 0,
    distribution.veryLong > 0
  ].filter(Boolean).length;
  sentenceVariationScore = Math.min(25, sentenceVariationScore + (categoriesPresent - 2) * 2.5);
  
  // Paragraph variation score (0-25)
  // Having both single-sentence AND long paragraphs is good
  let paragraphVariationScore = 0;
  if (singleSentenceParagraphs > 0) paragraphVariationScore += 8;
  if (longParagraphs > 0) paragraphVariationScore += 8;
  paragraphVariationScore += Math.min(9, symmetryScore * 15);
  
  // First-person distribution score (0-25)
  // Lower sentence-start ratio = better
  let firstPersonScore = 25;
  if (sentenceStartRatio > 0.5) firstPersonScore -= 15;
  else if (sentenceStartRatio > 0.3) firstPersonScore -= 8;
  if (maxConsecutiveI >= 4) firstPersonScore -= 10;
  else if (maxConsecutiveI >= 3) firstPersonScore -= 5;
  firstPersonScore = Math.max(0, firstPersonScore);
  
  // Repetition score (0-25)
  let repetitionScore = 25;
  if (maxConsecutiveSame >= 5) repetitionScore -= 20;
  else if (maxConsecutiveSame >= 4) repetitionScore -= 12;
  else if (maxConsecutiveSame >= 3) repetitionScore -= 6;
  repetitionScore = Math.max(0, repetitionScore);
  
  const totalScore = Math.round(
    sentenceVariationScore + 
    paragraphVariationScore + 
    firstPersonScore + 
    repetitionScore
  );
  
  // Interpretation
  let interpretation: 'mechanical' | 'somewhat_mechanical' | 'natural' | 'very_natural';
  if (totalScore >= 85) interpretation = 'very_natural';
  else if (totalScore >= 65) interpretation = 'natural';
  else if (totalScore >= 45) interpretation = 'somewhat_mechanical';
  else interpretation = 'mechanical';
  
  return {
    sentenceLengthVariation: {
      mean: meanLength,
      stdDev: stdDevLength,
      coefficientOfVariation: cv,
      distribution,
      hasNaturalVariation
    },
    paragraphAsymmetry: {
      meanSentences: meanParagraphSentences,
      stdDev: stdDevParagraph,
      symmetryScore,
      singleSentenceParagraphs,
      longParagraphs
    },
    firstPersonDistribution: {
      totalCount: totalFirstPerson,
      sentenceStartCount: sentenceStartFirstPerson,
      sentenceStartRatio,
      consecutiveIStart: maxConsecutiveI,
      isBalanced
    },
    repetitiveStarts: {
      maxConsecutiveSameStart: maxConsecutiveSame,
      problematicPatterns,
      hasRepetitionProblem
    },
    naturalness: {
      sentenceVariationScore: Math.round(sentenceVariationScore),
      paragraphVariationScore: Math.round(paragraphVariationScore),
      firstPersonScore: Math.round(firstPersonScore),
      repetitionScore: Math.round(repetitionScore),
      totalScore,
      interpretation
    }
  };
}
