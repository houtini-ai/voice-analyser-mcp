/**
 * Vocabulary Tier Analysis
 * 
 * Identifies formal vs casual vocabulary to help writers avoid
 * using words that are too formal for their authentic voice.
 */

import nlp from 'compromise';

// Common formal words that signal academic/corporate writing
const FORMAL_VERBS = [
  'achieve', 'acquire', 'demonstrate', 'facilitate', 'implement',
  'utilize', 'obtain', 'commence', 'conclude', 'determine',
  'establish', 'examine', 'indicate', 'investigate', 'maintain',
  'perform', 'proceed', 'provide', 'require', 'select',
  'subsequent', 'sufficient', 'undertake', 'employ', 'enable'
];

const FORMAL_ADJECTIVES = [
  'optimal', 'comprehensive', 'significant', 'substantial', 'considerable',
  'extensive', 'numerous', 'various', 'particular', 'specific',
  'appropriate', 'adequate', 'sufficient', 'relevant', 'potential'
];

const FORMAL_ADVERBS = [
  'subsequently', 'accordingly', 'consequently', 'furthermore',
  'moreover', 'nevertheless', 'nonetheless', 'additionally',
  'alternatively', 'evidently', 'presumably', 'potentially'
];

// AI slop words (zero tolerance)
const AI_SLOP = [
  'delve', 'leverage', 'unlock', 'seamless', 'robust',
  'cutting-edge', 'game-changer', 'revolutionize', 'groundbreaking',
  'transform', 'elevate', 'empower', 'synergy', 'paradigm',
  'holistic', 'dynamic', 'innovative', 'strategic', 'optimize'
];

export interface VocabularyTier {
  word: string;
  count: number;
  category: 'verb' | 'adjective' | 'adverb';
  formality: 'formal' | 'ai-slop';
  suggestedAlternatives: string[];
}

export interface VocabularyTierAnalysis {
  formalVerbs: VocabularyTier[];
  formalAdjectives: VocabularyTier[];
  formalAdverbs: VocabularyTier[];
  aiSlop: VocabularyTier[];
  totalFormalWords: number;
  formalityScore: number; // 0-100, lower is more casual
  recommendations: string[];
}

/**
 * Get casual alternatives for formal words
 */
function getCasualAlternatives(word: string): string[] {
  const alternatives: Record<string, string[]> = {
    'achieve': ['get', 'reach', 'hit', 'manage'],
    'acquire': ['get', 'buy', 'pick up', 'grab'],
    'demonstrate': ['show', 'prove', 'test'],
    'facilitate': ['help', 'make easier', 'enable'],
    'implement': ['use', 'put in place', 'set up', 'install'],
    'utilize': ['use'],
    'obtain': ['get', 'find', 'buy'],
    'commence': ['start', 'begin', 'kick off'],
    'conclude': ['finish', 'end', 'wrap up', 'decide'],
    'determine': ['find out', 'figure out', 'check', 'test'],
    'establish': ['set up', 'create', 'build', 'prove'],
    'examine': ['look at', 'check', 'test', 'study'],
    'indicate': ['show', 'suggest', 'point to'],
    'investigate': ['look into', 'check out', 'research'],
    'maintain': ['keep', 'hold', 'run'],
    'perform': ['do', 'run', 'carry out'],
    'proceed': ['go ahead', 'continue', 'move on'],
    'provide': ['give', 'offer', 'supply'],
    'require': ['need', 'must have', 'call for'],
    'select': ['pick', 'choose'],
    'employ': ['use', 'hire'],
    'enable': ['let', 'allow', 'make possible'],
    
    // Adjectives
    'optimal': ['best', 'ideal', 'perfect'],
    'comprehensive': ['complete', 'full', 'thorough'],
    'significant': ['big', 'major', 'important'],
    'substantial': ['big', 'large', 'considerable'],
    'extensive': ['large', 'wide', 'thorough'],
    'numerous': ['many', 'lots of', 'plenty of'],
    'various': ['different', 'several', 'a few'],
    'particular': ['specific', 'certain', 'this'],
    'appropriate': ['right', 'suitable', 'proper'],
    'adequate': ['enough', 'good enough', 'sufficient'],
    'relevant': ['related', 'connected', 'important'],
    
    // AI slop
    'delve': ['explore', 'look at', 'examine', 'dig into'],
    'leverage': ['use', 'apply', 'take advantage of'],
    'unlock': ['discover', 'access', 'enable', 'reveal'],
    'seamless': ['smooth', 'easy', 'works well'],
    'robust': ['strong', 'reliable', 'solid'],
    'cutting-edge': ['latest', 'modern', 'new'],
    'game-changer': ['big improvement', 'major change'],
    'revolutionize': ['change completely', 'transform'],
    'groundbreaking': ['new', 'innovative', 'first-of-its-kind'],
    'transform': ['change', 'improve', 'reshape'],
    'elevate': ['improve', 'enhance', 'lift'],
    'empower': ['enable', 'allow', 'help'],
    'optimize': ['improve', 'fine-tune', 'tweak']
  };
  
  return alternatives[word.toLowerCase()] || ['[rewrite in simpler terms]'];
}

