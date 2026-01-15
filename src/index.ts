#!/usr/bin/env node

/**
 * Voice Analysis MCP Server
 * Automatic tone-of-voice analysis from published writing corpus
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { collectCorpus, CollectCorpusParams } from './tools/collect-corpus.js';
import { analyzeCorpus, AnalyzeCorpusParams } from './tools/analyze-corpus.js';
import { generateNarrativeGuide, NarrativeGuideParams } from './tools/generate-narrative-guide.js';

const server = new Server(
  {
    name: 'voice-analysis-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'collect_corpus',
      description: 'Crawl sitemap and collect clean writing corpus from published articles',
      inputSchema: {
        type: 'object',
        properties: {
          sitemap_url: {
            type: 'string',
            description: 'URL to XML sitemap (e.g., https://example.com/post-sitemap.xml)'
          },
          output_name: {
            type: 'string',
            description: 'Corpus identifier/name (e.g., "richard-baxter")'
          },
          output_dir: {
            type: 'string',
            description: 'Directory to store corpus files (e.g., "C:/dev/corpus")'
          },
          max_articles: {
            type: 'number',
            description: 'Maximum articles to process (default: 100)',
            default: 100
          },
          article_pattern: {
            type: 'string',
            description: 'Optional regex to filter URLs'
          }
        },
        required: ['sitemap_url', 'output_name', 'output_dir'],
      },
    },
    {
      name: 'analyze_corpus',
      description: 'Perform linguistic analysis on collected corpus (vocabulary, sentence structure, voice markers)',
      inputSchema: {
        type: 'object',
        properties: {
          corpus_name: {
            type: 'string',
            description: 'Name of corpus to analyze'
          },
          corpus_dir: {
            type: 'string',
            description: 'Directory where corpus is stored'
          },
          analysis_type: {
            type: 'string',
            enum: ['full', 'quick', 'vocabulary', 'syntax'],
            description: 'Type of analysis to perform (default: full)',
            default: 'full'
          },
        },
        required: ['corpus_name', 'corpus_dir'],
      },
    },
    {
      name: 'generate_narrative_guide',
      description: 'Generate NARRATIVE voice immersion guide focused on examples, patterns, and flow rather than statistics. Teaches voice through immersion, not compliance.',
      inputSchema: {
        type: 'object',
        properties: {
          corpus_name: {
            type: 'string',
            description: 'Name of analyzed corpus'
          },
          corpus_dir: {
            type: 'string',
            description: 'Directory where corpus is stored'
          }
        },
        required: ['corpus_name', 'corpus_dir'],
      },
    },
  ],
}));

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case 'collect_corpus': {
        const params = request.params.arguments as unknown as CollectCorpusParams;
        const result = await collectCorpus(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case 'analyze_corpus': {
        const params = request.params.arguments as unknown as AnalyzeCorpusParams;
        const result = await analyzeCorpus(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case 'generate_narrative_guide': {
        const params = request.params.arguments as unknown as NarrativeGuideParams;
        const result = await generateNarrativeGuide(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});
