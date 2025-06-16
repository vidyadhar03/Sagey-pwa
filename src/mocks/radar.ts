import type { SpotifyArtist, AudioFeatures } from '../hooks/useSpotify';

// Helper to generate a date string for X days ago
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Helper for a night-time track played 2 days ago
const nightTimeDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    date.setHours(23, 0, 0, 0);
    return date.toISOString();
}

export const mockRecentTracks: any[] = [
  { // Played 1 day ago -> high recency weight
    played_at: daysAgo(1),
    _test_hour: 14, // Afternoon
    track: {
      id: 'track1', name: 'Happy Song', artist: 'Artist A', duration_ms: 180000,
      album: { name: 'Album 1', release_date: '2023-01-01' },
      external_urls: { spotify: '' },
    },
  },
  { // Played 20 days ago -> low recency weight
    played_at: daysAgo(20),
    _test_hour: 9, // Morning
    track: {
      id: 'track2', name: 'Nostalgic Tune', artist: 'Artist B', duration_ms: 240000,
      album: { name: 'Oldies', release_date: '1985-05-10' },
      external_urls: { spotify: '' },
    },
  },
  { // Played at night
    played_at: nightTimeDate(),
    _test_hour: 23, // Night
    track: {
      id: 'track3', name: 'Night Drive', artist: 'Artist C', duration_ms: 200000,
      album: { name: 'After Dark', release_date: '2021-11-20' },
      external_urls: { spotify: '' },
    }
  },
];

export const mockTopArtists: SpotifyArtist[] = [
  { // Pop artist - contributes to low exploration
    id: 'artist1', name: 'Artist A', genres: ['pop', 'dance pop'], popularity: 80, followers: 1000000, external_urls: { spotify: '' }, image_url: '', track_count: 50
  },
  { // Rock artist
    id: 'artist2', name: 'Artist B', genres: ['rock', 'alternative rock'], popularity: 75, followers: 500000, external_urls: { spotify: '' }, image_url: '', track_count: 30
  },
  { // Electronic artist - high diversity
    id: 'artist3', name: 'Artist C', genres: ['electronica', 'techno', 'house'], popularity: 70, followers: 250000, external_urls: { spotify: '' }, image_url: '', track_count: 70
  },
];

export const mockAudioFeatures: AudioFeatures[] = [
  { // For track1: Happy Song - high valence, high energy
    id: 'track1', valence: 0.9, energy: 0.8, tempo: 120, danceability: 0.7, acousticness: 0.1, instrumentalness: 0, mood_score: 0.85
  },
  { // For track2: Nostalgic Tune - low valence, low energy
    id: 'track2', valence: 0.2, energy: 0.3, tempo: 90, danceability: 0.4, acousticness: 0.8, instrumentalness: 0.1, mood_score: 0.25
  },
  { // For track3: Night Drive - mid valence, high energy
    id: 'track3', valence: 0.5, energy: 0.9, tempo: 140, danceability: 0.6, acousticness: 0.2, instrumentalness: 0.5, mood_score: 0.7
  },
];

export const mockRadarPayload = {
  tracks: [
    {
      id: 'track1',
      name: 'Happy Song',
      artist: 'Artist A',
      duration_ms: 180000,
      album: { name: 'Album 1', release_date: '2023-01-01' },
      external_urls: { spotify: '' },
    },
    {
      id: 'track2',
      name: 'Nostalgic Tune',
      artist: 'Artist B',
      duration_ms: 240000,
      album: { name: 'Oldies', release_date: '1985-05-10' },
      external_urls: { spotify: '' },
    },
    {
      id: 'track3',
      name: 'Night Drive',
      artist: 'Artist C',
      duration_ms: 200000,
      album: { name: 'After Dark', release_date: '2021-11-20' },
      external_urls: { spotify: '' },
    },
  ],
  trends: [
    { axis: 'Positivity', value: 0.05 },
    { axis: 'Energy', value: -0.02 },
    { axis: 'Exploration', value: 0.15 },
    { axis: 'Nostalgia', value: 0.01 },
    { axis: 'Night-Owl', value: -0.08 },
  ],
}; 