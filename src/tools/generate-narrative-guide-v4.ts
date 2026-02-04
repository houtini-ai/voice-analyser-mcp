/**
 * Generate Narrative Style Guide v4
 * 
 * Example-first format focused on executable writing instructions
 * rather than statistical analysis.
 */

import fs from 'fs/promises';
import path from 'path';
import type { VocabularyTierAnalysis } from '../analyzers/vocabulary-tiers.js';
import type { PhraseLibrary } from '../analyzers/phrase-extraction.js';

/**
 * Generate v4 style guide with example-first structure
 */
export async function generateNarrativeGuideV4(
  analysisDir: string,
  corpusName: string
): Promise<string> {
  
  // Load all analysis files
  const vocabularyTiers: VocabularyTierAnalysis = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'vocabulary-tiers.json'), 'utf-8')
  );
  
  const phraseLibrary: PhraseLibrary = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'phrase-library.json'), 'utf-8')
  );
  
  const voice = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'voice.json'), 'utf-8')
  );
  
  const sentence = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'sentence.json'), 'utf-8')
  );
  
  const punctuation = JSON.parse(
    await fs.readFile(path.join(analysisDir, 'punctuation.json'), 'utf-8')
  );
  
  // Extract sentence statistics (handle different JSON formats)
  const avgLength = sentence.length?.mean || sentence.averageLength || 0;
  const stdDev = sentence.length?.stdDev || sentence.standardDeviation || 0;
  
  const lines: string[] = [];
  
  // Header
  lines.push(`# ${formatCorpusName(corpusName)} Writing Style Guide`);
  lines.push('*Executable instructions for voice-matched writing*');
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // PART 1: ZERO TOLERANCE RULES
  lines.push('## PART 1: ZERO TOLERANCE RULES');
  lines.push('');
  lines.push('*These rules MUST be followed. Violations break authenticity.*');
  lines.push('');
  
  // AI Slop Detection
  lines.push('### ❌ Forbidden Vocabulary (AI Slop)');
  lines.push('');
  lines.push('These words NEVER appear in this corpus:');
  lines.push('');
  
  if (vocabularyTiers.aiSlop.length > 0) {
    lines.push('**DETECTED IN CORPUS (must remove):**');
    for (const word of vocabularyTiers.aiSlop) {
      lines.push(`- **${word.word}** (${word.count}× occurrences) → Use: ${word.suggestedAlternatives.join(', ')}`);
    }
    lines.push('');
  }
  
  lines.push('**Common AI slop to avoid:**');
  lines.push('- delve → Use: explore, look at, examine');
  lines.push('- leverage → Use: use, apply');
  lines.push('- unlock → Use: discover, access, enable');
  lines.push('- seamless → Use: smooth, works well');
  lines.push('- robust → Use: strong, reliable');
  lines.push('- cutting-edge → Use: latest, modern');
  lines.push('- game-changer → Use: big improvement');
  lines.push('- revolutionize → Use: change completely');
  lines.push('- groundbreaking → Use: new, innovative');
  lines.push('');
  
  // Formal vocabulary
  lines.push('### ⚠️ Formal Words (Replace with Casual)');
  lines.push('');
  lines.push(`**Formality Score:** ${vocabularyTiers.formalityScore} formal words per 1000`);
  lines.push('');
  
  if (vocabularyTiers.formalityScore > 10) {
    lines.push('⚠️ **HIGH FORMALITY** - This voice is very casual. Replace formal words.');
  } else if (vocabularyTiers.formalityScore > 5) {
    lines.push('✓ **ACCEPTABLE** - Minor tweaks recommended.');
  } else {
    lines.push('✓ **CASUAL VOICE** - Good natural tone.');
  }
  lines.push('');
  
  if (vocabularyTiers.formalVerbs.length > 0) {
    lines.push('**Formal verbs found in corpus:**');
    for (const verb of vocabularyTiers.formalVerbs.slice(0, 10)) {
      lines.push(`- ${verb.word} (${verb.count}×) → ${verb.suggestedAlternatives.join(', ')}`);
    }
    lines.push('');
  }
  
  if (vocabularyTiers.formalAdjectives.length > 0) {
    lines.push('**Formal adjectives found in corpus:**');
    for (const adj of vocabularyTiers.formalAdjectives.slice(0, 5)) {
      lines.push(`- ${adj.word} (${adj.count}×) → ${adj.suggestedAlternatives.join(', ')}`);
    }
    lines.push('');
  }
  
  // Punctuation rules
  lines.push('### ❌ Forbidden Punctuation');
  lines.push('');
  
  const hasEmDashes = punctuation.dashTypes?.emDash > 0;
  if (hasEmDashes) {
    lines.push(`⚠️ **Em-dashes detected:** ${punctuation.dashTypes.emDash} occurrences`);
    lines.push('This writer uses regular hyphens with spaces, not em-dashes (—).');
  } else {
    lines.push('✓ **No em-dashes** - Use regular hyphens with spaces ( - ) instead of em-dashes (—)');
  }
  lines.push('');
  
  lines.push('---');
  lines.push('');
  
  // PART 2: PHRASE LIBRARY
  lines.push('## PART 2: PHRASE LIBRARY');
  lines.push('');
  lines.push('*Actual phrases from the corpus. Use these as templates.*');
  lines.push('');
  
  // Opening patterns
  lines.push('### Opening Patterns');
  lines.push('');
  
  if (phraseLibrary.openingPatterns.personalStory.length > 0) {
    lines.push('**Personal Story Openings:**');
    for (const example of phraseLibrary.openingPatterns.personalStory.slice(0, 15)) {
      lines.push(`- "${example.phrase}"`);
    }
    lines.push('');
  }
  
  if (phraseLibrary.openingPatterns.directAction.length > 0) {
    lines.push('**Direct Action Openings:**');
    for (const example of phraseLibrary.openingPatterns.directAction.slice(0, 15)) {
      lines.push(`- "${example.phrase}"`);
    }
    lines.push('');
  }
  
  if (phraseLibrary.openingPatterns.protectiveWarning.length > 0) {
    lines.push('**Protective Warning Openings:**');
    for (const example of phraseLibrary.openingPatterns.protectiveWarning.slice(0, 10)) {
      lines.push(`- "${example.phrase}"`);
    }
    lines.push('');
  }
  
  // Equipment references
  lines.push('### Equipment References');
  lines.push('');
  lines.push('**✅ Good (with possessives):**');
  for (const example of phraseLibrary.equipmentReferences.withPossessive.slice(0, 10)) {
    lines.push(`- "${example.phrase}" (${example.count}×)`);
  }
  lines.push('');
  
  lines.push('**❌ Generic (avoid when possible):**');
  for (const example of phraseLibrary.equipmentReferences.generic.slice(0, 10)) {
    lines.push(`- "${example.phrase}" (${example.count}×)`);
  }
  lines.push('');
  
  // Caveat phrases
  if (phraseLibrary.caveatPhrases.length > 0) {
    lines.push('### Honesty & Caveat Phrases');
    lines.push('');
    lines.push('**Examples from corpus:**');
    for (const example of phraseLibrary.caveatPhrases) {
      lines.push(`- "${example.phrase}"`);
    }
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  // PART 3: SENTENCE PATTERNS
  lines.push('## PART 3: SENTENCE PATTERNS');
  lines.push('');
  
  lines.push('### Rhythm Variation');
  lines.push('');
  lines.push(`**Target:** Mix of short (5-8 words), medium (15-25), long (30-40), very long (40+)`);
  lines.push('');
  lines.push(`**Average sentence length:** ${avgLength.toFixed(1)} words`);
  lines.push(`**Standard deviation:** ±${stdDev.toFixed(1)} words`);
  lines.push('');
  
  if (sentence.examples && sentence.examples.shortest && sentence.examples.longest) {
    lines.push('**Examples from corpus:**');
    lines.push(`- **Short:** "${sentence.examples.shortest.text}" (${sentence.examples.shortest.length} words)`);
    if (sentence.examples.median) {
      lines.push(`- **Medium:** "${sentence.examples.median.text}" (${sentence.examples.median.length} words)`);
    }
    lines.push(`- **Long:** "${sentence.examples.longest.text}" (${sentence.examples.longest.length} words)`);
    lines.push('');
  }
  
  lines.push('### First-Person Usage');
  lines.push('');
  lines.push(`**Frequency:** ${voice.firstPerson.frequency.toFixed(2)} per 100 words`);
  lines.push('');
  lines.push('**Patterns:**');
  for (const example of voice.firstPerson.examples.slice(0, 8)) {
    lines.push(`- "${example.phrase}" (${example.count}×)`);
  }
  lines.push('');
  
  lines.push('---');
  lines.push('');
  
  // PART 4: VALIDATION CHECKLIST
  lines.push('## PART 4: VALIDATION CHECKLIST');
  lines.push('');
  lines.push('*After writing, verify:*');
  lines.push('');
  
  lines.push('### Critical (Must Pass):');
  lines.push('');
  lines.push('- [ ] Zero AI slop words (search for: delve, leverage, unlock, seamless, robust)');
  if (!hasEmDashes) {
    lines.push('- [ ] Zero em-dashes (search for: —)');
  }
  lines.push('- [ ] British spelling (colour, optimise, whilst)');
  lines.push('- [ ] Equipment named specifically (not generic "the product")');
  lines.push('');
  
  lines.push('### Voice Match (Should Pass):');
  lines.push('');
  lines.push(`- [ ] First-person present (target: ~${voice.firstPerson.frequency.toFixed(1)} per 100 words)`);
  lines.push('- [ ] Sentence length varies wildly (5-word to 40-word sentences)');
  lines.push('- [ ] At least one honest caveat included');
  lines.push('- [ ] Opening matches corpus patterns (personal/direct/protective)');
  lines.push('');
  
  lines.push('---');
  lines.push('');
  
  // PART 5: QUICK REFERENCE
  lines.push('## PART 5: QUICK REFERENCE');
  lines.push('');
  
  lines.push('### Top Phrases by Frequency');
  lines.push('');
  
  // Get top equipment references
  const topEquipment = [...phraseLibrary.equipmentReferences.withPossessive]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  if (topEquipment.length > 0) {
    lines.push('**Equipment references:**');
    for (const item of topEquipment) {
      lines.push(`- "${item.phrase}" (${item.count}×)`);
    }
    lines.push('');
  }
  
  // Voice markers
  lines.push('**First-person markers:**');
  const topFirstPerson = voice.firstPerson.examples.slice(0, 5);
  for (const item of topFirstPerson) {
    lines.push(`- "${item.phrase}" (${item.count}×)`);
  }
  lines.push('');
  
  lines.push(`### Statistics Summary`);
  lines.push('');
  lines.push(`- **Formality Score:** ${vocabularyTiers.formalityScore} formal words per 1000`);
  lines.push(`- **Average Sentence:** ${avgLength.toFixed(1)} words (±${stdDev.toFixed(1)})`);
  lines.push(`- **First-Person:** ${voice.firstPerson.frequency.toFixed(2)} per 100 words`);
  lines.push(`- **Total Phrases Extracted:** ${phraseLibrary.totalPhrases}`);
  lines.push('');
  
  lines.push('---');
  lines.push('');
  lines.push('**Generated by Voice Analysis MCP v1.4.0**');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format corpus name for display
 */
function formatCorpusName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
