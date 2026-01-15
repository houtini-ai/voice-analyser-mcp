/**
 * Paragraph Transitions Analyzer
 * Detects how this writer connects paragraphs and shifts topics
 */

export interface ParagraphTransition {
  fromType: 'technical' | 'personal' | 'example' | 'warning' | 'explanation';
  toType: 'technical' | 'personal' | 'example' | 'warning' | 'explanation';
  linkingDevice: string;
  linkingPhrase?: string;
  frequency: number;
  examples: TransitionExample[];
}

export interface TransitionExample {
  paragraph1: string;
  transitionSentence: string;
  paragraph2: string;
}

export interface ParagraphTransitionsAnalysis {
  transitions: ParagraphTransition[];
  topicShiftPatterns: {
    pattern: string;
    description: string;
    frequency: number;
    examples: string[];
  }[];
  energyShifts: {
    from: string;
    to: string;
    description: string;
    markers: string[];
    examples: string[];
  }[];
}

export function analyzeParagraphTransitions(text: string): ParagraphTransitionsAnalysis {
  const paragraphs = text.split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 50);
  
  const transitions = detectTransitions(paragraphs);
  const topicShifts = detectTopicShiftPatterns(paragraphs);
  const energyShifts = detectEnergyShifts(paragraphs);
  
  return {
    transitions,
    topicShiftPatterns: topicShifts,
    energyShifts
  };
}

function detectTransitions(paragraphs: string[]): ParagraphTransition[] {
  const transitionMap: Map<string, ParagraphTransition> = new Map();
  
  for (let i = 0; i < paragraphs.length - 1; i++) {
    const para1 = paragraphs[i];
    const para2 = paragraphs[i + 1];
    
    const type1 = classifyParagraph(para1);
    const type2 = classifyParagraph(para2);
    
    const linkingDevice = detectLinkingDevice(para2);
    const key = `${type1}->${type2}:${linkingDevice}`;
    
    if (!transitionMap.has(key)) {
      transitionMap.set(key, {
        fromType: type1,
        toType: type2,
        linkingDevice,
        linkingPhrase: extractLinkingPhrase(para2, linkingDevice),
        frequency: 0,
        examples: []
      });
    }
    
    const transition = transitionMap.get(key)!;
    transition.frequency++;
    
    if (transition.examples.length < 3) {
      const firstSentence2 = para2.split(/[.!?]/)[0] || '';
      transition.examples.push({
        paragraph1: para1,
        transitionSentence: firstSentence2.trim(),
        paragraph2: para2
      });
    }
  }
  
  return Array.from(transitionMap.values())
    .filter(t => t.frequency > 0)
    .sort((a, b) => b.frequency - a.frequency);
}

function classifyParagraph(para: string): 'technical' | 'personal' | 'example' | 'warning' | 'explanation' {
  const lower = para.toLowerCase();
  
  // Technical: high density of technical terms, specifications, measurements
  const technicalMarkers = ['specifications', 'performance', 'features', 'technical', 'model', 'version'];
  const hasTechnical = technicalMarkers.some(m => lower.includes(m)) || 
                       /\d+\s*(nm|kg|mm|watts|hz|fps)/i.test(para);
  
  // Personal: first-person, personal experience
  const personalMarkers = ['i\'ve', 'my', 'i tested', 'in my experience', 'i found'];
  const hasPersonal = personalMarkers.some(m => lower.includes(m));
  
  // Warning: protective, cautionary language
  const warningMarkers = ['before', 'caveat', 'warning', 'watch out', 'be careful', 'avoid'];
  const hasWarning = warningMarkers.some(m => lower.includes(m));
  
  // Example: contains "for example", "for instance", specific scenarios
  const exampleMarkers = ['for example', 'for instance', 'consider', 'imagine', 'say you'];
  const hasExample = exampleMarkers.some(m => lower.includes(m));
  
  // Classify by strongest signal
  if (hasWarning) return 'warning';
  if (hasPersonal) return 'personal';
  if (hasExample) return 'example';
  if (hasTechnical) return 'technical';
  return 'explanation';
}

function detectLinkingDevice(para: string): string {
  const firstSentence = para.split(/[.!?]/)[0].toLowerCase().trim();
  
  // Direct continuation devices
  if (/^(and|also|additionally|furthermore|moreover)/.test(firstSentence)) {
    return 'additive';
  }
  
  // Contrast devices
  if (/^(but|however|though|although|yet|still)/.test(firstSentence)) {
    return 'contrast';
  }
  
  // Causal devices
  if (/^(so|therefore|thus|hence|consequently|as a result)/.test(firstSentence)) {
    return 'causal';
  }
  
  // Temporal devices
  if (/^(now|then|next|after|before|when|once)/.test(firstSentence)) {
    return 'temporal';
  }
  
  // Example devices
  if (/^(for example|for instance|consider|imagine)/.test(firstSentence)) {
    return 'example';
  }
  
  // Emphasis devices
  if (/^(importantly|crucially|note that|remember|the key)/.test(firstSentence)) {
    return 'emphasis';
  }
  
  // Question devices
  if (firstSentence.includes('?')) {
    return 'question';
  }
  
  // Conversational restart
  if (/^(look|well|okay|right|actually)/.test(firstSentence)) {
    return 'conversational_restart';
  }
  
  return 'implicit';
}

function extractLinkingPhrase(para: string, device: string): string | undefined {
  if (device === 'implicit') return undefined;
  
  const firstSentence = para.split(/[.!?]/)[0];
  const words = firstSentence.trim().split(/\s+/);
  
  // Return first 1-3 words that constitute the linking phrase
  if (device === 'conversational_restart') {
    return words.slice(0, 1).join(' ');
  }
  
  return words.slice(0, Math.min(3, words.length)).join(' ');
}

