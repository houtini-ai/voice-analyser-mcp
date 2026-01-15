/**
 * Argument Flow Analyzer v2.0
 * Detects how this writer builds arguments with confidence scoring
 */

import * as nlp from 'compromise';

export interface ArgumentPattern {
  pattern: string;
  description: string;
  frequency: number;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0-1 numeric score
  examples: ArgumentExample[];
}

export interface ArgumentExample {
  fullText: string;
  components: {
    opening?: string;
    claim?: string;
    evidence?: string;
    counterpoint?: string;
    dismissal?: string;
    conclusion?: string;
    linkingPhrase?: string;
  };
}

export interface ConversationalDevice {
  type: 'thought_restart' | 'tangent_marker' | 'reader_alignment' | 'admission' | 'emphasis';
  trigger: string;
  context: string;
  purpose: string;
  frequency: number;
  examples: string[];
}

export interface ArgumentFlowAnalysis {
  patterns: ArgumentPattern[];
  conversationalDevices: ConversationalDevice[];
  openingMoves: {
    type: string;
    description: string;
    frequency: number;
    examples: string[];
  }[];
  closingMoves: {
    type: string;
    description: string;
    frequency: number;
    examples: string[];
  }[];
}

export function analyzeArgumentFlow(text: string): ArgumentFlowAnalysis {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 100);
  
  const devices = analyzeConversationalDevices(text, paragraphs);
  const patterns = detectArgumentPatterns(paragraphs);
  const openingMoves = analyzeOpeningMoves(paragraphs);
  const closingMoves = analyzeClosingMoves(paragraphs);
  
  return {
    patterns,
    conversationalDevices: devices,
    openingMoves,
    closingMoves
  };
}

function analyzeConversationalDevices(text: string, paragraphs: string[]): ConversationalDevice[] {
  const devices: ConversationalDevice[] = [];
  
  const actuallyMatches = text.match(/\bactually\b/gi) || [];
  if (actuallyMatches.length > 0) {
    const examples = findContextForDevice(text, 'actually', 5);
    devices.push({
      type: 'thought_restart',
      trigger: 'actually',
      context: 'Appears mid-argument to pivot from expectation to reality',
      purpose: 'Signals course correction - "here\'s what\'s really true"',
      frequency: actuallyMatches.length,
      examples
    });
  }
  
  const lookMatches = text.match(/\blook[,:\s]/gi) || [];
  if (lookMatches.length > 0) {
    const examples = findContextForDevice(text, 'look', 5);
    devices.push({
      type: 'reader_alignment',
      trigger: 'look',
      context: 'Sentence-initial position, before key point',
      purpose: 'Breaks formality, demands attention for important point',
      frequency: lookMatches.length,
      examples
    });
  }
  
  const wellMatches = text.match(/\bwell[,:\s]/gi) || [];
  if (wellMatches.length > 0) {
    const examples = findContextForDevice(text, 'well', 5);
    devices.push({
      type: 'thought_restart',
      trigger: 'well',
      context: 'Transition between thoughts',
      purpose: 'Signals considerate pause or reconsideration',
      frequency: wellMatches.length,
      examples
    });
  }
  
  const franklyMatches = text.match(/\bfrankly\b/gi) || [];
  if (franklyMatches.length > 0) {
    const examples = findContextForDevice(text, 'frankly', 5);
    devices.push({
      type: 'admission',
      trigger: 'frankly',
      context: 'Before inconvenient truth or unpopular opinion',
      purpose: 'Signals honest admission, potentially controversial view',
      frequency: franklyMatches.length,
      examples
    });
  }
  
  const obviouslyMatches = text.match(/\bobviously\b/gi) || [];
  if (obviouslyMatches.length > 0) {
    const examples = findContextForDevice(text, 'obviously', 5);
    devices.push({
      type: 'reader_alignment',
      trigger: 'obviously',
      context: 'Normalizing shortcuts or common knowledge',
      purpose: 'Establishes shared understanding, validates reader\'s shortcuts',
      frequency: obviouslyMatches.length,
      examples
    });
  }
  
  return devices.filter(d => d.frequency > 0);
}

