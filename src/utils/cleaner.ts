/**
 * Content cleaning utilities for corpus preparation
 * Removes extraction artifacts that pollute linguistic analysis
 */

export interface CleaningReport {
  isClean: boolean;
  artifactsRemoved: {
    base64Images: number;
    urlFragments: number;
    htmlTags: number;
    fileExtensions: number;
    shortcodes: number;
  };
  warningMessages: string[];
}

/**
 * Clean article content by removing extraction artifacts
 */
export function cleanArticleContent(markdown: string): { content: string; report: CleaningReport } {
  const report: CleaningReport = {
    isClean: true,
    artifactsRemoved: {
      base64Images: 0,
      urlFragments: 0,
      htmlTags: 0,
      fileExtensions: 0,
      shortcodes: 0,
    },
    warningMessages: [],
  };

  let cleaned = markdown;

  // 1. Remove base64 image data (CRITICAL)
  const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g;
  const base64Matches = cleaned.match(base64Pattern);
  if (base64Matches) {
    report.artifactsRemoved.base64Images = base64Matches.length;
    report.isClean = false;
    cleaned = cleaned.replace(base64Pattern, '');
    report.warningMessages.push(`Removed ${base64Matches.length} base64 image(s)`);
  }

  // 2. Remove inline images but preserve alt text (for context)
  // Pattern: ![alt text](url) → alt text
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // 3. Remove markdown links but preserve link text
  // Pattern: [link text](url) → link text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 4. Remove standalone URLs
  const urlPattern = /https?:\/\/[^\s\)]+/g;
  const urlMatches = cleaned.match(urlPattern);
  if (urlMatches) {
    report.artifactsRemoved.urlFragments = urlMatches.length;
    cleaned = cleaned.replace(urlPattern, '');
  }

  // 5. Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // 6. Remove any leaked HTML tags
  const htmlTagPattern = /<[^>]+>/g;
  const htmlMatches = cleaned.match(htmlTagPattern);
  if (htmlMatches) {
    report.artifactsRemoved.htmlTags = htmlMatches.length;
    report.isClean = false;
    cleaned = cleaned.replace(htmlTagPattern, '');
    report.warningMessages.push(`Removed ${htmlMatches.length} HTML tag(s)`);
  }

  // 7. Remove WordPress/CMS shortcodes
  // Pattern: [shortcode param="value"]
  const shortcodePattern = /\[[\w_-]+(?:\s+[^\]]+)?\]/g;
  const shortcodeMatches = cleaned.match(shortcodePattern);
  if (shortcodeMatches) {
    report.artifactsRemoved.shortcodes = shortcodeMatches.length;
    cleaned = cleaned.replace(shortcodePattern, '');
  }

  // 8. Remove metadata/frontmatter blocks (if any leaked through)
  cleaned = cleaned.replace(/^---[\s\S]*?---\s*/m, '');

  // 9. Remove code blocks (they skew linguistic analysis)
  // Keep inline code but remove blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/~~~[\s\S]*?~~~/g, '');

  // 10. Normalize whitespace
  cleaned = cleaned
    .replace(/\t/g, ' ')           // Tabs to spaces
    .replace(/\r\n/g, '\n')        // Windows line endings
    .replace(/\r/g, '\n')          // Old Mac line endings
    .replace(/ +/g, ' ')           // Multiple spaces
    .replace(/\n{3,}/g, '\n\n')    // Multiple blank lines
    .trim();

  return { content: cleaned, report };
}

/**
 * Validate if a word is legitimate vocabulary (not an artifact)
 */
