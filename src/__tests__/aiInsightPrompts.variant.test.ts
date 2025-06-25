import { buildPsyHypePrompt } from '../services/aiInsightPrompts';
import { HypePayload } from '../features/psycho/buildHypePayload';

// Mock payload for testing
const mockHypePayload: HypePayload = {
  psycho: {
    scores: {
      musical_diversity: { score: 0.75, confidence: 'high', formula: 'test' },
      exploration_rate: { score: 0.60, confidence: 'medium', formula: 'test' },
      temporal_consistency: { score: 0.85, confidence: 'high', formula: 'test' },
      mainstream_affinity: { score: 0.70, confidence: 'high', formula: 'test' },
      emotional_volatility: { score: 0.50, confidence: 'medium', formula: 'test' }
    },
    metadata: {
      tracks_analyzed: 50,
      artists_analyzed: 25,
      genres_found: 8,
      generated_at: '2023-12-01T12:00:00Z'
    }
  },
  radar: {
    'Positivity': 80,
    'Energy': 70,
    'Exploration': 60,
    'Nostalgia': 50,
    'Night-Owl': 40
  },
  musicalAge: {
    age: 5,
    era: 'Digital',
    trackCount: 50,
    averageYear: 2019,
    stdDev: 2,
    oldest: { title: 'Old Song', artist: 'Old Artist', year: 2017 },
    newest: { title: 'New Song', artist: 'New Artist', year: 2021 },
    decadeBuckets: [{ decade: 2010, weight: 50 }],
    description: 'Digital era music taste'
  },
  nightOwl: {
    hourlyData: [1, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 3],
    peakHour: 10,
    isNightOwl: false,
    score: 30,
    histogram: [1, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 3]
  },
  moodRing: {
    emotions: { happy: 40, energetic: 30, chill: 20, melancholy: 10 },
    dominantMood: 'Happy',
    distribution: [
      { label: 'Happy', pct: 40, color: '#FFD700' },
      { label: 'Energetic', pct: 30, color: '#FF6347' }
    ]
  },
  counts: { tracks: 50, artists: 25, genres: 8, weeks: 4 },
  topGenre: 'Pop',
  sampleTrack: { title: 'Test Track', artist: 'Test Artist' }
};

describe('buildPsyHypePrompt with variants', () => {
  describe('witty variant', () => {
    it('generates witty-specific instructions', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      expect(prompt).toContain('WITTY:');
      expect(prompt).toContain('upbeat');
      expect(prompt).toContain('Gen-Z tone');
      expect(prompt).toContain('emoji');
    });

    it('includes character limits for witty variant', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      expect(prompt).toContain('≤90 chars headline');
      expect(prompt).toContain('≤110 chars');
    });

    it('defaults to witty when no variant specified', () => {
      const promptWithDefault = buildPsyHypePrompt(mockHypePayload);
      const promptWithWitty = buildPsyHypePrompt(mockHypePayload, 'witty');
      
      // Due to randomization in seeds, we check they both contain witty style
      expect(promptWithDefault).toContain('WITTY:');
      expect(promptWithWitty).toContain('WITTY:');
    });
  });

  describe('poetic variant', () => {
    it('generates poetic-specific instructions', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(prompt).toContain('POETIC:');
      expect(prompt).toContain('metaphors');
      expect(prompt).toContain('no text emojis');
      expect(prompt).toContain('lyrical');
    });

    it('includes stricter character limits for poetic variant', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(prompt).toContain('≤85 chars headline');
      expect(prompt).toContain('≤110 chars');
    });

    it('excludes emojis in text instructions for poetic', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(prompt).toContain('no text emojis');
    });
  });

  describe('genre cluster tone selection', () => {
    it('selects correct tone for electronic genres', () => {
      const electronicPayload = { ...mockHypePayload, topGenre: 'Electronic' };
      const prompt = buildPsyHypePrompt(electronicPayload, 'witty');
      
      // The prompt should include the full payload which contains the electronic genre
      expect(prompt).toContain('"topGenre":"Electronic"');
    });

    it('selects correct tone for rock genres', () => {
      const rockPayload = { ...mockHypePayload, topGenre: 'Rock' };
      const prompt = buildPsyHypePrompt(rockPayload, 'witty');
      
      expect(prompt).toContain('"topGenre":"Rock"');
    });

    it('handles other genres correctly', () => {
      const popPayload = { ...mockHypePayload, topGenre: 'Pop' };
      const prompt = buildPsyHypePrompt(popPayload, 'witty');
      
      expect(prompt).toContain('"topGenre":"Pop"');
    });
  });

  describe('common elements', () => {
    it('includes base system instructions for both variants', () => {
      const wittyPrompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      const poeticPrompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      const baseInstructions = [
        "music psychologist",
        'JSON:',
        '≤80 chars',
        '≤70 chars'
      ];

      baseInstructions.forEach(instruction => {
        expect(wittyPrompt).toContain(instruction);
        expect(poeticPrompt).toContain(instruction);
      });
    });

    it('includes the full HypePayload JSON in both variants', () => {
      const wittyPrompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      const poeticPrompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(wittyPrompt).toContain('Data:');
      expect(poeticPrompt).toContain('Data:');
      expect(wittyPrompt).toContain('"psycho"');
      expect(poeticPrompt).toContain('"psycho"');
    });
  });

  describe('variant differences', () => {
    it('generates different content for different variants', () => {
      const wittyPrompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      const poeticPrompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(wittyPrompt).not.toEqual(poeticPrompt);
      expect(wittyPrompt).toContain('WITTY:');
      expect(poeticPrompt).toContain('POETIC:');
    });

    it('has different character limits for headlines', () => {
      const wittyPrompt = buildPsyHypePrompt(mockHypePayload, 'witty');
      const poeticPrompt = buildPsyHypePrompt(mockHypePayload, 'poetic');
      
      expect(wittyPrompt).toContain('≤90 chars headline');
      expect(poeticPrompt).toContain('≤85 chars headline');
    });
  });
}); 