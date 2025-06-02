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
    console.log('⏰ Calculating listening time for tracks:', tracks?.length);
    
    if (!tracks || tracks.length === 0) {
      console.log('⚠️ No tracks provided for calculation');
      return { todayMinutes: 0, comparison: '+0%' };
    }

    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    let todayTracks = 0;
    let yesterdayTracks = 0;
    let todayDuration = 0;
    let yesterdayDuration = 0;

    tracks.forEach((trackItem, index) => {
      // Handle both direct tracks and recent tracks format
      const track = trackItem.track || trackItem;
      const playedAt = trackItem.played_at || track.played_at;
      
      if (!playedAt) {
        console.log(`⚠️ Track ${index} missing played_at:`, trackItem);
        return;
      }

      try {
        const playedDate = new Date(playedAt).toDateString();
        const duration = track.duration_ms || trackItem.duration_ms || 180000; // Default 3 minutes
        
        if (playedDate === today) {
          todayTracks++;
          todayDuration += duration;
          console.log(`📅 Today track: ${track.name || 'Unknown'} - ${Math.round(duration/1000/60)}min`);
        } else if (playedDate === yesterday) {
          yesterdayTracks++;
          yesterdayDuration += duration;
        }
      } catch (error) {
        console.error(`❌ Error processing track ${index}:`, error, trackItem);
      }
    });

    // Convert to minutes
    const todayMinutes = Math.round(todayDuration / (1000 * 60));
    const yesterdayMinutes = Math.round(yesterdayDuration / (1000 * 60));
    
    console.log('📊 Listening calculation results:', {
      todayTracks,
      todayMinutes,
      yesterdayTracks,
      yesterdayMinutes
    });
    
    // Calculate comparison with yesterday (based on minutes, not tracks)
    let comparison = '+0%';
    if (yesterdayMinutes > 0) {
      const percentChange = Math.round(((todayMinutes - yesterdayMinutes) / yesterdayMinutes) * 100);
      comparison = percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
    } else if (todayMinutes > 0) {
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

    // Set loading state
    setInsights(prev => ({ ...prev, loading: true, error: null }));
    console.log('🔄 Fetching Spotify data for insights...');

    try {
      // Only fetch recent tracks - this is the primary data we need
      // The genre calculation will fetch top artists when needed
      const recentTracks = await getRecentTracks();
      console.log('📈 Recent tracks fetched:', recentTracks?.length);
      
      // Debug: Log first few tracks to understand data structure
      if (recentTracks?.length > 0) {
        const firstTrack: any = recentTracks[0];
        console.log('🔍 Sample recent track data:', {
          first: firstTrack,
          hasTrackProperty: !!firstTrack?.track,
          hasPlayedAt: !!firstTrack?.played_at
        });
      }

      // Calculate today's listening time from recent tracks
      const { todayMinutes, comparison } = calculateListeningTime(recentTracks);
      console.log('⏰ Today listening calculated:', { todayMinutes, comparison });

      // Calculate additional stats from recent tracks
      const uniqueArtists = new Set(
        recentTracks.map((trackItem: any) => {
          // Handle both track formats - recent tracks vs direct tracks
          if (trackItem.track) {
            // Recent track format: { track: { artists: [...] }, played_at: ... }
            return trackItem.track.artists?.[0]?.name;
          } else {
            // Direct track format: { artist: "...", name: "..." }
            return trackItem.artist;
          }
        }).filter(Boolean)
      ).size;

      // Calculate top genre (this will use cached data if available)
      console.log('🎵 Starting genre calculation...');
      const genreData = await calculateTopGenre();
      console.log('🎯 Genre data calculated:', genreData);

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

      console.log('✅ Final insights calculated:', newInsights);
      setInsights(newInsights);

    } catch (error) {
      console.error('💥 Failed to load Spotify insights:', error);
      setInsights(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load insights. Please try again.'
      }));
    }
  }, [connected, getRecentTracks, calculateTopGenre, calculateListeningTime]);

  // Load insights only when component mounts or connection changes
  useEffect(() => {
    console.log('🎯 useSpotifyInsights: useEffect triggered, connected:', connected);
    if (connected) {
      loadInsights();
    }
  }, [connected]); // Only depend on connected state

  return {
    ...insights,
    refresh: loadInsights
  };
} 