export function isValidWord(word: string): boolean {
  // Empty or whitespace only
  if (!word || word.trim().length === 0) return false;

  // Filter out URL fragments
  if (/^https?|^www\.|^gravatar|^cdn\.|^static\./i.test(word)) return false;

  // Filter out file extensions (as standalone "words")
  if (/^\.(jpg|jpeg|png|gif|svg|webp|js|css|html|pdf|mp4|webm)$/i.test(word)) return false;
  if (/^(jpg|jpeg|png|gif|svg|webp|js|css|html|pdf|mp4|webm)$/i.test(word)) return false;

  // Filter out base64 fragments (long alphanumeric strings)
  if (word.length > 50 && /^[A-Za-z0-9+/=]+$/.test(word)) return false;

  // Filter out pure numbers (unless they're common years)
  if (/^\d+$/.test(word) && !(word.length === 4 && word >= '1900' && word <= '2100')) return false;

  // Filter out common image dimension patterns
  if (/^\d+x\d+$/i.test(word)) return false;

  // Keep only words containing at least one letter
  if (!/[a-zA-Z]/.test(word)) return false;

  // Filter out single characters (except "I" and "a")
  if (word.length === 1 && word !== 'I' && word !== 'a' && word !== 'A') return false;

  return true;
}

/**
 * Validate entire corpus quality
 */
export function validateCorpusQuality(
  articles: Array<{ content: string; title: string }>
): {
  overallQuality: 'clean' | 'acceptable' | 'poor';
  issuesFound: number;
  recommendations: string[];
  articleReports: Array<{ title: string; isClean: boolean; issues: number }>;
} {
  const articleReports: Array<{ title: string; isClean: boolean; issues: number }> = [];
  let totalIssues = 0;
  const recommendations: string[] = [];

  articles.forEach((article) => {
    const { report } = cleanArticleContent(article.content);
    const issueCount = Object.values(report.artifactsRemoved).reduce((sum, count) => sum + count, 0);

    articleReports.push({
      title: article.title,
      isClean: report.isClean,
      issues: issueCount,
    });

    totalIssues += issueCount;
  });

  // Determine overall quality
  const avgIssuesPerArticle = totalIssues / articles.length;
  let overallQuality: 'clean' | 'acceptable' | 'poor';

  if (avgIssuesPerArticle === 0) {
    overallQuality = 'clean';
  } else if (avgIssuesPerArticle < 5) {
    overallQuality = 'acceptable';
    recommendations.push('Minor cleaning issues detected. Analysis should be reliable.');
  } else {
    overallQuality = 'poor';
    recommendations.push('CRITICAL: Significant extraction artifacts detected.');
    recommendations.push('Consider using different extraction method or manual review.');
  }

  // Check for specific patterns
  const articlesWithIssues = articleReports.filter((r) => !r.isClean).length;
  const percentageAffected = (articlesWithIssues / articles.length) * 100;

  if (percentageAffected > 50) {
    recommendations.push(`${percentageAffected.toFixed(0)}% of articles have extraction issues.`);
  }

  return {
    overallQuality,
    issuesFound: totalIssues,
    recommendations,
    articleReports,
  };
}

/**
 * Filter vocabulary to remove artifacts
 */
export function filterVocabulary(words: string[]): string[] {
  return words.filter(isValidWord);
}

/**
 * Get cleaning statistics for reporting
 */
export function getCleaningStats(reports: CleaningReport[]): {
  totalArtifactsRemoved: number;
  artifactBreakdown: Record<string, number>;
  cleanArticles: number;
  dirtyArticles: number;
} {
  const breakdown: Record<string, number> = {
    base64Images: 0,
    urlFragments: 0,
    htmlTags: 0,
    fileExtensions: 0,
    shortcodes: 0,
  };

  let cleanCount = 0;
  let dirtyCount = 0;

  reports.forEach((report) => {
    if (report.isClean) {
      cleanCount++;
    } else {
      dirtyCount++;
    }

    Object.entries(report.artifactsRemoved).forEach(([key, value]) => {
      breakdown[key] += value;
    });
  });

  const totalArtifacts = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

  return {
    totalArtifactsRemoved: totalArtifacts,
    artifactBreakdown: breakdown,
    cleanArticles: cleanCount,
    dirtyArticles: dirtyCount,
  };
}
