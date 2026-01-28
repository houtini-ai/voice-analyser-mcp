/**
 * Style Guide Generator v3.0 - EXECUTABLE FORMAT
 * 
 * PHILOSOPHY SHIFT: Prescriptive rules over immersive learning
 * STRUCTURE: Match writing_style.md format (500 lines target)
 * OUTPUT: Claude can execute this, not "learn by immersion"
 * 
 * Structure (matching writing_style.md):
 * 1. EXECUTIVE SUMMARY FOR CLAUDE (critical rules upfront)
 * 2. THE FORBIDDEN LIST (zero tolerance AI clichés)
 * 3. CORE VOICE CHARACTERISTICS (do/don't examples)
 * 4. SENTENCE STRUCTURE & RHYTHM (target statistics)
 * 5. CONVERSATIONAL MARKERS (extracted patterns)
 * 6. ANTI-MECHANICAL WRITING PATTERNS (problems + solutions)
 * 7. AUTHENTIC VOICE CHECKLIST (60s/5min/10min validation)
 * 8. EXAMPLES: WHAT AUTHENTICITY LOOKS LIKE (good/bad side-by-side)
 * 9. REFERENCE: CORPUS STATISTICS (z-scores, tables)
 */

import fs from 'fs/promises';
import path from 'path';
import type { VocabularyAnalysis } from '../analyzers/vocabulary.js';
import type { SentenceAnalysis } from '../analyzers/sentence.js';
import type { VoiceMarkers } from '../analyzers/voice-markers.js';
import type { ParagraphAnalysis } from '../analyzers/paragraph.js';
import type { PunctuationAnalysis } from '../analyzers/punctuation.js';
import type { FunctionWordAnalysis } from '../analyzers/function-words.js';
import type { ArgumentFlowAnalysis } from '../analyzers/argument-flow.js';
import type { ParagraphTransitionsAnalysis } from '../analyzers/paragraph-transitions.js';

export interface StyleGuideParams {
  corpus_name: string;
  corpus_dir: string;
}

export interface StyleGuideResult {
  success: boolean;
  guide_path: string;
}

async function generateStyleGuideInternal(params: StyleGuideParams): Promise<StyleGuideResult> {
  const { corpus_name, corpus_dir } = params;
  
  const corpusPath = path.join(corpus_dir, corpus_name);
  const analysisDir = path.join(corpusPath, 'analysis');
  const articlesDir = path.join(corpusPath, 'articles');
  
  await fs.mkdir(corpusPath, { recursive: true });
  
  const vocab = await loadJSON<VocabularyAnalysis>(analysisDir, 'vocabulary.json');
  const sentence = await loadJSON<SentenceAnalysis>(analysisDir, 'sentence.json');
  const voice = await loadJSON<VoiceMarkers>(analysisDir, 'voice.json');
  const paragraph = await loadJSON<ParagraphAnalysis>(analysisDir, 'paragraph.json', true);
  const punctuation = await loadJSON<PunctuationAnalysis>(analysisDir, 'punctuation.json', true);
  const functionWords = await loadJSON<FunctionWordAnalysis>(analysisDir, 'function-words.json', true);
  const argumentFlow = await loadJSON<ArgumentFlowAnalysis>(analysisDir, 'argument-flow.json', true);
  const paragraphTransitions = await loadJSON<ParagraphTransitionsAnalysis>(analysisDir, 'paragraph-transitions.json', true);
  
  if (!vocab || !sentence || !voice) {
    throw new Error('Missing required analysis files (vocabulary, sentence, voice)');
  }
  
  if (!argumentFlow || !paragraphTransitions) {
    throw new Error('Missing argument-flow.json or paragraph-transitions.json - run analyze_corpus first');
  }
  
  const examples = await extractExampleParagraphs(articlesDir, 30);
  
  const metadata = JSON.parse(
    await fs.readFile(path.join(corpusPath, 'corpus.json'), 'utf-8')
  );
  
  const guide = generateExecutableGuide(
    corpus_name,
    metadata,
    vocab,
    sentence,
    voice,
    paragraph,
    punctuation,
    functionWords,
    argumentFlow,
    paragraphTransitions,
    examples
  );
  
  const guidePath = path.join(corpusPath, `writing_style_${corpus_name}.md`);
  await fs.writeFile(guidePath, guide, 'utf-8');
  
  return {
    success: true,
    guide_path: guidePath
  };
}

