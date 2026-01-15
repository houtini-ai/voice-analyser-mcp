/**
 * Expression marker analysis
 * Detects personal, informal, and stylistic elements of writing
 * 
 * Key markers for human writing:
 * - Sentence fragments: AI rarely uses these
 * - Rhetorical questions: Human expressiveness
 * - Mid-sentence asides: Parentheticals, dashes
 * - Contractions: Informal human marker
 * - Hedging phrases: Human uncertainty markers
 */

import nlp from 'compromise';

export interface ExpressionMarkerAnalysis {
  fragments: {
    count: number;
    rate: number; // per 100 sentences
    examples: string[];
    detectionRisk: 'safe' | 'moderate' | 'high';
    guidance: string;
  };
  rhetoricalQuestions: {
    count: number;
    rate: number; // per 1000 words
    examples: string[];
    guidance: string;
  };
  midSentenceAsides: {
    count: number;
    rate: number; // per 100 sentences
    types: {
      parenthetical: number;
      dashes: number;
      commaAsides: number;
    };
    examples: string[];
    guidance: string;
  };
  contractions: {
    count: number;
    rate: number; // per 100 words
    examples: string[];
  };
  hedgingPhrases: {
    count: number;
    rate: number;
    examples: string[];
  };
  emphaticMarkers: {
    count: number;
    rate: number;
    examples: string[];
  };
}

/**
 * Analyze expression markers in corpus
 */
export function analyzeExpressionMarkers(text: string): ExpressionMarkerAnalysis {
  const doc = nlp(text);
  const totalWords = doc.wordCount();
  
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Detect various markers
  const fragments = detectFragments(sentences);
  const questions = detectRhetoricalQuestions(sentences, totalWords);
  const asides = detectMidSentenceAsides(sentences);
  const contractions = detectContractions(doc, totalWords);
  const hedging = detectHedgingPhrases(doc, totalWords);
  const emphatic = detectEmphaticMarkers(doc, totalWords);
  
  return {
    fragments,
    rhetoricalQuestions: questions,
    midSentenceAsides: asides,
    contractions,
    hedgingPhrases: hedging,
    emphaticMarkers: emphatic
  };
}

/**
 * Detect sentence fragments (incomplete sentences)
 */
function detectFragments(sentences: string[]) {
  const doc = nlp(sentences.join('. '));
  const fragments: string[] = [];
  
  for (const sentence of sentences) {
    const sentDoc = nlp(sentence);
    const hasMainVerb = sentDoc.verbs().length > 0;
    const wordCount = sentDoc.wordCount();
    
    // Fragment = no main verb OR very short (1-4 words)
    if (!hasMainVerb || wordCount <= 4) {
      fragments.push(sentence);
    }
  }
  
  const count = fragments.length;
  const rate = sentences.length > 0 ? (count / sentences.length) * 100 : 0;
  
  // Humans use ~5% fragments, AI uses <0.5%
  const humanTypicalRate = 5.0;
  const detectionRisk: 'safe' | 'moderate' | 'high' = 
    rate < humanTypicalRate * 0.2 ? 'high' :
    rate < humanTypicalRate * 0.5 ? 'moderate' : 'safe';
  
  return {
    count,
    rate,
    examples: fragments.slice(0, 15),
    detectionRisk,
    guidance: generateFragmentGuidance(rate, humanTypicalRate)
  };
}

/**
 * Detect rhetorical questions
 */
function detectRhetoricalQuestions(sentences: string[], totalWords: number) {
  const questions = sentences.filter(s => s.includes('?'));
  
  const count = questions.length;
  const rate = totalWords > 0 ? (count / totalWords) * 1000 : 0;
  
  return {
    count,
    rate,
    examples: questions.slice(0, 10),
    guidance: generateQuestionGuidance(rate)
  };
}

/**
 * Detect mid-sentence asides (parenthetical, dashes)
 */
