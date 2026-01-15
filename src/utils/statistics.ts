/**
 * Statistical utility functions for linguistic analysis
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

export function distribution(
  values: number[], 
  ranges: Array<{ min: number; max: number; label: string }>
): Array<{ range: string; count: number; percentage: number }> {
  const total = values.length;
  return ranges.map(({ min, max, label }) => {
    const count = values.filter(v => v >= min && v < max).length;
    return {
      range: label,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    };
  });
}

export function frequencyMap<T extends string | number>(
  items: T[]
): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

export function topN<T>(
  map: Map<T, number>, 
  n: number
): Array<{ item: T; count: number; percentage: number }> {
  const total = Array.from(map.values()).reduce((sum, count) => sum + count, 0);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item, count]) => ({
      item,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
}
