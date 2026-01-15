/**
 * Z-Score calculation utilities for stylometric analysis
 * 
 * Z-score measures how many standard deviations an observation is from the mean.
 * In stylometry, used to identify distinctive function word usage patterns.
 */

import { mean, standardDeviation } from './statistics.js';

// Re-export for backwards compatibility
export { mean, standardDeviation };

/**
 * Calculate z-score: (value - mean) / standard_deviation
 * 
 * Interpretation:
 * - z > +2.0: Highly distinctive (much more than typical)
 * - z > +1.0: Distinctive (more than typical)
 * - -1.0 < z < +1.0: Normal range
 * - z < -1.0: Avoided (less than typical)
 * - z < -2.0: Highly avoided (much less than typical)
 */
export function zScore(value: number, refMean: number, refStdDev: number): number {
  if (refStdDev === 0) return 0; // Avoid division by zero
  return (value - refMean) / refStdDev;
}

/**
 * Interpret z-score for human-readable output
 */
export function interpretZScore(z: number): string {
  if (z > 2.0) return 'Highly distinctive (much more than typical)';
  if (z > 1.0) return 'Distinctive (more than typical)';
  if (z > 0.5) return 'Slightly more than typical';
  if (z > -0.5) return 'Normal range';
  if (z > -1.0) return 'Slightly less than typical';
  if (z > -2.0) return 'Avoided (less than typical)';
  return 'Highly avoided (much less than typical)';
}

/**
 * Calculate z-scores for multiple values against reference statistics
 */
export interface ZScoreResult {
  value: number;
  refMean: number;
  refStdDev: number;
  zScore: number;
  interpretation: string;
}

export function calculateZScores(
  values: Record<string, number>,
  refStats: Record<string, { mean: number; stdDev: number }>
): Record<string, ZScoreResult> {
  const results: Record<string, ZScoreResult> = {};
  
  for (const [key, value] of Object.entries(values)) {
    if (refStats[key]) {
      const { mean: refMean, stdDev: refStdDev } = refStats[key];
      const z = zScore(value, refMean, refStdDev);
      results[key] = {
        value,
        refMean,
        refStdDev,
        zScore: z,
        interpretation: interpretZScore(z)
      };
    }
  }
  
  return results;
}
