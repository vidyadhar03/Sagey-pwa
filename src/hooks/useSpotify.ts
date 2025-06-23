"use client";

import { useState, useEffect, useCallback } from 'react';

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

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtistSummary[];
  album: SpotifyAlbumSummary;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyArtistSummary {
  id: string;
  name: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbumSummary {
  id: string;
  name: string;
  release_date: string;
  release_date_precision: string;
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: { spotify: string };
}

export interface RecentlyPlayedTrack {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: number;
  external_urls: { spotify: string };
  image_url?: string;
  track_count: number;
}

export interface SpotifyAlbum {
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

// Function to refresh the Spotify access token
const refreshToken = async (): Promise<boolean> => {
  console.log('🔄 Attempting to refresh Spotify token...');
  try {
    const response = await fetch('/api/spotify/refresh', {
      method: 'POST',
    });

    if (response.ok) {
      console.log('✅ Token refreshed successfully');
      return true;
    } else {
      console.error('❌ Failed to refresh token:', response.status);
      return false;
    }
  } catch (error) {
    console.error('💥 Error refreshing token:', error);
    return false;
  }
};

// A wrapper for fetch that includes token refresh logic
const fetchWithRefresh = async (
  url: string,
  options: RequestInit,
  retryCount = 1
): Promise<Response> => {
  let response = await fetch(url, options);

  if ((response.status === 401 || response.status === 403) && retryCount > 0) {
    console.log(`Auth error (${response.status}), attempting token refresh...`);
    const refreshed = await refreshToken();
    
    if (refreshed) {
      console.log('Retrying original request after token refresh...');
      response = await fetchWithRefresh(url, options, retryCount - 1);
    }
  }

  return response;
};

export function useSpotify() {
  const [status, setStatus] = useState<SpotifyStatus>({
    connected: false,
    user: null,
    loading: true
  });

  // Check connection status
  const checkStatus = useCallback(async () => {
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
  }, []);

  // Connect to Spotify
  const connect = useCallback(() => {
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
  }, []);

  // Fetch recent tracks
  const getRecentTracks = useCallback(async (): Promise<RecentlyPlayedTrack[]> => {
    console.log('🎵 getRecentTracks: Fetching recent tracks with pagination');

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
      const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;
      const nowMs = Date.now();
      let before: number | null = null;
      let allTracks: any[] = [];

      // Loop to gather tracks covering last 4 weeks (or until API returns < 50 items)
      // Spotify lets us paginate using the 'before' timestamp. We keep requesting pages
      // until the oldest track we fetched is older than 4 weeks or the API returns < 50 items.
      for (let page = 0; page < 25; page++) { // hard-limit to 25 pages (~1250 plays)
        const requestUrl: string = before
          ? `/api/spotify/recent-tracks?before=${before}`
          : '/api/spotify/recent-tracks';

        console.log('📡 getRecentTracks: Requesting page', page + 1, requestUrl);

        const response: Response = await fetch(requestUrl);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ getRecentTracks: API error', errorData);
          // Handle 403 permission error same as before
          if (response.status === 403 && errorData.shouldReconnect) {
            setStatus({
              connected: false,
              user: null,
              loading: false,
              error: 'Please reconnect your Spotify account to grant updated permissions.'
            });
          }
          throw new Error(errorData.error || 'Failed to fetch recent tracks');
        }

        const data: { tracks?: any[]; items?: any[] } = await response.json();
        const pageTracks: any[] = data.tracks || data.items || [];

        if (!Array.isArray(pageTracks) || pageTracks.length === 0) {
          break; // no more data
        }

        allTracks = allTracks.concat(pageTracks);

        // Prepare next 'before' timestamp (subtract 1 ms to avoid duplicate track)
        const oldest: any = pageTracks[pageTracks.length - 1];
        before = new Date(oldest.played_at).getTime() - 1;

        // Stop if oldest track is beyond 4 weeks
        if (nowMs - before > FOUR_WEEKS_MS) {
          break;
        }

        // Stop if less than 50 items (Spotify returns < limit when no more)
        if (pageTracks.length < 50) {
          break;
        }
      }

      console.log('📡 getRecentTracks: Total tracks fetched', allTracks.length);

      // Normalize track data (reuse existing mapping logic)
      const tracks: RecentlyPlayedTrack[] = allTracks.map((item: any) => ({
        played_at: item.played_at,
        track: {
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
            external_urls: a.external_urls
          })),
          album: {
            id: item.track.album.id,
            name: item.track.album.name,
            release_date: item.track.album.release_date,
            release_date_precision: item.track.album.release_date_precision,
            images: item.track.album.images.map((i: any) => ({
              url: i.url,
              height: i.height,
              width: i.width
            })),
            external_urls: item.track.album.external_urls
          },
          duration_ms: item.track.duration_ms,
          explicit: item.track.explicit,
          popularity: item.track.popularity,
          preview_url: item.track.preview_url,
          external_urls: item.track.external_urls,
          uri: item.track.uri
        }
      }));

      // Cache the data
      setCacheData(cacheKey, tracks);
      return tracks;
    } finally {
      globalDataCache.isLoading[cacheKey] = false;
    }
  }, [status.connected]);

  // Fetch top tracks
  const getTopTracks = useCallback(async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> => {
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

      // API returns {tracks: [...], total: N} structure
      const tracksData = data.tracks || data.items || [];
      
      if (!tracksData || tracksData.length === 0) {
        console.warn('⚠️ useSpotify: No top tracks found in API response.');
        return [];
      }

      // Normalize track data from flattened API response
      const tracks: SpotifyTrack[] = tracksData.map((item: any) => ({
        id: item.id,
        name: item.name,
        artists: item.artists ? item.artists.map((a: any) => ({
          id: a.id,
          name: a.name,
          external_urls: a.external_urls
        })) : [{ id: item.artist || '', name: item.artist || 'Unknown Artist', external_urls: { spotify: '' } }],
        album: {
          id: item.album?.id || '',
          name: item.album?.name || item.album_name || 'Unknown Album',
          release_date: item.album?.release_date || '',
          release_date_precision: item.album?.release_date_precision || 'day',
          images: item.album?.images || [{ url: item.image_url || '', height: 640, width: 640 }],
          external_urls: item.album?.external_urls || { spotify: '' }
        },
        duration_ms: item.duration_ms || 0,
        explicit: item.explicit || false,
        popularity: item.popularity || 0,
        preview_url: item.preview_url || null,
        external_urls: item.external_urls || { spotify: '' },
        uri: item.uri || ''
      }));
      
      // Cache the data
      setCacheData(cacheKey, tracks);
      
      return tracks;
    } finally {
      globalDataCache.isLoading[cacheKey] = false;
    }
  }, [status.connected]);

  // Fetch top artists
  const getTopArtists = useCallback(async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[]> => {
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
  }, [status.connected]);

  // Fetch top albums
  const getTopAlbums = useCallback(async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyAlbum[]> => {
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
  }, [status.connected]);

   // Get music insights (combines multiple API calls)
  const getMusicInsights = useCallback(async () => {
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    try {
      // Fetch recent and top tracks
      const recentTracks: RecentlyPlayedTrack[] = await getRecentTracks();
      const topTracks: SpotifyTrack[] = await getTopTracks('medium_term');

      // Calculate listening stats
      const totalTracks = recentTracks.length;
      const uniqueArtists = new Set(recentTracks.map(item => item.track.artists.map(a => a.name).join(',')));
      const totalDurationMs = recentTracks.reduce((sum, item) => sum + item.track.duration_ms, 0);
      const estimatedDailyMinutes = Math.round(totalDurationMs / 1000 / 60 / 30); // Assuming 30-day window

      return {
        recentTracks,
        topTracks,
        stats: {
          totalTracks,
          uniqueArtists: uniqueArtists.size,
          estimatedDailyMinutes,
          moodScore: 0 // Placeholder for mood score
        }
      };
    } catch (error) {
      console.error('Failed to get music insights:', error);
      throw error;
    }
  }, [status.connected, getRecentTracks, getTopTracks]);

  // Logout/Disconnect from Spotify
  const logout = useCallback(async () => {
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
      
      // Aggressively clear any residual cookies on the client (covers path variants the server cannot)
      try {
        ['spotify_access_token','spotify_refresh_token','spotify_user_info','spotify_auth_state','spotify_code_verifier'].forEach(name=>{
          document.cookie = `${name}=; Max-Age=0; path=/;`;
          document.cookie = `${name}=; Max-Age=0; path=/api/spotify;`;
          document.cookie = `${name}=; Max-Age=0; path=/api/spotify/;`;
        });
      } catch(e) {
        console.warn('⚠️ useSpotify: Unable to clear cookies on client', e);
      }
      
      // Clear any cached data from localStorage/sessionStorage
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
  }, []);

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
  }, [checkStatus]);

  return {
    ...status,
    connect,
    logout,
    checkStatus,
    getRecentTracks,
    getTopTracks,
    getTopArtists,
    getTopAlbums,
    getMusicInsights,
    clearCache,
    getCacheStatus
  };
} 