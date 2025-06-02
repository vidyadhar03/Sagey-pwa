"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from './useSpotify';

interface ListeningStats {
  todayMinutes: number;
  todayComparison: string;
  topGenre: string;
  topGenrePercentage: number;
  totalTracks: number;
  uniqueArtists: number;
  loading: boolean;
  error: string | null;
}

interface GenreCount {
  [key: string]: number;
}

// Type to handle both SpotifyTrack interface and raw API responses
type TrackData = {
  artist?: string;
  duration_ms?: number;
  played_at?: string;
  track?: {
    artists?: Array<{ name: string }>;
    duration_ms?: number;
  };
  artists?: Array<{ name: string }>;
};

export function useSpotifyInsights() {
  const { connected, getRecentTracks, getTopArtists, getTopTracks } = useSpotify();
  const [insights, setInsights] = useState<ListeningStats>({
    todayMinutes: 0,
    todayComparison: '+0%',
    topGenre: 'Unknown',
    topGenrePercentage: 0,
    totalTracks: 0,
    uniqueArtists: 0,
    loading: true,
    error: null
  });

  const calculateListeningTime = useCallback((tracks: any[]) => {
    if (!tracks || tracks.length === 0) {
      return { todayMinutes: 0, comparison: '+0%' };
    }

    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    let todayTracks = 0;
    let yesterdayTracks = 0;
    let totalDuration = 0;

    tracks.forEach(track => {
      if (track.played_at) {
        const playedDate = new Date(track.played_at).toDateString();
        const duration = track.duration_ms || 180000; // Default 3 minutes
        
        if (playedDate === today) {
          todayTracks++;
          totalDuration += duration;
        } else if (playedDate === yesterday) {
          yesterdayTracks++;
        }
      }
    });

    // Convert to minutes
    const todayMinutes = Math.round(totalDuration / (1000 * 60));
    
    // Calculate comparison with yesterday
    let comparison = '+0%';
    if (yesterdayTracks > 0) {
      const percentChange = Math.round(((todayTracks - yesterdayTracks) / yesterdayTracks) * 100);
      comparison = percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
    } else if (todayTracks > 0) {
      comparison = '+100%';
    }

    return { todayMinutes, comparison };
  }, []);

  const calculateTopGenre = useCallback(async () => {
    try {
      console.log('🎵 Calculating top genre...');
      
      // Get top artists for genre analysis
      const topArtists = await getTopArtists('short_term');
      console.log('🎤 Top artists data:', topArtists);
      
      if (!topArtists || topArtists.length === 0) {
        console.log('⚠️ No top artists data found');
        return { topGenre: 'Unknown', topGenrePercentage: 0 };
      }

      // Count genres from top artists
      const genreCounts: GenreCount = {};
      let totalGenres = 0;

      topArtists.forEach(artist => {
        if (artist.genres && artist.genres.length > 0) {
          artist.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            totalGenres++;
          });
        }
      });

      console.log('🏷️ Genre counts:', genreCounts, 'Total:', totalGenres);

      if (totalGenres === 0) {
        return { topGenre: 'Mixed', topGenrePercentage: 0 };
      }

      // Find most common genre
      const sortedGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a);

      if (sortedGenres.length === 0) {
        return { topGenre: 'Mixed', topGenrePercentage: 0 };
      }

      const [topGenre, count] = sortedGenres[0];
      const percentage = Math.round((count / totalGenres) * 100);

      // Clean up genre names for display
      const cleanGenreName = topGenre
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      console.log('🎯 Top genre result:', { topGenre: cleanGenreName, percentage });

      return { 
        topGenre: cleanGenreName, 
        topGenrePercentage: percentage 
      };
    } catch (error) {
      console.error('❌ Failed to calculate top genre:', error);
      return { topGenre: 'Unknown', topGenrePercentage: 0 };
    }
  }, [getTopArtists]);

  const loadInsights = useCallback(async () => {
    console.log('📊 Loading insights, connected:', connected);
    
    if (!connected) {
      console.log('❌ Not connected, resetting insights');
      setInsights(prev => ({ 
        ...prev, 
        todayMinutes: 0,
        todayComparison: '+0%',
        topGenre: 'Unknown',
        topGenrePercentage: 0,
        totalTracks: 0,
        uniqueArtists: 0,
        loading: false, 
        error: null 
      }));
      return;
    }

    try {
      setInsights(prev => ({ ...prev, loading: true, error: null }));

      console.log('🔄 Fetching Spotify data...');

      // Fetch data in parallel with proper error handling
      const [recentTracks, topTracks, genreData] = await Promise.all([
        getRecentTracks().catch(error => {
          console.error('❌ Failed to get recent tracks:', error);
          return [];
        }),
        getTopTracks('short_term').catch(error => {
          console.error('❌ Failed to get top tracks:', error);
          return [];
        }),
        calculateTopGenre().catch(error => {
          console.error('❌ Failed to calculate top genre:', error);
          return { topGenre: 'Unknown', topGenrePercentage: 0 };
        })
      ]);

      console.log('📈 Data fetched:', {
        recentTracksCount: recentTracks.length,
        topTracksCount: topTracks.length,
        genreData
      });

      // Calculate listening time
      const { todayMinutes, comparison } = calculateListeningTime(recentTracks);

      // Calculate additional stats - extract artist names safely
      const uniqueArtists = new Set(
        recentTracks.map(track => track.artist).filter(Boolean)
      ).size;

      const newInsights = {
        todayMinutes,
        todayComparison: comparison,
        topGenre: genreData.topGenre,
        topGenrePercentage: genreData.topGenrePercentage,
        totalTracks: recentTracks.length,
        uniqueArtists,
        loading: false,
        error: null
      };

      console.log('✅ Final insights:', newInsights);
      setInsights(newInsights);

    } catch (error) {
      console.error('💥 Failed to load Spotify insights:', error);
      setInsights(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load insights. Please try again.'
      }));
    }
  }, [connected, getRecentTracks, getTopTracks, calculateTopGenre, calculateListeningTime]);

  // Load insights when component mounts and when connection status changes
  useEffect(() => {
    console.log('🎯 useEffect triggered, connected:', connected);
    loadInsights();
  }, [loadInsights]);

  // Don't auto-refresh if not connected
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing insights...');
      loadInsights();
    }, 15 * 60 * 1000); // 15 minutes - increased from 5 minutes

    return () => clearInterval(interval);
  }, [connected, loadInsights]);

  return {
    ...insights,
    refresh: loadInsights
  };
} 