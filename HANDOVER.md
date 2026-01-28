# Voice Analyzer MCP - Development Handover

**Date:** January 28, 2025  
**Status:** MCP SDK migrated, functional, NOT YET PUBLISHED  
**Branch:** `fix/node-24-esm-compatibility`  
**Version:** 1.2.2 (bumped, ready for npm publish)

---

## Current State

### What Works ✅

**MCP Server:**
- Migrated from SDK 1.0.4 → 1.25.3
- Server → McpServer conversion complete
- Zod schema validation implemented
- All three tools working: `collect_corpus`, `analyze_corpus`, `generate_narrative_guide`
- ES modules properly configured
- Build succeeds, runs locally, tested in Claude Desktop

**Test Results:**
- Successfully collected 15 articles from MyMiningRig (21,490 words)
- Full analysis completed without errors
- Narrative guide generated (820 lines)

**Files Modified:**
- `package.json` - SDK updated, Zod added, Node >=18
- `tsconfig.json` - module: "nodenext", DOM added to lib
- `src/index.ts` - McpServer implementation with registerTool
- All imports already had .js extensions (no changes needed)

---

## Critical Issue: Output Format Mismatch

### The Problem

**Generator produces:** 820-line "immersion learning" narrative guide
- Philosophy: "Read examples, absorb voice, then write"
- Structure: Examples first, rules buried, statistics throughout
- Verbose: Micro-rhythm annotations on every example
- Long: Extended multi-paragraph sequences with detailed analysis

**What's actually needed:** Executable style guide like `writing_style.md`
- Philosophy: "Here are the rules, follow them"
- Structure: Rules first, examples as proof, statistics at end
- Concise: Clear do/don't format with specific instructions
- Practical: Quick validation checklists (60s, 5min, 10min)

### Evidence of the Problem

Compare these structures:

**Generated output (narrative guide):**
```markdown
## VOICE IMMERSION: EXTENDED EXAMPLES
*Read these aloud. Let the rhythm settle...*

### Personal Experience - Authority from Testing
**Example 1:**
[Full paragraph from corpus]

**What makes this feel human:**
- Present tense creates "happening now" energy
- Acknowledging pending/uncertain future...
```

**Actual need (writing_style.md):**
```markdown
## CORE VOICE CHARACTERISTICS

### 2. Practitioner Authority

**✅ Right:**
- "I've tested my Simucube 2 Pro extensively..."
- Specific equipment ("my Simucube 2 Pro")
- Personal testing ("I've tested extensively")

**❌ Wrong:**
- "The product was tested extensively..."
- Generic references
```

### Your Diagnosis (from context)

> "We were doing better when outputting something more like the writing_style.md files. The cleverer we got, the worse the output became."

**The "too clever" problem:**
- Micro-rhythm annotations (verbose)
- Statistical analysis woven throughout (distracting)
- Immersion pedagogy (wrong for LLM instruction)
- Length (820 lines vs 498 needed)

**What was better before:**
- Statistics likely minimal or at end
- Examples shorter and prescriptive
- Rules front-loaded
- Executable format

---

## What Needs Fixing

### Priority 1: Restructure Generator Output

**File to modify:** `src/tools/generate-narrative-guide.ts` (1,099 lines)

**Current template structure:**
1. THE VOICE IN ONE PAGE (synthesis)
2. VOICE IMMERSION (extended examples with annotations)
3. HOW ARGUMENTS ARE BUILT (pattern analysis)
4. HOW IDEAS CONNECT (transition analysis)
5. ANTI-PATTERNS (what breaks voice)
6. PUNCTUATION & MECHANICAL TELLS
7. VALIDATION METRICS (at the very end)

