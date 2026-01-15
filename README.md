# Voice Analyser

[![npm version](https://img.shields.io/npm/v/@houtini/voice-analyser)](https://www.npmjs.com/package/@houtini/voice-analyser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Extract statistical voice models from your published writing. Generate immersive style guides that teach LLMs to replicate how you actually write - not through rules, but through examples and rhythm patterns.

## What's New in v1.2.0

**Micro-Rhythm Analysis** - The guide now annotates examples with the invisible patterns that make writing feel human:
- Mid-thought pivots (comma before "and", "but", "so")
- Present-tense immediacy
- Embedded uncertainty
- Parenthetical asides
- Punchy fragments contrasting with longer sentences

These patterns are what distinguish "competent technical writing" from "a specific person thinking on the page."

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voice-analysis": {
      "command": "npx",
      "args": ["-y", "@houtini/voice-analyser@latest"]
    }
  }
}
```

**Config locations:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after saving.

### Requirements

- Node.js 20+

## Quick Start

### 1. Collect Your Writing

```
Collect corpus from https://yoursite.com/post-sitemap.xml as "your-name"
```

Works with XML sitemaps. Collects up to 100 articles by default.

### 2. Analyse Patterns

```
Analyse corpus "your-name"
```

Generates statistical analysis across 14 analysers covering vocabulary, sentence structure, voice markers, argument flow, and paragraph transitions.

### 3. Generate Voice Guide

```
Generate narrative guide for "your-name"
```

Creates an immersive style guide with annotated examples showing *what* makes each passage feel human.

## Philosophy: Immersion Over Rules

Traditional style guides list rules: "Use short sentences. Vary paragraph length. Include personal anecdotes."

This doesn't work. Writers don't follow rules - they channel voice.

**The Narrative Guide approach:**
1. Show extended examples from your actual writing
2. Annotate the micro-rhythms that create the "feel"
3. Let patterns emerge through reading, not memorising
4. Use statistics only for validation after writing

## What Gets Analysed

### Core Voice Patterns
- **Vocabulary** - Word choice, British/American markers, domain specificity
- **Sentence structure** - Length distribution, openers, complexity patterns
- **Voice markers** - First-person usage, hedging language, conversational markers
- **Punctuation** - Dash types (critical AI tell), comma density, parenthetical frequency

### Argument & Flow Patterns
- **Argument flow** - How you open, build, and close arguments
- **Paragraph transitions** - How ideas connect across paragraphs
- **Energy shifts** - How tone changes through a piece
- **Conversational devices** - "look", "frankly", "actually" and when they appear

### Micro-Rhythm Detection (New in v1.2.0)
- Mid-thought pivots (", and", ", but")
- Present-tense immediacy ("Right now, it's...")
- Embedded uncertainty ("I think", "probably")
- Casual sentence starters ("So,", "And,", "But,")
- Parenthetical asides
- Self-corrections ("or rather", "I mean")
- Future uncertainty / open loops
- Punchy fragments contrasting with longer sentences

## Output Example

The narrative guide annotates examples like this:

```markdown
**Example:**

```
For my first post, I'm going to document the build of my 4 x water-cooled 
RTX 3090 rig. Right now, it's hashing away and, I've added an RTX 2080 ti 
into the mix until a few more cards arrive.
```

**What makes this feel human:**

- Present tense creates "happening now" energy
  *"...RTX 3090 rig. Right now, it's hashing away..."*

- Acknowledging pending/uncertain future - real people have open loops
  *"...into the mix until a few more cards arrive..."*
```

Multi-paragraph sequences get comprehensive analysis:

```markdown
**Structure:** 3 paragraphs, 9 sentences, 176 words

**Human tells in this passage:**
- **Mid-thought pivots** (2x) - the writer pauses mid-sentence then redirects
- **Embedded uncertainty** - doubt woven into sentences shows real-time thinking

**Specific moments to notice:**
- "...build time, I think the 2nd one would..." - uncertainty mid-sentence
- "...instructions are OK but not perfect, so you're left..." - comma before "so"
```

## Tools Reference

### collect_corpus

Crawl a sitemap and extract article content.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `sitemap_url` | Yes | XML sitemap URL |
| `output_name` | Yes | Corpus identifier |
| `output_dir` | Yes | Where to store corpus |
| `max_articles` | No | Limit (default: 100) |
| `article_pattern` | No | Regex filter for URLs |

### analyze_corpus

Run all analysers on collected corpus.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from collect_corpus |
| `corpus_dir` | Yes | Directory containing corpus |
| `analysis_type` | No | full, quick, vocabulary, syntax |

### generate_narrative_guide

Generate immersive voice guide with micro-rhythm annotations.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from analyze_corpus |
| `corpus_dir` | Yes | Directory containing corpus |

## Minimum Corpus Size

- **Minimum:** 15,000 words (~20 articles)
- **Recommended:** 30,000 words
- **Ideal:** 50,000+ words

Below 15k words, statistical patterns become unreliable.

## Output Structure

```
corpus/
└── your-name/
    ├── articles/                           # Collected markdown
    ├── corpus.json                         # Metadata
    ├── analysis/                           # JSON analysis files
    │   ├── vocabulary.json
    │   ├── sentence.json
    │   ├── voice.json
    │   ├── paragraph.json
    │   ├── punctuation.json
    │   ├── function-words.json
    │   ├── argument-flow.json
    │   └── paragraph-transitions.json
    └── writing_style_your-name_narrative.md  # The voice guide
```

## Development

```bash
git clone https://github.com/houtini-ai/mcp-server-voice-analysis.git
cd mcp-server-voice-analysis
npm install
npm run build
```

## Research Foundation

The function word stylometry approach draws from computational authorship analysis. Z-score comparisons against reference English corpora create statistical fingerprints.

Key insight: function words (the, of, and, to) are used unconsciously and form stable individual patterns. Content words vary by topic; function words reveal the author.

The micro-rhythm analysis extends this to punctuation-level patterns - the pauses, pivots, and asides that create the "feel" of human writing.

---

MIT License - [Houtini.ai](https://houtini.ai)
