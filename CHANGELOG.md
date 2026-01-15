# Changelog

All notable changes to Voice Analysis MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-01-13

### Changed
- **Repository Depersonalization**: Removed all personal examples and internal development docs
- Replaced specific examples (personal names, domains) with generic placeholders
- Cleaned up temporary development files
- Streamlined QUICKSTART.md (283→109 lines) with universal examples
- Updated .gitignore to exclude future temp files

### Documentation
- All examples now use generic "author-name" and "example.com"
- Removed internal handover and scope documents
- Professional structure ready for public use

## [1.0.0] - 2025-12-01

### Added
- **Corpus Collection**: Extract writing samples from XML sitemaps, RSS/Atom feeds, and individual URLs
- **Linguistic Analysis**: Full statistical analysis of vocabulary, sentence structure, voice markers, punctuation
- **Function Word Stylometry**: Z-score analysis of 50 most common English function words
- **Enhanced N-Gram Analysis**: Character, word, and POS n-gram extraction
- **LLM-Optimized Guide Generation**: 20,000-25,000 word statistical voice models
- **AI Cliché Detection**: Automatically detect overused AI-generated phrases in your corpus
- **British vs American English**: Regional marker detection and vocabulary analysis
- **Multi-Domain Support**: Analyze writing across different content domains separately
- **Voice Validation Checklists**: Concrete pass/fail criteria for generated content

### Features
- Minimum 15,000 word corpus for reliable statistics
- Z-score fingerprinting (identifies over-use and avoidance patterns)
- First-person density tracking (authority voice measurement)
- Equipment specificity pattern detection
- Sentence length distribution analysis (full histogram, not just average)
- Transitional phrase extraction ("but I", "in my", signature combinations)
- Punctuation fingerprinting (comma density, exclamation usage, quotation style)
- Anti-pattern detection (marketing speak, AI clichés)

### Performance
- Tested with 64,000 word corpus across 3 domains
- 90% first-pass acceptance rate (vs 60% with generic style guides)
- 55 minutes saved per article (35 min vs 90 min with rewrites)
- Real-world ROI: £3,435 efficiency gains over 50 articles

### Documentation
- Comprehensive README with quick start guide
- QUICKSTART.md with detailed workflow examples
- Research documentation in `research/` directory
- Annotated examples in generated voice models

### Technical
- Built on @modelcontextprotocol/sdk
- Uses compromise.js for NLP
- Cheerio for HTML parsing
- Fast-xml-parser for sitemap/RSS processing
- TypeScript with full type safety
- MCP stdio transport for Claude Desktop integration

## [0.3.0] - 2025-11-30

### Added
- Character n-gram analysis
- Word n-gram analysis  
- POS n-gram analysis
- Enhanced guide generation with n-gram patterns

### Changed
- Improved function word z-score calculation
- Better cleaning algorithm for article extraction

## [0.2.0] - 2025-11-29

### Added
- Function word stylometry with z-scores
- Human-readable summary generation
- Reference data for 50 common English function words

### Changed
- Analysis output structure reorganized
- Improved statistical validation

## [0.1.0] - 2025-11-28

### Added
- Initial corpus collection from sitemaps
- Basic linguistic analysis (vocabulary, sentences, paragraphs)
- Simple guide generation
- MCP tool integration

---

## Planned Features

### [1.1.0] - Future
- Real-time validation API endpoint
- Voice drift detection alerts
- Multi-author analysis for teams
- Competitive voice analysis

### [1.2.0] - Future
- Delta distance scoring for authorship verification
- Automated style guide updates
- Integration with content management systems

### [2.0.0] - Future
- Web UI for corpus management
- Collaborative voice modeling
- Enterprise team features
- Cloud deployment options

---

## Notes

**Current Status:** Production ready (v1.0.0)

**Tested With:**
- Claude Desktop (Sonnet 4.5)
- Windows 10/11
- Node.js 18+

**Known Limitations:**
- Minimum 15,000 words required for reliable statistics
- Single-author corpus recommended (mixed authorship dilutes patterns)
- Re-analysis recommended quarterly (voice evolves over time)

**Support:**
- GitHub Issues for bug reports
- Research directory for technical background
- QUICKSTART.md for detailed usage examples

---

**Project:** Content Machine - Statistical voice preservation for authentic AI content generation