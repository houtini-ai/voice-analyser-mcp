/**
 * Universal Specificity Pattern Analyzer
 * Detects possessive (specific) vs generic (article-based) references
 * Works across any domain - tech, food, finance, academic, etc.
 */

export interface SpecificityPattern {
  pattern: string;
  category: 'possessive' | 'demonstrative' | 'generic_article' | 'bare_plural';
  examples: { phrase: string; context: string; }[];
  frequency: number;
}

export interface SpecificityAnalysis {
  possessivePatterns: SpecificityPattern[];
  genericPatterns: SpecificityPattern[];
  specificityRatio: number; // possessive/(possessive+generic)
  dominantNouns: { noun: string; count: number; }[];
  interpretation: string;
  guidanceText: string;
}

export function analyzeSpecificityPatterns(text: string): SpecificityAnalysis {
  const possessivePatterns = detectPossessivePatterns(text);
  const genericPatterns = detectGenericPatterns(text);
  
  const totalPossessive = possessivePatterns.reduce((sum, p) => sum + p.frequency, 0);
  const totalGeneric = genericPatterns.reduce((sum, p) => sum + p.frequency, 0);
  const specificityRatio = totalGeneric > 0 
    ? totalPossessive / (totalPossessive + totalGeneric) 
    : 0;
  
  const dominantNouns = extractDominantNouns(possessivePatterns);
  
  const interpretation = interpretSpecificityRatio(specificityRatio);
  const guidanceText = generateGuidance(specificityRatio, dominantNouns);
  
  return {
    possessivePatterns,
    genericPatterns,
    specificityRatio,
    dominantNouns,
    interpretation,
    guidanceText
  };
}

