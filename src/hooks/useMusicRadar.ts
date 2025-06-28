"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from './useSpotify';
import { getRadarPayload } from '../features/radar/getRadarPayload';
import type { RadarPayload } from '../features/radar/types';
import { useRadarHype } from './useRadarHype';
import type { RecentlyPlayedTrack, SpotifyArtist } from './useSpotify';

type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

// Simple in-memory cache
const cache = new Map<string, { payload: RadarPayload; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default/fallback payload when data is unavailable
const DEFAULT_PAYLOAD: RadarPayload = {
  scores: { 'Positivity': 0, 'Energy': 0, 'Exploration': 0, 'Nostalgia': 0, 'Night-Owl': 0 },
  stats: {
    positivity: { weightedMeanValence: 0, percentage: 0 },
    energy: { weightedMeanEnergy: 0, weightedMeanTempo: 0 },
    exploration: { genreCount: 0, entropy: 0, normalizedEntropy: 0 },
    nostalgia: { medianTrackAge: 0 },
    nightOwl: { nightPlayCount: 0, totalPlayCount: 0, percentage: 0 },
  },
  suggestions: [],
  trackCount: 0,
  isDefault: true,
  trends: [],
  topGenre: 'Pop',
  sampleTrack: { title: 'Unknown Track', artist: 'Unknown Artist' },
  weeks: 4,
};

/**
 * Fetches and computes the Music Radar data.
 */
const radarFetcher = async (
  getRecentTracks: () => Promise<RecentlyPlayedTrack[]>,
  getTopArtists: (term: SpotifyTimeRange) => Promise<SpotifyArtist[]>
): Promise<RadarPayload> => {
  console.log('📡 Fetching data for Music Radar...');

  const [recentTracks, topArtists] = await Promise.all([
    getRecentTracks(),
    getTopArtists('medium_term'),
  ]);

  if (recentTracks.length === 0 || topArtists.length === 0) {
    console.warn('⚠️ Insufficient data for Radar, returning default.');
    return { ...DEFAULT_PAYLOAD };
  }

  const payload = getRadarPayload({
    recentTracks,
    topArtists,
  });

  console.log('✅ Music Radar payload calculated.', payload);
  return payload;
};

/**
 * Custom hook to get Music Radar insights using a simple, dependency-free fetch/cache mechanism.
 */
export function useMusicRadar() {
  const { connected, getRecentTracks, getTopArtists } = useSpotify();
  // Initialise from cache to avoid loading flash when user revisits Home tab
  const cachedInitial = cache.get('music-radar');
  const [payload, setPayload] = useState<RadarPayload>(cachedInitial ? cachedInitial.payload : { ...DEFAULT_PAYLOAD });
  const [isLoading, setIsLoading] = useState(!cachedInitial);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(!!cachedInitial);

  // Fetch AI copy once the main payload is available and not the default
  const ai = useRadarHype(payload, !payload.isDefault);

  const fetchAndSetData = useCallback(async () => {
    if (!connected) {
      // Only show fallback data if we haven't loaded real data before
      if (!hasLoadedOnce) {
        setPayload({ ...DEFAULT_PAYLOAD });
      }
      setIsLoading(false);
      return;
    }

    const cacheKey = 'music-radar';
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION)) {
      console.log('📦 Using cached Music Radar data.');
      setPayload(cachedEntry.payload);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const data = await radarFetcher(getRecentTracks, getTopArtists);
      setPayload(data);
      setHasLoadedOnce(true);
      cache.set(cacheKey, { payload: data, timestamp: Date.now() });
    } catch (err) {
      console.error('💥 Failed to fetch Music Radar data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Keep stale data if available, otherwise fallback to default (only if never loaded before)
      if (!cache.has(cacheKey) && !hasLoadedOnce) {
        setPayload({ ...DEFAULT_PAYLOAD });
      }
    } finally {
      setIsLoading(false);
    }
  }, [connected, getRecentTracks, getTopArtists, hasLoadedOnce]);

  useEffect(() => {
    fetchAndSetData();

    // Set up an interval for periodic re-fetching, similar to SWR's refreshInterval
    const interval = setInterval(fetchAndSetData, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchAndSetData]);
  
  return {
    payload,
    isLoading,
    error,
    ai,
  };
} 