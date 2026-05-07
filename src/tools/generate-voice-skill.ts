import fs from 'fs/promises';
import path from 'path';
import type { PhraseLibrary, PhraseExample } from '../analyzers/phrase-extraction.js';
import type { VoiceMarkers } from '../analyzers/voice-markers.js';

export interface GenerateVoiceSkillParams {
  corpus_name: string;
  corpus_dir: string;
  sample_count?: number;
}

export interface GenerateVoiceSkillResult {
  success: boolean;
  skill_path: string;
  samples_written: number;
}

interface ArticleEntry {
  filename: string;
  title: string;
  body: string;
  wordCount: number;
}

export async function generateVoiceSkill(
  params: GenerateVoiceSkillParams
): Promise<GenerateVoiceSkillResult> {
  const { corpus_name, corpus_dir, sample_count = 25 } = params;

  const corpusPath = path.join(corpus_dir, corpus_name);
  const articlesDir = path.join(corpusPath, 'articles');
  const analysisDir = path.join(corpusPath, 'analysis');
  const skillDir = path.join(corpusPath, 'skill');
  const samplesDir = path.join(skillDir, 'samples');

  await fs.rm(samplesDir, { recursive: true, force: true });
  await fs.mkdir(samplesDir, { recursive: true });

  const phraseLibrary = await loadJson<PhraseLibrary>(path.join(analysisDir, 'phrase-library.json'));
  const voice = await loadJson<VoiceMarkers>(path.join(analysisDir, 'voice.json'));
  const punctuation = await loadJson<any>(path.join(analysisDir, 'punctuation.json'));

  const samplesWritten = await writeSamples(articlesDir, samplesDir, sample_count);

  const skillMd = buildSkillMd({
    corpus_name,
    sampleCount: samplesWritten,
    phraseLibrary,
    voice,
    punctuation,
  });

  await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillMd, 'utf-8');

  return {
    success: true,
    skill_path: skillDir,
    samples_written: samplesWritten,
  };
}

async function loadJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeSamples(
  articlesDir: string,
  samplesDir: string,
  desired: number
): Promise<number> {
  let files: string[];
  try {
    files = (await fs.readdir(articlesDir)).filter(f => f.endsWith('.md')).sort();
  } catch {
    return 0;
  }

  if (files.length === 0) return 0;

  const articles: ArticleEntry[] = [];
  for (const filename of files) {
    const raw = await fs.readFile(path.join(articlesDir, filename), 'utf-8');
    const titleMatch = raw.match(/^title:\s*(.+)$/m);
    const wcMatch = raw.match(/^word_count:\s*(\d+)/m);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, '');
    const body = raw.replace(/^---[\s\S]*?---\n+/, '').trim();
    if (!body) continue;
    const wordCount = wcMatch ? parseInt(wcMatch[1], 10) : body.split(/\s+/).length;
    articles.push({ filename, title, body, wordCount });
  }

  if (articles.length === 0) return 0;

  const byLength = [...articles].sort((a, b) => a.wordCount - b.wordCount);
  const picks = pickEvenly(byLength, desired);

  let written = 0;
  for (const article of picks) {
    const out = `# ${article.title}\n\n${article.body}\n`;
    await fs.writeFile(path.join(samplesDir, article.filename), out, 'utf-8');
    written++;
  }

  return written;
}

function pickEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    out.push(items[Math.floor(i * step)]);
  }
  return out;
}

interface SkillBuildContext {
  corpus_name: string;
  sampleCount: number;
  phraseLibrary: PhraseLibrary | null;
  voice: VoiceMarkers | null;
  punctuation: any;
}

function buildSkillMd(ctx: SkillBuildContext): string {
  const displayName = formatName(ctx.corpus_name);
  const skillName = `voice-${slugify(ctx.corpus_name)}`;
  const lines: string[] = [];

  lines.push('---');
  lines.push(`name: ${skillName}`);
  lines.push('description: >');
  lines.push(
    `  Write prose in ${displayName}'s voice. Loads ${ctx.sampleCount} real writing samples`
  );
  lines.push(
    `  and recurring phrases from ${displayName}'s published work so output reads like`
  );
  lines.push(`  ${displayName}, not like a model. Use when drafting or rewriting any prose:`);
  lines.push(`  blog posts, articles, page copy, reviews, product descriptions, emails,`);
  lines.push(`  social posts, landing copy. Auto-triggers when the user asks to "write like`);
  lines.push(
    `  ${displayName}", "in ${displayName}'s voice", "in our voice", or for any content`
  );
  lines.push(`  meant to match the existing site tone.`);
  lines.push('---');
  lines.push('');

  lines.push(
    `Read three random files from \`samples/\` end to end. Match what you read: sentence rhythm, where sentences end, how paragraphs turn, where ${displayName} self-corrects. Write fresh prose with the same shape. Don't paraphrase the samples.`
  );
  lines.push('');
  lines.push("Draft feels generic? Read another sample.");
  lines.push('');

  lines.push('## Persistence');
  lines.push('');
  lines.push(
    'Active for all prose responses once invoked. Drop the voice for code blocks, error messages, command output, JSON, and tables. Those stay literal. Resume the voice in surrounding prose.'
  );
  lines.push('');

  const rules = collectRules(ctx);
  if (rules.length > 0) {
    lines.push('## Rules');
    lines.push('');
    for (const r of rules) {
      lines.push(`- ${r}`);
    }
    lines.push('');
  }

  const openings = collectOpenings(ctx.phraseLibrary);
  if (openings.length > 0) {
    lines.push('## How sentences start');
    lines.push('');
    lines.push('Lift one of these shapes:');
    lines.push('');
    for (const o of openings) {
      lines.push(`- "${cleanQuote(o)}"`);
    }
    lines.push('');
  }

  const recurring = collectRecurring(ctx.voice);
  if (recurring.length > 0) {
    lines.push('## Phrases that recur');
    lines.push('');
    lines.push('Use where they fit. Don\'t force.');
    lines.push('');
    for (const p of recurring) {
      lines.push(`- "${cleanQuote(p.phrase)}"${p.count > 1 ? ` (${p.count}×)` : ''}`);
    }
    lines.push('');
  }

  const caveats = (ctx.phraseLibrary?.caveatPhrases ?? []).slice(0, 8);
  if (caveats.length > 0) {
    lines.push('## How to hedge');
    lines.push('');
    lines.push('Pull confident claims back with a small caveat:');
    lines.push('');
    for (const c of caveats) {
      lines.push(`- "${cleanQuote(c.phrase)}"`);
    }
    lines.push('');
  }

  lines.push('## When stuck');
  lines.push('');
  lines.push('Read another sample.');
  lines.push('');

  return lines.join('\n');
}