function detectPossessivePatterns(text: string): SpecificityPattern[] {
  const patterns: Map<string, SpecificityPattern> = new Map();
  
  // First-person possessives
  const myPattern = /\b(my|our)\s+([a-z][a-z\s-]{1,30}?)(?=\s|[.,!?])/gi;
  extractPatternMatches(text, myPattern, 'my/our', 'possessive', patterns);
  
  // Second-person possessives  
  const yourPattern = /\b(your|yours)\s+([a-z][a-z\s-]{1,30}?)(?=\s|[.,!?])/gi;
  extractPatternMatches(text, yourPattern, 'your/yours', 'possessive', patterns);
  
  // Third-person possessives (capturing specific entities)
  const thirdPersonPattern = /\b([A-Z][a-z]+'s|their)\s+([a-z][a-z\s-]{1,30}?)(?=\s|[.,!?])/g;
  extractPatternMatches(text, thirdPersonPattern, "third-person", 'possessive', patterns);
  
  // Demonstrative pronouns (this/that/these/those) - show specificity
  const demonstrativePattern = /\b(this|that|these|those)\s+([a-z][a-z\s-]{1,30}?)(?=\s|[.,!?])/gi;
  extractPatternMatches(text, demonstrativePattern, 'demonstrative', 'demonstrative', patterns);
  
  return Array.from(patterns.values())
    .sort((a, b) => b.frequency - a.frequency);
}

function detectGenericPatterns(text: string): SpecificityPattern[] {
  const patterns: Map<string, SpecificityPattern> = new Map();
  
  // Definite article (the) - generic reference
  const thePattern = /\b(the)\s+([a-z][a-z\s-]{1,30}?)(?=\s|[.,!?])/gi;
  extractPatternMatches(text, thePattern, 'the', 'generic_article', patterns);
  
  // Indefinite article (a/an) - generic reference
  const aAnPattern = /\b(an?)\s+([a-z][a-z\s-]{1,30}?)(?=\s|[.,!?])/gi;
  extractPatternMatches(text, aAnPattern, 'a/an', 'generic_article', patterns);
  
  // Bare plurals (no determiner) - often generic
  const barePluralPattern = /(?:^|\.\s+)([A-Z][a-z]+s)\s/g;
  extractBarePluralPatches(text, barePluralPattern, patterns);
  
  return Array.from(patterns.values())
    .sort((a, b) => b.frequency - a.frequency);
}

function extractPatternMatches(
  text: string, 
  regex: RegExp, 
  patternLabel: string,
  category: SpecificityPattern['category'],
  patterns: Map<string, SpecificityPattern>
): void {
  let match;
  while ((match = regex.exec(text)) !== null) {
    const determiner = match[1];
    const noun = match[2]?.trim();
    
    if (!noun || noun.length < 3) continue;
    
    const fullPhrase = `${determiner} ${noun}`;
    const context = extractContext(text, match.index, 60);
    
    if (!patterns.has(fullPhrase)) {
      patterns.set(fullPhrase, {
        pattern: fullPhrase,
        category,
        examples: [],
        frequency: 0
      });
    }
    
    const pattern = patterns.get(fullPhrase)!;
    pattern.frequency++;
    
    if (pattern.examples.length < 3) {
      pattern.examples.push({ phrase: fullPhrase, context });
    }
  }
}

function extractBarePluralPatches(
  text: string,
  regex: RegExp,
  patterns: Map<string, SpecificityPattern>
): void {
  let match;
  while ((match = regex.exec(text)) !== null) {
    const plural = match[1];
    const context = extractContext(text, match.index, 60);
    
    if (!patterns.has(plural)) {
      patterns.set(plural, {
        pattern: plural,
        category: 'bare_plural',
        examples: [],
        frequency: 0
      });
    }
    
    const pattern = patterns.get(plural)!;
    pattern.frequency++;
    
    if (pattern.examples.length < 3) {
      pattern.examples.push({ phrase: plural, context });
    }
  }
}

function extractContext(text: string, position: number, contextLength: number): string {
  const start = Math.max(0, position - contextLength);
  const end = Math.min(text.length, position + contextLength);
  return '...' + text.substring(start, end).trim() + '...';
}

function extractDominantNouns(possessivePatterns: SpecificityPattern[]): { noun: string; count: number; }[] {
  const nounCounts: Map<string, number> = new Map();
  
  for (const pattern of possessivePatterns) {
    // Extract the noun part (after possessive determiner)
    const nounMatch = pattern.pattern.match(/(?:my|our|your|this|that|these|those|'s|their)\s+(.+)/i);
    if (nounMatch) {
      const noun = nounMatch[1].trim().toLowerCase();
      nounCounts.set(noun, (nounCounts.get(noun) || 0) + pattern.frequency);
    }
  }
  
  return Array.from(nounCounts.entries())
    .map(([noun, count]) => ({ noun, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function interpretSpecificityRatio(ratio: number): string {
  if (ratio > 0.4) {
    return 'High specificity - strong personal ownership and testing authority';
  } else if (ratio > 0.25) {
    return 'Moderate specificity - balanced personal and general references';
  } else if (ratio > 0.15) {
    return 'Low specificity - predominantly generic references';
  } else {
    return 'Very low specificity - abstract or impersonal voice';
  }
}

function generateGuidance(ratio: number, dominantNouns: { noun: string; count: number; }[]): string {
  const lines: string[] = [];
  
  lines.push('### Specificity Pattern Guidance\n');
  
  if (ratio > 0.3) {
    lines.push('**Voice Characteristic:** This writer establishes authority through personal ownership.');
    lines.push('');
    lines.push('**How to replicate:**');
    lines.push('- Use possessive determiners frequently: "my [noun]", "our [approach]"');
    lines.push('- Avoid generic articles when discussing tested/owned items');
    lines.push('- Demonstratives ("this", "that") show hands-on familiarity');
    lines.push('');
  } else if (ratio > 0.15) {
    lines.push('**Voice Characteristic:** Balanced between personal experience and general discussion.');
    lines.push('');
    lines.push('**How to replicate:**');
    lines.push('- Mix possessive references with generic articles naturally');
    lines.push('- Use "my/our" for personally tested items');
    lines.push('- Use "the/a" for general industry discussion');
    lines.push('');
  } else {
    lines.push('**Voice Characteristic:** Abstract, academic, or impersonal tone.');
    lines.push('');
    lines.push('**How to replicate:**');
    lines.push('- Predominantly use definite/indefinite articles ("the", "a/an")');
    lines.push('- Avoid personal possessives unless necessary');
    lines.push('- Maintain objective distance from subject matter');
    lines.push('');
  }
  
  if (dominantNouns.length > 0) {
    lines.push(`**Dominant topics:** ${dominantNouns.slice(0, 5).map(n => n.noun).join(', ')}`);
    lines.push('');
  }
  
  return lines.join('\n');
}