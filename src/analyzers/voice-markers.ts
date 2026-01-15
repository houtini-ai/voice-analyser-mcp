/**
 * Voice markers analysis: person, passive voice, hedging, certainty
 * v2.0 - Enhanced with signature phrases, collegial patterns, and expanded AI detection
 */

export interface VoiceMarkers {
  firstPerson: {
    frequency: number;
    examples: Array<{ phrase: string; count: number }>;
  };
  secondPerson: {
    frequency: number;
    examples: Array<{ phrase: string; count: number }>;
  };
  passiveVoiceRatio: number;
  hedgingLanguage: {
    frequency: number;
    examples: Array<{ word: string; count: number }>;
  };
  certaintyMarkers: Array<{ word: string; count: number }>;
  conversationalMarkers: Array<{ word: string; count: number }>;
  aiCliches: Array<{ phrase: string; count: number }>;
  marketingSpeak: Array<{ phrase: string; count: number }>;
  
  // NEW in v2.0
  signatureHedging: Array<{ phrase: string; count: number }>;
  collegialPatterns: Array<{ phrase: string; count: number }>;
  equipmentSpecificity: {
    specific: Array<{ phrase: string; count: number }>;  // "my Simucube 2 Pro"
    generic: Array<{ phrase: string; count: number }>;   // "the wheelbase"
  };
  identityMarkers: {
    genuineInterest: Array<{ phrase: string; count: number }>;
    honestObsession: Array<{ phrase: string; count: number }>;
    humbleHelper: Array<{ phrase: string; count: number }>;
    transparencyCommitment: Array<{ phrase: string; count: number }>;
  };
  openingPatterns: {
    personalContext: number;
    observation: number;
    question: number;
    directProblem: number;
  };
  // NEW in v2.1 - Hollow intensifiers (performative authenticity markers)
  hollowIntensifiers: Array<{ phrase: string; count: number; alternative: string }>;
}

const FIRST_PERSON_PATTERNS = [
  "I've", "I have", "I am", "I'm", "I was", "I'd", "I would", "I will", 
  "I own", "I tested", "my", "mine", "myself"
];

const SECOND_PERSON_PATTERNS = [
  "you", "your", "you're", "you've", "yourself"
];

const HEDGING_WORDS = [
  "perhaps", "possibly", "might", "may", "could", "probably", 
  "somewhat", "fairly", "rather", "quite", "relatively"
];

const CERTAINTY_WORDS = [
  "definitely", "absolutely", "certainly", "clearly", "obviously", 
  "undoubtedly", "undeniably", "unquestionably"
];

const CONVERSATIONAL_WORDS = [
  "look", "well", "frankly", "honestly", "actually", "basically", 
  "simply", "essentially"
];

// EXPANDED AI cliché list - v2.0
const AI_CLICHES = [
  // Core AI tells
  "dive into", "delve into", "delve", "unlock", "leverage", "leveraging",
  "cutting-edge", "game-changer", "transform your", "elevate your",
  "seamless", "seamlessly", "robust", "revolutionize",
  
  // Landscape/journey metaphors
  "rapidly evolving", "evolving landscape", "digital landscape",
  "in today's world", "in today's", "today's landscape",
  
  // Power/potential language
  "harness", "harnessing", "harness the power", "unlock the potential",
  "unleash", "tap into", "take your .* to the next level",
  
  // Corporate speak
  "utilize", "utilization", "empower", "synergy", "paradigm", 
  "ecosystem", "holistic", "streamline",
  
  // Filler phrases
  "at the end of the day", "it goes without saying", 
  "needless to say", "it's worth noting", "it is worth noting",
  "it bears mentioning", "it should be noted",
  
  // Enthusiasm markers
  "game changer", "absolute game changer", "truly remarkable",
  "incredibly powerful", "truly amazing", "absolutely essential"
];

const MARKETING_SPEAK = [
  "best in class", "industry-leading", "premium experience", 
  "world-class", "state-of-the-art", "next-generation", 
  "revolutionary", "groundbreaking", "unparalleled", "unmatched",
  "second to none", "best-in-class", "market-leading"
];

// NEW v2.0 - Signature hedging phrases (authentic voice patterns)
const SIGNATURE_HEDGING = [
  "I'm pretty sure",
  "my drive-by opinion",
  "my drive by opinion",
  "I'm hopeful",
  "in my experience",
  "I tend to",
  "might look like",
  "I'm reasonably certain",
  "from what I've",
  "I reckon",
  "I'd say"
];

// NEW v2.0 - Collegial patterns (normalising shortcuts)
const COLLEGIAL_PATTERNS = [
  "obviously this is inevitable",
  "we're all busy",
  "but there's more to it",
  "of course",
  "to be fair",
  "let's be honest",
  "the reality is"
];