function findContextForDevice(text: string, device: string, maxExamples: number): string[] {
  const examples: string[] = [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  // Helper to clean markdown artifacts from extracted text
  const cleanText = (str: string): string => {
    return str
      .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1') // Remove markdown links but keep text
      .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
      .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold markers
      .replace(/\*([^\*]+)\*/g, '$1') // Remove italic markers
      .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
      .replace(/\[\]\(\)/g, '') // Remove empty links
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };
  
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(device.toLowerCase()) && examples.length < maxExamples) {
      const index = sentences.indexOf(sentence);
      const context = index > 0 
        ? sentences[index - 1] + '. ' + sentence + '.'
        : sentence + '.';
      examples.push(cleanText(context));
    }
  }
  
  return examples;
}

function detectArgumentPatterns(paragraphs: string[]): ArgumentPattern[] {
  const patterns: ArgumentPattern[] = [];
  
  const warningPattern = detectWarningPattern(paragraphs);
  if (warningPattern.examples.length > 0) {
    patterns.push(warningPattern);
  }
  
  const claimPattern = detectClaimEvidencePattern(paragraphs);
  if (claimPattern.examples.length > 0) {
    patterns.push(claimPattern);
  }
  
  const problemPattern = detectProblemSolutionPattern(paragraphs);
  if (problemPattern.examples.length > 0) {
    patterns.push(problemPattern);
  }
  
  const specificationPattern = detectSpecificationPattern(paragraphs);
  if (specificationPattern.examples.length > 0) {
    patterns.push(specificationPattern);
  }
  
  return patterns;
}

function detectWarningPattern(paragraphs: string[]): ArgumentPattern {
  const examples: ArgumentExample[] = [];
  const warningTriggers = ['before we', 'caveat', 'warning', 'watch out', 'be careful'];
  
  let strongMatches = 0; // Full pattern match
  let weakMatches = 0;   // Partial pattern match
  
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    if (warningTriggers.some(trigger => lower.includes(trigger))) {
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 20);
      if (sentences.length >= 2) {
        // Strong match: has warning + example + advice structure
        const hasExample = lower.includes('for example') || lower.includes('for instance') || /\d+/.test(para);
        const hasAdvice = lower.includes('instead') || lower.includes('should') || lower.includes('recommend');
        
        if (hasExample && hasAdvice) {
          strongMatches++;
        } else {
          weakMatches++;
        }
        
        examples.push({
          fullText: para,
          components: {
            opening: sentences[0]?.trim(),
            claim: sentences[1]?.trim(),
            conclusion: sentences[sentences.length - 1]?.trim()
          }
        });
      }
      if (examples.length >= 3) break;
    }
  }
  
  const confidence = calculateConfidence(strongMatches, weakMatches, examples.length);
  
  return {
    pattern: 'Protective Warning → Specific Example → Practical Advice',
    description: 'Warns readers about common mistakes by starting with a caveat, giving specific examples, then transitioning to what to do instead',
    frequency: examples.length,
    confidence: confidence.label,
    confidenceScore: confidence.score,
    examples
  };
}