/**
 * Analyze vocabulary formality in text
 */
export function analyzeVocabularyTiers(text: string): VocabularyTierAnalysis {
  const doc = nlp(text);
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
  
  const formalVerbs: VocabularyTier[] = [];
  const formalAdjectives: VocabularyTier[] = [];
  const formalAdverbs: VocabularyTier[] = [];
  const aiSlop: VocabularyTier[] = [];
  
  // Count formal verbs
  for (const verb of FORMAL_VERBS) {
    const count = words.filter(w => w === verb || w === verb + 's' || w === verb + 'ed' || w === verb + 'ing').length;
    if (count > 0) {
      formalVerbs.push({
        word: verb,
        count,
        category: 'verb',
        formality: 'formal',
        suggestedAlternatives: getCasualAlternatives(verb)
      });
    }
  }
  
  // Count formal adjectives
  for (const adj of FORMAL_ADJECTIVES) {
    const count = words.filter(w => w === adj).length;
    if (count > 0) {
      formalAdjectives.push({
        word: adj,
        count,
        category: 'adjective',
        formality: 'formal',
        suggestedAlternatives: getCasualAlternatives(adj)
      });
    }
  }
  
  // Count formal adverbs
  for (const adv of FORMAL_ADVERBS) {
    const count = words.filter(w => w === adv).length;
    if (count > 0) {
      formalAdverbs.push({
        word: adv,
        count,
        category: 'adverb',
        formality: 'formal',
        suggestedAlternatives: getCasualAlternatives(adv)
      });
    }
  }
  
  // Count AI slop (zero tolerance)
  for (const slop of AI_SLOP) {
    const count = words.filter(w => w === slop || w === slop + 's' || w === slop + 'ed' || w === slop + 'ing').length;
    if (count > 0) {
      aiSlop.push({
        word: slop,
        count,
        category: 'verb',
        formality: 'ai-slop',
        suggestedAlternatives: getCasualAlternatives(slop)
      });
    }
  }
  
  const totalFormalWords = formalVerbs.reduce((sum, v) => sum + v.count, 0) +
                          formalAdjectives.reduce((sum, v) => sum + v.count, 0) +
                          formalAdverbs.reduce((sum, v) => sum + v.count, 0);
  
  const totalWords = words.length;
  const formalityScore = Math.round((totalFormalWords / totalWords) * 1000); // per 1000 words
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (aiSlop.length > 0) {
    recommendations.push(`❌ CRITICAL: Found ${aiSlop.length} AI slop words. These MUST be removed.`);
  }
  
  if (formalityScore > 20) {
    recommendations.push(`⚠️ HIGH FORMALITY: ${formalityScore} formal words per 1000. Replace with casual equivalents.`);
  } else if (formalityScore > 10) {
    recommendations.push(`⚠️ MODERATE FORMALITY: ${formalityScore} formal words per 1000. Consider simplifying.`);
  } else if (formalityScore > 5) {
    recommendations.push(`✓ ACCEPTABLE: ${formalityScore} formal words per 1000. Minor tweaks recommended.`);
  } else {
    recommendations.push(`✓ CASUAL VOICE: ${formalityScore} formal words per 1000. Good natural tone.`);
  }
  
  if (formalVerbs.length > 0) {
    const top3 = formalVerbs.sort((a, b) => b.count - a.count).slice(0, 3);
    recommendations.push(`Most used formal verbs: ${top3.map(v => `"${v.word}" (${v.count}×)`).join(', ')}`);
  }
  
  return {
    formalVerbs: formalVerbs.sort((a, b) => b.count - a.count),
    formalAdjectives: formalAdjectives.sort((a, b) => b.count - a.count),
    formalAdverbs: formalAdverbs.sort((a, b) => b.count - a.count),
    aiSlop: aiSlop.sort((a, b) => b.count - a.count),
    totalFormalWords,
    formalityScore,
    recommendations
  };
}
