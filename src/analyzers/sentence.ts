/**
 * Sentence structure analysis: length, complexity, patterns
 */

import { mean, median, standardDeviation, distribution, frequencyMap, topN } from '../utils/statistics.js';

export interface SentenceAnalysis {
  totalSentences: number;
  length: {
    mean: number;
    median: number;
    stdDev: number;
    distribution: Array<{ range: string; count: number; percentage: number }>;
  };
  complexity: {
    simple: number;
    compound: number;
    complex: number;
  };
  starters: Array<{ word: string; count: number; percentage: number }>;
  enders: Array<{ punctuation: string; count: number; percentage: number }>;
}

export function analyzeSentences(text: string): SentenceAnalysis {
  // Split into sentences (basic - handles . ! ? but not all edge cases)
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const totalSentences = sentences.length;
  
  // Sentence lengths (in words)
  const lengths = sentences.map(s => s.split(/\s+/).length);
  
  const lengthDistribution = distribution(lengths, [
    { min: 0, max: 11, label: '1-10' },
    { min: 11, max: 21, label: '11-20' },
    { min: 21, max: 31, label: '21-30' },
    { min: 31, max: 41, label: '31-40' },
    { min: 41, max: Infinity, label: '41+' }
  ]);
  
  // Sentence complexity (basic heuristic)
  const complexity = { simple: 0, compound: 0, complex: 0 };
  
  for (const sentence of sentences) {
    const hasComma = sentence.includes(',');
    const hasSemicolon = sentence.includes(';');
    const hasConjunction = /\b(and|but|or)\b/i.test(sentence);
    const hasSubordinate = /\b(which|that|who|when|where|while|whilst|if|because|although)\b/i.test(sentence);
    
    if (hasSubordinate) {
      complexity.complex++;
    } else if (hasSemicolon || (hasComma && hasConjunction)) {
      complexity.compound++;
    } else {
      complexity.simple++;
    }
  }
  
  // Sentence starters
  const starters = sentences.map(s => {
    const firstWord = s.split(/\s+/)[0];
    return firstWord ? firstWord.toLowerCase().replace(/[^\w]/g, '') : '';
  }).filter(w => w.length > 0);
  
  const starterFreq = frequencyMap(starters);
  const topStarters = topN(starterFreq, 20);
  
  // Sentence enders (from original text to preserve punctuation)
  const enderMatches = text.match(/[.!?…]+/g) || [];
  const enderFreq = frequencyMap(enderMatches);
  const topEnders = topN(enderFreq, 10);
  
  return {
    totalSentences,
    length: {
      mean: mean(lengths),
      median: median(lengths),
      stdDev: standardDeviation(lengths),
      distribution: lengthDistribution
    },
    complexity: {
      simple: totalSentences > 0 ? (complexity.simple / totalSentences) * 100 : 0,
      compound: totalSentences > 0 ? (complexity.compound / totalSentences) * 100 : 0,
      complex: totalSentences > 0 ? (complexity.complex / totalSentences) * 100 : 0
    },
    starters: topStarters.map(({ item, count, percentage }) => ({
      word: item,
      count,
      percentage
    })),
    enders: topEnders.map(({ item, count, percentage }) => ({
      punctuation: item,
      count,
      percentage
    }))
  };
}
