# Voice Analyser: Generate a Skill.md for your Writing Style to Make Claude Talk like You - MCP analyses your sitemap, fetches and analyses a Corpus and generates a skill.md file 

[![npm version](https://img.shields.io/npm/v/@houtini/voice-analyser)](https://www.npmjs.com/package/@houtini/voice-analyser)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> MCP server that analyses your published writing and generates a Claude Skill so Claude writes prose in your voice by mimicking real samples instead of working through a rules checklist.

> **Quick Navigation**
>
> [Why this exists](#why-this-exists) | [Why rules don't work](#why-rule-based-style-guides-dont-work) | [How a Claude Skill changes things](#how-a-claude-skill-changes-things) | [Installation](#installation) | [Quick start](#quick-start) | [Using the skill](#using-the-voice-skill) | [What's in the bundle](#whats-in-the-bundle) | [Analysers](#the-six-analysers) | [Tools reference](#mcp-tools-reference) | [Known limitations](#known-limitations)

## Why this exists

For me, this started because I write a lot. Articles, blog posts, page copy – each has its own rhythm, and when I started leaning on Claude to draft new posts I quickly fell down the slippery slope of trying to make the output sound like me.

The first thing I tried was a long style guide. I'd run linguistic analysis across forty-odd articles and ended up with a 500-line markdown document full of "ZERO TOLERANCE" rules, forbidden words, formality scores per 1000, and a validation checklist. I thought this was a good idea. It wasn't. The output got stilted – I'm pretty sure the model was working harder to comply with the rules than to write naturally. Cognitive load, basically.

I'll be completely transparent about why I built this, and where I could have saved time. There are many things I'd do differently if I was starting from scratch. What you're looking at is what I settled on after trying to brute-force my own voice into Claude with rule lists, and watching it get worse the more rules I added.

## Why rule-based style guides don't work

Tone of voice is hard to describe. Try it sometime – take a paragraph of your own writing and explain to someone *why* it sounds like you. You end up with vague things ("conversational, but not too casual") and specific things ("I never use em-dashes; I always start with a personal anchor"). The vague things are useless to a model. The specific things are easy enough to write down – but that's where it goes wrong.

If you tell Claude "avoid em-dashes" and "use first-person 4× per 100 words" and "score formality below 5" and "always include an honest caveat", it'll obey. The output is technically correct. It just reads like someone hitting marks on a checklist instead of actually writing. Every sentence becomes a small compliance task.

In my experience, the more rules I added, the worse it got. I'd write longer style guides thinking I was capturing more of the voice. I was capturing more of the *constraints*. Those aren't the same thing.

## How a Claude Skill changes things

A while back I came across a Claude skill called "caveman" that compresses Claude's output by ~75% by talking like, well, a caveman. Drop articles, drop filler, fragments OK. The whole thing was a short SKILL.md – maybe 40 lines.

It worked. And it worked without "ZERO TOLERANCE" framing or formality scoring. The skill didn't try to define caveman speak with rules. It showed examples. "Not: 'Sure! I'd be happy to help...'. Yes: 'Bug in auth. Token expiry use < not <=. Fix:'" – just the transformation, made concrete.

That's the insight. Voice mimicry isn't a rules problem. It's an exemplar problem. Show Claude three pieces of writing and say "match this", and you get closer to natural voice in fewer tokens than you would with a 500-line guide.

A Claude Skill is the right shape because it's loaded on demand (only when a trigger fires – e.g. "write like Richard"), it can carry supporting files alongside the instructions, and the SKILL.md itself stays short. Mine runs to about 80 lines. The samples folder does the heavy lifting.

## What this MCP does

Three tools. They run in sequence.

**`collect_corpus`** – give it your sitemap URL. It crawls your articles, strips the boilerplate, and saves a clean markdown copy of each post.

**`analyze_corpus`** – runs six focused analysers across the corpus. Vocabulary tiers, phrase extraction, voice markers, punctuation habits, vulnerability patterns, and specificity patterns. Every analyser feeds the skill generator – nothing's there for show.

**`generate_voice_skill`** – packages the lot as a Claude Skill folder. Short SKILL.md, real article samples, ready to drop into your skills directory.

The skill itself is built on the principle that examples beat rules. Claude opens three random samples before drafting and matches the cadence. There's a small `## Rules` block, but it only contains things the corpus actually justifies – em-dash policy if you don't use them, hollow intensifiers if you don't either, AI slop words you've never written, equipment naming conventions where the corpus shows the pattern. Nothing speculative.

## Installation

### Claude Desktop

Add to `claude_desktop_config.json`:

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

### Claude Code (CLI)

Claude Code uses a different registration mechanism – it doesn't read `claude_desktop_config.json` or `.claude/settings.json` for MCP servers. Use `claude mcp add`:

```bash
claude mcp add -s user voice-analysis -- npx -y @houtini/voice-analyser@latest
```

Verify with `claude mcp get voice-analysis`. Status should show `Connected`.

**Config file locations (Claude Desktop):**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after saving.

**Requirements:** Node.js 18+

## Quick Start

### 1. Collect Writing Corpus

```
Collect corpus from https://yoursite.com/post-sitemap.xml
Save as "my-voice" in "C:\writing\voice-models"
```

The tool crawls your sitemap, extracts clean content from each article, and saves markdown files. Aim for 40+ articles (30,000+ words) for reliable phrase frequencies. Below that, you'll still get a working skill, but most signature phrases will only appear once or twice and the recurring-phrase section loses its punch.

### 2. Run Analysis

```
Analyse corpus "my-voice" in directory "C:\writing\voice-models"
```

Runs six analysers covering phrase patterns, voice markers, punctuation, vocabulary tiers, vulnerability/uncertainty patterns, and possessive vs generic specificity. Usually finishes in well under a minute.

### 3. Generate Voice Skill

```
Generate voice skill for "my-voice" in directory "C:\writing\voice-models"
```

Produces `C:\writing\voice-models\my-voice\skill\` with `SKILL.md` and `samples/`.

## Using the Voice Skill

The skill bundle is a portable folder. Three ways to load it.

**Claude Code, per-project:** copy or symlink the `skill/` folder into `.claude/skills/voice-my-voice/` at the root of your project. The skill auto-loads when you invoke prose tasks in that project.

**Claude Code, user-global:** copy to `~/.claude/skills/voice-my-voice/` (or `%USERPROFILE%\.claude\skills\voice-my-voice\` on Windows). Available in every session.

**Inline, any client:** point Claude at `SKILL.md` directly:

```
Read C:\writing\voice-models\my-voice\skill\SKILL.md and follow it.
Then write [content type] about [topic].
```

Claude opens three random samples and matches the cadence. If the draft starts to feel generic, ask it to read another sample.

## What's in the Bundle

`generate_voice_skill` writes a folder at `<corpus_dir>/<corpus_name>/skill/`:

```
skill/
  SKILL.md
  samples/
    001-<slug>.md
    002-<slug>.md
    ... (25 by default, sampled across the article-length spectrum)
```

`SKILL.md` itself is short. Sections are emitted only when the corpus produces real data for them:

| Section | What it contains |
|---------|------------------|
| YAML frontmatter | Skill `name` and a `description` packed with trigger phrases ("write like X", "in X's voice", "in our voice") so Claude auto-loads the skill on relevant prose tasks |
| Hero paragraph | Read three random samples, match the cadence, don't paraphrase |
| `## Persistence` | Stay active across the conversation. Drop the voice for code blocks, error messages, JSON, tables |
| `## Rules` | Bare imperatives – only the ones the corpus justifies. Em-dash policy, hollow intensifiers ("honestly", "really"), AI slop with replacement hints, equipment naming conventions |
| `## How sentences start` | Up to 12 real opening shapes pulled from your corpus |
| `## Phrases that recur` | Top signature hedges, collegial patterns, identity markers, uncertainty markers – with frequency counts |
| `## How to hedge` | Real caveat sentences from the corpus, filtered to genuine hedges |
| `## When stuck` | "Read another sample" |

A small slice of generated output, from a six-article test:

```markdown
## Rules

- No em-dashes (—). En-dashes (–) are fine and used liberally for asides.
- No "honestly", "really".
- No AI slop: "optimize" (use "improve").
- Name kit by make with a first-person possessive: "my LAN", "our Zotac",
  "my SupraHex". Not "the GPU", "the PCB".

## Phrases that recur

- "Of course" (6×)
- "I think" (6×)
- "Could be" (2×)
- "I'm pretty sure"
- "Fell down the slippery slope"
```

## The Six Analysers

Each one feeds at least one part of the SKILL.md. Output goes to `<corpus_dir>/<corpus_name>/analysis/`:

| File | What it captures | Where it shows up in SKILL.md |
|------|-----------------|-------------------------------|
| `phrase-library.json` | Opening patterns, transitions, caveat phrases, equipment phrases, AI clichés | `## How sentences start`, `## How to hedge`, `## Rules` (AI clichés) |
| `voice.json` | First-person markers, hollow intensifiers, signature hedging, marketing speak, identity markers | `## Rules` (intensifiers, marketing), `## Phrases that recur` |
| `punctuation.json` | Dash types (em vs en), comma density, parentheticals | `## Rules` (em-dash policy) |
| `vocabulary-tiers.json` | Formality scoring, AI slop detection with replacement alternatives | `## Rules` (no AI slop) |
| `vulnerability-patterns.json` | Uncertainty markers, mistake admissions, limitation statements | `## Phrases that recur` (multi-word patterns only) |
| `specificity-patterns.json` | Possessive vs generic references, dominant nouns | `## Rules` (equipment naming) |

If a section in `SKILL.md` is missing, it's because the analyser didn't find enough data to fill it. That's intentional – better no rule than a rule built on a single occurrence.

## Minimum Corpus Requirements

- **Minimum:** 15,000 words (~20 articles)
- **Recommended:** 30,000 words (~40 articles)
- **Ideal:** 50,000+ words

Below 15k words phrase frequencies become unreliable. The skill still generates – it just won't have the same density of signature phrases.

## MCP Tools Reference

### collect_corpus

Crawls sitemap and collects clean writing corpus.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `sitemap_url` | Yes | XML sitemap URL |
| `output_name` | Yes | Corpus identifier (e.g. "my-voice") |
| `output_dir` | Yes | Storage directory |
| `max_articles` | No | Article limit (default: 100) |
| `article_pattern` | No | Regex URL filter |

### analyze_corpus

Runs the six analysers on the collected corpus.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from `collect_corpus` |
| `corpus_dir` | Yes | Directory containing corpus |

### generate_voice_skill

Generates the Claude Skill bundle (`SKILL.md` plus real article samples) so Claude writes prose in the corpus author's voice by mimicking actual writing rather than following rule lists. Output goes to `<corpus_dir>/<corpus_name>/skill/`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `corpus_name` | Yes | Name from `analyze_corpus` |
| `corpus_dir` | Yes | Directory containing analysis |
| `sample_count` | No | Number of article samples to bundle (default: 25) |

## Development

```bash
git clone https://github.com/houtini-ai/voice-analyser-mcp.git
cd voice-analyser-mcp
npm install
npm run build
```

Local development mode in Claude Desktop config:

```json
{
  "mcpServers": {
    "voice-analysis": {
      "command": "node",
      "args": ["C:\\path\\to\\voice-analyser-mcp\\dist\\index.js"]
    }
  }
}
```

## Known Limitations

- Needs an XML sitemap. RSS feeds aren't supported yet.
- Works best with single-author content. Mixed authorship weakens the recurring-phrase signal – the analysis can't tell whose voice is whose.
- Heavily edited content produces less distinct voice patterns. If your articles have been through a copy-editor, you'll capture the editor's hand as much as yours.
- `SKILL.md` sections are omitted when the corpus doesn't produce enough data for reliable patterns. This is intentional – better no rule than a rule built on a single occurrence.
- The MCP runs locally. The corpus and analysis stay on your machine. Nothing leaves the device.

---

**License:** Apache 2.0
**Author:** [Houtini](https://houtini.ai)
**Version:** 1.5.0
