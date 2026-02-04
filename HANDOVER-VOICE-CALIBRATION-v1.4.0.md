# Voice Analyser MCP - Enhancement Handover Document
**Date:** 2026-02-04  
**Current Version:** 1.3.1 (XML parser upgrade complete, ready for npm publish)  
**Target Version:** 1.4.0 (Voice calibration enhancement)  
**Project:** C:\dev\content-machine\mcp-server-voice-analysis

---

## CURRENT STATUS

### ✅ COMPLETED (Ready for Production)
- **XML Parser Upgrade**: fast-xml-parser 4.5.0 → 5.3.4
- **TypeScript Build**: Fixed @types/node installation issue (manual tarball workaround)
- **Full Testing**: Tested with myminingrig.com corpus (5 articles, 8,586 words)
- **All Functions Working**: 
  - Sitemap parsing ✅
  - Content extraction ✅
  - Corpus generation ✅
  - Full linguistic analysis ✅
  - Micro-rhythm detection ✅
  - Style guide generation ✅

### 🔴 CRITICAL ISSUE IDENTIFIED

**The style guide output is not effective for actual writing.**

**Problem Statement:**
When testing the generated style guide (myminingrig corpus), the output was used to write an article about RTX 3090 mining. The result did NOT sound like the original author because:

1. **Too much statistics, not enough actionable guidance**
2. **Missing vocabulary tier analysis** (formal vs casual words)
3. **No detection of forbidden vocabulary** (words that appear in general English but NOT in this writer's voice)
4. **Insufficient phrase examples** (needs 50+ actual phrases, not just 5-10)
5. **Focus on WHAT the statistics show rather than HOW to write**

**Evidence:**
Written output contained phrases like:
- "actually achieve" ← formal academic construction
- "The Reality Check Nobody Asked For" ← clickbait headline (not in corpus style)
- "critical design flaw" ← corporate jargon
- Too many em-dashes and formal vocabulary

Original corpus uses:
- Concrete verbs: "own", "discovered", "fell down the slippery slope"
- Equipment with possessives: "my PC", "my 3090 FE"
- Direct language: "How does anyone get into mining Bitcoin?"
- Honest caveats: "It isn't perfect to look at"

---

## THE ENHANCEMENT: VOICE CALIBRATION v1.4.0

### Goal
Transform the style guide from **statistical analysis** to **executable writing instructions** that actually produce text matching the original voice.

### User Feedback Pattern
Richard uses this validation workflow in content-machine:

```markdown
## Step 4.5: Voice-Calibrate Corrections & Remove AI Slop

**CRITICAL: Load Richard's writing style template before validation**

#### Step 4.5A: Em-Dash Detection (Zero Tolerance)
❌ VALIDATION FAILS if ANY em dashes found (—)

#### Step 4.5B: AI Slop Detection (Zero Tolerance)
Forbidden: delve, leverage, unlock, seamless, robust, cutting-edge, 
game-changer, revolutionize, groundbreaking

#### Step 4.5C: British English Enforcement
Check for American spellings: color→colour, optimize→optimise

#### Step 4.5D: Voice Pattern Verification
Required elements:
- ✅ First-person transparency ("I've tested...", "my 4070 Ti")
- ✅ Equipment specificity (model names, not "the product")
- ✅ Honest caveats ("It's not perfect")
- ✅ Sentence variation (1-50+ words)
```

**The style guide should generate output that enables this validation workflow.**

---

## IMPLEMENTATION PLAN

### Phase 1: New Analyzer - Vocabulary Tiers
**File:** `src/analyzers/vocabulary-tiers.ts` ✅ CREATED (draft exists)

**Purpose:** Detect formal/casual vocabulary mismatches

**Features:**
1. **Formal Verb Detection**
   - Tracks: achieve, acquire, demonstrate, facilitate, implement, utilize, obtain, etc.
   - Provides casual alternatives: achieve→get/reach, acquire→buy/pick up
   
2. **AI Slop Detection** (Zero Tolerance)
   - Forbidden words: delve, leverage, unlock, seamless, robust, cutting-edge, game-changer
   - Flags ANY occurrence as critical error
   
3. **Formality Scoring**
   - Calculate: formal words per 1000 words
   - Benchmarks:
     - 0-5: Casual voice (good)
     - 5-10: Acceptable
     - 10-20: Moderate formality (needs work)
     - 20+: High formality (rewrite required)

**Output:** `vocabulary-tiers.json` in analysis directory

**Implementation Status:** ✅ Draft created, needs integration

---

### Phase 2: Enhanced Phrase Library
**File:** `src/analyzers/phrase-extraction.ts` (NEW)

**Purpose:** Extract frequently-used phrases for direct imitation

**Current State:** Style guide shows ~10 example phrases  
**Target State:** Style guide shows 50+ actual phrases organized by type

**Categories to Extract:**

1. **Opening Patterns** (first 2 sentences of paragraphs)
   - Current: Shows 5-10 examples
   - Target: Show 30+ examples categorized by:
     - Personal story openers ("I've been running...", "For me, this started...")
     - Direct action ("Right, let's start...", "So, here's our...")
     - Protective warnings ("Before getting started...")

2. **Transition Phrases** (between paragraphs)
   - Extract phrases like: "At this stage...", "Once you're happy...", "The key with these things..."
   
3. **Equipment References** (with possessives)
   - Extract: "my PC", "my 3090 FE", "my gaming rig"
   - Flag generic references: "the product", "the device", "this equipment"

4. **Caveat Phrases** (honesty markers)
   - Extract: "It's not perfect", "It isn't ideal", "I wish I'd...", "probably worth trying"

**Algorithm:**
```typescript
// Extract 2-6 word n-grams that appear 2+ times
// Filter for:
// - First-person markers (I, my, I've, I'm)
// - Equipment words (card, GPU, rig, block, pad)
// - Transitional phrases (at this, once you, if you)
// - Caveat markers (not perfect, not ideal, could be better)
```

**Output:** Enhanced `voice.json` with phrase libraries

---

### Phase 3: Style Guide Restructuring
**File:** `src/tools/generate-narrative-guide-v4.ts` (NEW VERSION)

**Current Structure Problems:**
- 60% statistics, 40% guidance
- Examples buried in explanations
- Hard to scan for "what should I do?"

**New Structure (Example-First):**

```markdown
# [Corpus Name] Writing Style Guide
*Executable instructions for voice-matched writing*

---

## PART 1: ZERO TOLERANCE RULES (2 pages)

### ❌ Forbidden Vocabulary (AI Slop)
These words NEVER appear in this corpus:
- delve (0 occurrences) → Use: explore, look at
- leverage (0 occurrences) → Use: use, apply
- achieve (0 occurrences) → Use: get, reach, hit
[Full list with alternatives]

### ❌ Forbidden Patterns
- Em dashes (—) → Use regular hyphens with spaces ( - )
- Generic references ("the product") → Use specific names ("my 3090 FE")
- Perfect narratives → Include honest caveats

---

## PART 2: PHRASE LIBRARY (4-6 pages)

### Opening Patterns (30+ examples)
**Personal Story:**
- "I've been running RTX 3090s in my water-cooled rig..."
- "For me, this started because I own a gaming rig"
- "How does anyone get into mining Bitcoin?"
[30 more examples]

**Direct Action:**
- "Right, let's start with..."
- "So, here's our 3090 FE"
- "Firstly, start by levering off..."
[20 more examples]

### Transition Phrases (20+ examples)
- "At this stage, you're ready to..."
- "Once you're happy with everything..."
- "The key with these things is..."
[20 more examples]

### Equipment References (20+ examples)
✅ Good: "my PC", "my 3090 FE", "my gaming rig"
❌ Wrong: "the hardware", "the device", "the system"
[20 more examples]

### Caveat Phrases (15+ examples)
- "It isn't perfect to look at"
- "I wish I'd bought..."
- "probably worth trying"
[15 more examples]

---

## PART 3: SENTENCE PATTERNS (2 pages)

### Rhythm Variation
**Target:** Mix of short (5-8 words), medium (15-25), long (30-40), very long (40+)

**Examples from corpus:**
- Short: "Look, it matters." (3 words)
- Medium: "I'm very much into sim racing and own a gaming PC with an NVIDIA 3090 RTX FE." (17 words)
- Long: "Having discovered Nicehash, I quickly fell down the slippery slope of always checking VRAM temps, Afterburner OC settings, watching my PC's power consumption – at least until I'd found quite an interest in the subject." (38 words)

### First-Person Usage
**Frequency:** 0.77 per 100 words (distributed, not clustered)

**Patterns:**
- "I own..." (equipment statements)
- "I've been..." (experience statements)
- "my [equipment]" (possession with specificity)

---

## PART 4: VALIDATION CHECKLIST (1 page)

After writing, verify:

### Critical (Must Pass):
- [ ] Zero AI slop words (grep for: delve|leverage|unlock|seamless)
- [ ] Zero em-dashes (search for —)
- [ ] British spelling (colour, optimise, whilst)
- [ ] Equipment named specifically (not generic "the product")

### Voice Match (Should Pass):
- [ ] First-person present (1 per 100-150 words)
- [ ] Sentence length varies wildly (5-word to 40-word sentences)
- [ ] At least one honest caveat ("It's not perfect...")
- [ ] Conversational marker present ("look", "well", "actually")

### Style (Nice to Have):
- [ ] Opening matches corpus patterns
- [ ] Transitions use corpus phrases
- [ ] Paragraph lengths vary (1-4 sentences)

---

## PART 5: QUICK REFERENCE (1 page)

**Top 10 Most-Used Phrases:**
1. "my PC" (appears 12 times)
2. "I've been" (appears 8 times)
[...more]

**Top 10 Verbs:**
1. "use" (not "utilize")
2. "get" (not "obtain" or "achieve")
[...more]

**Formality Score:** 3.2 formal words per 1000 (very casual)

---

TOTAL: 10-15 pages of executable guidance
vs CURRENT: 5-7 pages of statistical analysis
```

---

### Phase 4: Integration & Testing

**4.1 Update analyze-corpus.ts**
```typescript
// Add vocabulary-tiers to analysis pipeline
import { analyzeVocabularyTiers } from '../analyzers/vocabulary-tiers.js';

// In analyzeCorpus():
const vocabTiers = analyzeVocabularyTiers(fullText);
await writeJSON(analysisDir, 'vocabulary-tiers.json', vocabTiers);
```

**4.2 Update generate-narrative-guide-v3.ts**
- Load vocabulary-tiers.json
- Restructure output to example-first format
- Reduce statistical tables
- Expand phrase libraries to 50+ examples

**4.3 Testing Plan**
```bash
# 1. Run enhanced analysis on myminingrig corpus
voice-analysis:analyze_corpus(
  corpus_dir="C:/dev/content-machine/templates",
  corpus_name="myminingrig-test",
  analysis_type="full"
)

# 2. Generate v4 style guide
voice-analysis:generate_style_guide(
  corpus_dir="C:/dev/content-machine/templates",
  corpus_name="myminingrig-test"
)

# 3. Verify new files exist:
# - vocabulary-tiers.json
# - writing_style_v4_myminingrig-test.md (new format)

# 4. Write test article using v4 guide
# Use Gemini to fetch research on a topic
# Write article following v4 guide
# Run validation checklist
# Compare output to original corpus
```

---

## FILE CHANGES REQUIRED

### New Files to Create:
1. ✅ `src/analyzers/vocabulary-tiers.ts` (draft exists)
2. ⏳ `src/analyzers/phrase-extraction.ts`
3. ⏳ `src/tools/generate-narrative-guide-v4.ts`

### Files to Modify:
1. ⏳ `src/tools/analyze-corpus.ts` - Add vocabulary-tiers integration
2. ⏳ `src/index.ts` - Update tool descriptions if needed
3. ⏳ `package.json` - Bump version to 1.4.0

### Files to Keep (No Changes):
- All existing analyzers (sentence, voice, vocabulary, etc.)
- generate-narrative-guide-v3.ts (keep as fallback)
- Test files
- Core infrastructure

---

## ESTIMATED EFFORT

### Phase 1: Vocabulary Tiers Integration
- **Time:** 2-3 hours
- **Complexity:** LOW (draft already exists)
- **Tasks:**
  - Integrate vocabulary-tiers.ts into analyze-corpus
  - Add output to analysis pipeline
  - Test with myminingrig corpus
  - Verify JSON output format

### Phase 2: Phrase Extraction
- **Time:** 4-6 hours
- **Complexity:** MEDIUM
- **Tasks:**
  - Build n-gram extraction algorithm
  - Categorize phrases by type (opening, transition, caveat)
  - Filter for quality (frequency, first-person, equipment refs)
  - Test extraction accuracy
  - Add to voice.json output

### Phase 3: Style Guide v4
- **Time:** 6-8 hours
- **Complexity:** HIGH
- **Tasks:**
  - Design new structure (example-first)
  - Rewrite generation logic for v4 format
  - Expand phrase library sections
  - Reduce statistical content
  - Add validation checklist generation
  - Test readability and usability

### Phase 4: Integration & Testing
- **Time:** 2-3 hours
- **Complexity:** LOW
- **Tasks:**
  - End-to-end testing
  - Write test article to validate effectiveness
  - Compare output quality vs current guide
  - Documentation updates

**Total Estimated Time:** 14-20 hours of focused development

---

## SUCCESS CRITERIA

### Technical Success:
- [ ] vocabulary-tiers.json generated correctly
- [ ] phrase-extraction.json contains 50+ phrases
- [ ] Style guide v4 format renders correctly
- [ ] All existing functions still work
- [ ] Tests pass

### Functional Success:
- [ ] Style guide contains <30% statistics, >70% examples
- [ ] AI slop detection catches all forbidden words
- [ ] Phrase library has 50+ actual corpus examples
- [ ] Validation checklist is actionable (checkbox format)

### User Success (The Real Test):
- [ ] Write article using v4 guide with Gemini research
- [ ] Article passes voice calibration validation (Step 4.5)
- [ ] Article sounds like original author
- [ ] No forbidden vocabulary present
- [ ] No em-dashes present
- [ ] Equipment specificity maintained

**Primary Success Metric:** Can Claude write an article using the v4 style guide that sounds authentically like the original author?

---

## DEPENDENCIES & BLOCKERS

### None Currently Identified
- All required npm packages already installed
- TypeScript build system working
- Test infrastructure in place
- No external API dependencies for this enhancement

---

## ROLLOUT PLAN

### Version 1.3.1 (PUBLISH FIRST)
**Current state - XML parser upgrade**
- fast-xml-parser 5.3.4
- @types/node manual installation fix
- All tests passing
- Ready for npm publish NOW

**Action:** Publish to npm immediately, don't wait for v1.4.0

### Version 1.4.0 (Voice Calibration)
**Enhanced style guide output**
- Vocabulary tier analysis
- Expanded phrase libraries
- Example-first format
- Validation checklists

**Timeline:** 2-3 weeks of focused development

### Version 1.4.1+ (Future Enhancements)
Potential follow-ups based on v1.4.0 usage:
- Custom vocabulary blacklists per corpus
- Phrase similarity matching
- Style deviation detection
- Real-time writing feedback

---

## NOTES FOR NEXT DEVELOPER

### Quick Start:
1. Current code is in: `C:\dev\content-machine\mcp-server-voice-analysis`
2. Test corpus exists: `C:\dev\content-machine\templates\myminingrig-test`
3. Draft vocabulary-tiers.ts already created (needs integration)
4. Build with: `npm run build`
5. Test with existing corpus: Use voice-analysis MCP tools in Claude Desktop

### Key Insights:
1. **The problem isn't the analysis** - the statistical analysis is accurate
2. **The problem is the presentation** - too much data, not enough "how to write"
3. **Users need examples, not statistics** - Show 50 phrases, not percentages
4. **Zero tolerance lists are critical** - AI slop detection prevents bad output
5. **Validation checklists work** - Richard's Step 4.5 pattern should be built into guide

### Testing Approach:
1. Don't test if JSON files generate correctly
2. Test if **you can write using the guide** and produce authentic output
3. The guide works if someone following it produces voice-matched text
4. Statistics are helpers, examples are the teachers

### Philosophy:
Voice analysis is about **teaching by example**, not **explaining by statistics**.

The goal isn't to tell Claude "this corpus uses 0.77 first-person per 100 words" - 
it's to show Claude 50 examples of actual first-person usage so it can imitate naturally.

---

## QUESTIONS TO RESOLVE

1. **Should we deprecate v3 guide?**
   - Option A: Keep both, let users choose
   - Option B: Replace v3 with v4 completely
   - Recommendation: Keep v3 as `generate_style_guide_v3`, add v4 as `generate_style_guide`

2. **How many phrases is enough?**
   - Current: 10-15 examples
   - Proposed: 50+ examples
   - Question: Is 50 enough? Too many? Diminishing returns?
   - Recommendation: Start with 50, adjust based on feedback

3. **Should validation be automated?**
   - Could build `validate_text_against_corpus()` function
   - Returns pass/fail with specific violations
   - Recommendation: Save for v1.5.0, v1.4.0 focuses on guide quality

---

## CONTACT & HANDOVER

**Original Developer:** Claude (Anthropic)  
**Handover Date:** 2026-02-04  
**Project Owner:** Richard Baxter (Houtini)

**Key Files:**
- This handover: `C:\dev\content-machine\mcp-server-voice-analysis\HANDOVER-VOICE-CALIBRATION-v1.4.0.md`
- Vocabulary tiers draft: `C:\dev\content-machine\mcp-server-voice-analysis\src\analyzers\vocabulary-tiers.ts`
- Test corpus: `C:\dev\content-machine\templates\myminingrig-test\`

**For Questions:**
- Review conversation history from 2026-02-04
- Check test article attempt (contained formal vocabulary issues)
- Review Richard's content-machine validation workflow (Step 4.5 pattern)

---

**END OF HANDOVER DOCUMENT**
