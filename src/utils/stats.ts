/**
 * Statistical utility functions for insights calculations
 */

export interface WeightedData {
  year: number;
  weight: number;
}

/**
 * Calculate weighted median release year
 * @param data Array of {year, weight} objects
 * @returns Median year based on cumulative weights
 */
export function weightedMedianReleaseYear(data: WeightedData[]): number {
  if (data.length === 0) {
    return new Date().getFullYear();
  }

  // Sort by year ascending
  const sorted = [...data].sort((a, b) => a.year - b.year);
  
  // Calculate total weight
  const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0);
  
  if (totalWeight === 0) {
    return new Date().getFullYear();
  }

  // Find cumulative weight >= 50% of total
  const target = totalWeight / 2;
  let cumulativeWeight = 0;
  
  for (const item of sorted) {
    cumulativeWeight += item.weight;
    if (cumulativeWeight >= target) {
      return item.year;
    }
  }
  
  // Fallback (shouldn't reach here with valid data)
  return sorted[sorted.length - 1].year;
}

/**
 * Calculate weighted standard deviation
 * @param data Array of {year, weight} objects
 * @param weightedMean Weighted mean to calculate deviation from
 * @returns Standard deviation
 */
export function weightedStandardDeviation(data: WeightedData[], weightedMean: number): number {
  if (data.length === 0) {
    return 0;
  }

  const totalWeight = data.reduce((sum, item) => sum + item.weight, 0);
  
  if (totalWeight === 0) {
    return 0;
  }

  const variance = data.reduce((sum, item) => {
    const deviation = item.year - weightedMean;
    return sum + item.weight * (deviation * deviation);
  }, 0) / totalWeight;

  return Math.sqrt(variance);
} 