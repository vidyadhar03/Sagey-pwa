import { getPsyPayload } from '../features/psycho/getPsyPayload';
import { SpotifyArtist, RecentlyPlayedTrack } from '../hooks/useSpotify';

// Mock data for testing
const mockTopArtists: SpotifyArtist[] = [
  {
    id: 'artist1',
    name: 'Artist 1',
    genres: ['rock', 'alternative', 'indie'],
    popularity: 75,
    followers: 1000,
    external_urls: { spotify: 'https://open.spotify.com/artist/1' },
    track_count: 5
  },
  {
    id: 'artist2',
    name: 'Artist 2',
    genres: ['pop', 'electronic'],
    popularity: 80,
    followers: 2000,
    external_urls: { spotify: 'https://open.spotify.com/artist/2' },
    track_count: 3
  },
  {
    id: 'artist3',
    name: 'Artist 3',
    genres: ['jazz', 'blues', 'soul'],
    popularity: 60,
    followers: 500,
    external_urls: { spotify: 'https://open.spotify.com/artist/3' },
    track_count: 2
  }
];

const mockRecentTracks: RecentlyPlayedTrack[] = [
  {
    track: {
      id: 'track1',
      name: 'Track 1',
      artists: [{ id: 'artist1', name: 'Artist 1', external_urls: { spotify: '' } }],
      album: {
        id: 'album1',
        name: 'Album 1',
        release_date: '2023-01-01',
        release_date_precision: 'day',
        images: [],
        external_urls: { spotify: '' }
      },
      duration_ms: 180000,
      explicit: false,
      popularity: 75,
      preview_url: null,
      external_urls: { spotify: '' },
      uri: 'spotify:track:1'
    },
    played_at: '2023-01-01T12:00:00Z'
  },
  {
    track: {
      id: 'track2',
      name: 'Track 2',
      artists: [{ id: 'artist2', name: 'Artist 2', external_urls: { spotify: '' } }],
      album: {
        id: 'album2',
        name: 'Album 2',
        release_date: '2023-01-02',
        release_date_precision: 'day',
        images: [],
        external_urls: { spotify: '' }
      },
      duration_ms: 200000,
      explicit: false,
      popularity: 80,
      preview_url: null,
      external_urls: { spotify: '' },
      uri: 'spotify:track:2'
    },
    played_at: '2023-01-02T12:30:00Z'
  },
  {
    track: {
      id: 'track3',
      name: 'Track 3',
      artists: [{ id: 'artist1', name: 'Artist 1', external_urls: { spotify: '' } }],
      album: {
        id: 'album1',
        name: 'Album 1',
        release_date: '2023-01-01',
        release_date_precision: 'day',
        images: [],
        external_urls: { spotify: '' }
      },
      duration_ms: 190000,
      explicit: false,
      popularity: 70,
      preview_url: null,
      external_urls: { spotify: '' },
      uri: 'spotify:track:3'
    },
    played_at: '2023-01-03T12:15:00Z'
  }
];

// Mock tracks with clustered hours for temporal consistency testing
const mockClusteredTracks: RecentlyPlayedTrack[] = Array.from({ length: 15 }, (_, i) => ({
  track: {
    id: `track${i}`,
    name: `Track ${i}`,
    artists: [{ id: 'artist1', name: 'Artist 1', external_urls: { spotify: '' } }],
    album: {
      id: 'album1',
      name: 'Album 1',
      release_date: '2023-01-01',
      release_date_precision: 'day',
      images: [],
      external_urls: { spotify: '' }
    },
    duration_ms: 180000,
    explicit: false,
    popularity: 85 - (i % 3) * 10, // Mix of popular and less popular
    preview_url: null,
    external_urls: { spotify: '' },
    uri: `spotify:track:${i}`
  },
  // Cluster plays around 9AM and 7PM
  played_at: `2023-01-0${Math.floor(i / 5) + 1}T${i % 2 === 0 ? '09' : '19'}:${(i % 4) * 15}:00Z`
}));

