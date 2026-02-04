/**
 * Phrase Extraction Analysis
 * 
 * Extracts frequently-used phrases for direct imitation.
 * Focuses on opening patterns, transitions, equipment references, and caveats.
 */

import nlp from 'compromise';

export interface PhraseExample {
  phrase: string;
  count: number;
  context?: string;
}

export interface PhraseLibrary {
  openingPatterns: {
    personalStory: PhraseExample[];
    directAction: PhraseExample[];
    protectiveWarning: PhraseExample[];
  };
  transitionPhrases: PhraseExample[];
  equipmentReferences: {
    withPossessive: PhraseExample[];
    generic: PhraseExample[];
  };
  caveatPhrases: PhraseExample[];
  totalPhrases: number;
}

/**
 * Extract n-grams (2-6 word phrases) from text
 */
function extractNGrams(text: string, minLength: number = 2, maxLength: number = 6): Map<string, number> {
  const words = text.toLowerCase()
    .replace(/[—–]/g, '-')
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  const ngramCounts = new Map<string, number>();
  
  for (let n = minLength; n <= maxLength; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      ngramCounts.set(ngram, (ngramCounts.get(ngram) || 0) + 1);
    }
  }
  
  return ngramCounts;
}

/**
 * Extract opening patterns from paragraphs
 */
function extractOpeningPatterns(text: string): {
  personalStory: PhraseExample[];
  directAction: PhraseExample[];
  protectiveWarning: PhraseExample[];
} {
  const paragraphs = text.split(/\n\n+/);
  const openingSentences: string[] = [];
  
  for (const para of paragraphs) {
    const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      openingSentences.push(sentences[0].trim());
    }
  }
  
  const personalStory: PhraseExample[] = [];
  const directAction: PhraseExample[] = [];
  const protectiveWarning: PhraseExample[] = [];
  
  const personalMarkers = /\b(i've|i'm|i was|i have|for me|my|when i|how i)\b/i;
  const actionMarkers = /\b(right|so|now|let's|first|start|here's|okay)\b/i;
  const warningMarkers = /\b(before|make sure|important|note|remember|warning|careful)\b/i;
  
  for (const sentence of openingSentences) {
    const lower = sentence.toLowerCase();
    
    if (personalMarkers.test(lower)) {
      personalStory.push({ phrase: sentence, count: 1 });
    } else if (actionMarkers.test(lower)) {
      directAction.push({ phrase: sentence, count: 1 });
    } else if (warningMarkers.test(lower)) {
      protectiveWarning.push({ phrase: sentence, count: 1 });
    }
  }
  
  return { personalStory, directAction, protectiveWarning };
}

/**
 * Extract transition phrases (between paragraphs or at sentence starts)
 */function extractTransitionPhrases(text: string): PhraseExample[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const transitionMarkers = [
    'at this', 'once you', 'once we', 'at that', 'after that', 'from there',
    'next up', 'moving on', 'the key', 'the thing', 'in fact', 'actually',
    'however', 'though', 'still', 'meanwhile', 'alternatively',
    'for instance', 'for example', 'essentially', 'basically'
  ];
  
  const transitions = new Map<string, number>();
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase().trim();
    
    for (const marker of transitionMarkers) {
      if (lower.startsWith(marker)) {
        const match = sentence.match(new RegExp(`^${marker}[^,]*`, 'i'));
        if (match) {
          const phrase = match[0].trim();
          transitions.set(phrase, (transitions.get(phrase) || 0) + 1);
        }
      }
    }
  }
  
  return Array.from(transitions.entries())
    .filter(([_, count]) => count >= 1)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Extract equipment references with possessives vs generic
 */
function extractEquipmentReferences(text: string): {
  withPossessive: PhraseExample[];
  generic: PhraseExample[];
} {
  const equipmentWords = [
    'pc', 'rig', 'card', 'gpu', 'block', 'pad', 'thermal', 'cooler',
    'radiator', 'pump', 'fan', 'case', 'system', 'setup', 'hardware',
    'device', 'product', 'equipment', 'unit', 'tool'
  ];
  
  const withPossessive = new Map<string, number>();
  const generic = new Map<string, number>();
  
  const doc = nlp(text);
  
  for (const word of equipmentWords) {
    const possessiveMatches = doc.match(`(my|our) ${word}`);
    possessiveMatches.forEach((match: any) => {
      const phrase = match.text().toLowerCase();
      withPossessive.set(phrase, (withPossessive.get(phrase) || 0) + 1);
    });
    
    const genericMatches = doc.match(`(the|this|that|a) ${word}`);
    genericMatches.forEach((match: any) => {
      const phrase = match.text().toLowerCase();
      generic.set(phrase, (generic.get(phrase) || 0) + 1);
    });
  }
  
  return {
    withPossessive: Array.from(withPossessive.entries())
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30),
    generic: Array.from(generic.entries())
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  };
}

/**
 * Extract caveat and honesty phrases
 */
function extractCaveatPhrases(text: string): PhraseExample[] {
  const caveatMarkers = [
    "it isn't", "it's not", "not perfect", "not ideal", "could be better",
    "i wish", "would have", "should have", "probably", "might not",
    "may not", "doesn't always", "won't always", "can be", "tends to",
    "in my case", "for me", "your mileage"
  ];
  
  const caveats = new Map<string, number>();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    
    for (const marker of caveatMarkers) {
      if (lower.includes(marker)) {
        const match = sentence.match(new RegExp(`[^.!?]*${marker}[^.!?]*`, 'i'));
        if (match) {
          const phrase = match[0].trim();
          if (phrase.length > 10 && phrase.length < 100) {
            caveats.set(phrase, (caveats.get(phrase) || 0) + 1);
          }
        }
      }
    }
  }
  
  return Array.from(caveats.entries())
    .filter(([_, count]) => count >= 1)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Main phrase extraction function
 */
export function extractPhrases(text: string): PhraseLibrary {
  const openingPatterns = extractOpeningPatterns(text);
  const transitionPhrases = extractTransitionPhrases(text);
  const equipmentReferences = extractEquipmentReferences(text);
  const caveatPhrases = extractCaveatPhrases(text);
  
  const totalPhrases = 
    openingPatterns.personalStory.length +
    openingPatterns.directAction.length +
    openingPatterns.protectiveWarning.length +
    transitionPhrases.length +
    equipmentReferences.withPossessive.length +
    equipmentReferences.generic.length +
    caveatPhrases.length;
  
  return {
    openingPatterns,
    transitionPhrases,
    equipmentReferences,
    caveatPhrases,
    totalPhrases
  };
}
