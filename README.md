# Voice Analyser MCP

[![npm version](https://img.shields.io/npm/v/@houtini/voice-analyser)](https://www.npmjs.com/package/@houtini/voice-analyser)
[![Known Vulnerabilities](https://snyk.io/test/github/houtini-ai/voice-analyser-mcp/badge.svg)](https://snyk.io/test/github/houtini-ai/voice-analyser-mcp)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> MCP server that analyses your published writing and generates executable style guides for voice-matched content creation.

## What This Does

I built this because traditional style guides don't work. They tell you "use short sentences" and "vary paragraph length" - rules that sound helpful but produce robotic output when you try to follow them.

This tool extracts statistical patterns from your published writing and generates a style guide that teaches through **zero tolerance rules, phrase libraries, and validation checklists** rather than vague principles.

Version 1.4.0 focuses on executable instructions: forbidden word lists with alternatives, 50+ actual phrases from your corpus, and checkbox validation that catches AI slop before you publish.

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

**Config file locations:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after saving.

**Requirements:** Node.js 20+

## Quick Start

### 1. Create Output Directory

Pick a directory for corpus storage and analysis:

```
C:\writing\voice-models\        (Windows)
~/writing/voice-models/          (Mac/Linux)
```

This holds collected articles, analysis JSON files, and generated style guides.

### 2. Collect Writing Corpus

In Claude Desktop:
```
Collect corpus from https://yoursite.com/post-sitemap.xml 
Save as "my-voice" in "C:\writing\voice-models"
```

Parameters:
- `sitemap_url` - XML sitemap URL
- `output_name` - Corpus identifier (e.g., "my-voice")
- `output_dir` - Directory you created above
- `max_articles` - Optional limit (default: 100)

The tool crawls your sitemap, extracts clean content, and saves markdown files.

### 3. Run Analysis

```
Analyse corpus "my-voice" in directory "C:\writing\voice-models"
```

This runs 15+ analysers covering:
- Vocabulary tiers (AI slop detection, formality scoring)
- Phrase extraction (opening patterns, transitions, caveats)
- Sentence structure and rhythm
- Voice markers and conversational devices
- Punctuation habits

### 4. Generate Style Guide v4

```
Generate style guide for "my-voice" in directory "C:\writing\voice-models"
```

Creates an example-first guide at:
`C:\writing\voice-models\my-voice\writing_style_my-voice.md`

## What v1.4.0 Changed

Previous versions generated statistical analysis that was accurate but not useful for writing. v1.4.0 restructures the output:

**Before:** 60% statistics, 40% guidance  
**After:** 70% examples, 30% statistics

### New Style Guide Structure

**Part 1: Zero Tolerance Rules**
- Forbidden vocabulary (AI slop) with alternatives
- Formal words flagged with casual replacements
- Punctuation rules (em-dash detection)

**Part 2: Phrase Library (50+ Examples)**
- Opening patterns (personal story, direct action, protective warnings)
- Equipment references (possessive vs generic)
- Caveat phrases (honesty markers)
- Transition patterns

**Part 3: Sentence Patterns**
- Rhythm variation targets with corpus examples
- First-person usage frequency
- Natural sentence flow demonstrations

**Part 4: Validation Checklist**
- Critical rules (must pass)
- Voice match rules (should pass)
- Actionable checkbox format

**Part 5: Quick Reference**
- Top phrases by frequency
- Statistics summary

## Using the Style Guide

Load the generated guide into Claude conversations:

```
Load C:\writing\voice-models\my-voice\writing_style_my-voice.md 
and use it to write [content type] about [topic]
```

The guide includes validation checklists. After Claude writes, run:

```
Check what you just wrote against the style guide validation checklist.
Report any violations.
```

### Critical Validation Rules

The guide flags these as must-pass:
- Zero AI slop words (delve, leverage, unlock, seamless, robust)
- Zero em-dashes if corpus doesn't use them
- British/American spelling consistency
- Equipment named specifically (not "the product")

### Voice Match Validation

The guide checks these as should-pass:
- First-person frequency matches target (~0.8 per 100 words typical)
- Sentence length varies wildly (5-word to 40-word sentences)
- Honest caveats present ("It's not perfect", "I wish I'd...")
- Opening follows corpus patterns

## Analysis Output

The tool generates these JSON files in `corpus-name/analysis/`:

**Core Analysis:**
- `vocabulary.json` - Word choice, domain terms, British/American markers
- `sentence.json` - Length distribution, complexity patterns
- `voice.json` - First-person usage, hedging language, conversational markers
- `paragraph.json` - Structure and transition patterns
- `punctuation.json` - Dash types, comma density, parenthetical frequency

**v1.4.0 Additions:**
- `vocabulary-tiers.json` - AI slop detection, formality scoring with alternatives
- `phrase-library.json` - 50+ extracted phrases organized by type

**Advanced Analysis:**
- `function-words.json` - Z-scores for style fingerprinting
- `anti-mechanical.json` - Naturalness scoring
- `argument-flow.json` - How arguments open, build, close
- `paragraph-transitions.json` - Cross-paragraph connection patterns
- `specificity-patterns.json` - Possessive vs generic references

## Minimum Corpus Requirements

- **Minimum:** 15,000 words (~20 articles)
- **Recommended:** 30,000 words (~40 articles)
- **Ideal:** 50,000+ words

Below 15k words, statistical patterns become unreliable. The phrase library needs volume to find frequently-used patterns.

## MCP Tools Reference

### collect_corpus

Crawls sitemap and collects clean writing corpus.

**Parameters:**
- `sitemap_url` (required) - XML sitemap URL
- `output_name` (required) - Corpus identifier
- `output_dir` (required) - Storage directory
- `max_articles` (optional) - Limit, default 100
- `article_pattern` (optional) - Regex URL filter

### analyze_corpus

Runs linguistic analysis on collected corpus.

**Parameters:**
- `corpus_name` (required) - Name from collect_corpus
- `corpus_dir` (required) - Directory containing corpus
- `analysis_type` (optional) - full, quick, vocabulary, syntax (default: full)

### generate_style_guide

Generates v4 executable style guide.

**Parameters:**
- `corpus_name` (required) - Name from analyze_corpus
- `corpus_dir` (required) - Directory containing analysis

## Development

```bash
git clone https://github.com/houtini-ai/mcp-server-voice-analysis.git
cd mcp-server-voice-analysis
npm install
npm run build
```

Local development mode in Claude Desktop config:

```json
{
  "mcpServers": {
    "voice-analysis": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-server-voice-analysis\\dist\\index.js"]
    }
  }
}
```

## Known Limitations

- Needs XML sitemap (RSS feeds not supported)
- Works best with single-author content
- Mixed authorship weakens statistical signals
- Heavily edited content produces less distinct voice patterns
- Transition phrase detection currently returns sparse results (being improved)

## What's Next

v1.5.0 planned features:
- Automated text validation against corpus
- Real-time writing feedback
- Custom forbidden vocabulary per corpus
- Improved transition phrase detection

---

**License:** Apache 2.0  
**Author:** [Houtini](https://houtini.ai)  
**Version:** 1.4.0