function detectClaimEvidencePattern(paragraphs: string[]): ArgumentPattern {
  const examples: ArgumentExample[] = [];
  const evidenceTriggers = ['i\'ve tested', 'in my experience', 'after using', 'i\'ve found'];
  
  let strongMatches = 0;
  let weakMatches = 0;
  
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    if (evidenceTriggers.some(trigger => lower.includes(trigger))) {
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 20);
      if (sentences.length >= 2) {
        // Strong match: has clear claim at start, evidence in middle, conclusion at end
        const hasClaimStart = sentences[0].length < 150; // Concise opening claim
        const hasConclusion = lower.includes('so ') || lower.includes('therefore') || lower.includes('this means');
        
        if (hasClaimStart && hasConclusion) {
          strongMatches++;
        } else {
          weakMatches++;
        }
        
        examples.push({
          fullText: para,
          components: {
            claim: sentences[0]?.trim(),
            evidence: sentences.slice(1, -1).join('. '),
            conclusion: sentences[sentences.length - 1]?.trim()
          }
        });
      }
      if (examples.length >= 3) break;
    }
  }
  
  const confidence = calculateConfidence(strongMatches, weakMatches, examples.length);
  
  return {
    pattern: 'Claim → Personal Evidence → Conclusion',
    description: 'Makes a claim, supports it with personal testing experience, draws practical conclusion',
    frequency: examples.length,
    confidence: confidence.label,
    confidenceScore: confidence.score,
    examples
  };
}

function detectProblemSolutionPattern(paragraphs: string[]): ArgumentPattern {
  const examples: ArgumentExample[] = [];
  const problemTriggers = ['the problem', 'the issue', 'struggle', 'challenge'];
  const solutionTriggers = ['solution', 'fix', 'answer', 'works', 'solved'];
  
  let strongMatches = 0;
  let weakMatches = 0;
  
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    const hasProblem = problemTriggers.some(trigger => lower.includes(trigger));
    const hasSolution = solutionTriggers.some(trigger => lower.includes(trigger));
    
    if (hasProblem && hasSolution) {
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      // Strong match: has counter-objection ("but", "however", "although")
      const hasCounterObjection = lower.includes('but ') || lower.includes('however') || lower.includes('although');
      
      if (hasCounterObjection) {
        strongMatches++;
      } else {
        weakMatches++;
      }
      
      examples.push({
        fullText: para,
        components: {
          opening: sentences[0]?.trim() || '',
          conclusion: sentences[sentences.length - 1]?.trim() || ''
        }
      });
      if (examples.length >= 3) break;
    }
  }
  
  const confidence = calculateConfidence(strongMatches, weakMatches, examples.length);
  
  return {
    pattern: 'Problem → Solution → Counter-objection',
    description: 'Identifies a problem, proposes solution, then addresses obvious objection preemptively',
    frequency: examples.length,
    confidence: confidence.label,
    confidenceScore: confidence.score,
    examples
  };
}

function detectSpecificationPattern(paragraphs: string[]): ArgumentPattern {
  const examples: ArgumentExample[] = [];
  const productPattern = /\b[A-Z][a-z]+\s+[A-Z0-9][a-z0-9]+(\s+(Pro|Ultra|Max|Plus|GT))?\b/g;
  
  let strongMatches = 0;
  let weakMatches = 0;
  
  for (const para of paragraphs) {
    const matches = para.match(productPattern);
    if (matches && matches.length > 0 && para.length > 200) {
      const lower = para.toLowerCase();
      
      // Strong match: specific product + benefit explanation + preemptive defense
      const hasBenefit = lower.includes('because') || lower.includes('lets you') || lower.includes('allows');
      const hasDefense = lower.includes('yes') || lower.includes('expensive') || lower.includes('worth');
      
      if (hasBenefit && hasDefense) {
        strongMatches++;
      } else if (hasBenefit || hasDefense) {
        weakMatches++;
      }
      
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 20);
      examples.push({
        fullText: para,
        components: {
          opening: sentences[0]?.trim() || '',
          claim: matches[0]
        }
      });
      if (examples.length >= 3) break;
    }
  }
  
  const confidence = calculateConfidence(strongMatches, weakMatches, examples.length);
  
  return {
    pattern: 'Specification → Why It Matters → Preemptive Defense',
    description: 'Names specific product (never generic), explains practical benefit, addresses price/complexity concern',
    frequency: examples.length,
    confidence: confidence.label,
    confidenceScore: confidence.score,
    examples
  };
}

