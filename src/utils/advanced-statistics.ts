/**
 * Advanced statistical functions for AI detection avoidance analysis
 * Based on peer-reviewed linguistic research (CMU PNAS 2025, AAAI 2025)
 */

import { mean, standardDeviation } from './statistics.js';

/**
 * Calculate burstiness coefficient
 * Measures clustering vs uniformity in sequences
 * Range: -1 (perfectly uniform) to +1 (extremely bursty)
 * 
 * Formula: B = (σ - μ) / (σ + μ)
 * Where σ = standard deviation, μ = mean
 */
export function burstiness(values: number[]): number {
  if (values.length < 2) return 0;
  
  const avg = mean(values);
  const stdDev = standardDeviation(values);
  
  // Avoid division by zero
  if (stdDev + avg === 0) return 0;
  
  return (stdDev - avg) / (stdDev + avg);
}

/**
 * Detect clusters in a sequence of values
 * Returns groups of consecutive similar values
 * 
 * @param values - Sequence to analyze
 * @param threshold - Maximum difference for cluster membership (default: 5)
 * @param minSize - Minimum cluster size to report (default: 2)
 */
export interface Cluster {
  startIndex: number;
  endIndex: number;
  size: number;
  values: number[];
  mean: number;
  min: number;
  max: number;
}

export function detectClusters(
  values: number[], 
  threshold: number = 5,
  minSize: number = 2
): Cluster[] {
  if (values.length < minSize) return [];
  
  const clusters: Cluster[] = [];
  let currentCluster: number[] = [values[0]];
  let startIndex = 0;
  
  for (let i = 1; i < values.length; i++) {
    const diff = Math.abs(values[i] - values[i - 1]);
    
    if (diff <= threshold) {
      currentCluster.push(values[i]);
    } else {
      // Cluster ended - record if meets minimum size
      if (currentCluster.length >= minSize) {
        clusters.push(createCluster(currentCluster, startIndex));
      }
      currentCluster = [values[i]];
      startIndex = i;
    }
  }
  
  // Handle final cluster
  if (currentCluster.length >= minSize) {
    clusters.push(createCluster(currentCluster, startIndex));
  }
  
  return clusters;
}

function createCluster(values: number[], startIndex: number): Cluster {
  const clusterMean = mean(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return {
    startIndex,
    endIndex: startIndex + values.length - 1,
    size: values.length,
    values: [...values],
    mean: clusterMean,
    min,
    max
  };
}

/**
 * Calculate entropy of a distribution
 * Measures diversity/uniformity in categorical data
 * Higher entropy = more diverse distribution
 */
export function entropy<T>(items: T[]): number {
  if (items.length === 0) return 0;
  
  // Count frequencies
  const frequencies = new Map<T, number>();
  for (const item of items) {
    frequencies.set(item, (frequencies.get(item) || 0) + 1);
  }
  
  // Calculate entropy: -Σ(p * log2(p))
  const total = items.length;
  let ent = 0;
  
  for (const count of frequencies.values()) {
    const probability = count / total;
    if (probability > 0) {
      ent -= probability * Math.log2(probability);
    }
  }
  
  return ent;
}

/**
 * Calculate Type-Token Ratio (TTR)
 * Measures lexical diversity: unique words / total words
 */
export function typeTokenRatio(tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const types = new Set(tokens.map(t => t.toLowerCase()));
  return types.size / tokens.length;
}

/**
 * Calculate Moving Average Type-Token Ratio (MATTR)
 * More stable measure of lexical diversity for longer texts
 * 
 * @param tokens - Word tokens
 * @param windowSize - Window size for moving average (default: 100)
 */
export function movingAvgTypeTokenRatio(
  tokens: string[], 
  windowSize: number = 100
): number {
  if (tokens.length < windowSize) {
    return typeTokenRatio(tokens);
  }
  
  const ttrs: number[] = [];
  
  for (let i = 0; i <= tokens.length - windowSize; i++) {
    const window = tokens.slice(i, i + windowSize);
    ttrs.push(typeTokenRatio(window));
  }
  
  return mean(ttrs);
}

/**
 * Count hapax legomena (words appearing only once)
 * Strong indicator of human writing vs AI
 */
export function hapaxLegomenaCount(tokens: string[]): number {
  const frequencies = new Map<string, number>();
  
  for (const token of tokens) {
    const lower = token.toLowerCase();
    frequencies.set(lower, (frequencies.get(lower) || 0) + 1);
  }
  
  let hapaxCount = 0;
  for (const count of frequencies.values()) {
    if (count === 1) hapaxCount++;
  }
  
  return hapaxCount;
}

/**
 * Calculate bigram uniqueness
 * Ratio of unique word pairs to total word pairs
 */
export function bigramUniqueness(tokens: string[]): number {
  if (tokens.length < 2) return 0;
  
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i].toLowerCase()} ${tokens[i + 1].toLowerCase()}`);
  }
  
  const uniqueBigrams = new Set(bigrams);
  return uniqueBigrams.size / bigrams.length;
}

/**
 * Categorize values into distribution buckets
 * Returns both counts and examples for each bucket
 */
export interface DistributionBucket<T> {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  examples?: T[];
}

export function categorizedDistribution<T>(
  items: Array<{ value: number; item: T }>,
  buckets: Array<{ min: number; max: number; label: string }>,
  maxExamples: number = 5
): DistributionBucket<T>[] {
  const total = items.length;
  
  return buckets.map(({ min, max, label }) => {
    const matching = items.filter(({ value }) => value >= min && value < max);
    
    return {
      label,
      min,
      max,
      count: matching.length,
      percentage: total > 0 ? (matching.length / total) * 100 : 0,
      examples: matching.slice(0, maxExamples).map(({ item }) => item)
    };
  });
}
