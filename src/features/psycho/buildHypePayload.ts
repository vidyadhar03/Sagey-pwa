import { PsyPayload } from './types';
import { RadarAxis } from '../radar/types';
import { getRadarPayload } from '../radar/getRadarPayload';
import { getMusicalAgePayload, getMoodRingPayload, getNightOwlPayload, type MusicalAgePayload, type MoodRingPayload, type NightOwlPayload } from '../../utils/insightSelectors';
import { useSpotify } from '../../hooks/useSpotify';
import { getPsyPayload } from './getPsyPayload';

// Spotify data types from useSpotify hook
import type { RecentlyPlayedTrack, SpotifyArtist, SpotifyTrack } from '../../hooks/useSpotify';

export interface HypePayload {
  psycho: PsyPayload;
  radar: Record<RadarAxis, number>;  // positivity, energy, exploration, nostalgia, nightOwl (0-100)
  musicalAge: MusicalAgePayload;
  nightOwl: NightOwlPayload;
  moodRing: MoodRingPayload;
  counts: { tracks: number; artists: number; genres: number; weeks: number };
  topGenre: string;
  sampleTrack: { title: string; artist: string };
  variant?: "witty" | "poetic"; // Optional variant for tone switching
}

/**
 * Input data structure for buildHypePayload
 */
export interface HypePayloadInput {
  recentTracks: RecentlyPlayedTrack[];
  topArtists: SpotifyArtist[];
}

/**
 * Builds a unified HypePayload by aggregating data from all existing selectors
 */
export function buildHypePayload(input: HypePayloadInput): HypePayload {
  const { recentTracks, topArtists } = input;

  // 1. Compute psycho-analysis payload
  const psycho = getPsyPayload({ recentTracks, topArtists });

  // 2. Compute radar payload and extract scores
  const radarPayload = getRadarPayload({ recentTracks, topArtists });
  const radar = radarPayload.scores;

  // 3. Transform recent tracks to the format expected by insight selectors
  const tracksForInsights = recentTracks.map(item => ({
    ...item.track,
    played_at: item.played_at,
    // Include common fields that insight selectors expect
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists,
    duration_ms: item.track.duration_ms,
    popularity: item.track.popularity,
    release_date: item.track.album?.release_date,
    album: item.track.album
  }));

  // 4. Compute musical age payload
  const musicalAge = getMusicalAgePayload({ tracks: tracksForInsights });

  // 5. Compute mood ring payload
  const moodRing = getMoodRingPayload({ tracks: tracksForInsights });

  // 6. Compute night owl payload
  const nightOwl = getNightOwlPayload({ tracks: tracksForInsights });

  // 7. Calculate counts and metadata
  const genreSet = new Set<string>();
  topArtists.forEach(artist => {
    if (artist.genres && Array.isArray(artist.genres)) {
      artist.genres.forEach(genre => genreSet.add(genre));
    }
  });

  const counts = {
    tracks: recentTracks.length,
    artists: topArtists.length, 
    genres: genreSet.size,
    weeks: radarPayload.weeks || 4
  };

  // 8. Extract top genre and sample track from radar payload
  const topGenre = radarPayload.topGenre || 'Pop';
  const sampleTrack = radarPayload.sampleTrack || { 
    title: 'Unknown Track', 
    artist: 'Unknown Artist' 
  };

  return {
    psycho,
    radar,
    musicalAge,
    nightOwl,
    moodRing,
    counts,
    topGenre,
    sampleTrack
  };
} 