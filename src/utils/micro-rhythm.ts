/**
 * Micro-Rhythm Detector v1.0
 * 
 * Detects the small patterns that make writing feel human:
 * - Mid-thought pivots (comma before conjunction)
 * - Present-tense immediacy
 * - Casual connectors in unexpected places
 * - Embedded uncertainty
 * - Sentence-pair momentum
 * 
 * These patterns are invisible to readers but create the "feel"
 * that distinguishes human writing from AI output.
 */

export interface MicroRhythm {
  type: string;
  description: string;
  excerpt: string;
  position: number;
}

export interface AnnotatedText {
  originalText: string;
  rhythms: MicroRhythm[];
  summary: string[];
}

/**
 * Analyse text for micro-rhythms that create human feel
 */
export function detectMicroRhythms(text: string): AnnotatedText {
  const rhythms: MicroRhythm[] = [];
  
  // 1. Mid-thought pivots: "and," or "but," with comma before
  const commaConjunctionPattern = /,\s+(and|but|so|yet)\s+/gi;
  let match;
  while ((match = commaConjunctionPattern.exec(text)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    const excerpt = text.slice(start, end);
    
    rhythms.push({
      type: 'mid-thought-pivot',
      description: `Comma before "${match[1]}" creates a spoken pause-then-redirect`,
      excerpt: `...${excerpt}...`,
      position: match.index
    });
  }
  
  // 2. Dash interruptions (hyphen used as pause, not em-dash)
  const dashInterruptPattern = /\s+-\s+(?!and|or|but)/g;
  while ((match = dashInterruptPattern.exec(text)) !== null) {
    const start = Math.max(0, match.index - 25);
    const end = Math.min(text.length, match.index + match[0].length + 25);
    const excerpt = text.slice(start, end);
    
    rhythms.push({
      type: 'dash-interruption',
      description: 'Dash creates an aside or afterthought feel',
      excerpt: `...${excerpt}...`,
      position: match.index
    });
  }
  
  // 3. Present-tense immediacy in context that could be past
  const presentImmediacy = /\b(right now|at the moment|currently|as I write|it's running|it's working|it's hashing)\b/gi;
  while ((match = presentImmediacy.exec(text)) !== null) {
    const start = Math.max(0, match.index - 20);
    const end = Math.min(text.length, match.index + match[0].length + 20);
    const excerpt = text.slice(start, end);
    
    rhythms.push({
      type: 'present-immediacy',
      description: 'Present tense creates "happening now" energy',
      excerpt: `...${excerpt}...`,
      position: match.index
    });
  }
  
  // 4. Embedded uncertainty mid-sentence
  const embeddedUncertainty = /,?\s*(I think|I suspect|probably|I'm pretty sure|I'm not (entirely )?sure|maybe|might be)\s*,?/gi;
  while ((match = embeddedUncertainty.exec(text)) !== null) {
    // Only count if it's mid-sentence (not at start)
    if (match.index > 10) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 20);
      const excerpt = text.slice(start, end);
      
      rhythms.push({
        type: 'embedded-uncertainty',
        description: 'Uncertainty woven into sentence shows thinking-in-progress',
        excerpt: `...${excerpt}...`,
        position: match.index
      });
    }
  }
  
  // 5. Casual sentence starters
  const casualStarters = /(?:^|\. )(So,?|And,?|But,?|Now,?|Well,?|Look,?|Anyway,?)\s+[A-Z]/gm;
  while ((match = casualStarters.exec(text)) !== null) {
    const end = Math.min(text.length, match.index + match[0].length + 30);
    const excerpt = text.slice(match.index, end);
    
    rhythms.push({
      type: 'casual-starter',
      description: `Starting with "${match[1]}" breaks formal writing rules - feels conversational`,
      excerpt: excerpt.startsWith('.') ? excerpt.slice(2) : excerpt,
      position: match.index
    });
  }
  
  // 6. Parenthetical asides
  const parentheticals = /\([^)]{10,60}\)/g;
  while ((match = parentheticals.exec(text)) !== null) {
    rhythms.push({
      type: 'parenthetical-aside',
      description: 'Parenthetical adds spoken-style tangent',
      excerpt: match[0],
      position: match.index
    });
  }
  
  // 7. Self-correction or refinement
  const selfCorrection = /(\s*-\s*or (rather|actually|more accurately)|,?\s*well,?\s*(actually|no)|I mean,?)/gi;
  while ((match = selfCorrection.exec(text)) !== null) {
    const start = Math.max(0, match.index - 15);
    const end = Math.min(text.length, match.index + match[0].length + 20);
    const excerpt = text.slice(start, end);
    
    rhythms.push({
      type: 'self-correction',
      description: 'Mid-stream correction shows thinking happening in real-time',
      excerpt: `...${excerpt}...`,
      position: match.index
    });
  }
  
  // 8. Future uncertainty (pending situations)
  const futureUncertainty = /(until .{5,30} arrive|when .{5,20} (happen|come|finish)|once .{5,20} (done|ready|complete)|we'll see)/gi;
  while ((match = futureUncertainty.exec(text)) !== null) {
    const start = Math.max(0, match.index - 10);
    const end = Math.min(text.length, match.index + match[0].length + 10);
    const excerpt = text.slice(start, end);
    
    rhythms.push({
      type: 'future-uncertainty',
      description: 'Acknowledging pending/uncertain future - real people have open loops',
      excerpt: `...${excerpt}...`,
      position: match.index
    });
  }
  
  // 9. Sentence fragments (short punchy statements)
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  for (let i = 0; i < sentences.length; i++) {
    const words = sentences[i].split(/\s+/).length;
    if (words <= 5 && words >= 2) {
      // Check if preceded or followed by longer sentence (contrast)
      const prevWords = i > 0 ? sentences[i-1].split(/\s+/).length : 0;
      const nextWords = i < sentences.length - 1 ? sentences[i+1].split(/\s+/).length : 0;
      
      if (prevWords > 15 || nextWords > 15) {
        rhythms.push({
          type: 'punchy-fragment',
          description: 'Short fragment after/before longer sentence creates rhythm punch',
          excerpt: sentences[i],
          position: text.indexOf(sentences[i])
        });
      }
    }
  }
  
  // 10. Colon-list rhythm (statement: then items)
  const colonList = /:\s*[^.!?]{10,}/g;
  while ((match = colonList.exec(text)) !== null) {
    const before = text.slice(Math.max(0, match.index - 30), match.index);
    if (before.trim().length > 0) {
      rhythms.push({
        type: 'colon-setup',
        description: 'Colon creates "here comes the point" setup',
        excerpt: `...${before}${match[0].slice(0, 40)}...`,
        position: match.index
      });
    }
  }
  
  // Generate summary of what makes this text feel human
  const summary = generateRhythmSummary(rhythms);
  
  return {
    originalText: text,
    rhythms: rhythms.sort((a, b) => a.position - b.position),
    summary
  };
}

