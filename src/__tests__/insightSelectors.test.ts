import {
  getMusicalAgePayload,
  getMoodRingPayload,
  getGenrePassportPayload,
  getNightOwlPayload,
} from '@/utils/insightSelectors';
import sampleData from './fixtures/sampleSpotifyData.json';

describe('Insight Selectors', () => {
  describe('getMusicalAgePayload', () => {
    it('computes musical age correctly', () => {
      const result = getMusicalAgePayload(sampleData);
      
      expect(result.age).toBeGreaterThan(0);
      expect(result.averageYear).toBeGreaterThan(1950);
      expect(result.averageYear).toBeLessThan(2025);
      expect(result.trackCount).toBe(10);
      expect(result.oldest).toBeLessThanOrEqual(result.newest);
    });

    it('handles empty track data', () => {
      const result = getMusicalAgePayload({ tracks: [] });
      
      expect(result.age).toBe(0);
      expect(result.trackCount).toBe(0);
      expect(result.description).toBe('No tracks available');
    });

    it('calculates average year from release dates', () => {
      const result = getMusicalAgePayload(sampleData);
      
      // Our sample data spans 1971-2020, average should be around 1990s
      expect(result.averageYear).toBeGreaterThan(1980);
      expect(result.averageYear).toBeLessThan(2010);
    });
  });

  describe('getMoodRingPayload', () => {
    it('returns 100% total mood distribution', () => {
      const result = getMoodRingPayload(sampleData);
      
      const total = result.distribution.reduce((sum, d) => sum + d.pct, 0);
      expect(total).toBeCloseTo(100, 1);
    });

    it('categorizes emotions correctly', () => {
      const result = getMoodRingPayload(sampleData);
      
      const { emotions } = result;
      const totalEmotions = emotions.happy + emotions.energetic + emotions.chill + emotions.melancholy;
      
      expect(totalEmotions).toBe(sampleData.tracks.length);
      expect(result.dominantMood).toBeTruthy();
    });

    it('handles empty track data', () => {
      const result = getMoodRingPayload({ tracks: [] });
      
      expect(result.emotions.happy).toBe(0);
      expect(result.emotions.energetic).toBe(0);
      expect(result.emotions.chill).toBe(0);
      expect(result.emotions.melancholy).toBe(0);
      expect(result.dominantMood).toBe('Unknown');
      expect(result.distribution).toHaveLength(0);
    });

    it('includes color information in distribution', () => {
      const result = getMoodRingPayload(sampleData);
      
      result.distribution.forEach(item => {
        expect(item.color).toMatch(/^#[0-9A-F]{6}$/i);
        expect(item.label).toBeTruthy();
        expect(typeof item.pct).toBe('number');
      });
    });
  });

  describe('getGenrePassportPayload', () => {
    it('counts distinct genres correctly', () => {
      const result = getGenrePassportPayload(sampleData);
      
      expect(result.distinctCount).toBeGreaterThan(0);
      expect(result.totalGenres).toBe(result.distinctCount);
      expect(result.topGenres.length).toBeGreaterThan(0);
    });

    it('calculates exploration score', () => {
      const result = getGenrePassportPayload(sampleData);
      
      expect(result.explorationScore).toBeGreaterThanOrEqual(0);
      expect(result.explorationScore).toBeLessThanOrEqual(100);
    });

    it('handles empty artist data', () => {
      const result = getGenrePassportPayload({ artists: [] });
      
      expect(result.totalGenres).toBe(0);
      expect(result.distinctCount).toBe(0);
      expect(result.topGenres).toHaveLength(0);
      expect(result.explorationScore).toBe(0);
    });

    it('returns top genres in correct format', () => {
      const result = getGenrePassportPayload(sampleData);
      
      expect(Array.isArray(result.topGenres)).toBe(true);
      expect(result.topGenres.length).toBeLessThanOrEqual(8);
      result.topGenres.forEach(genre => {
        expect(typeof genre).toBe('string');
        expect(genre.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getNightOwlPayload', () => {
    it('creates 24-slot histogram', () => {
      const result = getNightOwlPayload(sampleData);
      
      expect(result.histogram).toHaveLength(24);
      expect(result.hourlyData).toHaveLength(24);
    });

    it('calculates peak hour correctly', () => {
      const result = getNightOwlPayload(sampleData);
      
      expect(result.peakHour).toBeGreaterThanOrEqual(0);
      expect(result.peakHour).toBeLessThan(24);
    });

    it('determines night owl status', () => {
      const result = getNightOwlPayload(sampleData);
      
      expect(typeof result.isNightOwl).toBe('boolean');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('handles empty track data', () => {
      const result = getNightOwlPayload({ tracks: [] });
      
      expect(result.histogram).toHaveLength(24);
      expect(result.histogram.every(count => count === 0)).toBe(true);
      expect(result.score).toBe(0);
    });

    it('processes played_at timestamps correctly', () => {
      const result = getNightOwlPayload(sampleData);
      
      // Sum of histogram should equal number of tracks with played_at
      const totalPlays = result.histogram.reduce((sum, count) => sum + count, 0);
      const tracksWithTimestamp = sampleData.tracks.filter(track => track.played_at).length;
      
      expect(totalPlays).toBe(tracksWithTimestamp);
    });
  });
}); 