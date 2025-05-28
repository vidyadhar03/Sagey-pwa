"use client";

import { useState, useEffect } from 'react';

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

export function useSpotify() {
  const [status, setStatus] = useState<SpotifyStatus>({
    connected: false,
    user: null,
    loading: true
  });

  // Check connection status
  const checkStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const response = await fetch('/api/spotify/status');
      const data = await response.json();
      
      setStatus({
        connected: data.connected,
        user: data.user,
        loading: false,
        error: data.error
      });
    } catch (error) {
      console.error('Failed to check Spotify status:', error);
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
    window.location.href = '/api/spotify/auth';
  };

  // Fetch recent tracks
  const getRecentTracks = async (): Promise<SpotifyTrack[]> => {
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    const response = await fetch('/api/spotify/recent-tracks');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recent tracks');
    }

    const data = await response.json();
    return data.tracks;
  };

  // Fetch top tracks
  const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> => {
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    const response = await fetch(`/api/spotify/top-tracks?time_range=${timeRange}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch top tracks');
    }

    const data = await response.json();
    return data.tracks;
  };

  // Fetch top artists
  const getTopArtists = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[]> => {
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    const response = await fetch(`/api/spotify/top-artists?time_range=${timeRange}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch top artists');
    }

    const data = await response.json();
    return data.artists;
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
    if (!status.connected) {
      throw new Error('Spotify not connected');
    }

    const ids = trackIds.join(',');
    const response = await fetch(`/api/spotify/audio-features?ids=${ids}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch audio features');
    }

    return response.json();
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

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    ...status,
    connect,
    checkStatus,
    getRecentTracks,
    getTopTracks,
    getTopArtists,
    getTopAlbums,
    getAudioFeatures,
    getMusicInsights
  };
} 