"use client";

import { useState, useEffect } from 'react';

// Debug logging integration
const debugAddLog: ((type: 'info' | 'warning' | 'error' | 'success', category: 'auth' | 'api' | 'cookie' | 'redirect' | 'network' | 'status', message: string, details?: any) => void) | null = null;

// Initialize debug logging if available
try {
  const { useSpotifyDebug } = require('./useSpotifyDebug');
  // This will only work within a React component context
} catch (error) {
  // Debug hook not available, continue without logging
}

interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  followers?: number;
  images?: Array<{ url: string }>;
  country?: string;
  product?: string;
}

interface SpotifyStatus {
  connected: boolean;
  user: SpotifyUser | null;
  loading: boolean;
  error?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  played_at?: string;
  duration_ms: number;
  external_urls: { spotify: string };
  preview_url?: string;
  image_url?: string;
  popularity?: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: number;
  external_urls: { spotify: string };
  image_url?: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artist: string;
  artists: string;
  release_date: string;
  total_tracks: number;
  external_urls: { spotify: string };
  image_url?: string;
  album_type: string;
  track_count: number;
}

interface AudioFeatures {
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  tempo: number;
  mood_score: number;
}

// Global data cache to prevent duplicate API calls across components
const globalDataCache = {
  recentTracks: null as any[] | null,
  topTracks: {} as Record<string, any[]>,
  topArtists: {} as Record<string, any[]>,
  topAlbums: {} as Record<string, any[]>,
  lastFetch: {} as Record<string, number>,
  isLoading: {} as Record<string, boolean>
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Check if cached data is still valid
const isCacheValid = (key: string): boolean => {
  const lastFetch = globalDataCache.lastFetch[key];
  return !!(lastFetch && (Date.now() - lastFetch) < CACHE_DURATION);
};

// Set cache data with timestamp
const setCacheData = (key: string, data: any): void => {
  globalDataCache.lastFetch[key] = Date.now();
  if (key === 'recent-tracks') {
    globalDataCache.recentTracks = data;
  } else if (key.startsWith('top-tracks-')) {
    const timeRange = key.replace('top-tracks-', '');
    globalDataCache.topTracks[timeRange] = data;
  } else if (key.startsWith('top-artists-')) {
    const timeRange = key.replace('top-artists-', '');
    globalDataCache.topArtists[timeRange] = data;
  } else if (key.startsWith('top-albums-')) {
    const timeRange = key.replace('top-albums-', '');
    globalDataCache.topAlbums[timeRange] = data;
  }
};

// Clear all cached data
const clearCache = (): void => {
  console.log('🧹 Clearing global data cache');
  globalDataCache.recentTracks = null;
  globalDataCache.topTracks = {};
  globalDataCache.topArtists = {};
  globalDataCache.topAlbums = {};
  globalDataCache.lastFetch = {};
  globalDataCache.isLoading = {};
};

// Get cached data
const getCacheData = (key: string): any => {
  if (key === 'recent-tracks') {
    return globalDataCache.recentTracks;
  } else if (key.startsWith('top-tracks-')) {
    const timeRange = key.replace('top-tracks-', '');
    return globalDataCache.topTracks[timeRange];
  } else if (key.startsWith('top-artists-')) {
    const timeRange = key.replace('top-artists-', '');
    return globalDataCache.topArtists[timeRange];
  } else if (key.startsWith('top-albums-')) {
    const timeRange = key.replace('top-albums-', '');
    return globalDataCache.topAlbums[timeRange];
  }
  return null;
};

export function useSpotify() {
  const [status, setStatus] = useState<SpotifyStatus>({
    connected: false,
    user: null,
    loading: true
  });

  // Check connection status
  const checkStatus = async () => {
    console.log('🔍 useSpotify: Starting connection status check');
    
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      console.log('📡 useSpotify: Making API request to /api/spotify/status');
      const response = await fetch('/api/spotify/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 useSpotify: Status API response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const data = await response.json();
      
      console.log('📡 useSpotify: Status API data parsed', {
        connected: data.connected,
        hasUser: !!data.user,
        error: data.error,
        userId: data.user?.id
      });
      
      setStatus({
        connected: data.connected,
        user: data.user,
        loading: false,
        error: data.error
      });
      
      if (data.connected) {
        console.log('✅ useSpotify: Successfully connected to Spotify', data.user);
      } else {
        console.log('❌ useSpotify: Not connected to Spotify', { 
          error: data.error,
          reason: 'No valid session found'
        });
      }
      
    } catch (error) {
      console.error('💥 useSpotify: Failed to check Spotify status:', error);
      console.error('🔍 useSpotify: Error details:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setStatus({
        connected: false,
        user: null,
        loading: false,
        error: 'Failed to check connection'
      });
    }
  };

  // Connect to Spotify
  const connect = () => {
    console.log('🚀 useSpotify: Starting Spotify authentication process');
    
    // Enhanced mobile debugging
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    // Log current environment info
    console.log('🌍 useSpotify: Environment info', {
      userAgent: userAgent.substring(0, 100),
      platform: navigator.platform,
      isMobile,
      isAndroid, 
      isIOS,
      online: navigator.onLine,
      url: window.location.href,
      referrer: document.referrer,
      cookiesEnabled: navigator.cookieEnabled
    });
    
    // Log cookie information
    console.log('🍪 useSpotify: Current cookies', {
      allCookies: document.cookie,
      cookieCount: document.cookie ? document.cookie.split(';').length : 0,
      domain: window.location.hostname,
      protocol: window.location.protocol
    });
    
    // Log touch/click capability for mobile
    if (isMobile) {
      console.log('📱 useSpotify: Mobile-specific info', {
        touchSupport: 'ontouchstart' in window,
        screenSize: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio
      });
    }
    
    console.log('🔗 useSpotify: Redirecting to /api/spotify/auth');
    
    try {
      // Add a small delay for mobile to ensure logging is captured
      if (isMobile) {
        setTimeout(() => {
          console.log('🔀 useSpotify: Mobile redirect executing...');
          window.location.href = '/api/spotify/auth';
        }, 100);
      } else {
        window.location.href = '/api/spotify/auth';
      }
    } catch (error) {
      console.error('💥 useSpotify: Failed to redirect to auth endpoint:', error);
      console.error('🔍 useSpotify: Error details:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  };

  // Fetch recent tracks
  const getRecentTracks = async (): Promise<SpotifyTrack[]> => {
    console.log('🎵 getRecentTracks: Starting fetch');
    
    if (!status.connected) {
      console.log('❌ getRecentTracks: Not connected');
      throw new Error('Spotify not connected');
    }

    const cacheKey = 'recent-tracks';
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCacheData(cacheKey);
      if (cachedData) {
        console.log('✅ getRecentTracks: Using cached data');
        return cachedData;
      }
    }

    // Prevent duplicate API calls
    if (globalDataCache.isLoading[cacheKey]) {
      console.log('⏳ getRecentTracks: Already loading, waiting...');
      // Wait for the current request to complete
      while (globalDataCache.isLoading[cacheKey]) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return cached data after waiting
      const cachedData = getCacheData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    globalDataCache.isLoading[cacheKey] = true;

    try {
      console.log('📡 getRecentTracks: Making API request');
      const response = await fetch('/api/spotify/recent-tracks', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 getRecentTracks: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ getRecentTracks: API error', errorData);
        
        // Handle specific error cases
        if (response.status === 403 && errorData.shouldReconnect) {
          // Clear current connection status to force reconnection
          setStatus({
            connected: false,
            user: null,
            loading: false,
            error: 'Please reconnect your Spotify account to grant updated permissions.'
          });
        }
        
        throw new Error(errorData.error || 'Failed to fetch recent tracks');
      }

      const data = await response.json();
      const tracks = data.tracks || [];
      
      console.log('✅ getRecentTracks: Data received', {
        tracksCount: tracks.length,
        total: data.total,
        firstTrack: tracks[0]
      });
      
      // Cache the data
      setCacheData(cacheKey, tracks);
      
      return tracks;
    } finally {
      globalDataCache.isLoading[cacheKey] = false;
    }
  };

  // Fetch top tracks
  const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> => {
    console.log('🎵 getTopTracks: Starting fetch with timeRange:', timeRange);
    
    if (!status.connected) {
      console.log('❌ getTopTracks: Not connected');
      throw new Error('Spotify not connected');
    }

    const cacheKey = `top-tracks-${timeRange}`;
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCacheData(cacheKey);
      if (cachedData) {
        console.log('✅ getTopTracks: Using cached data for', timeRange);
        return cachedData;
      }
    }

    // Prevent duplicate API calls
    if (globalDataCache.isLoading[cacheKey]) {
      console.log('⏳ getTopTracks: Already loading, waiting...', timeRange);
      // Wait for the current request to complete
      while (globalDataCache.isLoading[cacheKey]) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return cached data after waiting
      const cachedData = getCacheData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    globalDataCache.isLoading[cacheKey] = true;

    try {
      console.log('📡 getTopTracks: Making API request');
      const response = await fetch(`/api/spotify/top-tracks?time_range=${timeRange}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 getTopTracks: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ getTopTracks: API error', errorData);
        
        // Handle specific error cases
        if (response.status === 403 && errorData.shouldReconnect) {
          // Clear current connection status to force reconnection
          setStatus({
            connected: false,
            user: null,
            loading: false,
            error: 'Please reconnect your Spotify account to grant updated permissions.'
          });
        }
        
        throw new Error(errorData.error || 'Failed to fetch top tracks');
      }

      const data = await response.json();
      const tracks = data.tracks || [];
      
      console.log('✅ getTopTracks: Data received', {
        tracksCount: tracks.length,
        total: data.total,
        timeRange: data.time_range,
        firstTrack: tracks[0]
      });
      
      // Cache the data
      setCacheData(cacheKey, tracks);
      
      return tracks;
    } finally {
      globalDataCache.isLoading[cacheKey] = false;
    }
  };

  // Fetch top artists
  const getTopArtists = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[]> => {
    console.log('🎤 getTopArtists: Starting fetch with timeRange:', timeRange);
    
    if (!status.connected) {
      console.log('❌ getTopArtists: Not connected');
      throw new Error('Spotify not connected');
    }

    const cacheKey = `top-artists-${timeRange}`;
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCacheData(cacheKey);
      if (cachedData) {
        console.log('✅ getTopArtists: Using cached data for', timeRange);
        return cachedData;
      }
    }

    // Prevent duplicate API calls
    if (globalDataCache.isLoading[cacheKey]) {
      console.log('⏳ getTopArtists: Already loading, waiting...', timeRange);
      // Wait for the current request to complete
      while (globalDataCache.isLoading[cacheKey]) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return cached data after waiting
      const cachedData = getCacheData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    globalDataCache.isLoading[cacheKey] = true;

    try {
      console.log('📡 getTopArtists: Making API request');
      const response = await fetch(`/api/spotify/top-artists?time_range=${timeRange}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 getTopArtists: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ getTopArtists: API error', errorData);
        
        // Handle specific error cases
        if (response.status === 403 && errorData.shouldReconnect) {
          // Clear current connection status to force reconnection
          setStatus({
            connected: false,
            user: null,
            loading: false,
            error: 'Please reconnect your Spotify account to grant updated permissions.'
          });
        }
        
        throw new Error(errorData.error || 'Failed to fetch top artists');
      }

      const data = await response.json();
      const artists = data.artists || [];
      
      console.log('✅ getTopArtists: Data received', {
        artistsCount: artists.length,
        total: data.total,
        timeRange: data.time_range,
        firstArtist: artists[0]
      });
      
      // Cache the data
      setCacheData(cacheKey, artists);
      
      return artists;
    } finally {
      globalDataCache.isLoading[cacheKey] = false;
    }
  };

  // Fetch top albums
  const getTopAlbums = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyAlbum[]> => {
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    const response = await fetch(`/api/spotify/top-albums?time_range=${timeRange}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch top albums');
    }

    const data = await response.json();
    return data.albums;
  };

  // Fetch audio features for tracks
  const getAudioFeatures = async (trackIds: string[]): Promise<{ aggregate: AudioFeatures; audio_features: any[] }> => {
    console.log('🎵 getAudioFeatures called with:', { connected: status.connected, trackCount: trackIds.length });
    
    if (!status.connected) {
      console.log('❌ getAudioFeatures: Not connected to Spotify');
      throw new Error('Spotify not connected');
    }

    if (!trackIds || trackIds.length === 0) {
      console.log('❌ getAudioFeatures: No track IDs provided');
      throw new Error('No track IDs provided');
    }

    try {
      const ids = trackIds.join(',');
      console.log('🔄 getAudioFeatures: Making API request...');
      
      const response = await fetch(`/api/spotify/audio-features?ids=${ids}`);
      
      console.log('📡 getAudioFeatures: API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getAudioFeatures: API error:', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText 
        });
        
        // Don't throw for 403/401 errors - just return empty result
        if (response.status === 403 || response.status === 401) {
          console.log('🔄 getAudioFeatures: Auth error, returning empty result');
          return {
            aggregate: {
              energy: 0,
              valence: 0,
              danceability: 0,
              acousticness: 0,
              instrumentalness: 0,
              tempo: 0,
              mood_score: 0
            },
            audio_features: []
          };
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ getAudioFeatures: Success');
      return data;
      
    } catch (error) {
      console.error('❌ getAudioFeatures: Exception occurred:', error);
      throw error;
    }
  };

  // Get music insights (combines multiple API calls)
  const getMusicInsights = async () => {
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    try {
      // Fetch recent and top tracks
      const [recentTracks, topTracks] = await Promise.all([
        getRecentTracks(),
        getTopTracks('short_term')
      ]);

      // Get audio features for top tracks
      const topTrackIds = topTracks.slice(0, 20).map(track => track.id);
      const audioFeatures = await getAudioFeatures(topTrackIds);

      // Calculate listening stats
      const totalTracks = recentTracks.length;
      const uniqueArtists = [...new Set(recentTracks.map(track => track.artist))];
      
      // Estimate daily listening time (based on recent tracks)
      const totalDuration = recentTracks.reduce((sum, track) => sum + track.duration_ms, 0);
      const avgTrackDuration = totalDuration / totalTracks;
      const estimatedDailyMinutes = Math.round((avgTrackDuration * 20) / (1000 * 60)); // Rough estimate

      return {
        recentTracks,
        topTracks,
        audioFeatures: audioFeatures.aggregate,
        stats: {
          totalTracks,
          uniqueArtists: uniqueArtists.length,
          estimatedDailyMinutes,
          moodScore: audioFeatures.aggregate.mood_score
        }
      };
    } catch (error) {
      console.error('Failed to get music insights:', error);
      throw error;
    }
  };

  // Logout/Disconnect from Spotify
  const logout = async () => {
    console.log('🚪 useSpotify: Starting logout process');
    
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // Call logout API endpoint
      const response = await fetch('/api/spotify/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 useSpotify: Logout API response', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      // Reset state regardless of API response (ensure local state is clean)
      setStatus({
        connected: false,
        user: null,
        loading: false,
        error: undefined
      });
      
      if (response.ok) {
        console.log('✅ useSpotify: Successfully logged out from Spotify');
      } else {
        console.warn('⚠️ useSpotify: Logout API failed, but local state cleared');
      }
      
      // Optional: Clear any cached data from localStorage/sessionStorage
      try {
        localStorage.removeItem('spotify_cache');
        sessionStorage.removeItem('spotify_temp');
      } catch (error) {
        console.warn('⚠️ useSpotify: Failed to clear local storage:', error);
      }
      
      // Clear all cached data
      clearCache();
      
    } catch (error) {
      console.error('💥 useSpotify: Failed to logout:', error);
      
      // Still reset state even if API call fails
      setStatus({
        connected: false,
        user: null,
        loading: false,
        error: 'Logout failed, but session cleared locally'
      });
    }
  };

  // Get cache status for debugging
  const getCacheStatus = () => {
    return {
      recentTracks: !!globalDataCache.recentTracks,
      topTracks: Object.keys(globalDataCache.topTracks),
      topArtists: Object.keys(globalDataCache.topArtists),
      topAlbums: Object.keys(globalDataCache.topAlbums),
      lastFetch: globalDataCache.lastFetch,
      isLoading: globalDataCache.isLoading
    };
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    ...status,
    connect,
    logout,
    checkStatus,
    getRecentTracks,
    getTopTracks,
    getTopArtists,
    getTopAlbums,
    getAudioFeatures,
    getMusicInsights,
    clearCache,
    getCacheStatus
  };
} 