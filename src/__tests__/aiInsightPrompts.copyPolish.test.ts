import { buildPsyHypePrompt } from '../services/aiInsightPrompts';
import { getTraitSeed, selectUniqueSeeds, coachTipSeeds } from '../features/psycho/copy';
import { HypePayload } from '../features/psycho/buildHypePayload';

// Mock HypePayload for testing
const mockHypePayload: HypePayload = {
  psycho: {
    scores: {
      musical_diversity: { score: 0.2, confidence: 'high', formula: 'test' },
      exploration_rate: { score: 0.8, confidence: 'high', formula: 'test' },
      temporal_consistency: { score: 0.5, confidence: 'medium', formula: 'test' },
      mainstream_affinity: { score: 0.1, confidence: 'low', formula: 'test' },
      emotional_volatility: { score: 0.9, confidence: 'high', formula: 'test' }
    },
    metadata: {
      tracks_analyzed: 50,
      artists_analyzed: 25,
      genres_found: 8,
      generated_at: '2024-01-01T00:00:00Z'
    }
  },
  radar: {
    Positivity: 75,
    Energy: 60,
    Exploration: 85,
    Nostalgia: 40,
    'Night-Owl': 30
  },
  musicalAge: {
    age: 25,
    era: 'Digital',
    trackCount: 50,
    stdDev: 3,
    averageYear: 2015,
    oldest: { title: 'Old Song', artist: 'Vintage Artist', year: 2010 },
    newest: { title: 'New Song', artist: 'Modern Artist', year: 2020 },
    decadeBuckets: [{ decade: 2010, weight: 1.5 }],
    description: 'Test description'
  },
  nightOwl: {
    peakHour: 22,
    isNightOwl: true,
    score: 75,
    hourlyData: new Array(24).fill(0).map((_, i) => i > 20 ? 10 : 2),
    histogram: new Array(24).fill(0).map((_, i) => i > 20 ? 10 : 2)
  },
  moodRing: {
    emotions: { happy: 40, energetic: 30, chill: 20, melancholy: 10 },
    dominantMood: 'Happy',
    distribution: [
      { label: 'happy', pct: 40, color: '#1DB954' },
      { label: 'energetic', pct: 30, color: '#FF6B6B' }
    ]
  },
  counts: { tracks: 50, artists: 25, genres: 8, weeks: 4 },
  topGenre: 'Electronic',
  sampleTrack: { title: 'Test Track', artist: 'Test Artist' }
};

