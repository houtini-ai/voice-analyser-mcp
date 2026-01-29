# Voice Analyser

[![npm version](https://img.shields.io/npm/v/@houtini/voice-analyser)](https://www.npmjs.com/package/@houtini/voice-analyser)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **Experimental library** for extracting statistical voice models from your published writing. Generates immersive style guides that teach LLMs to replicate how you actually write - not through rules, but through examples and rhythm patterns.

## Why This Exists

Traditional style guides list rules: "Use short sentences. Vary paragraph length. Include personal anecdotes."

This doesn't work. Writers don't follow rules - they channel voice.

This tool extracts the statistical fingerprint of *your writing* and presents it as immersive examples with annotations showing *what makes each passage feel human*. The goal is voice replication through pattern recognition, not rule compliance.

**Status:** Experimental. The approach works but is under active development.

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

### 1. Create an Output Directory

First, create a directory where your corpus and analysis will be stored:

```
C:\writing\voice-models\        (Windows)
~/writing/voice-models/          (Mac/Linux)
```

This directory will contain:
- Collected articles (markdown)
- Analysis JSON files
- Generated voice guides

### 2. Collect Your Writing

```
Collect corpus from https://yoursite.com/post-sitemap.xml 
Save as "my-voice" in "C:\writing\voice-models"
```

The tool needs:
- `sitemap_url` - Your XML sitemap URL
- `output_name` - A name for this corpus (e.g., "my-voice", "blog-posts")
- `output_dir` - The directory you created above

**Example with all parameters:**
```
Collect corpus from https://example.com/post-sitemap.xml
Output name: "technical-writing"  
Output directory: "C:\writing\voice-models"
Maximum articles: 50
```

### 3. Analyse Patterns

```
Analyse corpus "my-voice" in directory "C:\writing\voice-models"
```

This runs 14 analysers covering vocabulary, sentence structure, voice markers, argument flow, and paragraph transitions.

### 4. Generate Voice Guide

```
Generate narrative guide for "my-voice" in directory "C:\writing\voice-models"
```

Creates an immersive style guide with annotated examples at:
`C:\writing\voice-models\my-voice\writing_style_my-voice_narrative.md`

## Using the Voice Guide

Once generated, the voice guide can be loaded into any LLM conversation to help it write in your voice.

### Loading the Guide

```
Load the file C:\writing\voice-models\my-voice\writing_style_my-voice_narrative.md 
and use it as a reference for all writing in this conversation.
```

### Example Prompts for Content Generation

**Blog post:**
```
Using the voice guide as your reference, write a blog post about [topic].

Key requirements:
- Match the sentence rhythm patterns shown in the examples
- Use the conversational devices naturally (not forced)
- Include the micro-rhythms: mid-thought pivots, embedded uncertainty, present-tense immediacy
- Vary sentence length as shown in the statistical targets
- Use British/American spelling as indicated in the guide
```

**Technical article:**
```
Reference the voice guide and write a technical explanation of [concept].

Channel the voice by:
- Opening with the pattern shown in "Opening Moves" section
- Using specific product/tool names, not generic references  
- Including admissions of complexity or uncertainty where authentic
- Following the argument flow patterns from the guide
- Matching the punctuation habits (especially dash usage)
```

**Product review:**
```
Using the loaded voice guide, write a review of [product].

Capture the voice by:
- Starting with personal context (why you tested this)
- Blending technical specs with practical implications
- Using the transition patterns between paragraphs
- Including the "human tells" - parenthetical asides, mid-thought corrections
- Ending with the closing patterns shown in examples
```

**Email/communication:**
```
Write an email about [subject] using the voice patterns from the guide.

Focus on:
- Conversational markers appearing naturally
- Sentence length variation (some punchy, some complex)
- The hedging/confidence balance shown in statistics
- First-person usage matching the corpus frequency
```

### Validation After Writing

The guide includes statistical targets. After writing, check:

```
Review what you just wrote against the voice guide metrics:
- Does sentence length variation match the target standard deviation?
- Is first-person frequency within the expected range?
- Are conversational markers present but not overused?
- Does the rhythm feel like the extended examples?
```

## What Gets Analysed

### Core Voice Patterns
- **Vocabulary** - Word choice, British/American markers, domain specificity
- **Sentence structure** - Length distribution, openers, complexity patterns
- **Voice markers** - First-person usage, hedging language, conversational markers
- **Punctuation** - Dash types, comma density, parenthetical frequency

### Argument & Flow Patterns
- **Argument flow** - How you open, build, and close arguments
- **Paragraph transitions** - How ideas connect across paragraphs
- **Conversational devices** - "look", "frankly", "actually" and when they appear

### Micro-Rhythm Detection
The guide annotates examples with invisible patterns that make writing feel human:
- Mid-thought pivots (comma before "and", "but", "so")
- Present-tense immediacy ("Right now, it's...")
- Embedded uncertainty ("I think", "probably")
- Casual sentence starters ("So,", "And,", "But,")
- Parenthetical asides
- Punchy fragments contrasting with longer sentences

## Output Structure

```
your-output-directory/
└── corpus-name/
    ├── articles/                              # Collected markdown files
    ├── corpus.json                            # Metadata
    ├── analysis/                              # JSON analysis files
    │   ├── vocabulary.json
    │   ├── sentence.json
    │   ├── voice.json
    │   ├── paragraph.json
    │   ├── punctuation.json
    │   ├── function-words.json
    │   ├── argument-flow.json
    │   └── paragraph-transitions.json
    └── writing_style_[name]_narrative.md      # The voice guide
```

## Minimum Corpus Size

- **Minimum:** 15,000 words (~20 articles)
- **Recommended:** 30,000 words
- **Ideal:** 50,000+ words

Below 15k words, statistical patterns become unreliable.

## Tools Reference

### collect_corpus

| Parameter | Required | Description |
|-----------|----------|-------------|
| `sitemap_url` | Yes | XML sitemap URL |
| `output_name` | Yes | Corpus identifier (e.g., "my-voice") |
| `output_dir` | Yes | Directory to store corpus |
| `max_articles` | No | Limit (default: 100) |
| `article_pattern` | No | Regex filter for URLs |

### analyze_corpus

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from collect_corpus |
| `corpus_dir` | Yes | Directory containing corpus |
| `analysis_type` | No | full, quick, vocabulary, syntax |

### generate_narrative_guide

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from analyze_corpus |
| `corpus_dir` | Yes | Directory containing corpus |

## Development

```bash
git clone https://github.com/houtini-ai/mcp-server-voice-analysis.git
cd mcp-server-voice-analysis
npm install
npm run build
```

## Limitations

- Requires XML sitemap (RSS feeds not currently supported)
- Works best with consistent single-author content
- Mixed authorship or heavily edited content produces weaker signals
- The approach is experimental - results vary by writing style

---

Apache License 2.0 - [Houtini.ai](https://houtini.ai)
