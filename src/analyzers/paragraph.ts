/**
 * Paragraph analysis: rhythm, symmetry, patterns
 */

import { mean, median, standardDeviation, distribution, frequencyMap, topN } from '../utils/statistics.js';

export interface ParagraphAnalysis {
  totalParagraphs: number;
  sentencesPerParagraph: {
    mean: number;
    median: number;
    stdDev: number;
    distribution: Array<{ range: string; count: number; percentage: number }>;
  };
  symmetryScore: number;
  openingPatterns: Array<{ type: string; count: number; percentage: number }>;
  transitionWords: Array<{ word: string; count: number }>;
}

const TRANSITION_WORDS = [
  "however", "moreover", "furthermore", "therefore", "thus", "hence",
  "consequently", "nevertheless", "nonetheless", "meanwhile", "additionally",
  "similarly", "conversely", "alternatively"
];

export function analyzeParagraphs(text: string): ParagraphAnalysis {
  // Split by double newlines (paragraph breaks)
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  const totalParagraphs = paragraphs.length;
  
  // Sentences per paragraph
  const sentenceCounts = paragraphs.map(p => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  });
  
  const sentDistribution = distribution(sentenceCounts, [
    { min: 0, max: 2, label: '1' },
    { min: 2, max: 3, label: '2' },
    { min: 3, max: 4, label: '3' },
    { min: 4, max: 5, label: '4' },
    { min: 5, max: 6, label: '5' },
    { min: 6, max: Infinity, label: '6+' }
  ]);
  
  // Symmetry score (coefficient of variation - lower = more symmetric/consistent)
  // We want HIGHER score (more variation) for natural writing
  const sentMean = mean(sentenceCounts);
  const sentStdDev = standardDeviation(sentenceCounts);
  const coefficientOfVariation = sentMean > 0 ? sentStdDev / sentMean : 0;
  const symmetryScore = 1 - Math.min(coefficientOfVariation, 1); // Invert: 0 = highly variable, 1 = very symmetric
  
  // Opening patterns
  const openingTypes: Array<{ type: string; count: number }> = [];
  let statements = 0;
  let questions = 0;
  let personal = 0;
  
  for (const para of paragraphs) {
    const firstSentence = para.split(/[.!?]+/)[0].trim();
    if (firstSentence.endsWith('?') || firstSentence.includes('?')) {
      questions++;
    } else if (/^(I|I've|I'm|My|For me|In my)/i.test(firstSentence)) {
      personal++;
    } else {
      statements++;
    }
  }
  
  openingTypes.push(
    { type: 'statement', count: statements },
    { type: 'question', count: questions },
    { type: 'personal', count: personal }
  );
  
  const openingPatterns = openingTypes.map(({ type, count }) => ({
    type,
    count,
    percentage: totalParagraphs > 0 ? (count / totalParagraphs) * 100 : 0
  }));
  
  // Transition words
  const transitionWords = TRANSITION_WORDS.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { word, count: matches.length };
  }).filter(w => w.count > 0);
  
  return {
    totalParagraphs,
    sentencesPerParagraph: {
      mean: mean(sentenceCounts),
      median: median(sentenceCounts),
      stdDev: standardDeviation(sentenceCounts),
      distribution: sentDistribution
    },
    symmetryScore,
    openingPatterns,
    transitionWords
  };
}
