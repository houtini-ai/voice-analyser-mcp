/**
 * HTTP crawling with rate limiting and error handling
 */

import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  priority?: number;
}

export async function fetchSitemap(sitemapUrl: string): Promise<SitemapEntry[]> {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }
  
  const xml = await response.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xml);
  
  // Handle RSS/Atom feed format
  if (parsed.rss && parsed.rss.channel) {
    const items = parsed.rss.channel.item || [];
    const itemArray = Array.isArray(items) ? items : [items];
    
    return itemArray.map((item: any) => ({
      loc: item.link,
      lastmod: item.pubDate,
      priority: undefined,
    }));
  }
  
  // Handle Atom feed format
  if (parsed.feed && parsed.feed.entry) {
    const entries = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
    
    return entries.map((entry: any) => ({
      loc: entry.link?.['@_href'] || entry.link,
      lastmod: entry.updated || entry.published,
      priority: undefined,
    }));
  }
  
  // Handle standard sitemap formats
  const urlset = parsed.urlset || parsed.sitemapindex;
  if (!urlset) {
    throw new Error('Invalid sitemap/feed format: No urlset, sitemapindex, RSS, or Atom structure found');
  }
  
  const urls = urlset.url || urlset.sitemap || [];
  const urlArray = Array.isArray(urls) ? urls : [urls];
  
  return urlArray.map((entry: any) => ({
    loc: entry.loc,
    lastmod: entry.lastmod,
    priority: entry.priority ? parseFloat(entry.priority) : undefined,
  }));
}

export async function fetchUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VoiceAnalysisMCP/1.0)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  
  return response.text();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function filterUrls(
  urls: SitemapEntry[], 
  pattern?: string
): SitemapEntry[] {
  if (!pattern) return urls;
  
  const regex = new RegExp(pattern);
  return urls.filter(entry => regex.test(entry.loc));
}