**Target structure (match writing_style.md):**
1. EXECUTIVE SUMMARY FOR CLAUDE (critical rules upfront)
2. THE FORBIDDEN LIST (zero tolerance AI clichés)
3. CORE VOICE CHARACTERISTICS (with corpus examples, do/don't format)
4. SENTENCE STRUCTURE & RHYTHM (target statistics table)
5. CONVERSATIONAL MARKERS (extracted from corpus)
6. ANTI-MECHANICAL WRITING PATTERNS (problems + solutions)
7. AUTHENTIC VOICE CHECKLIST (60s/5min/10min validation)
8. EXAMPLES: WHAT AUTHENTICITY LOOKS LIKE (good/bad side-by-side)
9. REFERENCE: CORPUS STATISTICS (z-scores, frequencies)

**Key changes needed:**
- Remove micro-rhythm annotations (or make optional/brief)
- Convert immersive examples → prescriptive do/don't
- Move statistics to reference section at end
- Add quick validation checklists
- Front-load forbidden phrases
- Shorter, actionable format

### Priority 2: Reduce Output Verbosity

**Current line count:** 820 lines (too long)
**Target:** ~500 lines (like writing_style.md)

**What to cut/condense:**
- Multi-paragraph sequences (show 2-3 not 4-8)
- Micro-rhythm annotations (remove or drastically reduce)
- Opening move categorization (show top 2 patterns, not all)
- Conversational device examples (3 examples max, not 5+)
- Transition analysis (top 5 types, not exhaustive list)
- Statistical tables (consolidated reference section)

### Priority 3: Add Missing Sections

**From writing_style.md but NOT in generated output:**
- Pre-publication validation checklist (quick, detailed, deep)
- Quick reference card (printable statistics table)
- British English spelling table
- Domain-specific vocabulary (if multi-domain corpus)
- Side-by-side good/bad examples

---

## Technical Context

### Generator Architecture

**Main function:** `generateNarrativeContent()` in `generate-narrative-guide.ts`
- Takes analysis JSON files as input
- Builds markdown string line-by-line
- Uses helper functions for examples, sequences, patterns

**Key helper functions:**
- `extractExampleParagraphs()` - pulls categorized examples from corpus
- `extractMultiParagraphSequences()` - gets 3-paragraph flows
- `annotateExample()` - adds micro-rhythm annotations (THIS IS THE PROBLEM)
- `annotateSequence()` - annotates full sequences (ALSO PROBLEM)

**Data sources (from analyze_corpus):**
- `vocabulary.json` - word frequencies, British markers
- `sentence.json` - length stats, structure patterns
- `voice.json` - first-person, hedging, conversational markers
- `paragraph.json` - sentences per paragraph
- `punctuation.json` - dash types, comma density
- `function-words.json` - distinctive/avoided words with z-scores
- `argument-flow.json` - opening moves, argument patterns
- `paragraph-transitions.json` - how paragraphs connect

### What to Preserve

**These parts work well:**
1. ✅ Corpus extraction (real examples, not invented)
2. ✅ Conversational device detection ("look", "well", "actually")
3. ✅ Equipment specificity analysis ("my X" vs "the product")
4. ✅ Argument pattern recognition (Protective Warning → Example)
5. ✅ Opening move categorization (observation vs personal story)
6. ✅ Forbidden phrase detection (AI clichés from corpus)
7. ✅ Function word z-score analysis (distinctive usage)

**Just present them differently:**
- Less immersive, more prescriptive
- Shorter examples with clear guidance
- Statistics in reference tables
- Actionable do/don't format

---

## Code Review: What Needs Changing

### Section 1: Remove/Simplify Micro-Rhythm Annotations

**Current code (lines ~18-20):**
```typescript
import { detectMicroRhythms, annotateExample, annotateSequence } from '../utils/micro-rhythm.js';
```

**Issue:** These functions add verbose annotations to every example

**Options:**
1. Remove entirely (cleanest)
2. Make optional via parameter
3. Drastically simplify (1-2 line max per example)

**Recommendation:** Remove. The micro-rhythms are interesting but make output too verbose. The patterns are captured in other sections.

### Section 2: Restructure generateNarrativeContent()

**Current structure (line ~296 onwards):**
```typescript
function generateNarrativeContent(...) {
  const lines: string[] = [];
  
  // Header
  lines.push(`# ${formatWriterName(writerName)} Writing Voice (Narrative Guide)`);
  
  // THE VOICE IN ONE PAGE
  lines.push('## THE VOICE IN ONE PAGE');
  // [~200 lines of synthesis]
  
  // VOICE IMMERSION: EXTENDED EXAMPLES
  lines.push('## VOICE IMMERSION: EXTENDED EXAMPLES');
  // [~300 lines of annotated examples]
  
  // ... more sections
}
```

**Needed structure:**
```typescript
function generateExecutableGuide(...) {
  const lines: string[] = [];
  
  // EXECUTIVE SUMMARY FOR CLAUDE
  lines.push('## EXECUTIVE SUMMARY FOR CLAUDE');
  // [Critical rules upfront]
  
  // THE FORBIDDEN LIST
  lines.push('## THE FORBIDDEN LIST');
  // [Zero tolerance AI clichés from corpus]
  
  // CORE VOICE CHARACTERISTICS
  lines.push('## CORE VOICE CHARACTERISTICS');
  // [With do/don't examples from corpus]
  
  // ... prescriptive sections
  
  // REFERENCE: CORPUS STATISTICS (at end)
  lines.push('## REFERENCE: CORPUS STATISTICS');
  // [All z-scores, frequencies, tables]
}
```

### Section 3: Convert Examples Format

**Current format (verbose):**
```typescript
lines.push('**Example 1:**');
lines.push('');
lines.push(annotateExample(examples.personal[i], 3)); // Adds annotations
```

**Target format (prescriptive):**
```typescript
lines.push('**✅ Right:**');
lines.push('```');
lines.push(examples.personal[i]); // No annotations
lines.push('```');
lines.push('');
lines.push('**Why this works:**');
lines.push('- Specific equipment named');
lines.push('- Personal testing authority');
lines.push('- Engineering rationale included');
```

### Section 4: Add Validation Checklists

**Needed at end (before statistics):**
```typescript
lines.push('## AUTHENTIC VOICE CHECKLIST');
lines.push('');
lines.push('### Pre-Publication Validation');
lines.push('');
lines.push('**Quick Filter (60 seconds):**');
lines.push('- [ ] Contains specific product name (not "the product")');
lines.push('- [ ] Contains first-person statement');
lines.push('- [ ] No AI clichés detected');
lines.push('- [ ] Sounds like person, not marketing');
lines.push('');
lines.push('**Detailed Check (5 minutes):**');
// ... more checkboxes
```

---

## Testing Approach

### Before Changes

**Baseline test:** Run analyzer on a corpus and save output
```bash
voice-analyser:collect_corpus \
  sitemap_url="https://simracingcockpit.gg/sitemap.xml" \
  output_dir="C:/dev/test-baseline" \
  output_name="baseline"