// NEW v2.0 - Identity markers
const GENUINE_INTEREST_PATTERNS = [
  "I'm very much into",
  "I've always loved",
  "I've always been interested",
  "I'm really into"
];

const HONEST_OBSESSION_PATTERNS = [
  "fell down the slippery slope",
  "slippery slope",
  "quickly fell into",
  "became obsessed",
  "couldn't stop"
];

const HUMBLE_HELPER_PATTERNS = [
  "I'm hopeful I can help",
  "I'm hopeful that I can",
  "share the lessons",
  "hard lessons I've had",
  "lessons I've learned",
  "help you learn from"
];

const TRANSPARENCY_COMMITMENT_PATTERNS = [
  "I'll be completely transparent",
  "completely transparent",
  "where I could have saved",
  "what I'd do differently",
  "what I would do differently",
  "if I was building this again",
  "if I was doing this again",
  "many things I would do differently"
];

// NEW v2.1 - Hollow intensifiers: words that signal "I'm being authentic" 
// which paradoxically make writing feel LESS authentic
// These are performative sincerity markers - AI overuses them
const HOLLOW_INTENSIFIERS: Array<{ pattern: string; alternative: string }> = [
  { pattern: "honestly", alternative: "just state the fact directly" },
  { pattern: "genuinely", alternative: "remove - if it's genuine, it shows" },
  { pattern: "the real", alternative: "drop 'real' - 'the issue' not 'the real issue'" },
  { pattern: "really", alternative: "often removable - 'I enjoyed' not 'I really enjoyed'" },
  { pattern: "truly", alternative: "remove - sounds like marketing copy" },
  { pattern: "actually really", alternative: "pick one or neither" },
  { pattern: "I have to say", alternative: "just say it" },
  { pattern: "I must say", alternative: "just say it" },
  { pattern: "to be honest", alternative: "implies you're not honest elsewhere" },
  { pattern: "if I'm being honest", alternative: "remove - just be honest" },
  { pattern: "in all honesty", alternative: "remove - state the fact" },
  { pattern: "the truth is", alternative: "remove - just state the truth" },
  { pattern: "I can honestly say", alternative: "just say it" },
  { pattern: "quite frankly", alternative: "'frankly' alone or remove both" },
];

// NEW v2.0 - Equipment specificity patterns
const SPECIFIC_EQUIPMENT_PATTERN = /\bmy\s+([A-Z][\w]*(?:\s+[\w\d]+){1,4})/g;
// Matches: "my Simucube 2 Pro", "my NVIDIA 3090 RTX FE", "my Radical SR1"

const GENERIC_EQUIPMENT_PATTERNS = [
  "the wheelbase",
  "the wheel base",
  "a wheelbase",
  "the pedals",
  "the graphics card",
  "a graphics card",
  "the product",
  "this product",
  "the setup",
  "your setup",
  "the hardware",
  "this hardware"
];