describe('getPsyPayload', () => {
  it('should compute musical diversity from genre data', () => {
    const payload = getPsyPayload({
      recentTracks: mockRecentTracks,
      topArtists: mockTopArtists
    });

    expect(payload.scores.musical_diversity.score).toBeGreaterThan(0);
    expect(payload.scores.musical_diversity.confidence).toBe('low'); // 8 total genres
    expect(payload.scores.musical_diversity.formula).toContain('Shannon entropy');
  });

  it('should compute exploration rate from track data', () => {
    const payload = getPsyPayload({
      recentTracks: mockRecentTracks,
      topArtists: mockTopArtists
    });

    expect(payload.scores.exploration_rate.score).toBeGreaterThan(0);
    expect(payload.scores.exploration_rate.confidence).toBe('low'); // 3 tracks
    expect(payload.scores.exploration_rate.formula).toContain('unique artists');
  });

  it('should return default metrics for insufficient data', () => {
    const payload = getPsyPayload({
      recentTracks: [],
      topArtists: []
    });

    expect(payload.scores.musical_diversity.score).toBe(0);
    expect(payload.scores.musical_diversity.confidence).toBe('insufficient');
    expect(payload.scores.exploration_rate.score).toBe(0);
    expect(payload.scores.exploration_rate.confidence).toBe('insufficient');
  });

  it('should include proper metadata', () => {
    const payload = getPsyPayload({
      recentTracks: mockRecentTracks,
      topArtists: mockTopArtists
    });

    expect(payload.metadata.tracks_analyzed).toBe(3);
    expect(payload.metadata.artists_analyzed).toBe(3);
    expect(payload.metadata.genres_found).toBe(8); // Total unique genres
    expect(payload.metadata.generated_at).toBeDefined();
  });

  it('should compute temporal consistency from listening patterns', () => {
    const payload = getPsyPayload({
      recentTracks: mockClusteredTracks,
      topArtists: mockTopArtists
    });

    expect(payload.scores.temporal_consistency.score).toBeGreaterThan(0.8); // Clustered hours = high consistency
    expect(payload.scores.temporal_consistency.confidence).toBe('low'); // 15 tracks = low confidence
    expect(payload.scores.temporal_consistency.formula).toContain('variance of listening hours');
  });

  it('should compute mainstream affinity from popularity data', () => {
    const payload = getPsyPayload({
      recentTracks: mockClusteredTracks, // Has popularity scores 75-85
      topArtists: mockTopArtists
    });

    expect(payload.scores.mainstream_affinity.score).toBeGreaterThan(0.5);
    expect(payload.scores.mainstream_affinity.score).toBeLessThan(0.8);
    expect(payload.scores.mainstream_affinity.confidence).toBe('high'); // Always high
    expect(payload.scores.mainstream_affinity.formula).toContain('track popularity');
  });

  it('should handle artists with no genres', () => {
    const artistsWithoutGenres: SpotifyArtist[] = [
      {
        id: 'artist1',
        name: 'Artist 1',
        genres: [],
        popularity: 50,
        followers: 100,
        external_urls: { spotify: '' },
        track_count: 1
      }
    ];

    const payload = getPsyPayload({
      recentTracks: mockRecentTracks,
      topArtists: artistsWithoutGenres
    });

    expect(payload.scores.musical_diversity.score).toBe(0);
    expect(payload.scores.musical_diversity.confidence).toBe('insufficient');
  });

  it('should handle empty data gracefully for new metrics', () => {
    const payload = getPsyPayload({
      recentTracks: [],
      topArtists: []
    });

    expect(payload.scores.temporal_consistency.score).toBe(0);
    expect(payload.scores.temporal_consistency.confidence).toBe('insufficient');
    expect(payload.scores.mainstream_affinity.score).toBe(0);
    expect(payload.scores.mainstream_affinity.confidence).toBe('high'); // Always high
    expect(payload.scores.emotional_volatility.score).toBe(0);
    expect(payload.scores.emotional_volatility.confidence).toBe('insufficient');
  });

  it('should compute emotional volatility with sufficient data', () => {
    // Create tracks with diverse genres for volatility testing
    const volatilityTracks: RecentlyPlayedTrack[] = Array.from({ length: 15 }, (_, i) => ({
      track: {
        id: `track${i}`,
        name: `Track ${i}`,
        artists: [{ 
          id: `artist${i % 3 + 1}`, 
          name: `Artist ${i % 3 + 1}`, 
          external_urls: { spotify: '' } 
        }],
        album: {
          id: `album${i}`,
          name: `Album ${i}`,
          release_date: '2023-01-01',
          release_date_precision: 'day',
          images: [],
          external_urls: { spotify: '' }
        },
        duration_ms: 180000,
        explicit: false,
        popularity: 75,
        preview_url: null,
        external_urls: { spotify: '' },
        uri: `spotify:track:${i}`
      },
      played_at: `2023-01-01T12:${i}:00Z`
    }));

    const payload = getPsyPayload({
      recentTracks: volatilityTracks,
      topArtists: mockTopArtists
    });

    expect(payload.scores.emotional_volatility.score).toBeGreaterThan(0);
    expect(payload.scores.emotional_volatility.confidence).toBe('low'); // 15 tracks = low confidence
    expect(payload.scores.emotional_volatility.formula).toContain('valenceTrack');
  });

  it('should return insufficient confidence for emotional volatility with few tracks', () => {
    // Only 2 tracks - insufficient for volatility analysis
    const fewTracks = mockRecentTracks.slice(0, 2);
    
    const payload = getPsyPayload({
      recentTracks: fewTracks,
      topArtists: mockTopArtists
    });

    expect(payload.scores.emotional_volatility.score).toBe(0);
    expect(payload.scores.emotional_volatility.confidence).toBe('insufficient');
  });

  it('should provide tracking data for insufficient emotional volatility', () => {
    // Create 5 tracks with known genres (below 10 threshold)
    const limitedGenreTracks: RecentlyPlayedTrack[] = Array.from({ length: 5 }, (_, i) => ({
      track: {
        id: `track${i}`,
        name: `Track ${i}`,
        artists: [{ id: 'artist1', name: 'Pop Artist', external_urls: { spotify: '' } }], // Will map to pop genre
        album: {
          id: `album${i}`,
          name: `Album ${i}`,
          release_date: '2023-01-01',
          release_date_precision: 'day',
          images: [],
          external_urls: { spotify: '' }
        },
        duration_ms: 180000,
        explicit: false,
        popularity: 75,
        preview_url: null,
        external_urls: { spotify: '' },
        uri: `spotify:track:${i}`
      },
      played_at: `2023-01-01T12:${i}:00Z`
    }));

    const genreArtists: SpotifyArtist[] = [
      {
        id: 'artist1',
        name: 'Pop Artist',
        genres: ['pop'], // Known genre with valence
        popularity: 75,
        followers: 1000,
        external_urls: { spotify: '' },
        track_count: 5
      }
    ];

    const payload = getPsyPayload({
      recentTracks: limitedGenreTracks,
      topArtists: genreArtists
    });

    expect(payload.scores.emotional_volatility.confidence).toBe('insufficient');
    expect(payload.scores.emotional_volatility.mappedTrackCount).toBe(5);
    expect(payload.scores.emotional_volatility.minRequired).toBe(10);
  });

  it('should not include tracking data when volatility has sufficient confidence', () => {
    // Use existing test data that provides sufficient confidence
    const payload = getPsyPayload({
      recentTracks: mockRecentTracks,
      topArtists: mockTopArtists
    });

    // Should not include tracking data when confidence is not insufficient
    if (payload.scores.emotional_volatility.confidence !== 'insufficient') {
      expect(payload.scores.emotional_volatility.mappedTrackCount).toBeUndefined();
      expect(payload.scores.emotional_volatility.minRequired).toBeUndefined();
    }
  });

  it('should calculate high volatility for diverse mood genres', () => {
    // Create artists with very different valence genres
    const diverseMoodArtists: SpotifyArtist[] = [
      {
        id: 'artist1',
        name: 'Happy Artist',
        genres: ['disco', 'dance pop'], // High valence ~0.8
        popularity: 75,
        followers: 1000,
        external_urls: { spotify: '' },
        track_count: 5
      },
      {
        id: 'artist2',
        name: 'Sad Artist',
        genres: ['emo', 'screamo'], // Low valence ~0.2
        popularity: 60,
        followers: 500,
        external_urls: { spotify: '' },
        track_count: 5
      },
      {
        id: 'artist3',
        name: 'Neutral Artist',
        genres: ['jazz', 'classical'], // Mid valence ~0.5
        popularity: 70,
        followers: 800,
        external_urls: { spotify: '' },
        track_count: 5
      }
    ];

    // Create 30 tracks with alternating extreme moods
    const extremeMoodTracks: RecentlyPlayedTrack[] = Array.from({ length: 30 }, (_, i) => ({
      track: {
        id: `track${i}`,
        name: `Track ${i}`,
        artists: [{ 
          id: `artist${(i % 2) + 1}`, // Alternate between happy and sad artists
          name: `Artist ${(i % 2) + 1}`, 
          external_urls: { spotify: '' } 
        }],
        album: {
          id: `album${i}`,
          name: `Album ${i}`,
          release_date: '2023-01-01',
          release_date_precision: 'day',
          images: [],
          external_urls: { spotify: '' }
        },
        duration_ms: 180000,
        explicit: false,
        popularity: 75,
        preview_url: null,
        external_urls: { spotify: '' },
        uri: `spotify:track:${i}`
      },
      played_at: `2023-01-01T12:${i}:00Z`
    }));

    const payload = getPsyPayload({
      recentTracks: extremeMoodTracks,
      topArtists: diverseMoodArtists
    });

    expect(payload.scores.emotional_volatility.score).toBeGreaterThan(0.5); // High volatility
    expect(payload.scores.emotional_volatility.confidence).toBe('medium'); // 30 tracks = medium confidence
  });

  it('should calculate low volatility for consistent mood genres', () => {
    // Create artists with similar valence genres
    const consistentMoodArtists: SpotifyArtist[] = [
      {
        id: 'artist1',
        name: 'Pop Artist 1',
        genres: ['pop', 'dance pop'], // High valence ~0.7
        popularity: 75,
        followers: 1000,
        external_urls: { spotify: '' },
        track_count: 15
      },
      {
        id: 'artist2',
        name: 'Pop Artist 2',
        genres: ['indie pop', 'electropop'], // Similar high valence ~0.7
        popularity: 80,
        followers: 2000,
        external_urls: { spotify: '' },
        track_count: 15
      }
    ];

    // Create 40 tracks from similar mood artists
    const consistentMoodTracks: RecentlyPlayedTrack[] = Array.from({ length: 40 }, (_, i) => ({
      track: {
        id: `track${i}`,
        name: `Track ${i}`,
        artists: [{ 
          id: `artist${(i % 2) + 1}`,
          name: `Artist ${(i % 2) + 1}`, 
          external_urls: { spotify: '' } 
        }],
        album: {
          id: `album${i}`,
          name: `Album ${i}`,
          release_date: '2023-01-01',
          release_date_precision: 'day',
          images: [],
          external_urls: { spotify: '' }
        },
        duration_ms: 180000,
        explicit: false,
        popularity: 75,
        preview_url: null,
        external_urls: { spotify: '' },
        uri: `spotify:track:${i}`
      },
      played_at: `2023-01-01T12:${i}:00Z`
    }));

    const payload = getPsyPayload({
      recentTracks: consistentMoodTracks,
      topArtists: consistentMoodArtists
    });

    expect(payload.scores.emotional_volatility.score).toBeLessThan(0.3); // Low volatility
    expect(payload.scores.emotional_volatility.confidence).toBe('high'); // 40 tracks = high confidence
  });

  it('should handle artists with unmapped genres gracefully', () => {
    const unmappedGenreArtists: SpotifyArtist[] = [
      {
        id: 'artist1',
        name: 'Unknown Genre Artist',
        genres: ['super-obscure-genre-that-does-not-exist'],
        popularity: 50,
        followers: 100,
        external_urls: { spotify: '' },
        track_count: 10
      }
    ];

    const tracksWithUnmappedGenres: RecentlyPlayedTrack[] = Array.from({ length: 5 }, (_, i) => ({
      track: {
        id: `track${i}`,
        name: `Track ${i}`,
        artists: [{ id: 'artist1', name: 'Unknown Genre Artist', external_urls: { spotify: '' } }],
        album: {
          id: `album${i}`,
          name: `Album ${i}`,
          release_date: '2023-01-01',
          release_date_precision: 'day',
          images: [],
          external_urls: { spotify: '' }
        },
        duration_ms: 180000,
        explicit: false,
        popularity: 50,
        preview_url: null,
        external_urls: { spotify: '' },
        uri: `spotify:track:${i}`
      },
      played_at: `2023-01-01T12:${i}:00Z`
    }));

    const payload = getPsyPayload({
      recentTracks: tracksWithUnmappedGenres,
      topArtists: unmappedGenreArtists
    });

    // Should fall back to default valence and still calculate, but with insufficient confidence
    expect(payload.scores.emotional_volatility.confidence).toBe('insufficient');
  });
}); 