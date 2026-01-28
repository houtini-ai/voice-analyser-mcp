#!/usr/bin/env node

/**
 * Voice Analysis MCP Server
 * Automatic tone-of-voice analysis from published writing corpus
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import * as z from 'zod';

import { collectCorpus, CollectCorpusParams } from './tools/collect-corpus.js';
import { analyzeCorpus, AnalyzeCorpusParams } from './tools/analyze-corpus.js';
import { generateStyleGuide, StyleGuideParams } from './tools/generate-narrative-guide-v3.js';

const server = new McpServer({
  name: 'voice-analysis-server',
  version: '1.2.1',
});

// Register tools using new SDK API
server.registerTool(
  'collect_corpus',
  {
    title: 'Collect Corpus',
    description: 'Crawl sitemap and collect clean writing corpus from published articles',
    inputSchema: {
      sitemap_url: z.string().describe('URL to XML sitemap (e.g., https://example.com/post-sitemap.xml)'),
      output_name: z.string().describe('Corpus identifier/name (e.g., "richard-baxter")'),
      output_dir: z.string().describe('Directory to store corpus files (e.g., "C:/dev/corpus")'),
      max_articles: z.number().optional().default(100).describe('Maximum articles to process (default: 100)'),
      article_pattern: z.string().optional().describe('Optional regex to filter URLs'),
    },
  },
  async ({ sitemap_url, output_name, output_dir, max_articles, article_pattern }) => {
    try {
      const result = await collectCorpus({
        sitemap_url,
        output_name,
        output_dir,
        max_articles,
        article_pattern,
      });
      
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Corpus collection failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

server.registerTool(
  'analyze_corpus',
  {
    title: 'Analyze Corpus',
    description: 'Perform linguistic analysis on collected corpus (vocabulary, sentence structure, voice markers)',
    inputSchema: {
      corpus_name: z.string().describe('Name of corpus to analyze'),
      corpus_dir: z.string().describe('Directory where corpus is stored'),
      analysis_type: z.enum(['full', 'quick', 'vocabulary', 'syntax']).optional().default('full').describe('Type of analysis to perform (default: full)'),
    },
  },
  async ({ corpus_name, corpus_dir, analysis_type }) => {
    try {
      const result = await analyzeCorpus({
        corpus_name,
        corpus_dir,
        analysis_type,
      });
      
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Corpus analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

server.registerTool(
  'generate_style_guide',
  {
    title: 'Generate Style Guide',
    description: 'Generate EXECUTABLE style guide focused on prescriptive rules with do/don\'t examples. Teaches voice through clear instructions, validation checklists, and corpus statistics.',
    inputSchema: {
      corpus_name: z.string().describe('Name of analyzed corpus'),
      corpus_dir: z.string().describe('Directory where corpus is stored'),
    },
  },
  async ({ corpus_name, corpus_dir }) => {
    try {
      const result = await generateStyleGuide({
        corpus_name,
        corpus_dir,
      });
      
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Guide generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});