voice-analyser:analyze_corpus \
  corpus_dir="C:/dev/test-baseline" \
  corpus_name="baseline"

voice-analyser:generate_narrative_guide \
  corpus_dir="C:/dev/test-baseline" \
  corpus_name="baseline"
```

Save the generated guide for comparison.

### After Changes

1. **Rebuild:** `npm run build`
2. **Re-test:** Run same commands on same corpus
3. **Compare:**
   - Line count (should be ~500, not 820)
   - Structure (rules first, examples as proof)
   - Readability (Claude can scan and execute)
   - Completeness (all critical sections present)

### Validation Criteria

**Generated guide should:**
- ✅ Start with executive summary and forbidden list
- ✅ Use do/don't format for examples
- ✅ Have quick validation checklists
- ✅ Put statistics in reference section at end
- ✅ Be ~500 lines (not 820)
- ✅ Match writing_style.md structure
- ✅ Preserve actual corpus examples (not invented)

---

## Git Status

**Branch:** `fix/node-24-esm-compatibility`
**Commits:**
- `31490c7` - feat: migrate to MCP SDK 1.25.3 with ES modules
- Version bumped to 1.2.2 (ready to publish)

**NOT merged to main yet**
**NOT published to npm yet**

### Next Steps After Fixing Generator

1. **Test changes** with multiple corpora
2. **Commit to branch:** "refactor: restructure guide output to match writing_style.md format"
3. **Merge to main**
4. **Bump version:** `npm version minor` (1.3.0 - significant change)
5. **Publish:** `npm publish`
6. **Update README** with new output format examples

---

## Reference Files

**Key files to review:**
- `C:\dev\content-machine\templates\writing_style.md` - TARGET format (498 lines)
- `C:\dev\content-machine\templates\myminingrig-test\writing_style_myminingrig-test_narrative.md` - CURRENT output (820 lines)
- `src/tools/generate-narrative-guide.ts` - Generator implementation (1,099 lines)
- `src/utils/micro-rhythm.ts` - Annotation functions (likely culprit)

**Analysis files structure:**
```
corpus_name/
├── articles/           # Extracted markdown files
├── analysis/          # JSON analysis results
│   ├── vocabulary.json
│   ├── sentence.json
│   ├── voice.json
│   ├── paragraph.json
│   ├── punctuation.json
│   ├── function-words.json
│   ├── argument-flow.json
│   └── paragraph-transitions.json
└── writing_style_[name]_narrative.md  # Generated guide
```

---

## Questions to Consider

1. **Keep micro-rhythms at all?** Or remove entirely?
   - If keep: Make very brief (1 line per example max)
   - Likely answer: Remove, they're interesting but verbose

2. **How many examples per section?**
   - Current: 3-8 examples per category
   - Proposed: 2-3 examples max
   - writing_style.md pattern: 1-2 examples with clear guidance

3. **Statistics placement?**
   - Current: Woven throughout (frequencies, z-scores inline)
   - Proposed: Reference section at end (tables)
   - writing_style.md: Tables at end, quick ref card

4. **Should we rename?**
   - `generate_narrative_guide` → `generate_style_guide`?
   - Currently accurate name, but implies wrong format

5. **Backwards compatibility?**
   - Anyone already using this output format?
   - Probably not widely used yet (just published recently)
   - Breaking change acceptable if documented

---

## Development Environment

**Location:** `C:\dev\content-machine\mcp-server-voice-analysis`
**Node version:** 18+ required
**Build:** `npm run build`
**Test locally:** `node dist/index.js`

**Claude Desktop config for testing:**
```json
{
  "mcpServers": {
    "voice-analysis-local": {
      "command": "node",
      "args": ["C:\\dev\\content-machine\\mcp-server-voice-analysis\\dist\\index.js"]
    }
  }
}
```

---

## Summary

**What's done:**
- ✅ MCP SDK migration complete
- ✅ All tools working
- ✅ Build succeeds, tests pass
- ✅ Version bumped to 1.2.2

**What's needed:**
- ❌ Restructure generator output (match writing_style.md)
- ❌ Remove/simplify micro-rhythm annotations
- ❌ Add validation checklists
- ❌ Reduce verbosity (~500 lines target)
- ❌ Test with multiple corpora
- ❌ Publish to npm

**Core insight:**
> "The cleverer we got, the worse the output became"

The generator captures authentic patterns but presents them in the wrong format. Claude needs **prescriptive rules**, not **immersive learning**. The analysis is sound; the presentation is wrong.

**Estimated work:** 4-6 hours to restructure generator + testing

---

**End of Handover**