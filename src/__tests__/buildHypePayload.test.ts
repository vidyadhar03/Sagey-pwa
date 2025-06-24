import { buildHypePayload, type HypePayloadInput } from '../features/psycho/buildHypePayload';
import { getPsyPayload } from '../features/psycho/getPsyPayload';
import { getRadarPayload } from '../features/radar/getRadarPayload';
import { getMusicalAgePayload, getMoodRingPayload, getNightOwlPayload } from '../utils/insightSelectors';
import type { ConfidenceLevel } from '../features/psycho/types';

// Mock the selector functions
jest.mock('../features/psycho/getPsyPayload');
jest.mock('../features/radar/getRadarPayload');
jest.mock('../utils/insightSelectors');

const mockGetPsyPayload = getPsyPayload as jest.MockedFunction<typeof getPsyPayload>;
const mockGetRadarPayload = getRadarPayload as jest.MockedFunction<typeof getRadarPayload>;
const mockGetMusicalAgePayload = getMusicalAgePayload as jest.MockedFunction<typeof getMusicalAgePayload>;
const mockGetMoodRingPayload = getMoodRingPayload as jest.MockedFunction<typeof getMoodRingPayload>;
const mockGetNightOwlPayload = getNightOwlPayload as jest.MockedFunction<typeof getNightOwlPayload>;

// Mock input data
const mockRecentTracks = [
  {
    track: {
      id: 'track1',
      name: 'Test Song 1',
      artists: [{ id: 'artist1', name: 'Artist 1' }],
      duration_ms: 180000,
      popularity: 75,
      album: {
        release_date: '2020-01-01',
        name: 'Test Album'
      }
    },
    played_at: '2023-12-01T10:00:00Z'
  },
  {
    track: {
      id: 'track2',
      name: 'Test Song 2',
      artists: [{ id: 'artist2', name: 'Artist 2' }],
      duration_ms: 200000,
      popularity: 85,
      album: {
        release_date: '2019-06-15',
        name: 'Another Album'
      }
    },
    played_at: '2023-12-01T15:30:00Z'
  }
] as any[];

const mockTopArtists = [
  {
    id: 'artist1',
    name: 'Artist 1',
    genres: ['pop', 'dance'],
    followers: 1000000
  },
  {
    id: 'artist2', 
    name: 'Artist 2',
    genres: ['rock', 'alternative'],
    followers: 500000
  }
] as any[];

const mockInput: HypePayloadInput = {
  recentTracks: mockRecentTracks,
  topArtists: mockTopArtists
};

// Mock return values
const mockPsyPayload = {
  scores: {
    musical_diversity: { score: 0.75, confidence: 'high' as ConfidenceLevel, formula: 'test' },
    exploration_rate: { score: 0.60, confidence: 'medium' as ConfidenceLevel, formula: 'test' },
    temporal_consistency: { score: 0.85, confidence: 'high' as ConfidenceLevel, formula: 'test' },
    mainstream_affinity: { score: 0.70, confidence: 'high' as ConfidenceLevel, formula: 'test' },
    emotional_volatility: { score: 0.50, confidence: 'medium' as ConfidenceLevel, formula: 'test' }
  },
  metadata: {
    tracks_analyzed: 2,
    artists_analyzed: 2,
    genres_found: 4,
    generated_at: '2023-12-01T12:00:00Z'
  }
};

const mockRadarPayload = {
  scores: {
    'Positivity': 80,
    'Energy': 70,
    'Exploration': 60,
    'Nostalgia': 50,
    'Night-Owl': 40
  },
  stats: {
    positivity: { weightedMeanValence: 0.8, percentage: 80 },
    energy: { weightedMeanEnergy: 0.7, weightedMeanTempo: 0.65 },
    exploration: { genreCount: 4, entropy: 1.5, normalizedEntropy: 60 },
    nostalgia: { medianTrackAge: 3 },
    nightOwl: { nightPlayCount: 1, totalPlayCount: 2, percentage: 40 }
  },
  suggestions: [],
  trackCount: 2,
  isDefault: false,
  trends: [],
  topGenre: 'Pop',
  sampleTrack: { title: 'Test Song 1', artist: 'Artist 1' },
  weeks: 4
};

const mockMusicalAgePayload = {
  age: 5,
  era: 'Digital' as const,
  trackCount: 2,
  averageYear: 2019,
  stdDev: 1,
  oldest: { title: 'Test Song 2', artist: 'Artist 2', year: 2019 },
  newest: { title: 'Test Song 1', artist: 'Artist 1', year: 2020 },
  decadeBuckets: [{ decade: 2010, weight: 2 }],
  description: 'Your music taste spans 5 years'
};

const mockMoodRingPayload = {
  emotions: { happy: 5, energetic: 3, chill: 2, melancholy: 0 },
  dominantMood: 'happy',
  distribution: [
    { label: 'happy', pct: 50, color: '#FFD700' },
    { label: 'energetic', pct: 30, color: '#FF6B6B' },
    { label: 'chill', pct: 20, color: '#4ECDC4' },
    { label: 'melancholy', pct: 0, color: '#95A5A6' }
  ]
};

const mockNightOwlPayload = {
  hourlyData: new Array(24).fill(0).map((_, i) => i === 10 ? 1 : i === 15 ? 1 : 0),
  peakHour: 10,
  isNightOwl: false,
  score: 25,
  histogram: new Array(24).fill(0).map((_, i) => i === 10 ? 1 : i === 15 ? 1 : 0)
};

