import { useState, useEffect } from 'react';
import { useMoodData } from './useMoodData';
import { usePsyMetrics } from './usePsyMetrics';

interface PlaylistTrack {
  id: string;
  name: string;
  artists: string[];
  preview_url: string | null;
  albumColor?: string;
}

interface PlaylistRecommendation {
  id: string;
  name: string;
  description: string;
  moodTag: string;
  subtext: string;
  tracks: PlaylistTrack[];
  spotifyUrl: string;
  coverImage?: string;
}

interface EmotionalState {
  state: 'positive' | 'neutral' | 'low';
  averageScore: number;
  emoji: string;
}

interface WellnessPlaylistData {
  emotionalState: EmotionalState;
  playlists: PlaylistRecommendation[];
  insight: string;
}

interface UseWellnessPlaylistsReturn {
  data: WellnessPlaylistData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Personality determination logic (matching the one from MentalHealthInsights)
function determinePersonalityType(psyPayload: any): string {
  if (!psyPayload) return 'Balanced Listener';

  const scores = psyPayload.scores;
  const types: string[] = [];

  // Convert 0-1 range to percentage and apply thresholds
  const musicalDiversity = scores.musical_diversity.score * 100;
  const explorationRate = scores.exploration_rate.score * 100;
  const temporalConsistency = scores.temporal_consistency.score * 100;
  const mainstreamAffinity = scores.mainstream_affinity.score * 100;
  const emotionalVolatility = scores.emotional_volatility.score * 100;

  if (musicalDiversity >= 60) types.push('Open-minded');
  if (explorationRate >= 60) types.push('Explorer');
  if (temporalConsistency >= 60) types.push('Consistent Listener');
  if (mainstreamAffinity >= 60) types.push('Mainstream Listener');
  
  if (emotionalVolatility >= 60) {
    types.push('Emotionally Volatile');
  } else if (emotionalVolatility <= 40) {
    types.push('Emotionally Stable');
  }

  // Return dominant type or balanced listener
  return types.length > 0 ? types[0] : 'Balanced Listener';
}

export function useWellnessPlaylists(): UseWellnessPlaylistsReturn {
  const [data, setData] = useState<WellnessPlaylistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Get mood data and personality
  const { moodData, loading: moodLoading } = useMoodData();
  const { payload: psyPayload, loading: psyLoading } = usePsyMetrics();

  const fetchWellnessPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);

      // Wait until both mood and personality data are ready
      if (moodLoading || psyLoading) {
        // Keep skeleton visible until real data is available
        if (!hasLoadedOnce) {
          setLoading(true);
        }
        return;
      }

      if (moodData.length === 0) {
        // No mood data yet, avoid showing stale recommendations
        if (!hasLoadedOnce) {
          setLoading(true);
        }
        return;
      }

      // Get personality type
      const personalityType = determinePersonalityType(psyPayload);

      // Fetch additional Spotify data in parallel
      const [topArtistsRes, recentTracksRes] = await Promise.all([
        fetch('/api/spotify/top-artists?time_range=medium_term').catch(() => null),
        fetch('/api/spotify/recent-tracks').catch(() => null),
      ]);

      let topGenres: string[] = [];
      let topArtists: Array<{ id: string; name: string }> = [];
      let recentTracks: Array<{ id: string; name: string }> = [];

      // Process top artists data
      if (topArtistsRes?.ok) {
        const topArtistsData = await topArtistsRes.json();
        topArtists = topArtistsData.artists?.slice(0, 3).map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })) || [];

        // Extract genres from top artists
        const genreSet = new Set<string>();
        topArtistsData.artists?.forEach((artist: any) => {
          artist.genres?.forEach((genre: string) => genreSet.add(genre));
        });
        topGenres = Array.from(genreSet).slice(0, 3);
      }

      // Process recent tracks data  
      if (recentTracksRes?.ok) {
        const recentTracksData = await recentTracksRes.json();
        recentTracks = recentTracksData.items?.slice(0, 2).map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
        })) || [];
      }

      // Call wellness playlists API
      const response = await fetch('/api/spotify/wellness-playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodData: moodData.map(day => ({
            date: day.date,
            moodScore: day.moodScore,
          })),
          personalityType,
          topGenres,
          topArtists,
          recentTracks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const wellnessData = await response.json();
      setData(wellnessData);
      setHasLoadedOnce(true);

    } catch (err) {
      console.error('Failed to fetch wellness playlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wellness playlists');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies are ready
  useEffect(() => {
    if (!psyLoading) {
      fetchWellnessPlaylists();
    }
  }, [moodData.length, moodLoading, psyLoading, psyPayload]);

  const refetch = () => {
    fetchWellnessPlaylists();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
} 