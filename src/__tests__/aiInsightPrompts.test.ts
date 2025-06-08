import { buildPrompt } from '@/services/aiInsightPrompts';
import { MusicalAgePayload } from '@/utils/insightSelectors';
import type { MoodRingPayload, GenrePassportPayload, NightOwlPatternPayload } from '@/lib/openaiClient';

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
}); 