export function analyzeVoiceMarkers(text: string): VoiceMarkers {
  const words = text.split(/\s+/);
  const totalWords = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // First person
  const firstPersonCounts = FIRST_PERSON_PATTERNS.map(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  const totalFirstPerson = firstPersonCounts.reduce((sum, p) => sum + p.count, 0);
  const firstPersonFrequency = totalWords > 0 ? (totalFirstPerson / totalWords) * 100 : 0;
  
  // Second person
  const secondPersonCounts = SECOND_PERSON_PATTERNS.map(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  const totalSecondPerson = secondPersonCounts.reduce((sum, p) => sum + p.count, 0);
  const secondPersonFrequency = totalWords > 0 ? (totalSecondPerson / totalWords) * 100 : 0;
  
  // Passive voice (basic detection: "was/were/been" + past participle pattern)
  const passiveMatches = text.match(/\b(was|were|been)\s+\w+ed\b/gi) || [];
  const passiveVoiceRatio = sentences.length > 0 ? (passiveMatches.length / sentences.length) * 100 : 0;
  
  // Hedging language
  const hedgingCounts = HEDGING_WORDS.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { word, count: matches.length };
  }).filter(w => w.count > 0);
  
  const totalHedging = hedgingCounts.reduce((sum, w) => sum + w.count, 0);
  const hedgingFrequency = totalWords > 0 ? (totalHedging / totalWords) * 100 : 0;
  
  // Certainty markers
  const certaintyMarkers = CERTAINTY_WORDS.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { word, count: matches.length };
  }).filter(w => w.count > 0);
  
  // Conversational markers
  const conversationalMarkers = CONVERSATIONAL_WORDS.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { word, count: matches.length };
  }).filter(w => w.count > 0);
  
  // AI clichés
  const aiCliches = AI_CLICHES.map(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  // Marketing speak
  const marketingSpeak = MARKETING_SPEAK.map(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  // NEW v2.0 - Signature hedging
  const signatureHedging = SIGNATURE_HEDGING.map(phrase => {
    const regex = new RegExp(phrase.replace(/['']/g, "[''']"), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  // NEW v2.0 - Collegial patterns
  const collegialPatterns = COLLEGIAL_PATTERNS.map(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  // NEW v2.0 - Equipment specificity
  const specificEquipmentMatches: Array<{ phrase: string; count: number }> = [];
  const specificPattern = /\bmy\s+([A-Z][\w]*(?:\s+[\w\d]+){0,4})/g;
  let match;
  const specificCounts = new Map<string, number>();
  while ((match = specificPattern.exec(text)) !== null) {
    const phrase = match[0];
    specificCounts.set(phrase, (specificCounts.get(phrase) || 0) + 1);
  }
  specificCounts.forEach((count, phrase) => {
    specificEquipmentMatches.push({ phrase, count });
  });
  
  const genericEquipmentMatches = GENERIC_EQUIPMENT_PATTERNS.map(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  // NEW v2.0 - Identity markers
  const genuineInterest = GENUINE_INTEREST_PATTERNS.map(phrase => {
    const regex = new RegExp(phrase.replace(/['']/g, "[''']"), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  const honestObsession = HONEST_OBSESSION_PATTERNS.map(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  const humbleHelper = HUMBLE_HELPER_PATTERNS.map(phrase => {
    const regex = new RegExp(phrase.replace(/['']/g, "[''']").replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  const transparencyCommitment = TRANSPARENCY_COMMITMENT_PATTERNS.map(phrase => {
    const regex = new RegExp(phrase.replace(/['']/g, "[''']").replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex) || [];
    return { phrase, count: matches.length };
  }).filter(p => p.count > 0);
  
  // NEW v2.0 - Opening patterns (analyze first sentences of paragraphs)
  const paragraphs = text.split(/\n\n+/);
  let personalContextCount = 0;
  let observationCount = 0;
  let questionCount = 0;
  let directProblemCount = 0;
  
  const firstSentencePatterns = {
    personalContext: [/^For me,/i, /^I've always/i, /^I'm very much/i, /^I own/i],
    observation: [/^Surprisingly/i, /^Interestingly/i, /^Strangely/i],
    question: [/^How does/i, /^How do/i, /^What is/i, /^Why do/i, /^Have you/i],
    directProblem: [/^Addressing/i, /^The (main|core|fundamental)/i, /^One of the/i]
  };
  
  for (const para of paragraphs) {
    const firstSentence = para.split(/[.!?]/)[0] || '';
    
    if (firstSentencePatterns.personalContext.some(p => p.test(firstSentence))) {
      personalContextCount++;
    }
    if (firstSentencePatterns.observation.some(p => p.test(firstSentence))) {
      observationCount++;
    }
    if (firstSentencePatterns.question.some(p => p.test(firstSentence))) {
      questionCount++;
    }
    if (firstSentencePatterns.directProblem.some(p => p.test(firstSentence))) {
      directProblemCount++;
    }
  }
  
  // NEW v2.1 - Hollow intensifiers detection
  const hollowIntensifiers = HOLLOW_INTENSIFIERS.map(({ pattern, alternative }) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    const matches = text.match(regex) || [];
    return { phrase: pattern, count: matches.length, alternative };
  }).filter(p => p.count > 0);
  
  return {
    firstPerson: {
      frequency: firstPersonFrequency,
      examples: firstPersonCounts
    },
    secondPerson: {
      frequency: secondPersonFrequency,
      examples: secondPersonCounts
    },
    passiveVoiceRatio,
    hedgingLanguage: {
      frequency: hedgingFrequency,
      examples: hedgingCounts
    },
    certaintyMarkers,
    conversationalMarkers,
    aiCliches,
    marketingSpeak,
    
    // NEW v2.0
    signatureHedging,
    collegialPatterns,
    equipmentSpecificity: {
      specific: specificEquipmentMatches.sort((a, b) => b.count - a.count),
      generic: genericEquipmentMatches
    },
    identityMarkers: {
      genuineInterest,
      honestObsession,
      humbleHelper,
      transparencyCommitment
    },
    openingPatterns: {
      personalContext: personalContextCount,
      observation: observationCount,
      question: questionCount,
      directProblem: directProblemCount
    },
    // NEW v2.1
    hollowIntensifiers
  };
}
