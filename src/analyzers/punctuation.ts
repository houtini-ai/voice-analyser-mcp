/**
 * Punctuation analysis: comma density, dash types, quotation style
 * 
 * ENHANCED: Now includes AI detection signals for dash consistency.
 * Most human writers consistently use ONE dash type (usually hyphen "-").
 * AI-generated content often mixes em-dashes, en-dashes, and hyphens.
 */

export interface PunctuationAnalysis {
  commaDensity: number;
  dashTypes: {
    hyphen: number;       // - (ASCII 45)
    enDash: number;       // – (Unicode 8211)
    emDash: number;       // — (Unicode 8212)
  };
  dashConsistency: {
    dominantType: 'hyphen' | 'en-dash' | 'em-dash' | 'none';
    consistencyScore: number;  // 0-100, higher = more consistent
    mixedUsage: boolean;       // True if multiple dash types used significantly
    aiDetectionFlag: boolean;  // True if pattern suggests AI generation
    note: string;
  };
  ellipsisFrequency: number;
  quotationStyle: 'single' | 'double' | 'mixed' | 'none';
  parentheticalFrequency: number;
  exclamationFrequency: number;
  semicolonFrequency: number;
  colonFrequency: number;
}

export function analyzePunctuation(text: string): PunctuationAnalysis {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalSentences = sentences.length;
  const words = text.split(/\s+/);
  const totalWords = words.length;
  
  // Comma density (per sentence)
  const commaMatches = text.match(/,/g) || [];
  const commaDensity = totalSentences > 0 ? commaMatches.length / totalSentences : 0;
  
  // Dash types - careful Unicode matching
  // Hyphen: U+002D (-)
  // En-dash: U+2013 (–)
  // Em-dash: U+2014 (—)
  
  // Count hyphens that are used as dashes (surrounded by spaces or at word boundaries)
  // This excludes hyphenated compound words like "well-known"
  const hyphenDashPattern = /\s-\s|^-\s|\s-$/gm;
  const hyphenAsWordJoiner = /-/g;
  const allHyphens = text.match(hyphenAsWordJoiner) || [];
  const hyphenAsDash = text.match(hyphenDashPattern) || [];
  
  const enDashMatches = text.match(/–/g) || [];
  const emDashMatches = text.match(/—/g) || [];
  
  // For dash consistency, we care about dashes used for punctuation
  // (separating clauses), not hyphens in compound words
  const hyphenCount = allHyphens.length;
  const enDashCount = enDashMatches.length;
  const emDashCount = emDashMatches.length;
  
  // Determine dominant dash type
  const dashCounts = {
    hyphen: hyphenCount,
    'en-dash': enDashCount,
    'em-dash': emDashCount
  };
  
  const totalDashes = hyphenCount + enDashCount + emDashCount;
  
  let dominantType: 'hyphen' | 'en-dash' | 'em-dash' | 'none' = 'none';
  let maxCount = 0;
  
  for (const [type, count] of Object.entries(dashCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type as 'hyphen' | 'en-dash' | 'em-dash';
    }
  }
  
  if (totalDashes === 0) {
    dominantType = 'none';
  }
  
  // Consistency score: what percentage of dashes are the dominant type?
  const consistencyScore = totalDashes > 0 
    ? Math.round((maxCount / totalDashes) * 100) 
    : 100;
  
  // Mixed usage: significant use of multiple dash types
  const significantThreshold = 3; // At least 3 uses to be "significant"
  const significantTypes = Object.values(dashCounts).filter(c => c >= significantThreshold).length;
  const mixedUsage = significantTypes > 1;
  
  // AI detection flag
  // Human writers typically use ONE dash type consistently
  // AI often mixes em-dashes and en-dashes (typographic "correctness" gone wrong)
  let aiDetectionFlag = false;
  let dashNote = '';
  
  if (totalDashes > 10) {
    // Only flag if we have enough dashes to analyze
    if (mixedUsage && consistencyScore < 80) {
      aiDetectionFlag = true;
      dashNote = `Mixed dash usage detected (${consistencyScore}% consistency). Human writers typically use one dash type consistently. Consider standardising to "${dominantType}".`;
    } else if (enDashCount > 5 || emDashCount > 5) {
      // Significant use of typographic dashes may indicate AI
      if (dominantType === 'en-dash' || dominantType === 'em-dash') {
        dashNote = `Uses ${dominantType} as primary dash. This is typographically "correct" but uncommon in casual/blog writing. May indicate AI or formal editing.`;
        // Not flagging as AI, just noting
      }
    } else {
      dashNote = `Consistent use of ${dominantType} (${consistencyScore}% consistency). Natural pattern.`;
    }
  } else if (totalDashes > 0) {
    dashNote = `Limited dash usage (${totalDashes} total). Insufficient data for consistency analysis.`;
  } else {
    dashNote = 'No significant dash usage detected.';
  }
  
  // Ellipsis (per 1000 words)
  const ellipsisMatches = text.match(/\.{3}|…/g) || [];
  const ellipsisFrequency = totalWords > 0 ? (ellipsisMatches.length / totalWords) * 1000 : 0;
  
  // Quotation style
  const singleQuoteMatches = text.match(/'/g) || [];
  const doubleQuoteMatches = text.match(/"/g) || [];
  
  let quotationStyle: 'single' | 'double' | 'mixed' | 'none';
  if (singleQuoteMatches.length === 0 && doubleQuoteMatches.length === 0) {
    quotationStyle = 'none';
  } else if (singleQuoteMatches.length > doubleQuoteMatches.length * 2) {
    quotationStyle = 'single';
  } else if (doubleQuoteMatches.length > singleQuoteMatches.length * 2) {
    quotationStyle = 'double';
  } else {
    quotationStyle = 'mixed';
  }
  
  // Parenthetical (per 1000 words)
  const parenthesisMatches = text.match(/\(/g) || [];
  const parentheticalFrequency = totalWords > 0 ? (parenthesisMatches.length / totalWords) * 1000 : 0;
  
  // Exclamation marks (per 1000 words)
  const exclamationMatches = text.match(/!/g) || [];
  const exclamationFrequency = totalWords > 0 ? (exclamationMatches.length / totalWords) * 1000 : 0;
  
  // Semicolons (per 1000 words)
  const semicolonMatches = text.match(/;/g) || [];
  const semicolonFrequency = totalWords > 0 ? (semicolonMatches.length / totalWords) * 1000 : 0;
  
  // Colons (per 1000 words)
  const colonMatches = text.match(/:/g) || [];
  const colonFrequency = totalWords > 0 ? (colonMatches.length / totalWords) * 1000 : 0;
  
  return {
    commaDensity,
    dashTypes: {
      hyphen: hyphenCount,
      enDash: enDashCount,
      emDash: emDashCount
    },
    dashConsistency: {
      dominantType,
      consistencyScore,
      mixedUsage,
      aiDetectionFlag,
      note: dashNote
    },
    ellipsisFrequency,
    quotationStyle,
    parentheticalFrequency,
    exclamationFrequency,
    semicolonFrequency,
    colonFrequency
  };
}

/**
 * Generate human-readable punctuation summary
 */
export function summarizePunctuation(analysis: PunctuationAnalysis): string {
  const lines: string[] = [];
  
  lines.push('# Punctuation Analysis');
  lines.push('');
  
  lines.push('## Dash Usage');
  lines.push('');
  lines.push(`- Hyphens (-): ${analysis.dashTypes.hyphen}`);
  lines.push(`- En-dashes (–): ${analysis.dashTypes.enDash}`);
  lines.push(`- Em-dashes (—): ${analysis.dashTypes.emDash}`);
  lines.push(`- Dominant type: **${analysis.dashConsistency.dominantType}**`);
  lines.push(`- Consistency: ${analysis.dashConsistency.consistencyScore}%`);
  
  if (analysis.dashConsistency.aiDetectionFlag) {
    lines.push('');
    lines.push(`**⚠️ AI Detection Signal:** ${analysis.dashConsistency.note}`);
  } else {
    lines.push(`- ${analysis.dashConsistency.note}`);
  }
  lines.push('');
  
  lines.push('## Other Punctuation');
  lines.push('');
  lines.push(`- Comma density: ${analysis.commaDensity.toFixed(2)} per sentence`);
  lines.push(`- Quotation style: ${analysis.quotationStyle}`);
  lines.push(`- Parentheticals: ${analysis.parentheticalFrequency.toFixed(1)} per 1000 words`);
  lines.push(`- Exclamation marks: ${analysis.exclamationFrequency.toFixed(1)} per 1000 words`);
  lines.push(`- Semicolons: ${analysis.semicolonFrequency.toFixed(1)} per 1000 words`);
  lines.push(`- Colons: ${analysis.colonFrequency.toFixed(1)} per 1000 words`);
  lines.push(`- Ellipses: ${analysis.ellipsisFrequency.toFixed(1)} per 1000 words`);
  lines.push('');
  
  return lines.join('\n');
}
