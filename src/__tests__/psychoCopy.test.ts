import { getMetricCopy, psychoCopyConfig, confidenceDescriptions } from '../features/psycho/copy';

describe('psychoCopy', () => {
  describe('getMetricCopy', () => {
    it('should return low copy for scores in 0-0.34 range', () => {
      const result = getMetricCopy('musical_diversity', 0.2);
      
      expect(result.headline).toBe('Genre comfort zone');
      expect(result.subtitle).toBe("You've got your favorites locked down");
    });

    it('should return medium copy for scores in 0.35-0.67 range', () => {
      const result = getMetricCopy('exploration_rate', 0.5);
      
      expect(result.headline).toBe('Balanced discoverer');
      expect(result.subtitle).toBe('Finding new gems while keeping favorites');
    });

    it('should return high copy for scores in 0.68-1 range', () => {
      const result = getMetricCopy('temporal_consistency', 0.8);
      
      expect(result.headline).toBe('Clock-work curator!');
      expect(result.subtitle).toBe('Your music schedule is surprisingly steady');
    });

    it('should handle boundary values correctly', () => {
      // Test exact boundaries
      expect(getMetricCopy('mainstream_affinity', 0.34).headline).toBe('Underground connoisseur');
      expect(getMetricCopy('mainstream_affinity', 0.35).headline).toBe('Chart-curious');
      expect(getMetricCopy('mainstream_affinity', 0.67).headline).toBe('Chart-curious');
      expect(getMetricCopy('mainstream_affinity', 0.68).headline).toBe('Pop culture pulse!');
    });

    it('should return fallback copy for unknown metrics', () => {
      const result = getMetricCopy('unknown_metric', 0.5);
      
      expect(result.headline).toBe('Musical metric');
      expect(result.subtitle).toBe('Analyzing your listening patterns');
    });

    it('should handle edge cases (0 and 1)', () => {
      const lowResult = getMetricCopy('emotional_volatility', 0);
      const highResult = getMetricCopy('emotional_volatility', 1);
      
      expect(lowResult.headline).toBe('Steady mood soundtrack');
      expect(highResult.headline).toBe('Mood swing maestro!');
    });
  });

  describe('psychoCopyConfig', () => {
    it('should have copy for all metric types', () => {
      const expectedMetrics = [
        'musical_diversity',
        'exploration_rate', 
        'temporal_consistency',
        'mainstream_affinity',
        'emotional_volatility'
      ];

      expectedMetrics.forEach(metric => {
        expect(psychoCopyConfig[metric]).toBeDefined();
        expect(psychoCopyConfig[metric].low).toBeDefined();
        expect(psychoCopyConfig[metric].medium).toBeDefined();
        expect(psychoCopyConfig[metric].high).toBeDefined();
      });
    });

    it('should have complete copy structure for each metric', () => {
      Object.values(psychoCopyConfig).forEach(config => {
        ['low', 'medium', 'high'].forEach(level => {
          expect(config[level as keyof typeof config].headline).toBeTruthy();
          expect(config[level as keyof typeof config].subtitle).toBeTruthy();
        });
      });
    });
  });

  describe('confidenceDescriptions', () => {
    it('should have descriptions for all confidence levels', () => {
      const expectedLevels = ['high', 'medium', 'low', 'insufficient'];
      
      expectedLevels.forEach(level => {
        expect(confidenceDescriptions[level as keyof typeof confidenceDescriptions]).toBeDefined();
        expect(confidenceDescriptions[level as keyof typeof confidenceDescriptions].title).toBeTruthy();
        expect(confidenceDescriptions[level as keyof typeof confidenceDescriptions].description).toBeTruthy();
      });
    });

    it('should include data requirements in descriptions', () => {
      expect(confidenceDescriptions.high.description).toContain('40+');
      expect(confidenceDescriptions.medium.description).toContain('20-39');
      expect(confidenceDescriptions.low.description).toContain('10-19');
      expect(confidenceDescriptions.insufficient.description).toContain('<10');
    });
  });
}); 