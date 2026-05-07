/**
 * Tool: analyze_corpus
 *
 * Runs the six analysers whose output feeds generate_voice_skill:
 *   - phrase-extraction → phrase-library.json
 *   - voice-markers     → voice.json
 *   - punctuation       → punctuation.json
 *   - vocabulary-tiers  → vocabulary-tiers.json
 *   - vulnerability     → vulnerability-patterns.json
 *   - specificity       → specificity-patterns.json
 */

import fs from 'fs/promises';
import path from 'path';
import { extractPhrases } from '../analyzers/phrase-extraction.js';
import { analyzeVoiceMarkers } from '../analyzers/voice-markers.js';
import { analyzePunctuation } from '../analyzers/punctuation.js';
import { analyzeVocabularyTiers } from '../analyzers/vocabulary-tiers.js';
import { analyzeVulnerabilityPatterns } from '../analyzers/vulnerability-patterns.js';
import { analyzeSpecificityPatterns } from '../analyzers/specificity-patterns.js';

export interface AnalyzeCorpusParams {
  corpus_name: string;
  corpus_dir: string;
}

export interface AnalyzeCorpusResult {
  success: boolean;
  corpus_name: string;
  analysis_path: string;
}

export async function analyzeCorpus(params: AnalyzeCorpusParams): Promise<AnalyzeCorpusResult> {
  const { corpus_name, corpus_dir } = params;

  const corpusDir = path.join(corpus_dir, corpus_name);
  const articlesDir = path.join(corpusDir, 'articles');
  const analysisDir = path.join(corpusDir, 'analysis');

  await fs.mkdir(analysisDir, { recursive: true });

  const files = await fs.readdir(articlesDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));

  let combinedText = '';
  for (const file of markdownFiles) {
    const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n\n/, '');
    combinedText += withoutFrontmatter + '\n\n';
  }

  const outputs: Array<[string, unknown]> = [
    ['phrase-library.json', extractPhrases(combinedText)],
    ['voice.json', analyzeVoiceMarkers(combinedText)],
    ['punctuation.json', analyzePunctuation(combinedText)],
    ['vocabulary-tiers.json', analyzeVocabularyTiers(combinedText)],
    ['vulnerability-patterns.json', analyzeVulnerabilityPatterns(combinedText)],
    ['specificity-patterns.json', analyzeSpecificityPatterns(combinedText)],
  ];

  for (const [filename, data] of outputs) {
    await fs.writeFile(
      path.join(analysisDir, filename),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  return {
    success: true,
    corpus_name,
    analysis_path: analysisDir,
  };
}