function calculateConfidence(
  strongMatches: number, 
  weakMatches: number, 
  totalMatches: number
): { label: 'high' | 'medium' | 'low'; score: number } {
  if (totalMatches === 0) {
    return { label: 'low', score: 0 };
  }
  
  const strongRatio = strongMatches / totalMatches;
  const score = strongRatio;
  
  if (strongRatio >= 0.7) {
    return { label: 'high', score };
  } else if (strongRatio >= 0.4) {
    return { label: 'medium', score };
  } else {
    return { label: 'low', score };
  }
}

function analyzeOpeningMoves(paragraphs: string[]): any[] {
  const openings = paragraphs.slice(0, Math.min(10, paragraphs.length));
  const moves: any[] = [];
  
  const actionOpenings = openings.filter(p => {
    const first = p.split(/[.!?]/)[0].toLowerCase();
    return first.length < 100 && (
      first.includes('right') || 
      first.includes('here') || 
      first.includes('okay') ||
      /^(let's|we'll|i'll|you'll)/.test(first)
    );
  });
  
  if (actionOpenings.length > 0) {
    moves.push({
      type: 'Direct Action',
      description: 'Opens with immediate call to action or present-tense announcement',
      frequency: actionOpenings.length,
      examples: actionOpenings.slice(0, 3)
    });
  }
  
  const personalOpenings = openings.filter(p => {
    const first = p.split(/[.!?]/)[0].toLowerCase();
    return first.includes('i\'ve') || first.includes('my') || first.includes('after');
  });
  
  if (personalOpenings.length > 0) {
    moves.push({
      type: 'Personal Context',
      description: 'Opens by establishing personal experience or credentials',
      frequency: personalOpenings.length,
      examples: personalOpenings.slice(0, 3)
    });
  }
  
  const warningOpenings = openings.filter(p => {
    const first = p.toLowerCase();
    return first.includes('before') || first.includes('caveat') || first.includes('warning');
  });
  
  if (warningOpenings.length > 0) {
    moves.push({
      type: 'Protective Warning',
      description: 'Opens with caveat or warning to protect reader from common mistake',
      frequency: warningOpenings.length,
      examples: warningOpenings.slice(0, 3)
    });
  }
  
  return moves;
}

function analyzeClosingMoves(paragraphs: string[]): any[] {
  const closings = paragraphs.slice(Math.max(0, paragraphs.length - 10));
  const moves: any[] = [];
  
  const summaryClosings = closings.filter(p => {
    const lower = p.toLowerCase();
    return lower.includes('in summary') || 
           lower.includes('to sum up') || 
           lower.includes('bottom line') ||
           lower.includes('key takeaway');
  });
  
  if (summaryClosings.length > 0) {
    moves.push({
      type: 'Summary',
      description: 'Explicit summary of key points',
      frequency: summaryClosings.length,
      examples: summaryClosings.slice(0, 2)
    });
  }
  
  const recommendationClosings = closings.filter(p => {
    const lower = p.toLowerCase();
    return (lower.includes('i\'d') || lower.includes('i would')) && 
           (lower.includes('recommend') || lower.includes('suggest') || lower.includes('buy'));
  });
  
  if (recommendationClosings.length > 0) {
    moves.push({
      type: 'Personal Recommendation',
      description: 'Closes with specific personal advice or product recommendation',
      frequency: recommendationClosings.length,
      examples: recommendationClosings.slice(0, 2)
    });
  }
  
  const forwardClosings = closings.filter(p => {
    const lower = p.toLowerCase();
    return lower.includes('next') || lower.includes('future') || lower.includes('coming');
  });
  
  if (forwardClosings.length > 0) {
    moves.push({
      type: 'Forward-Looking',
      description: 'Points toward future developments or next steps',
      frequency: forwardClosings.length,
      examples: forwardClosings.slice(0, 2)
    });
  }
  
  return moves;
}