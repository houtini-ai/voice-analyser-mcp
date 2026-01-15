/**
 * Vocabulary analysis: word frequency, richness, regional markers
 */

import { frequencyMap, topN } from '../utils/statistics.js';
import { isValidWord, filterVocabulary } from '../utils/cleaner.js';

export interface VocabularyAnalysis {
  totalWords: number;
  uniqueWords: number;
  vocabularyRichness: number;
  wordFrequency: Array<{ word: string; count: number; percentage: number }>;
  contractions: {
    usageRate: number;
    examples: Array<{ contracted: string; expanded: string; count: number }>;
  };
  britishMarkers: Array<{ word: string; count: number }>;
  americanMarkers: Array<{ word: string; count: number }>;
  currencyPreference: {
    gbp: number;
    eur: number;
    usd: number;
  };
  technicalTerms: Array<{ word: string; count: number }>;
}

const CONTRACTIONS = [
  { contracted: "I've", expanded: "I have" },
  { contracted: "I'm", expanded: "I am" },
  { contracted: "I'd", expanded: "I would" },
  { contracted: "you've", expanded: "you have" },
  { contracted: "you're", expanded: "you are" },
  { contracted: "it's", expanded: "it is" },
  { contracted: "that's", expanded: "that is" },
  { contracted: "won't", expanded: "will not" },
  { contracted: "can't", expanded: "cannot" },
  { contracted: "don't", expanded: "do not" },
  { contracted: "doesn't", expanded: "does not" },
];

const BRITISH_MARKERS = [
  "whilst", "colour", "favourite", "optimise", "analyse", "centre",
  "behaviour", "honour", "favour", "labour", "recognise", "organise"
];

const AMERICAN_MARKERS = [
  "while", "color", "favorite", "optimize", "analyze", "center",
  "behavior", "honor", "favor", "labor", "recognize", "organize"
];

export function analyzeVocabulary(text: string): VocabularyAnalysis {
  // Tokenize text (preserve case for contraction detection)
  const rawWords = text.split(/\s+/).filter(w => w.length > 0);
  
  // Filter out extraction artifacts
  const words = filterVocabulary(rawWords);
  const totalWords = words.length;
  
  // Convert to lowercase for frequency analysis
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^\w'-]/g, ''));
  
  // Additional filter: remove empty strings after punctuation removal
  const validLowerWords = lowerWords.filter(w => w.length > 0 && isValidWord(w));
  
  const wordFreq = frequencyMap(validLowerWords);
  const uniqueWords = wordFreq.size;
  
  // Top 1000 words
  const topWords = topN(wordFreq, 1000);
  const wordFrequency = topWords.map(({ item, count, percentage }) => ({
    word: item,
    count,
    percentage
  }));
  
  // Contractions analysis
  const contractionCounts = CONTRACTIONS.map(({ contracted, expanded }) => {
    const regex = new RegExp(`\\b${contracted}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { contracted, expanded, count: matches.length };
  }).filter(c => c.count > 0);
  
  const totalContractions = contractionCounts.reduce((sum, c) => sum + c.count, 0);
  const usageRate = totalWords > 0 ? (totalContractions / totalWords) * 100 : 0;
  
  // British vs American markers
  const britishMarkers = BRITISH_MARKERS.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { word, count: matches.length };
  }).filter(m => m.count > 0);
  
  const americanMarkers = AMERICAN_MARKERS.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { word, count: matches.length };
  }).filter(m => m.count > 0);
  
  // Currency detection
  const gbpMatches = text.match(/£/g) || [];
  const eurMatches = text.match(/€/g) || [];
  const usdMatches = text.match(/\$/g) || [];
  
  // Technical terms (words appearing more than 10 times but not in top common words)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
  
  const technicalTerms = topWords
    .filter(({ item, count }) => 
      count >= 10 && 
      item.length > 3 && 
      !commonWords.has(item)
    )
    .slice(0, 50)
    .map(({ item, count }) => ({ word: item, count }));
  
  return {
    totalWords,
    uniqueWords,
    vocabularyRichness: uniqueWords / totalWords,
    wordFrequency,
    contractions: {
      usageRate,
      examples: contractionCounts
    },
    britishMarkers,
    americanMarkers,
    currencyPreference: {
      gbp: gbpMatches.length,
      eur: eurMatches.length,
      usd: usdMatches.length
    },
    technicalTerms
  };
}