function collectRules(ctx: SkillBuildContext): string[] {
  const rules: string[] = [];

  const emDashes = ctx.punctuation?.dashTypes?.emDash ?? 0;
  if (emDashes === 0) {
    rules.push('No em-dashes (—). Use hyphen with spaces, a comma, or a full stop.');
  }

  const hollow = (ctx.voice?.hollowIntensifiers ?? []).slice(0, 8);
  if (hollow.length > 0) {
    const list = hollow.map(h => `"${h.phrase}"`).join(', ');
    rules.push(`No ${list}.`);
  }

  const aiCliches = (ctx.voice?.aiCliches ?? []).slice(0, 8);
  if (aiCliches.length > 0) {
    const list = aiCliches.map(c => `"${c.phrase}"`).join(', ');
    rules.push(`No ${list}.`);
  }

  const marketing = (ctx.voice?.marketingSpeak ?? []).slice(0, 6);
  if (marketing.length > 0) {
    const list = marketing.map(m => `"${m.phrase}"`).join(', ');
    rules.push(`No marketing speak: ${list}.`);
  }

  const specific = ctx.voice?.equipmentSpecificity?.specific ?? [];
  const generic = ctx.voice?.equipmentSpecificity?.generic ?? [];
  if (specific.length > 0 && generic.length > 0) {
    const yesEx = specific.slice(0, 2).map(s => `"${cleanQuote(s.phrase)}"`).join(', ');
    const noEx = generic.slice(0, 2).map(g => `"${cleanQuote(g.phrase)}"`).join(', ');
    rules.push(`Name kit by make with a possessive: ${yesEx}. Not ${noEx}.`);
  } else if (specific.length > 0) {
    const yesEx = specific.slice(0, 2).map(s => `"${cleanQuote(s.phrase)}"`).join(', ');
    rules.push(`Name kit by make with a possessive: ${yesEx}.`);
  }

  return rules;
}

function collectOpenings(lib: PhraseLibrary | null): string[] {
  if (!lib) return [];
  const buckets: PhraseExample[][] = [
    lib.openingPatterns?.personalStory ?? [],
    lib.openingPatterns?.directAction ?? [],
    lib.openingPatterns?.protectiveWarning ?? [],
  ];
  const out: string[] = [];
  const seen = new Set<string>();
  const perBucket = 4;
  for (const bucket of buckets) {
    for (const ex of bucket.slice(0, perBucket)) {
      const trimmed = ex.phrase.trim();
      if (trimmed.length < 12 || trimmed.length > 140) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(trimmed);
    }
  }
  return out.slice(0, 12);
}

function collectRecurring(voice: VoiceMarkers | null): PhraseExample[] {
  if (!voice) return [];
  const pool: PhraseExample[] = [
    ...(voice.signatureHedging ?? []),
    ...(voice.collegialPatterns ?? []),
    ...(voice.identityMarkers?.genuineInterest ?? []),
    ...(voice.identityMarkers?.honestObsession ?? []),
    ...(voice.identityMarkers?.humbleHelper ?? []),
    ...(voice.identityMarkers?.transparencyCommitment ?? []),
  ];
  const merged = new Map<string, { display: string; count: number }>();
  for (const item of pool) {
    const display = item.phrase.trim();
    const key = display.toLowerCase();
    if (!key) continue;
    const existing = merged.get(key);
    if (existing) {
      existing.count += item.count;
    } else {
      merged.set(key, { display, count: item.count });
    }
  }
  return Array.from(merged.values())
    .map(({ display, count }) => ({ phrase: display, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function cleanQuote(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/"/g, "'").trim();
}

function formatName(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