function generateRhythmSummary(rhythms: MicroRhythm[]): string[] {
  const summary: string[] = [];
  
  const typeCounts = rhythms.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (typeCounts['mid-thought-pivot']) {
    summary.push(`**Mid-thought pivots** (${typeCounts['mid-thought-pivot']}x) - the writer pauses mid-sentence then redirects, like spoken thought`);
  }
  
  if (typeCounts['present-immediacy']) {
    summary.push(`**Present-tense immediacy** - creates "you're here with me" energy rather than distant reporting`);
  }
  
  if (typeCounts['casual-starter']) {
    summary.push(`**Casual sentence starters** (${typeCounts['casual-starter']}x) - "So," "And," "But," break formal rules but feel natural`);
  }
  
  if (typeCounts['embedded-uncertainty']) {
    summary.push(`**Embedded uncertainty** - doubt woven into sentences shows real-time thinking, not polished conclusions`);
  }
  
  if (typeCounts['parenthetical-aside']) {
    summary.push(`**Parenthetical asides** (${typeCounts['parenthetical-aside']}x) - spoken-style tangents that feel like the writer thinking aloud`);
  }
  
  if (typeCounts['dash-interruption']) {
    summary.push(`**Dash interruptions** - creates pauses for emphasis or afterthoughts`);
  }
  
  if (typeCounts['punchy-fragment']) {
    summary.push(`**Punchy fragments** - short sentences punch through longer ones, creating rhythm variation`);
  }
  
  if (typeCounts['future-uncertainty']) {
    summary.push(`**Open loops** - acknowledging things pending/uncertain, like a real person with unfinished business`);
  }
  
  if (typeCounts['self-correction']) {
    summary.push(`**Self-corrections** - "or rather", "I mean" show thinking evolving in real-time`);
  }
  
  if (summary.length === 0) {
    summary.push('*This passage relies more on content than micro-rhythms for its natural feel*');
  }
  
  return summary;
}

/**
 * Format a single example with human-feel annotations
 */
export function annotateExample(text: string, maxAnnotations: number = 3): string {
  const analysis = detectMicroRhythms(text);
  const lines: string[] = [];
  
  lines.push('```');
  lines.push(text);
  lines.push('```');
  lines.push('');
  
  if (analysis.rhythms.length > 0) {
    lines.push('**What makes this feel human:**');
    lines.push('');
    
    // Show top annotations (most illustrative)
    const topRhythms = analysis.rhythms.slice(0, maxAnnotations);
    for (const rhythm of topRhythms) {
      lines.push(`- ${rhythm.description}`);
      lines.push(`  *"${rhythm.excerpt.replace(/\s+/g, ' ').trim()}"*`);
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Format a multi-paragraph sequence with comprehensive annotations
 */
export function annotateSequence(text: string): string {
  const analysis = detectMicroRhythms(text);
  const lines: string[] = [];
  
  lines.push('```');
  lines.push(text);
  lines.push('```');
  lines.push('');
  
  // Paragraph-level stats
  const paras = text.split(/\n\n+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).length;
  
  lines.push('**Structure:** ' + `${paras.length} paragraphs, ${sentences.length} sentences, ${words} words`);
  lines.push('');
  
  // The human feel summary
  if (analysis.summary.length > 0) {
    lines.push('**Human tells in this passage:**');
    lines.push('');
    for (const item of analysis.summary) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }
  
  // Show specific examples if we have good ones
  const illustrativeRhythms = analysis.rhythms.filter(r => 
    ['mid-thought-pivot', 'present-immediacy', 'casual-starter', 'embedded-uncertainty'].includes(r.type)
  ).slice(0, 4);
  
  if (illustrativeRhythms.length > 0) {
    lines.push('**Specific moments to notice:**');
    lines.push('');
    for (const rhythm of illustrativeRhythms) {
      lines.push(`- "${rhythm.excerpt.replace(/\s+/g, ' ').trim()}" - ${rhythm.description.toLowerCase()}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}