function detectTopicShiftPatterns(paragraphs: string[]): any[] {
  const patterns: any[] = [];
  
  // Pattern: Zoom in (general → specific)
  const zoomInShifts = findZoomInShifts(paragraphs);
  if (zoomInShifts.length > 0) {
    patterns.push({
      pattern: 'Zoom In (General → Specific)',
      description: 'Starts broad, then narrows to specific example or technical detail',
      frequency: zoomInShifts.length,
      examples: zoomInShifts.slice(0, 2)
    });
  }
  
  // Pattern: Zoom out (specific → general)
  const zoomOutShifts = findZoomOutShifts(paragraphs);
  if (zoomOutShifts.length > 0) {
    patterns.push({
      pattern: 'Zoom Out (Specific → General)',
      description: 'Discusses specific case, then pulls back to broader implications',
      frequency: zoomOutShifts.length,
      examples: zoomOutShifts.slice(0, 2)
    });
  }
  
  // Pattern: Problem → Solution chains
  const problemSolutionChains = findProblemSolutionChains(paragraphs);
  if (problemSolutionChains.length > 0) {
    patterns.push({
      pattern: 'Problem → Solution Chain',
      description: 'Identifies problem in one paragraph, provides solution in next',
      frequency: problemSolutionChains.length,
      examples: problemSolutionChains.slice(0, 2)
    });
  }
  
  return patterns;
}

function findZoomInShifts(paragraphs: string[]): string[] {
  const examples: string[] = [];
  
  for (let i = 0; i < paragraphs.length - 1; i++) {
    const para1Lower = paragraphs[i].toLowerCase();
    const para2Lower = paragraphs[i + 1].toLowerCase();
    
    // General paragraph has abstract concepts
    const isGeneral = ['generally', 'overall', 'typically', 'most', 'many'].some(w => 
      para1Lower.includes(w)
    );
    
    // Specific paragraph has concrete details
    const isSpecific = ['specifically', 'for example', 'for instance'].some(w => 
      para2Lower.includes(w)
    ) || /\d+\s*(nm|kg|mm|watts|hz|fps)/i.test(paragraphs[i + 1]);
    
    if (isGeneral && isSpecific) {
      examples.push(`${paragraphs[i]} → ${paragraphs[i + 1]}`);
    }
  }
  
  return examples;
}

function findZoomOutShifts(paragraphs: string[]): string[] {
  const examples: string[] = [];
  
  for (let i = 0; i < paragraphs.length - 1; i++) {
    const para1 = paragraphs[i];
    const para2Lower = paragraphs[i + 1].toLowerCase();
    
    const isSpecific = /\d+\s*(nm|kg|mm|watts|hz|fps)/i.test(para1);
    const isGeneral = ['this means', 'in practice', 'the takeaway', 'overall'].some(w => 
      para2Lower.includes(w)
    );
    
    if (isSpecific && isGeneral) {
      examples.push(`${para1} → ${paragraphs[i + 1]}`);
    }
  }
  
  return examples;
}

function findProblemSolutionChains(paragraphs: string[]): string[] {
  const examples: string[] = [];
  
  const problemWords = ['problem', 'issue', 'challenge', 'difficult', 'struggle'];
  const solutionWords = ['solution', 'fix', 'answer', 'resolve', 'address', 'works'];
  
  for (let i = 0; i < paragraphs.length - 1; i++) {
    const para1Lower = paragraphs[i].toLowerCase();
    const para2Lower = paragraphs[i + 1].toLowerCase();
    
    const hasProblem = problemWords.some(w => para1Lower.includes(w));
    const hasSolution = solutionWords.some(w => para2Lower.includes(w));
    
    if (hasProblem && hasSolution) {
      examples.push(`PROBLEM: ${paragraphs[i]} → SOLUTION: ${paragraphs[i + 1]}`);
    }
  }
  
  return examples;
}

function detectEnergyShifts(paragraphs: string[]): any[] {
  const shifts: any[] = [];
  
  // High energy → technical detail
  const highToTechnical = findEnergyShift(paragraphs, 
    ['!', 'great', 'excellent', 'impressive'],
    ['specifications', 'technical', 'features', 'performance']
  );
  
  if (highToTechnical.length > 0) {
    shifts.push({
      from: 'High Energy (Enthusiasm)',
      to: 'Technical Detail',
      description: 'Establishes enthusiasm, then grounds in technical specifics',
      markers: ['Exclamation marks → specification language'],
      examples: highToTechnical
    });
  }
  
  // Technical → personal experience
  const technicalToPersonal = findEnergyShift(paragraphs,
    ['specifications', 'technical', 'features'],
    ['i\'ve', 'my', 'in my experience']
  );
  
  if (technicalToPersonal.length > 0) {
    shifts.push({
      from: 'Technical Detail',
      to: 'Personal Experience',
      description: 'Presents specs, then validates with personal testing',
      markers: ['Specification language → first-person'],
      examples: technicalToPersonal
    });
  }
  
  return shifts;
}

function findEnergyShift(paragraphs: string[], fromMarkers: string[], toMarkers: string[]): string[] {
  const examples: string[] = [];
  
  for (let i = 0; i < paragraphs.length - 1; i++) {
    const para1Lower = paragraphs[i].toLowerCase();
    const para2Lower = paragraphs[i + 1].toLowerCase();
    
    const hasFrom = fromMarkers.some(m => para1Lower.includes(m));
    const hasTo = toMarkers.some(m => para2Lower.includes(m));
    
    if (hasFrom && hasTo && examples.length < 3) {
      examples.push(`${paragraphs[i]} → ${paragraphs[i + 1]}`);
    }
  }
  
  return examples;
}