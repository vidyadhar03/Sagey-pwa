"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ShareDataType, 
  InsightShareData, 
  TopAspectShareData 
} from '../components/GlobalShareInterface';
import { useSpotifyInsights } from './useSpotifyInsights';
import { useSpotify, SpotifyTrack, SpotifyArtist, SpotifyAlbum, RecentlyPlayedTrack } from './useSpotify';
import { useMusicRadar } from './useMusicRadar';
import { useAIInsights } from './useAIInsights';

export function useGlobalShare() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareDataType, setShareDataType] = useState<ShareDataType>('insights');
  
  // State for storing fetched data by time range
  const [topTracksData, setTopTracksData] = useState<Record<string, SpotifyTrack[]>>({});
  const [topArtistsData, setTopArtistsData] = useState<Record<string, SpotifyArtist[]>>({});
  const [topAlbumsData, setTopAlbumsData] = useState<Record<string, SpotifyAlbum[]>>({});
  const [recentTracks, setRecentTracks] = useState<RecentlyPlayedTrack[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [fetchingTimeRanges, setFetchingTimeRanges] = useState<Set<string>>(new Set());
  
  // Use refs to track current data state without causing re-renders
  const topTracksDataRef = useRef(topTracksData);
  const topArtistsDataRef = useRef(topArtistsData);
  const topAlbumsDataRef = useRef(topAlbumsData);
  
  // Update refs when state changes
  useEffect(() => {
    topTracksDataRef.current = topTracksData;
  }, [topTracksData]);
  
  useEffect(() => {
    topArtistsDataRef.current = topArtistsData;
  }, [topArtistsData]);
  
  useEffect(() => {
    topAlbumsDataRef.current = topAlbumsData;
  }, [topAlbumsData]);
  
  const { insights } = useSpotifyInsights();
  const { connected, getTopTracks, getTopArtists, getTopAlbums, getRecentTracks } = useSpotify();
  const { payload: radarPayload, ai: radarAI } = useMusicRadar();

  // AI Insights for each insight type (only fetch when data is available)
  const musicalAgeAI = useAIInsights(
    'musical_age', 
    insights.musicalAge, 
    !!(insights.musicalAge && !insights.isDefault)
  );
  
  const moodRingAI = useAIInsights(
    'mood_ring', 
    insights.moodRing, 
    !!(insights.moodRing && !insights.isDefault)
  );
  
  const genrePassportAI = useAIInsights(
    'genre_passport', 
    insights.genrePassport, 
    !!(insights.genrePassport && !insights.isDefault)
  );
  
  const nightOwlAI = useAIInsights(
    'night_owl_pattern', 
    insights.nightOwlPattern, 
    !!(insights.nightOwlPattern && !insights.isDefault)
  );

  // Rate limiting - track last fetch time for each time range
  const lastFetchTimeRef = useRef<Record<string, number>>({});
  const FETCH_COOLDOWN = 5000; // 5 seconds cooldown between fetches for same time range

  // Fetch data for specific time range
  const fetchDataForTimeRange = useCallback(async (timeRange: 'short_term' | 'medium_term' | 'long_term') => {
    if (!connected) return;
    
    // Rate limiting check
    const now = Date.now();
    const lastFetchTime = lastFetchTimeRef.current[timeRange] || 0;
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log(`Rate limited: ${timeRange} was fetched ${Math.round((now - lastFetchTime) / 1000)}s ago, waiting...`);
      return;
    }
    
    // Check if data already exists for this time range using refs
    const hasTracksData = topTracksDataRef.current[timeRange] && topTracksDataRef.current[timeRange].length > 0;
    const hasArtistsData = topArtistsDataRef.current[timeRange] && topArtistsDataRef.current[timeRange].length > 0;
    const hasAlbumsData = topAlbumsDataRef.current[timeRange] && topAlbumsDataRef.current[timeRange].length > 0;
    
    // If we already have all the data, don't fetch again
    if (hasTracksData && hasArtistsData && hasAlbumsData) {
      console.log(`Data already cached for ${timeRange}, skipping API call`);
      return;
    }
    
    console.log(`Fetching data for time range: ${timeRange}`);
    
    // Update last fetch time
    lastFetchTimeRef.current[timeRange] = now;
    
    try {
      const [tracks, artists, albums] = await Promise.all([
        getTopTracks(timeRange).catch(() => []),
        getTopArtists(timeRange).catch(() => []),
        getTopAlbums(timeRange).catch(() => [])
      ]);
      
      // Update refs immediately so data is available synchronously
      topTracksDataRef.current = { ...topTracksDataRef.current, [timeRange]: tracks };
      topArtistsDataRef.current = { ...topArtistsDataRef.current, [timeRange]: artists };
      topAlbumsDataRef.current = { ...topAlbumsDataRef.current, [timeRange]: albums };
      
      // Also update state for components that rely on reactivity
      setTopTracksData(prev => ({ ...prev, [timeRange]: tracks }));
      setTopArtistsData(prev => ({ ...prev, [timeRange]: artists }));
      setTopAlbumsData(prev => ({ ...prev, [timeRange]: albums }));
    } catch (error) {
      console.error(`Failed to fetch share data for ${timeRange}:`, error);
    }
  }, [connected, getTopTracks, getTopArtists, getTopAlbums, FETCH_COOLDOWN]);

  // Fetch initial data when connected
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!connected) return;
      
      setDataLoading(true);
      try {
        // Fetch medium_term by default and recent tracks
        await Promise.all([
          fetchDataForTimeRange('medium_term'),
          getRecentTracks().then(setRecentTracks).catch(() => [])
        ]);
      } catch (error) {
        console.error('Failed to fetch initial share data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [connected, fetchDataForTimeRange, getRecentTracks]);

  // Prepare insight share data
  const prepareInsightData = useCallback((): InsightShareData[] => {
    const insightData: InsightShareData[] = [];

    // Music Radar
    if (radarPayload && !radarPayload.isDefault) {
      insightData.push({
        type: 'music-radar',
        title: 'Music Radar',
        mainValue: 'Your Musical DNA',
        description: 'Your unique music personality profile',
        aiInsight: radarAI.mainInsight || undefined,
        visualData: radarPayload,
        colors: {
          primary: '#1DB954',
          secondary: '#1AA34A',
          accent: '#16803C'
        }
      });
    }

    // Musical Age
    if (insights.musicalAge && !insights.isDefault) {
      insightData.push({
        type: 'musical-age',
        title: 'Musical Age',
        mainValue: `${insights.musicalAge.age} years`,
        description: insights.musicalAge.description,
        aiInsight: musicalAgeAI.copy || undefined,
        visualData: insights.musicalAge,
        colors: {
          primary: '#1DB954',
          secondary: '#1AA34A',
          accent: '#16803C'
        }
      });
    }

    // Mood Ring
    if (insights.moodRing && !insights.isDefault) {
      const dominantMood = Object.entries(insights.moodRing.emotions)
        .sort(([,a], [,b]) => b - a)[0];
      
      insightData.push({
        type: 'mood-ring',
        title: 'Mood Ring',
        mainValue: dominantMood ? dominantMood[0] : 'Mixed',
        description: 'Your emotional music palette',
        aiInsight: moodRingAI.copy || undefined,
        visualData: insights.moodRing,
        colors: {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#6D28D9'
        }
      });
    }

    // Genre Passport
    if (insights.genrePassport && !insights.isDefault) {
      insightData.push({
        type: 'genre-passport',
        title: 'Genre Passport',
        mainValue: `${insights.genrePassport.totalGenres} genres`,
        description: 'Your musical journey across genres',
        aiInsight: genrePassportAI.copy || undefined,
        visualData: insights.genrePassport,
        colors: {
          primary: '#F97316',
          secondary: '#EA580C',
          accent: '#C2410C'
        }
      });
    }

    // Night Owl Pattern
    if (insights.nightOwlPattern && !insights.isDefault) {
      insightData.push({
        type: 'night-owl',
        title: 'Night Owl Pattern',
        mainValue: `${insights.nightOwlPattern.peakHour}:00`,
        description: 'Your daily listening rhythm',
        aiInsight: nightOwlAI.copy || undefined,
        visualData: insights.nightOwlPattern,
        colors: {
          primary: '#EC4899',
          secondary: '#DB2777',
          accent: '#BE185D'
        }
      });
    }

    return insightData;
  }, [insights, radarPayload, radarAI, musicalAgeAI.copy, moodRingAI.copy, genrePassportAI.copy, nightOwlAI.copy]);

  // Get data for specific time range
  const getDataForTimeRange = useCallback((timeRange: 'short_term' | 'medium_term' | 'long_term') => {
    return {
      tracks: topTracksDataRef.current[timeRange] || [],
      artists: topArtistsDataRef.current[timeRange] || [],
      albums: topAlbumsDataRef.current[timeRange] || []
    };
  }, []);

  // Prepare top aspect share data
  const prepareTopAspectData = useCallback((timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): TopAspectShareData[] => {
    const { tracks, artists, albums } = getDataForTimeRange(timeRange);
    const topAspectData: TopAspectShareData[] = [];

    // Get period label based on time range
    const getPeriodLabel = (timeRange: string) => {
      switch (timeRange) {
        case 'short_term': return 'Last 4 weeks';
        case 'medium_term': return 'Last 6 months';
        case 'long_term': return 'All time';
        default: return 'Last 6 months';
      }
    };
    
    const period = getPeriodLabel(timeRange);

    // Top Tracks
    if (tracks && tracks.length > 0) {
      topAspectData.push({
        type: 'top-tracks',
        title: 'Top Tracks',
        period,
        items: tracks.slice(0, 5).map((track: SpotifyTrack) => ({
          name: track.name || 'Unknown Track',
          artist: track.artists?.[0]?.name || 'Unknown Artist',
          image: track.album?.images?.[0]?.url,
          popularity: track.popularity
        }))
      });
    }

    // Top Artists
    if (artists && artists.length > 0) {
      topAspectData.push({
        type: 'top-artists',
        title: 'Top Artists',
        period,
        items: artists.slice(0, 5).map((artist: SpotifyArtist) => ({
          name: artist.name || 'Unknown Artist',
          image: artist.image_url,
          popularity: artist.popularity
        }))
      });
    }

    // Top Albums
    if (albums && albums.length > 0) {
      topAspectData.push({
        type: 'top-albums',
        title: 'Top Albums',
        period,
        items: albums.slice(0, 5).map((album: SpotifyAlbum) => ({
          name: album.name || 'Unknown Album',
          artist: album.artist || 'Unknown Artist',
          image: album.image_url
        }))
      });
    }

    // Top Genres (extracted from top artists)
    if (artists && artists.length > 0) {
      const genreCount: Record<string, number> = {};
      
      // Count genres from top artists
      artists.forEach((artist: SpotifyArtist) => {
        if (artist.genres && artist.genres.length > 0) {
          artist.genres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });

      // Sort genres by frequency and create top genres list
      const sortedGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      if (sortedGenres.length > 0) {
        topAspectData.push({
          type: 'top-genres',
          title: 'Top Genres',
          period,
          items: sortedGenres.map(([genre, count], index) => ({
            name: genre.charAt(0).toUpperCase() + genre.slice(1),
            popularity: count
          }))
        });
      }
    }

    return topAspectData;
  }, [getDataForTimeRange, recentTracks]);

  // Open share interface for insights
  const openInsightShare = useCallback(() => {
    const hasInsightData = prepareInsightData().length > 0;
    if (!hasInsightData) {
      console.log('No insight data available for sharing');
      return;
    }
    setShareDataType('insights');
    setIsShareOpen(true);
  }, [prepareInsightData]);

  // Open share interface for top aspects
  const openTopAspectShare = useCallback(() => {
    const hasTopAspectData = prepareTopAspectData().length > 0;
    if (!hasTopAspectData) {
      console.log('No top aspect data available for sharing');
      return;
    }
    setShareDataType('top-aspects');
    setIsShareOpen(true);
  }, [prepareTopAspectData]);

  // Close share interface
  const closeShare = useCallback(() => {
    setIsShareOpen(false);
  }, []);

  // Helper to build TopAspectShareData from explicit arrays
  const buildTopAspectData = (
    tracks: SpotifyTrack[],
    artists: SpotifyArtist[],
    albums: SpotifyAlbum[],
    timeRange: 'short_term' | 'medium_term' | 'long_term'
  ): TopAspectShareData[] => {
    const data: TopAspectShareData[] = [];
    
    // Get period label based on time range
    const getPeriodLabel = (timeRange: string) => {
      switch (timeRange) {
        case 'short_term': return 'Last 4 weeks';
        case 'medium_term': return 'Last 6 months';
        case 'long_term': return 'All time';
        default: return 'Last 6 months';
      }
    };
    
    const period = getPeriodLabel(timeRange);
    
    if (tracks.length) {
      data.push({
        type: 'top-tracks',
        title: 'Top Tracks',
        period,
        items: tracks.slice(0, 5).map(t => ({
          name: t.name,
          artist: t.artists?.[0]?.name,
          image: t.album?.images?.[0]?.url,
          popularity: t.popularity
        }))
      });
    }
    if (artists.length) {
      data.push({
        type: 'top-artists',
        title: 'Top Artists',
        period,
        items: artists.slice(0, 5).map(a => ({
          name: a.name,
          image: a.image_url,
          popularity: a.popularity
        }))
      });
    }
    if (albums.length) {
      data.push({
        type: 'top-albums',
        title: 'Top Albums',
        period,
        items: albums.slice(0, 5).map(al => ({
          name: al.name,
          artist: al.artist,
          image: al.image_url
        }))
      });
    }
    
    // Top Genres (extracted from top artists)
    if (artists.length) {
      const genreCount: Record<string, number> = {};
      
      // Count genres from top artists
      artists.forEach((artist: SpotifyArtist) => {
        if (artist.genres && artist.genres.length > 0) {
          artist.genres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });

      // Sort genres by frequency and create top genres list
      const sortedGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      if (sortedGenres.length > 0) {
        data.push({
          type: 'top-genres',
          title: 'Top Genres',
          period,
          items: sortedGenres.map(([genre, count], index) => ({
            name: genre.charAt(0).toUpperCase() + genre.slice(1),
            popularity: count
          }))
        });
      }
    }
    return data;
  };

  // Track ongoing fetch operations to prevent duplicates
  const fetchOperationsRef = useRef<Set<string>>(new Set());

  // Fetch fresh data and immediately build share data without relying on React state timing
  const fetchAndPrepareTopAspectData = useCallback(async (timeRange: 'short_term' | 'medium_term' | 'long_term') => {
    const fetchKey = `fetch-${timeRange}`;
    
    // Prevent duplicate concurrent fetches for the same time range
    if (fetchOperationsRef.current.has(fetchKey)) {
      console.log(`⏳ Already fetching data for ${timeRange}, skipping...`);
      // Return existing data if available
      const existingData = buildTopAspectData(
        topTracksDataRef.current[timeRange] || [],
        topArtistsDataRef.current[timeRange] || [],
        topAlbumsDataRef.current[timeRange] || [],
        timeRange
      );
      return existingData;
    }
    
    fetchOperationsRef.current.add(fetchKey);
    
    try {
      // Always fetch fresh data for share interface to ensure real-time updates
      const [tracks, artists, albums] = await Promise.all([
        getTopTracks(timeRange).catch((error) => {
          console.error(`Failed to fetch tracks for ${timeRange}:`, error);
          return [];
        }),
        getTopArtists(timeRange).catch((error) => {
          console.error(`Failed to fetch artists for ${timeRange}:`, error);
          return [];
        }),
        getTopAlbums(timeRange).catch((error) => {
          console.error(`Failed to fetch albums for ${timeRange}:`, error);
          return [];
        })
      ]);
      
      // Update refs and state with fresh data
      topTracksDataRef.current = { ...topTracksDataRef.current, [timeRange]: tracks };
      topArtistsDataRef.current = { ...topArtistsDataRef.current, [timeRange]: artists };
      topAlbumsDataRef.current = { ...topAlbumsDataRef.current, [timeRange]: albums };
      
      setTopTracksData(prev => ({ ...prev, [timeRange]: tracks }));
      setTopArtistsData(prev => ({ ...prev, [timeRange]: artists }));
      setTopAlbumsData(prev => ({ ...prev, [timeRange]: albums }));
      
      // Build and return the share data
      const shareData = buildTopAspectData(tracks, artists, albums, timeRange);
      
      return shareData;
    } finally {
      // Remove from ongoing operations
      fetchOperationsRef.current.delete(fetchKey);
    }
  }, [getTopTracks, getTopArtists, getTopAlbums]);

  return {
    isShareOpen,
    shareDataType,
    insightData: prepareInsightData(),
    topAspectData: prepareTopAspectData(),
    openInsightShare,
    openTopAspectShare,
    closeShare,
    fetchDataForTimeRange,
    prepareTopAspectDataForTimeRange: prepareTopAspectData,
    fetchAndPrepareTopAspectData
  };
} 