describe('buildHypePayload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock return values
    mockGetPsyPayload.mockReturnValue(mockPsyPayload);
    mockGetRadarPayload.mockReturnValue(mockRadarPayload);
    mockGetMusicalAgePayload.mockReturnValue(mockMusicalAgePayload);
    mockGetMoodRingPayload.mockReturnValue(mockMoodRingPayload);
    mockGetNightOwlPayload.mockReturnValue(mockNightOwlPayload);
  });

  it('should call all selector functions with correct data', () => {
    buildHypePayload(mockInput);

    // Verify psycho and radar selectors are called with original Spotify data
    expect(mockGetPsyPayload).toHaveBeenCalledWith({
      recentTracks: mockRecentTracks,
      topArtists: mockTopArtists
    });

    expect(mockGetRadarPayload).toHaveBeenCalledWith({
      recentTracks: mockRecentTracks,
      topArtists: mockTopArtists
    });

    // Verify insight selectors are called with transformed track data
    expect(mockGetMusicalAgePayload).toHaveBeenCalledWith({
      tracks: expect.arrayContaining([
        expect.objectContaining({
          id: 'track1',
          name: 'Test Song 1',
          played_at: '2023-12-01T10:00:00Z'
        })
      ])
    });

    expect(mockGetMoodRingPayload).toHaveBeenCalledWith({
      tracks: expect.arrayContaining([
        expect.objectContaining({
          id: 'track1',
          name: 'Test Song 1'
        })
      ])
    });

    expect(mockGetNightOwlPayload).toHaveBeenCalledWith({
      tracks: expect.arrayContaining([
        expect.objectContaining({
          id: 'track1',
          played_at: '2023-12-01T10:00:00Z'
        })
      ])
    });
  });

  it('should return a complete HypePayload with all required fields', () => {
    const result = buildHypePayload(mockInput);

    // Verify psycho payload is copied correctly
    expect(result.psycho).toEqual(mockPsyPayload);

    // Verify radar scores are extracted correctly
    expect(result.radar).toEqual({
      'Positivity': 80,
      'Energy': 70,
      'Exploration': 60,
      'Nostalgia': 50,
      'Night-Owl': 40
    });

    // Verify individual insight payloads are copied correctly
    expect(result.musicalAge).toEqual(mockMusicalAgePayload);
    expect(result.moodRing).toEqual(mockMoodRingPayload);
    expect(result.nightOwl).toEqual(mockNightOwlPayload);

    // Verify counts are calculated correctly
    expect(result.counts).toEqual({
      tracks: 2,
      artists: 2,
      genres: 4, // pop, dance, rock, alternative
      weeks: 4
    });

    // Verify metadata fields are extracted from radar payload
    expect(result.topGenre).toBe('Pop');
    expect(result.sampleTrack).toEqual({
      title: 'Test Song 1',
      artist: 'Artist 1'
    });
  });

  it('should handle empty input data gracefully', () => {
    const emptyInput: HypePayloadInput = {
      recentTracks: [],
      topArtists: []
    };

    const result = buildHypePayload(emptyInput);

    // Should still call all selectors
    expect(mockGetPsyPayload).toHaveBeenCalledWith({
      recentTracks: [],
      topArtists: []
    });

    expect(result.counts).toEqual({
      tracks: 0,
      artists: 0,
      genres: 0,
      weeks: 4
    });
  });

  it('should handle radar payload with missing optional fields', () => {
    const incompleteRadarPayload = {
      ...mockRadarPayload,
      topGenre: undefined,
      sampleTrack: undefined,
      weeks: undefined
    };

    mockGetRadarPayload.mockReturnValue(incompleteRadarPayload as any);

    const result = buildHypePayload(mockInput);

    // Should provide fallback values
    expect(result.topGenre).toBe('Pop');
    expect(result.sampleTrack).toEqual({
      title: 'Unknown Track',
      artist: 'Unknown Artist'
    });
    expect(result.counts.weeks).toBe(4);
  });

  it('should transform track data correctly for insight selectors', () => {
    buildHypePayload(mockInput);

    const expectedTransformedTracks = [
      expect.objectContaining({
        id: 'track1',
        name: 'Test Song 1',
        artists: [{ id: 'artist1', name: 'Artist 1' }],
        duration_ms: 180000,
        popularity: 75,
        played_at: '2023-12-01T10:00:00Z',
        release_date: '2020-01-01',
        album: expect.objectContaining({
          release_date: '2020-01-01',
          name: 'Test Album'
        })
      }),
      expect.objectContaining({
        id: 'track2',
        name: 'Test Song 2',
        artists: [{ id: 'artist2', name: 'Artist 2' }],
        duration_ms: 200000,
        popularity: 85,
        played_at: '2023-12-01T15:30:00Z',
        release_date: '2019-06-15'
      })
    ];

    expect(mockGetMusicalAgePayload).toHaveBeenCalledWith({
      tracks: expectedTransformedTracks
    });
  });

  it('should preserve data types correctly', () => {
    const result = buildHypePayload(mockInput);

    // Verify TypeScript interfaces are maintained
    expect(typeof result.psycho).toBe('object');
    expect(typeof result.radar).toBe('object');
    expect(typeof result.musicalAge).toBe('object');
    expect(typeof result.moodRing).toBe('object');
    expect(typeof result.nightOwl).toBe('object');
    expect(typeof result.counts).toBe('object');
    expect(typeof result.topGenre).toBe('string');
    expect(typeof result.sampleTrack).toBe('object');

    // Verify radar scores are numbers
    Object.values(result.radar).forEach(score => {
      expect(typeof score).toBe('number');
    });

    // Verify counts structure
    expect(typeof result.counts.tracks).toBe('number');
    expect(typeof result.counts.artists).toBe('number');
    expect(typeof result.counts.genres).toBe('number');
    expect(typeof result.counts.weeks).toBe('number');
  });
}); 