function detectMidSentenceAsides(sentences: string[]) {
  let parenthetical = 0;
  let dashes = 0;
  let commaAsides = 0;
  const examples: string[] = [];
  
  for (const sentence of sentences) {
    // Parenthetical asides
    if (sentence.includes('(') && sentence.includes(')')) {
      parenthetical++;
      const match = sentence.match(/\([^)]+\)/);
      if (match) examples.push(match[0]);
    }
    
    // Em-dash or double-dash asides
    if (sentence.match(/—[^—]+—/) || sentence.match(/\s-\s[^-]+\s-\s/)) {
      dashes++;
      const match = sentence.match(/[—-][^—-]+[—-]/);
      if (match) examples.push(match[0]);
    }
    
    // Comma-enclosed asides (simple heuristic: commas with certain patterns)
    const commaMatches = sentence.match(/,\s*(?:of course|naturally|obviously|clearly|frankly)[^,]*/g);
    if (commaMatches) {
      commaAsides += commaMatches.length;
      examples.push(...commaMatches);
    }
  }
  
  const total = parenthetical + dashes + commaAsides;
  const rate = sentences.length > 0 ? (total / sentences.length) * 100 : 0;
  
  return {
    count: total,
    rate,
    types: {
      parenthetical,
      dashes,
      commaAsides
    },
    examples: examples.slice(0, 15),
    guidance: generateAsideGuidance(rate)
  };
}

/**
 * Detect contractions (I'm, don't, can't, etc.)
 */
function detectContractions(doc: any, totalWords: number) {
  const contractions = doc.match('#Contraction');
  const count = contractions.length;
  const rate = totalWords > 0 ? (count / totalWords) * 100 : 0;
  
  return {
    count,
    rate,
    examples: contractions.out('array').slice(0, 15)
  };
}

/**
 * Detect hedging phrases (I think, probably, might, seems, etc.)
 */
function detectHedgingPhrases(doc: any, totalWords: number) {
  const hedgingPatterns = [
    'I think', 'I believe', 'probably', 'possibly', 'might',
    'could be', 'seems', 'appears', 'likely', 'perhaps',
    'maybe', 'somewhat', 'sort of', 'kind of'
  ];
  
  const examples: string[] = [];
  let count = 0;
  
  for (const pattern of hedgingPatterns) {
    const matches = doc.match(pattern);
    if (matches.length > 0) {
      count += matches.length;
      examples.push(...matches.out('array'));
    }
  }
  
  const rate = totalWords > 0 ? (count / totalWords) * 100 : 0;
  
  return {
    count,
    rate,
    examples: examples.slice(0, 15)
  };
}

/**
 * Detect emphatic markers (actually, really, very, quite, etc.)
 */
function detectEmphaticMarkers(doc: any, totalWords: number) {
  const emphaticPatterns = [
    'actually', 'really', 'very', 'quite', 'extremely',
    'absolutely', 'completely', 'totally', 'definitely', 'certainly'
  ];
  
  const examples: string[] = [];
  let count = 0;
  
  for (const pattern of emphaticPatterns) {
    const matches = doc.match(pattern);
    if (matches.length > 0) {
      count += matches.length;
      examples.push(...matches.out('array'));
    }
  }
  
  const rate = totalWords > 0 ? (count / totalWords) * 100 : 0;
  
  return {
    count,
    rate,
    examples: examples.slice(0, 15)
  };
}

/**
 * Generate guidance for fragment usage
 */
function generateFragmentGuidance(rate: number, humanTypical: number): string {
  const ratio = rate / humanTypical;
  
  if (ratio < 0.2) {
    return `HIGH RISK: Only ${(ratio * 100).toFixed(0)}% of human typical. AI rarely uses fragments. ADD deliberate fragments for emphasis, especially after technical points.`;
  } else if (ratio < 0.5) {
    return `MODERATE RISK: ${(ratio * 100).toFixed(0)}% of human typical. Consider adding more sentence fragments.`;
  } else {
    return `SAFE: ${(ratio * 100).toFixed(0)}% of human typical. Natural fragment usage.`;
  }
}

/**
 * Generate guidance for rhetorical question usage
 */
function generateQuestionGuidance(rate: number): string {
  if (rate < 1.0) {
    return 'Very few questions. Consider adding rhetorical questions for engagement.';
  } else if (rate < 3.0) {
    return 'Moderate question usage. Acceptable range.';
  } else {
    return 'Frequent questions. Strong conversational element.';
  }
}

/**
 * Generate guidance for aside usage
 */
function generateAsideGuidance(rate: number): string {
  // Humans use ~8% asides, AI uses ~1%
  const humanTypical = 8.0;
  const ratio = rate / humanTypical;
  
  if (ratio < 0.3) {
    return `Very few asides (${(ratio * 100).toFixed(0)}% of human typical). AI avoids parentheticals and dashes. ADD mid-sentence clarifications and asides.`;
  } else if (ratio < 0.6) {
    return `Moderate aside usage (${(ratio * 100).toFixed(0)}% of human typical). Consider adding more.`;
  } else {
    return `Strong aside usage (${(ratio * 100).toFixed(0)}% of human typical). Natural conversational style.`;
  }
}
