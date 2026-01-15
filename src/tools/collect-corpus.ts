/**
 * Tool: collect_corpus
 * Crawl sitemap and collect clean writing corpus
 */

import fs from 'fs/promises';
import path from 'path';
import { fetchSitemap, fetchUrl, delay, filterUrls } from '../utils/crawler.js';
import { extractArticleContent, ArticleMetadata } from '../utils/extractor.js';
import { getCleaningStats, type CleaningReport } from '../utils/cleaner.js';

export interface CollectCorpusParams {
  sitemap_url: string;
  output_name: string;
  output_dir: string;
  max_articles?: number;
  article_pattern?: string;
}

export interface CollectCorpusResult {
  success: boolean;
  corpus_name: string;
  articles_collected: number;
  total_words: number;
  output_path: string;
  cleaning_summary?: {
    artifacts_removed: number;
    clean_articles: number;
    dirty_articles: number;
  };
  errors?: string[];
}

export async function collectCorpus(params: CollectCorpusParams): Promise<CollectCorpusResult> {
  const { sitemap_url, output_name, output_dir, max_articles = 100, article_pattern } = params;
  
  const corpusDir = path.join(output_dir, output_name);
  const articlesDir = path.join(corpusDir, 'articles');
  
  // Create directories
  await fs.mkdir(articlesDir, { recursive: true });
  
  // Fetch sitemap
  const entries = await fetchSitemap(sitemap_url);
  
  // Filter URLs
  let urls = filterUrls(entries, article_pattern);
  
  // Limit to max_articles
  if (max_articles > 0) {
    urls = urls.slice(0, max_articles);
  }
  
  const articles: ArticleMetadata[] = [];
  const errors: string[] = [];
  const cleaningReports: CleaningReport[] = [];
  let totalWords = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const entry = urls[i];
    const articleNum = String(i + 1).padStart(3, '0');
    
    try {
      // Fetch HTML
      const html = await fetchUrl(entry.loc);
      
      // Extract content
      const article = extractArticleContent(html, entry.loc);
      
      if (article) {
        // Save cleaning report
        if (article.cleaningReport) {
          cleaningReports.push(article.cleaningReport);
        }
        
        // Save as markdown
        const filename = `${articleNum}-${article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .substring(0, 50)}.md`;
        
        const filepath = path.join(articlesDir, filename);
        
        const markdown = `---
title: ${article.title}
url: ${article.url}
date: ${article.date || 'unknown'}
word_count: ${article.wordCount}
---

${article.content}`;
        
        await fs.writeFile(filepath, markdown, 'utf-8');
        
        articles.push(article);
        totalWords += article.wordCount;
      }
      
      // Rate limiting
      await delay(1500);
      
    } catch (error) {
      const errorMsg = `Failed to process ${entry.loc}: ${error}`;
      errors.push(errorMsg);
    }
  }
  
  // Get cleaning statistics
  const cleaningStats = getCleaningStats(cleaningReports);
  
  // Save corpus.json with cleaning summary
  const corpusData = {
    name: output_name,
    created: new Date().toISOString(),
    sitemap_url,
    cleaning_summary: {
      total_artifacts_removed: cleaningStats.totalArtifactsRemoved,
      artifact_breakdown: cleaningStats.artifactBreakdown,
      clean_articles: cleaningStats.cleanArticles,
      dirty_articles: cleaningStats.dirtyArticles,
      cleaning_quality: cleaningStats.cleanArticles === articles.length ? 'excellent' : 
                        cleaningStats.dirtyArticles / articles.length < 0.2 ? 'good' : 'needs_review'
    },
    articles: articles.map(a => ({
      title: a.title,
      url: a.url,
      date: a.date,
      wordCount: a.wordCount
    })),
    statistics: {
      total_articles: articles.length,
      total_words: totalWords,
      avg_words_per_article: articles.length > 0 ? Math.round(totalWords / articles.length) : 0
    }
  };
  
  await fs.writeFile(
    path.join(corpusDir, 'corpus.json'),
    JSON.stringify(corpusData, null, 2),
    'utf-8'
  );
  
  return {
    success: true,
    corpus_name: output_name,
    articles_collected: articles.length,
    total_words: totalWords,
    output_path: corpusDir,
    cleaning_summary: {
      artifacts_removed: cleaningStats.totalArtifactsRemoved,
      clean_articles: cleaningStats.cleanArticles,
      dirty_articles: cleaningStats.dirtyArticles,
    },
    errors: errors.length > 0 ? errors : undefined
  };
}