describe('Copy Polish - aiInsightPrompts', () => {
  describe('getTraitSeed', () => {
    it('should return correct seeds for low scores', () => {
      const seeds = getTraitSeed('musical_diversity', 0.2);
      expect(seeds).toContain('focused');
      expect(seeds).toContain('loyal');
      expect(seeds.length).toBeGreaterThanOrEqual(6);
    });

    it('should return correct seeds for medium scores', () => {
      const seeds = getTraitSeed('exploration_rate', 0.5);
      expect(seeds).toContain('discovering');
      expect(seeds).toContain('curious');
      expect(seeds.length).toBeGreaterThanOrEqual(6);
    });

    it('should return correct seeds for high scores', () => {
      const seeds = getTraitSeed('emotional_volatility', 0.9);
      expect(seeds).toContain('intense');
      expect(seeds).toContain('dramatic');
      expect(seeds.length).toBeGreaterThanOrEqual(6);
    });

    it('should return empty array for unknown metrics', () => {
      const seeds = getTraitSeed('unknown_metric', 0.5);
      expect(seeds).toEqual([]);
    });
  });

  describe('selectUniqueSeeds', () => {
    it('should select unique elements from array', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const selected = selectUniqueSeeds(array, 3);
      
      expect(selected.length).toBe(3);
      expect(new Set(selected).size).toBe(3); // All unique
      selected.forEach(item => expect(array).toContain(item));
    });

    it('should handle count larger than array length', () => {
      const array = ['a', 'b'];
      const selected = selectUniqueSeeds(array, 5);
      
      expect(selected.length).toBe(2);
      expect(selected).toEqual(expect.arrayContaining(['a', 'b']));
    });

    it('should return empty array for empty input', () => {
      const selected = selectUniqueSeeds([], 3);
      expect(selected).toEqual([]);
    });
  });

  describe('coachTipSeeds', () => {
    it('should have at least 10 verbs', () => {
      expect(coachTipSeeds.verbs.length).toBeGreaterThanOrEqual(10);
      expect(coachTipSeeds.verbs).toContain('explore');
      expect(coachTipSeeds.verbs).toContain('discover');
    });

    it('should have at least 10 nouns', () => {
      expect(coachTipSeeds.nouns.length).toBeGreaterThanOrEqual(10);
      expect(coachTipSeeds.nouns).toContain('horizons');
      expect(coachTipSeeds.nouns).toContain('territories');
    });

    it('should contain unique values', () => {
      const verbSet = new Set(coachTipSeeds.verbs);
      const nounSet = new Set(coachTipSeeds.nouns);
      
      expect(verbSet.size).toBe(coachTipSeeds.verbs.length);
      expect(nounSet.size).toBe(coachTipSeeds.nouns.length);
    });
  });

  describe('buildPsyHypePrompt with seeds', () => {
    it('should generate prompt with unique trait seeds', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      // Should contain seed guidance section
      expect(prompt).toContain('Seeds:');
      
      // Should not repeat the same seed twice in instructions
      const seedSection = prompt.split('Seeds:')[1] || '';
      const matches = seedSection.match(/use "(\w+)"/g) || [];
      const seeds = matches.map(match => match.replace(/use "|"/g, ''));
      const uniqueSeeds = new Set(seeds);
      
      expect(uniqueSeeds.size).toBe(seeds.length); // All seeds are unique
    });

    it('should generate coach tips for weak metrics', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      // Should contain coach tips for low-scoring metrics
      expect(prompt).toContain('Seeds:');
      
      // Should reference weak metrics (musical_diversity: 0.2, mainstream_affinity: 0.1)
      const seedSection = prompt.split('Seeds:')[1] || '';
      const hasWeakMetricTips = 
        seedSection.includes('musical_diversity:') || 
        seedSection.includes('mainstream_affinity:');
      
      expect(hasWeakMetricTips).toBe(true);
    });

    it('should maintain prompt length constraint', () => {
      const wittyPrompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      const poeticPrompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      // Prompts should be reasonable length for efficiency
      expect(wittyPrompt.length).toBeLessThan(2100); // Adjusted for JSON data + seeds
      expect(poeticPrompt.length).toBeLessThan(2100);
      
      // Core instruction parts should be concise
      const wittyCore = wittyPrompt.split('Data:')[0];
      const poeticCore = poeticPrompt.split('Data:')[0];
      
      expect(wittyCore.length).toBeLessThan(700); // Includes seed guidance
      expect(poeticCore.length).toBeLessThan(700);
    });

    it('should handle empty scores without crashing', () => {
      const emptyPayload: HypePayload = {
        ...mockHypePayload,
        psycho: {
          scores: {} as any,
          metadata: mockHypePayload.psycho.metadata
        }
      };
      
      expect(() => buildPsyHypePrompt(emptyPayload, 'witty')).not.toThrow();
      
      const prompt = buildPsyHypePrompt(emptyPayload, 'witty');
      expect(prompt).toContain('music psychologist');
    });

    it('should differentiate between variants', () => {
      const wittyPrompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      const poeticPrompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(wittyPrompt).toContain('WITTY:');
      expect(wittyPrompt).toContain('Gen-Z tone');
      
      expect(poeticPrompt).toContain('POETIC:');
      expect(poeticPrompt).toContain('metaphors');
      expect(poeticPrompt).toContain('no text emojis');
    });

    it('should produce different prompts on multiple calls', () => {
      const prompt1 = buildPsyHypePrompt(mockHypePayload, 'witty');
      const prompt2 = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      // Due to randomization, prompts should be different
      // Check the seed sections specifically
      const seedSection1 = prompt1.split('Seeds:')[1]?.split('Data:')[0] || '';
      const seedSection2 = prompt2.split('Seeds:')[1]?.split('Data:')[0] || '';
      
      // At least one metric should have a different seed selected
      expect(seedSection1).not.toBe(seedSection2);
    });
  });

  describe('Integration tests', () => {
    it('should use seeds from correct score buckets', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      // Parse out the trait seed instructions
      const seedGuidance = prompt.split('Seeds:')[1]?.split('Data:')[0] || '';
      
      // musical_diversity (0.2) should use low bucket seeds
      if (seedGuidance.includes('musical_diversity:')) {
        const lowSeeds = getTraitSeed('musical_diversity', 0.2);
        const usedSeed = seedGuidance.match(/musical_diversity: use "(\w+)"/)?.[1];
        if (usedSeed) {
          expect(lowSeeds).toContain(usedSeed);
        }
      }
      
      // exploration_rate (0.8) should use high bucket seeds
      if (seedGuidance.includes('exploration_rate:')) {
        const highSeeds = getTraitSeed('exploration_rate', 0.8);
        const usedSeed = seedGuidance.match(/exploration_rate: use "(\w+)"/)?.[1];
        if (usedSeed) {
          expect(highSeeds).toContain(usedSeed);
        }
      }
    });
  });
});
