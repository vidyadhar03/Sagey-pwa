import {
  getMusicalAgePayload,
  getMoodRingPayload,
  getGenrePassportPayload,
  getNightOwlPayload,
} from '@/utils/insightSelectors';
import sampleData from './fixtures/sampleSpotifyData.json';

describe('Insight Selectors', () => {
  describe('getMusicalAgePayload', () => {
    it('computes musical age correctly with new algorithm', () => {
      const result = getMusicalAgePayload(sampleData);
      
      expect(result.age).toBeGreaterThan(0);
      expect(result.averageYear).toBeGreaterThan(1950);
      expect(result.averageYear).toBeLessThan(2025);
      expect(result.trackCount).toBe(10);
      expect(result.oldest.year).toBeLessThanOrEqual(result.newest.year);
    });

    it('includes all new fields from A2 specification', () => {
      const result = getMusicalAgePayload(sampleData);
      
      // Test era field
      expect(['Vinyl', 'Analog', 'Digital', 'Streaming']).toContain(result.era);
      
      // Test stdDev
      expect(typeof result.stdDev).toBe('number');
      expect(result.stdDev).toBeGreaterThanOrEqual(0);
      
      // Test oldest/newest as TrackBrief objects
      expect(result.oldest).toHaveProperty('title');
      expect(result.oldest).toHaveProperty('artist'); 
      expect(result.oldest).toHaveProperty('year');
      expect(result.newest).toHaveProperty('title');
      expect(result.newest).toHaveProperty('artist');
      expect(result.newest).toHaveProperty('year');
      
      // Test decadeBuckets
      expect(Array.isArray(result.decadeBuckets)).toBe(true);
      expect(result.decadeBuckets.length).toBeGreaterThan(0);
      result.decadeBuckets.forEach(bucket => {
        expect(bucket).toHaveProperty('decade');
        expect(bucket).toHaveProperty('weight');
        expect(typeof bucket.decade).toBe('number');
        expect(typeof bucket.weight).toBe('number');
      });
    });

    it('processes fixture data correctly (10 tracks spanning 1971-2020)', () => {
      const result = getMusicalAgePayload(sampleData);
      
      expect(result.trackCount).toBe(10);
      expect(result.decadeBuckets.length).toBeGreaterThanOrEqual(3); // 1970s, 1980s, 2010s, 2020s
      expect(result.stdDev).toBeGreaterThan(0); // Should have variance
      
      // Era should match median year rule - sample data is mostly modern
      expect(['Digital', 'Streaming']).toContain(result.era);
      
      // Oldest should be from 1971 (Stairway to Heaven)
      expect(result.oldest.year).toBe(1971);
      expect(result.oldest.title).toBe('Stairway to Heaven');
      expect(result.oldest.artist).toBe('Led Zeppelin');
      
      // Newest should be from 2020 (Blinding Lights or Levitating)
      expect(result.newest.year).toBe(2020);
    });

    it('handles empty track data', () => {
      const result = getMusicalAgePayload({ tracks: [] });
      
      expect(result.age).toBe(0);
      expect(result.trackCount).toBe(0);
      expect(result.description).toBe('No tracks available');
      expect(result.era).toBe('Streaming');
      expect(result.stdDev).toBe(0);
      expect(result.decadeBuckets).toHaveLength(0);
      expect(result.oldest.title).toBe('');
      expect(result.newest.title).toBe('');
    });

    it('filters tracks by duration (≥30s)', () => {
      const dataWithShortTracks = {
        tracks: [
          ...sampleData.tracks,
          {
            id: 'short1',
            name: 'Short Track',
            artist: 'Test Artist',
            album: { name: 'Test Album', release_date: '2020-01-01' },
            release_date: '2020-01-01',
            duration_ms: 15000, // 15 seconds - should be filtered out
            played_at: '2024-01-15T10:00:00Z'
          }
        ]
      };
      
      const result = getMusicalAgePayload(dataWithShortTracks);
      
      // Should still be 10 tracks (short track filtered out)
      expect(result.trackCount).toBe(10);
    });

    it('handles tracks without played_at timestamps', () => {
      const dataWithoutTimestamps = {
        tracks: sampleData.tracks.map(track => ({
          ...track,
          played_at: undefined
        }))
      };
      
      const result = getMusicalAgePayload(dataWithoutTimestamps);
      
      expect(result.trackCount).toBe(10);
      expect(result.age).toBeGreaterThanOrEqual(0);
      expect(result.decadeBuckets.length).toBeGreaterThan(0);
    });

    it('calculates weighted statistics correctly', () => {
      const result = getMusicalAgePayload(sampleData);
      
      // Should use weighted median, not simple average
      expect(result.age).toBeGreaterThan(0);
      expect(result.averageYear).toBeGreaterThan(1970);
      expect(result.averageYear).toBeLessThan(2025);
      
      // Standard deviation should reflect the spread in years
      expect(result.stdDev).toBeGreaterThan(0);
      expect(result.stdDev).toBeLessThan(100); // Reasonable bound
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