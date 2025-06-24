import { useState, useEffect } from 'react';
import { useSpotify } from './useSpotify';
import { getPsyPayload } from '../features/psycho/getPsyPayload';
import { PsyPayload } from '../features/psycho/types';

interface UsePsyMetricsResult {
  payload: PsyPayload | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

export function usePsyMetrics(): UsePsyMetricsResult {
  const [payload, setPayload] = useState<PsyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected, getRecentTracks, getTopArtists } = useSpotify();

  useEffect(() => {
    if (!connected) {
      setPayload(null);
      setLoading(false);
      setError('Spotify not connected');
      return;
    }

    async function fetchPsyMetrics() {
      try {
        setLoading(true);
        setError(null);

        console.log('🧠 usePsyMetrics: Fetching Spotify data...');

        // Fetch data in parallel
        const [recentTracks, topArtists] = await Promise.all([
          getRecentTracks(),
          getTopArtists('medium_term')
        ]);

        console.log('🧠 usePsyMetrics: Data fetched', {
          recentTracksCount: recentTracks.length,
          topArtistsCount: topArtists.length
        });

        // Compute psycho-analysis metrics
        const psyPayload = getPsyPayload({
          recentTracks,
          topArtists
        });

        console.log('🧠 usePsyMetrics: Metrics computed', {
          musical_diversity: psyPayload.scores.musical_diversity.score,
          exploration_rate: psyPayload.scores.exploration_rate.score,
          temporal_consistency: psyPayload.scores.temporal_consistency.score,
          mainstream_affinity: psyPayload.scores.mainstream_affinity.score,
          genres_found: psyPayload.metadata.genres_found
        });

        setPayload(psyPayload);
      } catch (err) {
        console.error('🧠 usePsyMetrics: Error computing metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to compute psycho-analysis');
        setPayload(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPsyMetrics();
  }, [connected, getRecentTracks, getTopArtists]);

  return {
    payload,
    loading,
    error,
    isFallback: false // Real data, not fallback
  };
} 