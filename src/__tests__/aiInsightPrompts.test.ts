import { buildPrompt, buildPsyHypePrompt } from '@/services/aiInsightPrompts';
import { MusicalAgePayload } from '@/utils/insightSelectors';
import type { MoodRingPayload, GenrePassportPayload, NightOwlPatternPayload } from '@/lib/openaiClient';
import { RadarPayload } from '@/features/radar/types';
import { HypePayload } from '@/features/psycho/buildHypePayload';

describe('AI Insight Prompts', () => {
  describe('buildPrompt for musical_age', () => {
    const mockMusicalAgeData: MusicalAgePayload = {
      age: 15,
      era: 'Digital',
      trackCount: 150,
      averageYear: 2009,
      stdDev: 8,
      oldest: {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        year: 1975
      },
      newest: {
        title: 'Blinding Lights',
        artist: 'The Weeknd', 
        year: 2020
      },
      decadeBuckets: [
        { decade: 1970, weight: 5.2 },
        { decade: 2000, weight: 15.8 },
        { decade: 2010, weight: 25.3 }
      ],
      description: 'Your music taste spans 15 years of musical history'
    };

    it('includes era field in the prompt', () => {
      const prompt = buildPrompt('musical_age', mockMusicalAgeData);
      
      expect(prompt).toContain('Era: Digital');
      expect(prompt).toContain('Digital era');
    });

    it('includes all new fields from A2 specification', () => {
      const prompt = buildPrompt('musical_age', mockMusicalAgeData);
      
      // Check readable format includes all fields
      expect(prompt).toContain('Musical Age: 15 years');
      expect(prompt).toContain('Era: Digital');
      expect(prompt).toContain('based on 150 tracks');
      expect(prompt).toContain('Standard Deviation: 8 years');
      expect(prompt).toContain('avg year: 2009');
      expect(prompt).toContain('Oldest Track: "Bohemian Rhapsody"');
      expect(prompt).toContain('Newest Track: "Blinding Lights"');
    });

    it('includes oldest and newest track information', () => {
      const prompt = buildPrompt('musical_age', mockMusicalAgeData);
      
      expect(prompt).toContain('Bohemian Rhapsody');
      expect(prompt).toContain('Queen');
      expect(prompt).toContain('Blinding Lights');
      expect(prompt).toContain('The Weeknd');
    });

    it('includes confidence interval hint', () => {
      const prompt = buildPrompt('musical_age', mockMusicalAgeData);
      
      expect(prompt).toContain('±8yr confidence');
    });

    it('includes era context in examples', () => {
      const prompt = buildPrompt('musical_age', mockMusicalAgeData);
      
      expect(prompt).toContain('Digital era');
      expect(prompt).toContain('era connoisseur');
    });

    it('maintains readable format structure', () => {
      const prompt = buildPrompt('musical_age', mockMusicalAgeData);
      
      // Check that the prompt has proper structure with context section
      expect(prompt).toContain('Context:');
      expect(prompt).toContain('Requirements:');
      expect(prompt).toContain('Examples of tone');
      expect(prompt).toContain('Generate ONE unique caption only');
      
      // Verify key information is present in readable format
      expect(prompt).toContain('Musical Age: 15');
      expect(prompt).toContain('Era: Digital');
      expect(prompt).toContain('Queen');
      expect(prompt).toContain('The Weeknd');
    });
  });

  describe('buildPrompt for other insight types', () => {
    it('builds mood_ring prompt correctly', () => {
      const mockData: MoodRingPayload = {
        emotions: { happy: 30, energetic: 25, chill: 25, melancholy: 20 },
        dominantMood: 'happy'
      };

      const prompt = buildPrompt('mood_ring', mockData);
      
      expect(prompt).toContain('happy');
      expect(prompt).toContain('30%');
      expect(prompt).toContain('Mood Ring');
    });

    it('builds genre_passport prompt correctly', () => {
      const mockData: GenrePassportPayload = {
        totalGenres: 15,
        topGenres: ['rock', 'pop', 'indie'],
        explorationScore: 75
      };

      const prompt = buildPrompt('genre_passport', mockData);
      
      expect(prompt).toContain('Distinct genre count: 15');
      expect(prompt).toContain('rock, pop, indie');
      expect(prompt).toContain('75/100');
    });

    it('builds night_owl_pattern prompt correctly', () => {
      const mockData: NightOwlPatternPayload = {
        hourlyData: new Array(24).fill(0),
        peakHour: 22,
        isNightOwl: true,
        score: 85
      };

      const prompt = buildPrompt('night_owl_pattern', mockData);
      
      expect(prompt).toContain('Night Owl');
      expect(prompt).toContain('10PM');
      expect(prompt).toContain('85/100');
    });
  });

  describe('buildPrompt for radar_summary', () => {
    const mockRadarData: RadarPayload = {
      scores: {
        'Positivity': 85,
        'Energy': 70,
        'Exploration': 40,
        'Nostalgia': 92,
        'Night-Owl': 20,
      },
      stats: {
        positivity: { weightedMeanValence: 0, percentage: 0 },
        energy: { weightedMeanEnergy: 0, weightedMeanTempo: 0 },
        exploration: { genreCount: 0, entropy: 0, normalizedEntropy: 0 },
        nostalgia: { medianTrackAge: 0 },
        nightOwl: { nightPlayCount: 0, totalPlayCount: 0, percentage: 0 },
      },
      suggestions: [],
      trackCount: 100,
      isDefault: false,
      trends: [],
      topGenre: 'Rock',
      sampleTrack: { title: 'Test Track', artist: 'Test Artist' },
      weeks: 4,
    };

    it('should create a prompt with all five axis scores', () => {
      const prompt = buildPrompt('radar_summary', mockRadarData);
      expect(prompt).toContain('Positivity Score: 85');
      expect(prompt).toContain('Energy Score: 70');
      expect(prompt).toContain('Exploration Score: 40');
      expect(prompt).toContain('Nostalgia Score: 92');
      expect(prompt).toContain('Night-Owl Score: 20');
    });

    it('should correctly identify the strongest and weakest traits', () => {
      const prompt = buildPrompt('radar_summary', mockRadarData);
      expect(prompt).toContain('Strongest Trait: Nostalgia (92)');
      expect(prompt).toContain('Weakest Trait: Night-Owl (20)');
    });

    it('should include the specified system message and requirements', () => {
      const prompt = buildPrompt('radar_summary', mockRadarData);
      expect(prompt).toContain("You are Vynce's fun music coach.");
      expect(prompt).toContain("First sentence should highlight the strongest trait");
      expect(prompt).toContain("Second sentence should playfully mention the weakest trait");
    });
  });

  describe('buildPrompt for radar_hype', () => {
    const mockRadarData: RadarPayload = {
      scores: {
        'Positivity': 85,
        'Energy': 72,
        'Exploration': 43,
        'Nostalgia': 28,
        'Night-Owl': 67,
      },
      stats: {
        positivity: { weightedMeanValence: 0.85, percentage: 85 },
        energy: { weightedMeanEnergy: 0.72, weightedMeanTempo: 0.68 },
        exploration: { genreCount: 8, entropy: 2.1, normalizedEntropy: 43 },
        nostalgia: { medianTrackAge: 7 },
        nightOwl: { nightPlayCount: 15, totalPlayCount: 50, percentage: 30 },
      },
      suggestions: [],
      trackCount: 25,
      isDefault: false,
      trends: [],
      topGenre: 'Tamil Pop',
      sampleTrack: { title: 'Solo Dolo, Pt III', artist: 'Kid Cudi' },
      weeks: 4,
    };

    it('includes personalized data fields in the prompt', () => {
      const prompt = buildPrompt('radar_hype', mockRadarData);

      // Should include personalized data
      expect(prompt).toContain('Tamil Pop');
      expect(prompt).toContain('Solo Dolo, Pt III');
      expect(prompt).toContain('Kid Cudi');
      expect(prompt).toContain('Weeks: 4');
      expect(prompt).toContain('Track Count: 25');
    });

    it('includes top and low axis information', () => {
      const prompt = buildPrompt('radar_hype', mockRadarData);
      
      // Should include top axis (Positivity - 85%)
      expect(prompt).toContain('Top Axis: Positivity (85%)');
      
      // Should include low axis (Nostalgia - 28%)
      expect(prompt).toContain('Low Axis: Nostalgia (28%)');
    });

    it('includes structured JSON requirements', () => {
      const prompt = buildPrompt('radar_hype', mockRadarData);
      
      expect(prompt).toContain('Required JSON Keys');
      expect(prompt).toContain('Gen-Z hype coach');
      expect(prompt).toContain('≤ 50 words');
      expect(prompt).toContain('≤ 18 words');
    });

    it('mentions coach tip logic for low scoring axes', () => {
      const prompt = buildPrompt('radar_hype', mockRadarData);
      
      // Nostalgia is 28% which is < 35%, but it's excluded from coach tips
      expect(prompt).toContain('omit tip key entirely');
    });
  });

  describe('buildPsyHypePrompt', () => {
    const mockHypePayload: HypePayload = {
      psycho: {
        scores: {
          musical_diversity: { score: 0.8, confidence: 'high', formula: 'test' },
          exploration_rate: { score: 0.6, confidence: 'medium', formula: 'test' },
          temporal_consistency: { score: 0.4, confidence: 'low', formula: 'test' },
          mainstream_affinity: { score: 0.7, confidence: 'high', formula: 'test' },
          emotional_volatility: { score: 0.3, confidence: 'insufficient', formula: 'test' },
        },
        metadata: {
          tracks_analyzed: 50,
          artists_analyzed: 25,
          genres_found: 8,
          generated_at: '2024-01-01T00:00:00Z',
        },
      },
      radar: {
        Positivity: 85,
        Energy: 70,
        Exploration: 60,
        Nostalgia: 40,
        'Night-Owl': 30,
      },
      musicalAge: {
        age: 15,
        era: 'Digital',
        trackCount: 50,
        averageYear: 2009,
        stdDev: 8,
        oldest: { title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975 },
        newest: { title: 'Blinding Lights', artist: 'The Weeknd', year: 2020 },
        decadeBuckets: [{ decade: 2000, weight: 15.8 }],
        description: 'Test description',
      },
      nightOwl: {
        hourlyData: new Array(24).fill(0),
        peakHour: 22,
        isNightOwl: true,
        score: 85,
        histogram: new Array(24).fill(0),
      },
      moodRing: {
        emotions: { happy: 65, energetic: 25, chill: 8, melancholy: 2 },
        dominantMood: 'happy',
        distribution: [{ label: 'happy', pct: 65, color: '#FFD700' }],
      },
      counts: { tracks: 50, artists: 25, genres: 8, weeks: 4 },
      topGenre: 'Pop',
      sampleTrack: { title: 'Test Track', artist: 'Test Artist' },
    };

    it('contains system role with JSON format requirements', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload);
      
      expect(prompt).toContain("You are Vynce's playful music psychologist");
      expect(prompt).toContain('Output strict JSON');
      expect(prompt).toContain('{headline, context, traits:[...], tips:[...]}');
    });

    it('includes character limits for each field', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload);
      
      expect(prompt).toContain('Headline ≤ 90 chars');
      expect(prompt).toContain('Context ≤ 120 chars');
      expect(prompt).toContain('traits: 1-3 crisp strings ≤ 80 chars each');
      expect(prompt).toContain('tips: 0-3 actionable strings ≤ 70 chars each');
    });

    it('includes the stringified HypePayload in user role', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload);
      
      expect(prompt).toContain('Here is the user\'s aggregated music-profile JSON:');
      expect(prompt).toContain('"psycho"');
      expect(prompt).toContain('"radar"');
      expect(prompt).toContain('"musicalAge"');
      expect(prompt).toContain('"nightOwl"');
      expect(prompt).toContain('"moodRing"');
    });

    it('includes guidance about clinical disorders', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload);
      
      expect(prompt).toContain('Never diagnose or mention clinical disorders');
    });

    it('constrains sentence length appropriately', () => {
      const prompt = buildPsyHypePrompt(mockHypePayload);
      
      // Should not contain sentence breaks beyond the character limits specified
      const lines = prompt.split('\n');
      const longLines = lines.filter(line => line.length > 200);
      
      // Most lines should be reasonable length except the JSON payload
      expect(longLines.length).toBeLessThanOrEqual(1); // Only the JSON line should be very long
    });

    it('works with buildPrompt function for psycho_hype_v2 type', () => {
      const prompt = buildPrompt('psycho_hype_v2', mockHypePayload);
      
      expect(prompt).toContain("You are Vynce's playful music psychologist");
      expect(prompt).toContain('Output strict JSON');
    });
  });
}); 