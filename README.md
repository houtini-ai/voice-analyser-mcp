# Voice Analyser MCP

[![npm version](https://img.shields.io/npm/v/@houtini/voice-analyser)](https://www.npmjs.com/package/@houtini/voice-analyser)
[![Known Vulnerabilities](https://snyk.io/test/github/houtini-ai/voice-analyser-mcp/badge.svg)](https://snyk.io/test/github/houtini-ai/voice-analyser-mcp)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> MCP server that analyses your published writing and generates executable style guides for voice-matched content creation.

<p align="center">
  <a href="https://glama.ai/mcp/servers/@houtini-ai/voice-analyser-mcp">
    <img width="380" height="200" src="https://glama.ai/mcp/servers/@houtini-ai/voice-analyser-mcp/badge" alt="Voice Analyser MCP server" />
  </a>
</p>

## What This Does

Point it at a sitemap, it crawls your articles, runs 16 linguistic analysers, and generates a style guide built from your actual writing patterns. Not generic advice — your phrases, your sentence rhythms, your quirks.

The output is designed for LLM consumption: forbidden word lists, phrase libraries with examples, burstiness targets, and validation checklists that catch AI slop before it ships.

## What Changed in v2.0.0

v1.x loaded 5 of the 16 analysis files and produced a 5-part guide heavy on statistics. v2.0.0 loads all 16 and restructures the output around examples.

**Before (v1.x):** 5-part guide, ~250 lines, stats-heavy, sparse examples
**After (v2.0.0):** 8-part guide, ~500 lines, examples-first with supporting stats

### New Guide Sections

| Part | What It Covers |
|------|---------------|
| 1. Zero Tolerance Rules | Forbidden AI slop vocabulary with alternatives, formal word replacements, punctuation rules |
| 2. Phrase Library | 50+ actual phrases from your corpus: opening patterns, equipment references, caveats, transitions |
| 3. Sentence Patterns | Length distribution, rhythm variation targets, first-person usage frequency |
| 4. Burstiness & Flow | Coefficient of variation, consecutive sentence clusters, rhythm examples from corpus |
| 5. Expression Markers | Hollow intensifiers to avoid, hedging/certainty balance, conversational devices |
| 6. Argument & Identity | How arguments open/build/close, identity markers (genuine interest, honest obsession, expertise) |
| 7. Paragraph Architecture | Opening/closing patterns, transition density, information density scoring |
| 8. Stylometric Fingerprint | Function word z-scores, punctuation signature, statistical fingerprint for voice matching |

Each section uses graceful degradation — if the corpus doesn't produce enough data for a section, it's omitted rather than padded with generic advice.

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

### Claude Code

Add to your `.claude/settings.json`:

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

**Config file locations (Claude Desktop):**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after saving.

**Requirements:** Node.js 18+

## Quick Start

### 1. Collect Writing Corpus

In Claude Desktop or Claude Code:
```
Collect corpus from https://yoursite.com/post-sitemap.xml
Save as "my-voice" in "C:\writing\voice-models"
```

The tool crawls your sitemap, extracts clean content from each article, and saves markdown files. Aim for 40+ articles (30,000+ words) for reliable patterns.

### 2. Run Analysis

```
Analyse corpus "my-voice" in directory "C:\writing\voice-models"
```

Runs 16 analysers covering vocabulary tiers, phrase extraction, sentence structure, voice markers, punctuation habits, argument flow, information density, and more. Takes 1-3 minutes depending on corpus size.

### 3. Generate Style Guide

```
Generate style guide for "my-voice" in directory "C:\writing\voice-models"
```

Creates an example-first guide at:
`C:\writing\voice-models\my-voice\writing_style_my-voice.md`

## Using the Style Guide

Load the generated guide into Claude conversations:

```
Load C:\writing\voice-models\my-voice\writing_style_my-voice.md
and use it to write [content type] about [topic]
```

The guide includes validation checklists. After Claude writes:

```
Check what you just wrote against the style guide validation checklist.
Report any violations.
```

### What It Catches

- AI slop words (delve, leverage, unlock, seamless, robust) with corpus-specific alternatives
- Em-dashes when your corpus uses hyphens (or vice versa)
- British/American spelling inconsistency
- Generic equipment references ("the product") vs possessive ("my rig")
- Sentence rhythm that's too uniform (low burstiness)
- First-person frequency outside your natural range
- Missing honest caveats and conversational devices

## Analysis Output

The tool generates 16 JSON files in `corpus-name/analysis/`:

| File | What It Captures |
|------|-----------------|
| `vocabulary.json` | Word choice, domain terms, British/American markers |
| `vocabulary-tiers.json` | AI slop detection, formality scoring with alternatives |
| `phrase-library.json` | 50+ extracted phrases organised by type |
| `sentence.json` | Length distribution, complexity, burstiness (CV) |
| `voice.json` | First-person usage, hedging, conversational markers |
| `paragraph.json` | Structure, length patterns, transition density |
| `punctuation.json` | Dash types, comma density, parentheticals |
| `function-words.json` | Z-scores for stylometric fingerprinting |
| `anti-mechanical.json` | Naturalness scoring |
| `expression-markers.json` | Hollow intensifiers, hedging/certainty balance |
| `clustering-patterns.json` | Consecutive sentence clusters by length |
| `argument-flow.json` | How arguments open, build, and close |
| `paragraph-transitions.json` | Cross-paragraph connection patterns |
| `information-density.json` | Technical density scoring |
| `specificity-patterns.json` | Possessive vs generic references |
| `vulnerability-patterns.json` | Identity markers (genuine interest, expertise signals) |

## Minimum Corpus Requirements

- **Minimum:** 15,000 words (~20 articles)
- **Recommended:** 30,000 words (~40 articles)
- **Ideal:** 50,000+ words

Below 15k words, statistical patterns become unreliable. The phrase library needs volume to find frequently-used patterns.

## MCP Tools Reference

### collect_corpus

Crawls sitemap and collects clean writing corpus.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `sitemap_url` | Yes | XML sitemap URL |
| `output_name` | Yes | Corpus identifier (e.g., "my-voice") |
| `output_dir` | Yes | Storage directory |
| `max_articles` | No | Article limit (default: 100) |
| `article_pattern` | No | Regex URL filter |

### analyze_corpus

Runs 16 linguistic analysers on collected corpus.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from collect_corpus |
| `corpus_dir` | Yes | Directory containing corpus |
| `analysis_type` | No | full, quick, vocabulary, syntax (default: full) |

### generate_style_guide

Generates v2.0 executable style guide from analysis data.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from analyze_corpus |
| `corpus_dir` | Yes | Directory containing analysis |

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
- Guide sections are omitted when the corpus doesn't produce enough data for reliable patterns (this is intentional, not a bug)

---

**License:** Apache 2.0
**Author:** [Houtini](https://houtini.ai)
**Version:** 2.0.0
