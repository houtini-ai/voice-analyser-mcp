/**
 * Function word reference list for stylometric analysis
 * 
 * Based on Mosteller-Wallace (1963), Burrows' Delta research
 * 70 core function words optimized for authorship fingerprinting
 */

export type FunctionWordCategory = 
  | 'article'
  | 'determiner'
  | 'preposition'
  | 'conjunction'
  | 'modal'
  | 'auxiliary'
  | 'pronoun';

export interface FunctionWord {
  word: string;
  category: FunctionWordCategory;
  tier: 1 | 2 | 3 | 4;  // Discriminative priority (1=highest)
  britishMarker?: boolean;
  notes?: string;
}

/**
 * Core 70 function words for stylometric analysis
 */
export const FUNCTION_WORDS: FunctionWord[] = [
  // Articles & Determiners (12 words)
  { word: 'a', category: 'article', tier: 2 },
  { word: 'an', category: 'article', tier: 2 },
  { word: 'the', category: 'article', tier: 2 },
  { word: 'this', category: 'determiner', tier: 2 },
  { word: 'that', category: 'determiner', tier: 2 },
  { word: 'these', category: 'determiner', tier: 2 },
  { word: 'those', category: 'determiner', tier: 2 },
  { word: 'some', category: 'determiner', tier: 2 },
  { word: 'any', category: 'determiner', tier: 2 },
  { word: 'all', category: 'determiner', tier: 2 },
  { word: 'every', category: 'determiner', tier: 2 },
  { word: 'no', category: 'determiner', tier: 2 },
  
  // Prepositions (16 words)
  { word: 'at', category: 'preposition', tier: 2 },
  { word: 'by', category: 'preposition', tier: 2 },
  { word: 'for', category: 'preposition', tier: 2 },
  { word: 'from', category: 'preposition', tier: 2 },
  { word: 'in', category: 'preposition', tier: 2 },
  { word: 'into', category: 'preposition', tier: 2 },
  { word: 'of', category: 'preposition', tier: 2 },
  { word: 'on', category: 'preposition', tier: 2 },
  { word: 'to', category: 'preposition', tier: 2 },
  { word: 'upon', category: 'preposition', tier: 1, notes: 'Highly discriminative' },
  { word: 'with', category: 'preposition', tier: 2 },
  { word: 'without', category: 'preposition', tier: 1 },
  { word: 'through', category: 'preposition', tier: 2 },
  { word: 'between', category: 'preposition', tier: 2 },
  { word: 'within', category: 'preposition', tier: 1 },
  { word: 'across', category: 'preposition', tier: 2 },
  
  // Conjunctions (14 words)
  { word: 'and', category: 'conjunction', tier: 2 },
  { word: 'as', category: 'conjunction', tier: 2 },
  { word: 'but', category: 'conjunction', tier: 2 },
  { word: 'if', category: 'conjunction', tier: 2 },
  { word: 'or', category: 'conjunction', tier: 2 },
  { word: 'so', category: 'conjunction', tier: 2 },
  { word: 'than', category: 'conjunction', tier: 2 },
  { word: 'that', category: 'conjunction', tier: 2 },
  { word: 'though', category: 'conjunction', tier: 1, notes: 'Highly discriminative' },
  { word: 'when', category: 'conjunction', tier: 2 },
  { word: 'while', category: 'conjunction', tier: 2 },
  { word: 'whilst', category: 'conjunction', tier: 1, britishMarker: true, notes: 'British preference' },
  { word: 'because', category: 'conjunction', tier: 2 },
  { word: 'although', category: 'conjunction', tier: 2 },
  
  // Modal Verbs (9 words)
  { word: 'can', category: 'modal', tier: 3 },
  { word: 'could', category: 'modal', tier: 3 },
  { word: 'may', category: 'modal', tier: 1, notes: 'Highly discriminative' },
  { word: 'might', category: 'modal', tier: 3 },
  { word: 'must', category: 'modal', tier: 1, notes: 'Highly discriminative' },
  { word: 'shall', category: 'modal', tier: 1, notes: 'Highly discriminative' },
  { word: 'should', category: 'modal', tier: 3 },
  { word: 'will', category: 'modal', tier: 3 },
  { word: 'would', category: 'modal', tier: 3 },
  
  // Auxiliary Verbs (10 words)
  { word: 'be', category: 'auxiliary', tier: 3 },
  { word: 'been', category: 'auxiliary', tier: 3 },
  { word: 'being', category: 'auxiliary', tier: 3 },
  { word: 'do', category: 'auxiliary', tier: 3 },
  { word: 'does', category: 'auxiliary', tier: 3 },
  { word: 'had', category: 'auxiliary', tier: 3 },
  { word: 'has', category: 'auxiliary', tier: 3 },
  { word: 'have', category: 'auxiliary', tier: 3 },
  { word: 'is', category: 'auxiliary', tier: 3 },
  { word: 'was', category: 'auxiliary', tier: 3 },
  { word: 'were', category: 'auxiliary', tier: 3 },
  
  // Pronouns (9 words - use with caution, genre-sensitive)
  { word: 'I', category: 'pronoun', tier: 4, notes: 'Genre-sensitive, track separately' },
  { word: 'we', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'you', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'he', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'she', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'it', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'they', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'one', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
  { word: 'who', category: 'pronoun', tier: 4, notes: 'Genre-sensitive' },
];

/**
 * Get function words by tier (discriminative priority)
 */
export function getFunctionWordsByTier(tier: 1 | 2 | 3 | 4): FunctionWord[] {
  return FUNCTION_WORDS.filter(fw => fw.tier === tier);
}

/**
 * Get function words by category
 */
export function getFunctionWordsByCategory(category: FunctionWordCategory): FunctionWord[] {
  return FUNCTION_WORDS.filter(fw => fw.category === category);
}

/**
 * Get British marker function words
 */
export function getBritishMarkers(): FunctionWord[] {
  return FUNCTION_WORDS.filter(fw => fw.britishMarker);
}

/**
 * Create lookup map for fast access
 */
export function getFunctionWordMap(): Map<string, FunctionWord> {
  const map = new Map<string, FunctionWord>();
  for (const fw of FUNCTION_WORDS) {
    map.set(fw.word.toLowerCase(), fw);
  }
  return map;
}

/**
 * General English reference statistics for z-score calculation
 * 
 * These are baseline frequencies (per 1000 words) from large English corpora
 * Source: Brown Corpus, BNC (British National Corpus)
 * 
 * Note: These should ideally be calculated from a reference corpus
 * For now, using typical values from linguistic research
 */
export const GENERAL_ENGLISH_STATS: Record<string, { mean: number; stdDev: number }> = {
  // High-frequency words (very stable across corpora)
  'the': { mean: 60.0, stdDev: 10.0 },
  'of': { mean: 35.0, stdDev: 8.0 },
  'and': { mean: 28.0, stdDev: 7.0 },
  'a': { mean: 22.0, stdDev: 5.0 },
  'to': { mean: 25.0, stdDev: 6.0 },
  'in': { mean: 20.0, stdDev: 5.0 },
  'is': { mean: 10.0, stdDev: 3.0 },
  'that': { mean: 12.0, stdDev: 4.0 },
  'for': { mean: 12.0, stdDev: 4.0 },
  'it': { mean: 11.0, stdDev: 3.0 },
  'with': { mean: 9.0, stdDev: 3.0 },
  'as': { mean: 8.0, stdDev: 3.0 },
  'was': { mean: 7.0, stdDev: 2.5 },
  'on': { mean: 7.0, stdDev: 2.5 },
  'be': { mean: 7.0, stdDev: 2.5 },
  
  // Modal verbs
  'can': { mean: 3.0, stdDev: 1.5 },
  'would': { mean: 4.0, stdDev: 2.0 },
  'will': { mean: 3.5, stdDev: 2.0 },
  'could': { mean: 2.0, stdDev: 1.0 },
  'should': { mean: 1.5, stdDev: 1.0 },
  'may': { mean: 1.0, stdDev: 0.8 },
  'might': { mean: 0.8, stdDev: 0.6 },
  'must': { mean: 0.9, stdDev: 0.7 },
  'shall': { mean: 0.2, stdDev: 0.3 },
  
  // British markers
  'whilst': { mean: 0.1, stdDev: 0.2 },  // Very rare in American English
  'upon': { mean: 0.5, stdDev: 0.5 },
  
  // Pronouns (highly variable by genre)
  'I': { mean: 5.0, stdDev: 5.0 },  // Large variance
  'we': { mean: 3.0, stdDev: 3.0 },
  'you': { mean: 4.0, stdDev: 4.0 },
  'he': { mean: 2.5, stdDev: 2.0 },
  'she': { mean: 1.5, stdDev: 1.5 },
  'they': { mean: 2.0, stdDev: 1.5 },
};
