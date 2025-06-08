import { weightedMedianReleaseYear, weightedStandardDeviation, WeightedData } from '@/utils/stats';

describe('Stats Utility Functions', () => {
  describe('weightedMedianReleaseYear', () => {
    it('returns current year for empty data', () => {
      const result = weightedMedianReleaseYear([]);
      const currentYear = new Date().getFullYear();
      expect(result).toBe(currentYear);
    });

    it('returns current year for zero weights', () => {
      const data: WeightedData[] = [
        { year: 2000, weight: 0 },
        { year: 2010, weight: 0 }
      ];
      const result = weightedMedianReleaseYear(data);
      const currentYear = new Date().getFullYear();
      expect(result).toBe(currentYear);
    });

    it('calculates weighted median correctly with simple dataset', () => {
      const data: WeightedData[] = [
        { year: 1990, weight: 1 },
        { year: 2000, weight: 2 }, // This should be the median (cumulative weight >= 50%)
        { year: 2010, weight: 1 }
      ];
      const result = weightedMedianReleaseYear(data);
      expect(result).toBe(2000);
    });

    it('handles single data point', () => {
      const data: WeightedData[] = [
        { year: 1995, weight: 5 }
      ];
      const result = weightedMedianReleaseYear(data);
      expect(result).toBe(1995);
    });

    it('sorts data by year before calculation', () => {
      const data: WeightedData[] = [
        { year: 2010, weight: 1 },
        { year: 1990, weight: 1 },
        { year: 2000, weight: 2 } // Should be median after sorting
      ];
      const result = weightedMedianReleaseYear(data);
      expect(result).toBe(2000);
    });

    it('finds correct median with equal weights', () => {
      const data: WeightedData[] = [
        { year: 1980, weight: 1 },
        { year: 1990, weight: 1 },
        { year: 2000, weight: 1 }, // 50% cumulative weight reached here
        { year: 2010, weight: 1 }
      ];
      const result = weightedMedianReleaseYear(data);
      expect(result).toBe(1990); // Second element reaches 50% threshold
    });

    it('handles heavily skewed weights', () => {
      const data: WeightedData[] = [
        { year: 1990, weight: 0.1 },
        { year: 2000, weight: 10 }, // This dominates
        { year: 2010, weight: 0.1 }
      ];
      const result = weightedMedianReleaseYear(data);
      expect(result).toBe(2000);
    });
  });

  describe('weightedStandardDeviation', () => {
    it('returns 0 for empty data', () => {
      const result = weightedStandardDeviation([], 2000);
      expect(result).toBe(0);
    });

    it('returns 0 for zero total weight', () => {
      const data: WeightedData[] = [
        { year: 2000, weight: 0 },
        { year: 2010, weight: 0 }
      ];
      const result = weightedStandardDeviation(data, 2005);
      expect(result).toBe(0);
    });

    it('calculates weighted standard deviation correctly', () => {
      const data: WeightedData[] = [
        { year: 1990, weight: 1 },
        { year: 2000, weight: 1 },
        { year: 2010, weight: 1 }
      ];
      const mean = 2000;
      const result = weightedStandardDeviation(data, mean);
      
      // Expected: sqrt(((1990-2000)² + (2000-2000)² + (2010-2000)²) / 3)
      // = sqrt((100 + 0 + 100) / 3) = sqrt(66.67) ≈ 8.16
      expect(result).toBeCloseTo(8.165, 2);
    });

    it('handles single data point', () => {
      const data: WeightedData[] = [
        { year: 2000, weight: 5 }
      ];
      const result = weightedStandardDeviation(data, 2000);
      expect(result).toBe(0);
    });

    it('calculates with different weights correctly', () => {
      const data: WeightedData[] = [
        { year: 1990, weight: 2 }, // More weight
        { year: 2010, weight: 1 }  // Less weight
      ];
      const mean = 1996.67; // Weighted mean: (1990*2 + 2010*1) / 3
      const result = weightedStandardDeviation(data, mean);
      
      // Should be > 0 since years differ from mean
      expect(result).toBeGreaterThan(0);
    });
  });
}); 