async function loadJSON<T>(dir: string, filename: string, optional: boolean = false): Promise<T | null> {
  try {
    const content = await fs.readFile(path.join(dir, filename), 'utf-8');
    return JSON.parse(content) as T;
  } catch (e) {
    if (optional) return null;
    throw e;
  }
}

async function extractExampleParagraphs(articlesDir: string, count: number): Promise<{
  personal: string[];
  technical: string[];
  counterpoints: string[];
}> {
  const files = await fs.readdir(articlesDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));
  
  const personal: string[] = [];
  const technical: string[] = [];
  const counterpoints: string[] = [];
  
  const cleanParagraph = (text: string): string => {
    return text
      .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^\*]+)\*\*/g, '$1')
      .replace(/\*([^\*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  for (const file of markdownFiles) {
    const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n\n/, '');
    const paras = withoutFrontmatter.split(/\n\n+/).filter(p => {
      const words = p.split(/\s+/).length;
      const hasNoHeaderMarker = !p.trim().startsWith('#');
      const hasSubstantialText = p.trim().length > 100;
      return words >= 30 && words <= 250 && hasNoHeaderMarker && hasSubstantialText;
    });
    
    if (paras.length === 0) continue;
    
    const perCategory = Math.ceil(count / 3);
    
    for (const para of paras) {
      const lower = para.toLowerCase();
      const isTechnical = /\d+\s*(nm|kg|mm|watts|hz|fps|%|px|kb|mb|gb)/i.test(para);
      const isPersonal = ["i've", "my ", "in my experience", "i found", "i tested"].some(w => lower.includes(w));
      const isCounterpoint = ['but ', 'however', 'although', 'despite', 'yet ', 'still'].some(w => 
        lower.startsWith(w) || lower.includes('. but ') || lower.includes('. however ')
      );
      
      if (isPersonal && personal.length < perCategory) {
        personal.push(cleanParagraph(para));
      } else if (isTechnical && technical.length < perCategory) {
        technical.push(cleanParagraph(para));
      } else if (isCounterpoint && counterpoints.length < perCategory) {
        counterpoints.push(cleanParagraph(para));
      }
    }
  }
  
  return { personal, technical, counterpoints };
}

function formatWriterName(name: string): string {
  return name.split(/[-_]/).map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
}

function generateExecutableGuide(
  writerName: string,
  metadata: any,
  vocab: VocabularyAnalysis,
  sentence: SentenceAnalysis,
  voice: VoiceMarkers,
  paragraph: ParagraphAnalysis | null,
  punctuation: PunctuationAnalysis | null,
  functionWords: FunctionWordAnalysis | null,
  argumentFlow: ArgumentFlowAnalysis,
  paragraphTransitions: ParagraphTransitionsAnalysis,
  examples: any
): string {
  const lines: string[] = [];
  
  // HEADER
  lines.push(`# ${formatWriterName(writerName)} Writing Style Guide`);
  lines.push(`*Corpus: ${metadata.wordCount.toLocaleString()} words across ${metadata.articleCount} articles*`);
  lines.push('');
  lines.push('**Status:** Statistical truth derived from published corpus');
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 1. EXECUTIVE SUMMARY FOR CLAUDE
  // ============================================================
  lines.push('## EXECUTIVE SUMMARY FOR CLAUDE');
  lines.push('');
  
  const hasPersonal = voice.firstPerson.frequency > 0.3;
  const hasConfidence = voice.hedgingLanguage.frequency < 0.5;
  const hasBritish = vocab.britishMarkers.length > 0;
  
  // Domain detection from argument flow
  const domains: string[] = [];
  if (argumentFlow.openingMoves.some(m => m.type.toLowerCase().includes('technical'))) {
    domains.push('technical');
  }
  if (voice.equipmentSpecificity && voice.equipmentSpecificity.specific.length > 5) {
    domains.push('product reviews');
  }
  
  lines.push(`You're writing as ${formatWriterName(writerName)}${domains.length > 0 ? ', covering ' + domains.join(', ') : ''}.`);
  lines.push('');
  
  lines.push('**Your voice:**');
  if (hasPersonal && hasConfidence) {
    lines.push('- Confident practitioner, not a guru or marketer');
    lines.push('- First-person authority from real testing/experience');
  } else if (hasPersonal) {
    lines.push('- Thoughtful expert with personal experience');
    lines.push('- Measured caution balanced with practical insight');
  } else {
    lines.push('- Authoritative educator style');
    lines.push('- Clear explanations with practical examples');
  }
  lines.push('- Technical depth with engineering rationale');
  lines.push('- Honest caveats and limitations');
  if (hasBritish) {
    lines.push('- British English throughout');
  }
  lines.push('- Natural conversational flow');
  lines.push('- **ZERO AI clichés** (non-negotiable)');
  lines.push('');
  lines.push('**Most critical rule:** If it sounds like marketing copy or a LinkedIn post, delete it.');
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 2. THE FORBIDDEN LIST
  // ============================================================
  lines.push('## THE FORBIDDEN LIST');
  lines.push('');
  lines.push('**Zero tolerance for these AI clichés:**');
  lines.push('');
  
  const universalForbidden = [
    { phrase: 'delve', fix: 'Use: explore, examine, look at' },
    { phrase: 'leverage', fix: 'Use: use, apply, employ' },
    { phrase: 'unlock', fix: 'Use: enable, access, discover' },
    { phrase: 'seamless', fix: 'Be specific about what works well' },
    { phrase: 'robust', fix: 'Describe actual capabilities' },
    { phrase: 'game-changer', fix: 'Explain actual impact' },
    { phrase: 'cutting-edge', fix: 'Name the actual technology' },
    { phrase: 'revolutionary', fix: 'Show what changed, do not claim it' }
  ];
  
  for (const item of universalForbidden) {
    lines.push(`- **"${item.phrase}"** → ${item.fix}`);
  }
  lines.push('');
  
  // Corpus-detected AI clichés
  if (voice.aiCliches && voice.aiCliches.length > 0) {
    lines.push('**Detected in YOUR corpus (must eliminate):**');
    lines.push('');
    for (const cliche of voice.aiCliches.slice(0, 5)) {
      lines.push(`- "${cliche.phrase}" (${cliche.count} uses) - Remove completely`);
    }
    lines.push('');
  }
  
  // Hollow intensifiers
  if (voice.hollowIntensifiers && voice.hollowIntensifiers.length > 0) {
    lines.push('**Hollow intensifiers (performative sincerity):**');
    lines.push('');
    for (const intensifier of voice.hollowIntensifiers.slice(0, 5)) {
      lines.push(`- "${intensifier.phrase}" → ${intensifier.alternative}`);
    }
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 3. CORE VOICE CHARACTERISTICS
  // ============================================================
  lines.push('## CORE VOICE CHARACTERISTICS');
  lines.push('');
  
  // 3.1 Confidence Level
  lines.push('### 1. Confident but Grounded');
  lines.push('');
  if (hasPersonal) {
    lines.push('**✅ Right:**');
    lines.push('- "I\'ve found that..." (establishes real experience)');
    lines.push('- "What I\'ve tested shows..." (practitioner authority)');
    lines.push('- "This is actually..." (emphasis on real insight)');
    lines.push('');
    lines.push('**❌ Wrong:**');
    lines.push('- "I\'m passionate about..." (marketing speak)');
    lines.push('- "This revolutionary approach..." (hyperbole)');
    lines.push('- "In today\'s digital landscape..." (corporate jargon)');
  } else {
    lines.push('**✅ Right:**');
    lines.push('- "It\'s worth knowing..." (educator voice)');
    lines.push('- "The key point is..." (direct guidance)');
    lines.push('- "What matters here..." (practical focus)');
    lines.push('');
    lines.push('**❌ Wrong:**');
    lines.push('- "You must understand..." (lecturing)');
    lines.push('- "It\'s crucial to realise..." (pompous)');
    lines.push('- "Let me explain..." (condescending)');
  }
  lines.push('');
  
  // 3.2 Practitioner Authority (if applicable)
  if (hasPersonal) {
    lines.push('### 2. Practitioner Authority');
    lines.push('');
    lines.push('**Signature pattern:** Personal experience + measured opinion + technical specificity');
    lines.push('');
    
    if (examples.personal.length > 0) {
      lines.push('**Example structure:**');
      lines.push('```');
      lines.push(examples.personal[0]);
      lines.push('```');
      lines.push('');
      lines.push('**Breaks down as:**');
      if (voice.equipmentSpecificity && voice.equipmentSpecificity.specific.length > 0) {
        const specific = voice.equipmentSpecificity.specific[0].phrase;
        lines.push(`- ✅ Specific equipment ("${specific}")`);
      }
      lines.push('- ✅ Personal testing (first-person statements)');
      lines.push('- ✅ Measured observation (not hyperbole)');
      lines.push('- ✅ Engineering rationale (why it matters)');
      lines.push('');
    }
  }
  
  // 3.3 Equipment Specificity (CRITICAL)
  if (voice.equipmentSpecificity && voice.equipmentSpecificity.specific.length > 0) {
    lines.push('### 3. Equipment Specificity (CRITICAL)');
    lines.push('');
    lines.push('**This is a major authenticity signal.**');
    lines.push('');
    lines.push('**✅ Right:**');
    for (const eq of voice.equipmentSpecificity.specific.slice(0, 5)) {
      lines.push(`- ${eq.phrase}`);
    }
    lines.push('');
    
    if (voice.equipmentSpecificity.generic.length > 0) {
      lines.push('**❌ Wrong:**');
      for (const eq of voice.equipmentSpecificity.generic.slice(0, 5)) {
        lines.push(`- ${eq.phrase}`);
      }
      lines.push('');
    } else {
      lines.push('**❌ Wrong:**');
      lines.push('- the wheelbase');
      lines.push('- a pedal set');
      lines.push('- the product');
      lines.push('- this equipment');
      lines.push('');
    }
    
    lines.push('**Why it matters:** Generic references signal AI-generated content. Specific names with possessives prove real testing.');
    lines.push('');
  }
  
  // 3.4 Hedging & Confidence Balance
  lines.push(`### ${voice.equipmentSpecificity && voice.equipmentSpecificity.specific.length > 0 ? '4' : '3'}. Hedging & Confidence Balance`);
  lines.push('');
  lines.push(`**Your confidence level:** ${hasConfidence ? 'HIGH' : 'MODERATE'}`);
  lines.push('');
  lines.push(`**Hedging frequency:** ${voice.hedgingLanguage.frequency.toFixed(2)} per 100 words (${hasConfidence ? 'LOW' : 'MODERATE'})`);
  lines.push('');
  if (hasConfidence) {
    lines.push('Use hedging words sparingly. You should sound decisive.');
    lines.push('');
    lines.push('**When hedging IS appropriate:**');
    lines.push('- Acknowledging alternatives: "possibly worth trying"');
    lines.push('- Caveat to personal opinion: "could also depend on..."');
    lines.push('- Technical uncertainty: "might perform differently"');
    lines.push('');
    lines.push('**When hedging HURTS your voice:**');
    lines.push('- Every suggestion wrapped in "perhaps"');
    lines.push('- Constant "I think, but..." (sounds unsure)');
    lines.push('- Over-qualifying every statement');
  } else {
    lines.push('Balanced hedging maintains credibility whilst showing appropriate caution.');
    lines.push('');
    lines.push('**Good hedging:**');
    lines.push('- "In most cases..." (acknowledges exceptions)');
    lines.push('- "Typically..." (allows for variation)');
    lines.push('- "Generally..." (not absolute claim)');
    lines.push('');
    lines.push('**Avoid:**');
    lines.push('- Absolute certainty where evidence is limited');
    lines.push('- Hedging so much you say nothing');
  }
  lines.push('');
  
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 4. SENTENCE STRUCTURE & RHYTHM
  // ============================================================
  lines.push('## SENTENCE STRUCTURE & RHYTHM');
  lines.push('');
  
  lines.push('### Target Statistics');
  lines.push('');
  lines.push('| Metric | Value | Interpretation |');
  lines.push('|--------|-------|-----------------|');
  lines.push(`| Avg sentence length | ${sentence.length.mean.toFixed(1)} words | ${sentence.length.mean < 18 ? 'Concise style' : sentence.length.mean > 25 ? 'Complex style' : 'Medium complexity'} |`);
  lines.push(`| Sentence variance | ±${sentence.length.stdDev.toFixed(1)} words | ${sentence.length.stdDev > 12 ? 'HIGH variance = natural' : 'Moderate variance'} |`);
  if (paragraph) {
    lines.push(`| Sentences per paragraph | ${paragraph.sentencesPerParagraph.mean.toFixed(1)} | ${paragraph.sentencesPerParagraph.mean < 2 ? 'VARIABLE (1-4 typical)' : 'Consistent structure'} |`);
  }
  lines.push(`| First-person frequency | ${voice.firstPerson.frequency.toFixed(2)} per 100 words | ${hasPersonal ? 'Distributed, not clustered' : 'Minimal personal voice'} |`);
  if (punctuation) {
    lines.push(`| Exclamation marks | ${punctuation.exclamationFrequency.toFixed(1)} per 1000 words | ${punctuation.exclamationFrequency > 5 ? 'Enthusiastic' : punctuation.exclamationFrequency > 2 ? 'Measured enthusiasm' : 'Restrained'} |`);
  }
  lines.push('');
  
  // Sentence length variation
  lines.push('### Sentence Length Variation (CRITICAL)');
  lines.push('');
  lines.push('**Bad (mechanical):** Every sentence 18-22 words');
  lines.push('');
  lines.push('**Good (natural):** Mix of these:');
  lines.push('- Short punchy: 5-8 words ("This actually works." / "Look, it matters.")');
  lines.push('- Standard: 10-18 words (most sentences land here)');
  lines.push('- Complex: 20-30 words (explaining technical detail)');
  lines.push('- Deep: 35+ words (rare, for complex concepts)');
  lines.push('');
  lines.push('**Test:** Read paragraph aloud. Does every sentence have the same rhythm? If yes, rewrite.');
  lines.push('');
  
  // Paragraph structure
  lines.push('### Paragraph Structure');
  lines.push('');
  if (paragraph && paragraph.sentencesPerParagraph.mean < 2.5) {
    lines.push('**Variable is key.** Your paragraphs should range from 1-4 sentences.');
    lines.push('');
    lines.push('**NOT this:**');
    lines.push('```');
    lines.push('First sentence explaining concept. Second sentence providing detail.');
    lines.push('Third sentence adding emphasis. Fourth sentence concluding thought.');
    lines.push('[repeat 5 times with same rhythm]');
    lines.push('```');
    lines.push('');
    lines.push('**DO this:**');
    lines.push('```');
    lines.push('Key insight in one sentence.');
    lines.push('');
    lines.push('Supporting detail here. Technical context. This explains the why.');
    lines.push('');
    lines.push('Counter-point or caveat.');
    lines.push('```');
  } else {
    lines.push('Maintain consistent paragraph length for readability.');
  }
  lines.push('');
  
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 5. CONVERSATIONAL MARKERS
  // ============================================================
  if (voice.conversationalMarkers.length > 0 || argumentFlow.conversationalDevices.length > 0) {
    lines.push('## CONVERSATIONAL MARKERS');
    lines.push('');
    
    if (voice.conversationalMarkers.length > 0) {
      lines.push('**Words that make writing feel spoken:**');
      lines.push('');
      for (const marker of voice.conversationalMarkers.slice(0, 8)) {
        const frequency = (marker.count / metadata.statistics.total_words) * 100;
        lines.push(`- **"${marker.word}"** (${frequency.toFixed(2)}/100 words) - Natural connector`);
      }
      lines.push('');
    }
    
    if (argumentFlow.conversationalDevices.length > 0) {
      lines.push('**Devices from your corpus:**');
      lines.push('');
      for (const device of argumentFlow.conversationalDevices.slice(0, 5)) {
        lines.push(`- **"${device.trigger}"** - ${device.purpose}`);
      }
      lines.push('');
    }
    
    lines.push('**When to use:** Naturally, not forced. If every paragraph has one, you\'re overdoing it.');
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // ============================================================
  // 6. ANTI-MECHANICAL WRITING PATTERNS
  // ============================================================
  lines.push('## ANTI-MECHANICAL WRITING PATTERNS');
  lines.push('');
  
  lines.push('### Problem 1: Uniform Sentence Rhythm');
  lines.push('');
  lines.push('**Symptom:** Every sentence 15-20 words, same structure');
  lines.push('');
  lines.push('**Fix:** Deliberately vary. Write a 6-word sentence. Follow with a 28-word explanation that includes multiple clauses and technical detail.');
  lines.push('');
  
  if (voice.equipmentSpecificity && voice.equipmentSpecificity.specific.length > 0) {
    lines.push('### Problem 2: Generic References');
    lines.push('');
    lines.push('**Symptom:** "the product", "the equipment", "this device"');
    lines.push('');
    lines.push('**Fix:** Name it specifically. Include model numbers, versions, your ownership.');
    lines.push('');
  }
  
  lines.push('### Problem 3: Perfect Narratives');
  lines.push('');
  lines.push('**Symptom:** Everything works perfectly, no caveats, absolute confidence');
  lines.push('');
  lines.push('**Fix:** Admit limitations. Include "but" paragraphs. Acknowledge uncertainty.');
  lines.push('');
  
  if (examples.counterpoints.length > 0) {
    lines.push('**Example from your corpus:**');
    lines.push('```');
    lines.push(examples.counterpoints[0]);
    lines.push('```');
    lines.push('');
  }
  
  // Punctuation anti-patterns
  if (punctuation) {
    lines.push('### Problem 4: Em-Dash Overuse');
    lines.push('');
    
    if (punctuation.dashTypes.emDash === 0) {
      lines.push('**Your pattern:** You NEVER use em-dashes (—). Only hyphens (-).');
      lines.push('');
      lines.push('**CRITICAL:** If you see an em-dash in output, replace it immediately. Em-dashes are a major AI tell.');
    } else {
      lines.push(`**Your pattern:** Em-dashes appear ${punctuation.dashTypes.emDash} times in corpus.`);
      lines.push('');
      lines.push('**Watch:** AI overuses em-dashes. Use sparingly and consistently.');
    }
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 7. AUTHENTIC VOICE CHECKLIST
  // ============================================================
  lines.push('## AUTHENTIC VOICE CHECKLIST');
  lines.push('');
  
  lines.push('### Pre-Publication Validation');
  lines.push('');
  
  lines.push('**Quick Filter (60 seconds):**');
  if (voice.equipmentSpecificity && voice.equipmentSpecificity.specific.length > 0) {
    lines.push('- [ ] Contains specific product name (not "the product")');
  }
  if (hasPersonal) {
    lines.push('- [ ] Contains first-person statement');
  }
  lines.push('- [ ] No AI clichés detected (check forbidden list)');
  lines.push('- [ ] Sounds like person, not marketing');
  lines.push('');
  
  lines.push('**Detailed Check (5 minutes):**');
  lines.push('- [ ] Sentence lengths vary (5-8 words to 30+ words)');
  lines.push('- [ ] No em-dash usage (or consistent with corpus)');
  lines.push('- [ ] Specific examples, not generic');
  if (hasBritish) {
    lines.push('- [ ] British spelling throughout');
  }
  if (examples.counterpoints.length > 0) {
    lines.push('- [ ] Contains caveats or limitations');
  }
  lines.push('');
  
  lines.push('**Deep Validation (10 minutes):**');
  lines.push(`- [ ] First-person frequency ~${voice.firstPerson.frequency.toFixed(2)}/100 words`);
  lines.push(`- [ ] Hedging frequency ~${voice.hedgingLanguage.frequency.toFixed(2)}/100 words`);
  lines.push(`- [ ] Sentence variance ${sentence.length.stdDev.toFixed(1)}+ stddev`);
  if (voice.conversationalMarkers.length > 0) {
    const markers = voice.conversationalMarkers.slice(0, 3).map(m => `"${m.word}"`).join(', ');
    lines.push(`- [ ] Conversational markers present (${markers})`);
  }
  lines.push('');
  
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 8. EXAMPLES: WHAT AUTHENTICITY LOOKS LIKE
  // ============================================================
  lines.push('## EXAMPLES: WHAT AUTHENTICITY LOOKS LIKE');
  lines.push('');
  
  if (examples.personal.length > 0) {
    lines.push('### Personal Authority');
    lines.push('');
    lines.push('**✅ Good:**');
    lines.push('```');
    lines.push(examples.personal[0]);
    lines.push('```');
    lines.push('');
    lines.push('**Why this works:**');
    lines.push('- Specific equipment named');
    lines.push('- Personal testing authority');
    lines.push('- Engineering rationale included');
    lines.push('');
  }
  
  if (examples.technical.length > 0) {
    lines.push('### Technical Detail');
    lines.push('');
    lines.push('**✅ Good:**');
    lines.push('```');
    lines.push(examples.technical[0]);
    lines.push('```');
    lines.push('');
    lines.push('**Why this works:**');
    lines.push('- Real numbers and specifications');
    lines.push('- Practical implications explained');
    lines.push('- Human voice persists in technical content');
    lines.push('');
  }
  
  if (examples.counterpoints.length > 0) {
    lines.push('### Authentic Nuance');
    lines.push('');
    lines.push('**✅ Good:**');
    lines.push('```');
    lines.push(examples.counterpoints[0]);
    lines.push('```');
    lines.push('');
    lines.push('**Why this works:**');
    lines.push('- Acknowledges limitations');
    lines.push('- "But" creates authentic complexity');
    lines.push('- Not perfect narrative');
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  // ============================================================
  // 9. REFERENCE: CORPUS STATISTICS
  // ============================================================
  lines.push('## REFERENCE: CORPUS STATISTICS');
  lines.push('');
  lines.push('*These validate the voice. They don\'t create it.*');
  lines.push('');
  
  // Function words (if available)
  if (functionWords && (functionWords.distinctive.length > 0 || functionWords.avoided.length > 0)) {
    lines.push('### Function Word Signature');
    lines.push('');
    
    if (functionWords.distinctive.length > 0) {
      lines.push('**Words used MORE than typical:**');
      lines.push('');
      for (const word of functionWords.distinctive.slice(0, 8)) {
        const zScore = functionWords.zScores[word.word];
        if (zScore) {
          lines.push(`- **"${word.word}"** (z=${zScore.zScore.toFixed(2)}) - ${word.frequency.toFixed(2)}/100 words`);
        }
      }
      lines.push('');
    }
    
    if (functionWords.avoided.length > 0) {
      lines.push('**Words AVOIDED (use sparingly):**');
      lines.push('');
      for (const word of functionWords.avoided.slice(0, 8)) {
        const zScore = functionWords.zScores[word.word];
        if (zScore) {
          lines.push(`- **"${word.word}"** (z=${zScore.zScore.toFixed(2)}) - ${word.frequency.toFixed(2)}/100 words`);
        }
      }
      lines.push('');
    }
  }
  
  // British English markers
  if (hasBritish) {
    lines.push('### British English Markers');
    lines.push('');
    lines.push('| American | British |');
    lines.push('|----------|---------|');
    for (const marker of vocab.britishMarkers.slice(0, 10)) {
      const british = marker.word;
      const american = british.replace('ise', 'ize').replace('our', 'or').replace('re', 'er');
      lines.push(`| ${american} | ${british} |`);
    }
    lines.push('');
  }
  
  // Punctuation patterns
  if (punctuation) {
    lines.push('### Punctuation Patterns');
    lines.push('');
    lines.push('| Pattern | Value |');
    lines.push('|---------|-------|');
    lines.push(`| Comma density | ${punctuation.commaDensity.toFixed(2)}/sentence |`);
    lines.push(`| Semicolons | ${punctuation.semicolonFrequency.toFixed(1)}/1000 words |`);
    lines.push(`| Exclamations | ${punctuation.exclamationFrequency.toFixed(1)}/1000 words |`);
    lines.push(`| Parentheticals | ${punctuation.parentheticalFrequency.toFixed(1)}/1000 words |`);
    if (punctuation.dashTypes.emDash === 0) {
      lines.push(`| Em-dashes | 0 (NEVER use) |`);
    }
    lines.push('');
  }
  
  // Corpus overview
  lines.push('### Corpus Overview');
  lines.push('');
  lines.push(`- **Total words:** ${metadata.wordCount.toLocaleString()}`);
  lines.push(`- **Articles analyzed:** ${metadata.articleCount}`);
  lines.push(`- **Average article length:** ${Math.round(metadata.wordCount / metadata.articleCount).toLocaleString()} words`);
  lines.push('');
  
  return lines.join('\n');
}

export { generateStyleGuideInternal as generateStyleGuide };