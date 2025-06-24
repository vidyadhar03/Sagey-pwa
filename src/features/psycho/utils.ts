/**
 * Calculate Shannon entropy for a list of strings
 * @param items Array of strings (e.g., genres)
 * @returns Shannon entropy value
 */
export function shannonEntropy<T extends string>(items: T[]): number {
  if (items.length === 0) return 0;

  // Count frequencies
  const frequencies = new Map<T, number>();
  for (const item of items) {
    frequencies.set(item, (frequencies.get(item) || 0) + 1);
  }

  const total = items.length;
  let entropy = 0;

  for (const count of Array.from(frequencies.values())) {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

/**
 * Normalize Shannon entropy by the maximum possible entropy (log2(n))
 * @param items Array of strings
 * @returns Normalized entropy (0-1 range)
 */
export function normalizedShannonEntropy<T extends string>(items: T[]): number {
  if (items.length === 0) return 0;

  const entropy = shannonEntropy(items);
  const uniqueItems = new Set(items).size;
  
  if (uniqueItems <= 1) return 0;
  
  const maxEntropy = Math.log2(uniqueItems);
  return entropy / maxEntropy;
}

/**
 * Calculate unique ratio (unique items / total items)
 * @param items Array of items
 * @returns Ratio between 0 and 1
 */
export function uniqueRatio<T>(items: T[]): number {
  if (items.length === 0) return 0;
  const uniqueItems = new Set(items).size;
  return uniqueItems / items.length;
} 