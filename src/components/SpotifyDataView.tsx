"use client";

import React, { useState, useEffect } from 'react';
import { useSpotify } from '../hooks/useSpotify';
import ShareableCards from './ShareableCards';
import TopAppBar from './TopAppBar';

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

export default function SpotifyDataView() {
  const { connected, user, loading, connect, checkStatus, getTopTracks, getTopArtists, getTopAlbums, getRecentTracks } = useSpotify();
  
  // Set default filter to tracks and default time range to short_term (4 weeks)
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'genres' | 'albums' | 'recent'>('tracks');
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term');
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<SpotifyAlbum[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set default view mode to grid
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showShareCards, setShowShareCards] = useState(false);
  const [genreRetryCount, setGenreRetryCount] = useState(0);
  
  // New simplified data loading state
  const [isInitialized, setIsInitialized] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // NEW ARCHITECTURE: Single effect for data loading when connected
  useEffect(() => {
    if (connected && !isInitialized) {
      console.log('🚀 Initializing data load for connected user');
      initializeData();
    }
  }, [connected]);

  // Load data when tab or time range changes (only after initialization)
  useEffect(() => {
    if (connected && isInitialized) {
      console.log('🔄 Loading data for tab/time change:', { activeTab, timeRange });
      loadDataForCurrentTab();
    }
  }, [activeTab, timeRange, connected, isInitialized]);

  const initializeData = async () => {
    console.log('🎯 Starting initial data load...');
    setDataLoading(true);
    setError(null);
    
    try {
      // Load tracks data first (default tab)
      const tracksData = await getTopTracks('short_term');
      console.log('✅ Initial tracks loaded:', tracksData?.length || 0);
      setTopTracks(tracksData || []);
      setIsInitialized(true);
    } catch (err) {
      console.error('❌ Initial data load failed:', err);
      setError('Failed to load initial data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const loadDataForCurrentTab = async () => {
    setDataLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Loading ${activeTab} data for ${timeRange}`);
      
      switch (activeTab) {
        case 'tracks':
          const tracksData = await getTopTracks(timeRange);
          setTopTracks(tracksData || []);
          break;
          
        case 'artists':
          const artistsData = await getTopArtists(timeRange);
          setTopArtists(artistsData || []);
          break;
          
        case 'albums':
          const albumsData = await getTopAlbums(timeRange);
          setTopAlbums(albumsData || []);
          break;
          
        case 'genres':
          // For genres, we need artists data
          const genreArtistsData = await getTopArtists(timeRange);
          setTopArtists(genreArtistsData || []);
          break;
          
        case 'recent':
          const recentData = await getRecentTracks();
          setRecentTracks(recentData || []);
          break;
      }
      
      console.log(`✅ ${activeTab} data loaded successfully`);
    } catch (err) {
      console.error(`❌ Failed to load ${activeTab} data:`, err);
      setError(`Failed to load ${activeTab} data. Please try again.`);
    } finally {
      setDataLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTopGenres = () => {
    if (!topArtists || !Array.isArray(topArtists)) return [];
    
    const genreCounts: { [key: string]: number } = {};
    
    topArtists.forEach((artist: any) => {
      if (artist.genres && Array.isArray(artist.genres)) {
        artist.genres.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => Number(b.count) - Number(a.count))
      .slice(0, 20);
  };

  const retryGenreData = async () => {
    if (genreRetryCount < 3) {
      setGenreRetryCount(prev => prev + 1);
      setDataLoading(true);
      setError(null);
      
      try {
        // Try different time ranges to get genre data
        const timeRanges: ('short_term' | 'medium_term' | 'long_term')[] = ['long_term', 'medium_term', 'short_term'];
        
        for (const range of timeRanges) {
          const data = await getTopArtists(range);
          if (data && data.length > 0) {
            setTopArtists(data);
            setTimeRange(range);
            break;
          }
        }
      } catch (err) {
        console.error('Error retrying genre data:', err);
        setError('Failed to load genre data. Please try again.');
      } finally {
        setDataLoading(false);
      }
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'short_term': return 'Last 4 weeks';
      case 'medium_term': return 'Last 6 months';
      case 'long_term': return 'All time';
      default: return 'Last 6 months';
    }
  };

  const formatPlayedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  const handleShare = () => {
    setShowShareCards(true);
  };

  const getViewModeIcon = () => {
    if (viewMode === 'list') {
      return "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z";
    } else {
      return "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z";
    }
  };

  const getContainerClasses = () => {
    if (viewMode === 'grid') {
      // Change to 2 columns for grid view
      return 'grid grid-cols-2 gap-4';
    }
    return 'space-y-4';
  };

  const getItemClasses = () => {
    if (viewMode === 'grid') {
      return 'p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all';
    }
    return 'p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all';
  };

  const renderTrackItem = (track: any, index: number) => {
    const isGrid = viewMode === 'grid';
    
    return (
      <div key={track.id} className={getItemClasses()}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-center'}`}>
          {!isGrid && <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>}
          {track.image_url && (
            <img 
              src={track.image_url} 
              alt={track.album}
              className={`${isGrid ? 'w-full aspect-square mb-3' : 'w-12 h-12 mr-4'} rounded-lg`}
            />
          )}
          <div className={`${isGrid ? '' : 'flex-1 min-w-0'}`}>
            {isGrid && <span className="text-[#1DB954] font-bold text-sm mb-1 block">#{index + 1}</span>}
            <h4 className={`text-white font-medium ${isGrid ? 'text-sm mb-1' : ''} truncate`}>{track.name}</h4>
            <p className={`text-gray-400 text-sm truncate ${isGrid ? 'mb-2' : ''}`}>{track.artist} • {track.album}</p>
            <div className="flex items-center">
              <span className="text-xs text-gray-400">{formatDuration(track.duration_ms)}</span>
              {track.popularity && (
                <>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-xs text-[#1DB954]">{track.popularity}% popularity</span>
                </>
              )}
              {/* Add played_at time for recent tracks */}
              {track.played_at && (
                <>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-xs text-orange-400">{formatPlayedAt(track.played_at)}</span>
                </>
              )}
            </div>
          </div>
          {!isGrid && (
            <a 
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          )}
        </div>
        {isGrid && (
          <div className="mt-3 flex justify-center">
            <a 
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          </div>
        )}
      </div>
    );
  };

  const renderArtistItem = (artist: any, index: number) => {
    const isGrid = viewMode === 'grid';
    
    return (
      <div key={artist.id} className={getItemClasses()}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-center'}`}>
          {!isGrid && <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>}
          {artist.image_url && (
            <img 
              src={artist.image_url} 
              alt={artist.name}
              className={`${isGrid ? 'w-full aspect-square mb-3' : 'w-16 h-16 mr-4'} rounded-full border-2 border-[#1DB954]/20`}
            />
          )}
          <div className={`${isGrid ? 'text-center' : 'flex-1 min-w-0'}`}>
            {isGrid && <span className="text-[#1DB954] font-bold text-sm mb-1 block">#{index + 1}</span>}
            <h4 className={`text-white font-medium ${isGrid ? 'text-sm mb-1' : 'text-lg'} truncate`}>{artist.name}</h4>
            <div className={`flex items-center ${isGrid ? 'justify-center text-xs' : 'mt-1'}`}>
              <span className="text-xs text-gray-400">{formatNumber(artist.followers)} followers</span>
              <span className="text-gray-400 mx-1">•</span>
              <span className="text-xs text-[#1DB954]">{artist.popularity}% popularity</span>
            </div>
            {artist.genres.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-2 ${isGrid ? 'justify-center' : ''}`}>
                {artist.genres.slice(0, isGrid ? 2 : 3).map((genre: string, genreIndex: number) => (
                  <span 
                    key={genreIndex}
                    className="px-2 py-1 bg-[#1DB954]/20 text-[#1DB954] text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
                {artist.genres.length > (isGrid ? 2 : 3) && (
                  <span className="text-gray-400 text-xs py-1">
                    +{artist.genres.length - (isGrid ? 2 : 3)} more
                  </span>
                )}
              </div>
            )}
          </div>
          {!isGrid && (
            <a 
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          )}
        </div>
        {isGrid && (
          <div className="mt-3 flex justify-center">
            <a 
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DB954] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <svg className="w-16 h-16 text-[#1DB954] mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Connect to Spotify</h2>
            <p className="text-gray-400">Connect your Spotify account to view your music data and insights.</p>
            </div>
            <button
              onClick={connect}
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Connect Spotify
            </button>
          </div>
        </div>
    );
  }

  return (
    <>
      {/* Use TopAppBar component to match home/insights styling */}
      <TopAppBar
        title="Top"
        showLeftIcon={false}
        showRightIcon={false}
        titleAlign="left"
        rightIcons={[
          {
            path: getViewModeIcon(),
            label: `Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`,
            onClick: toggleViewMode
          },
          {
            path: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z",
            label: "Share your music data",
            onClick: handleShare
          }
        ]}
      />
      
      <div className="pt-[60px] w-full h-screen overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        {/* Fixed Filter Chips - Remove all spacing between top bar and filter chips */}
        <div className="sticky top-[60px] z-30 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
              <button
                onClick={() => setActiveTab('tracks')}
                className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'tracks'
                    ? 'bg-[#1DB954] text-white shadow-sm'
                    : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                }`}
              >
                Tracks
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'artists'
                    ? 'bg-[#1DB954] text-white shadow-sm'
                    : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                }`}
              >
                Artists
              </button>
              <button
                onClick={() => setActiveTab('albums')}
                className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'albums'
                    ? 'bg-[#1DB954] text-white shadow-sm'
                    : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                }`}
              >
                Albums
              </button>
              <button
                onClick={() => setActiveTab('genres')}
                className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'genres'
                    ? 'bg-[#1DB954] text-white shadow-sm'
                    : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                }`}
              >
                Genres
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'recent'
                    ? 'bg-[#1DB954] text-white shadow-sm'
                    : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                }`}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-[120px]">
          {/* Time Range Selector (for tracks, artists, albums, and genres) */}
          {activeTab !== 'recent' && (
            <div className="mb-6 pt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('short_term')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    timeRange === 'short_term'
                      ? 'bg-[#1DB954] text-white shadow-sm'
                      : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                  }`}
                >
                  Last 4 weeks
                </button>
                <button
                  onClick={() => setTimeRange('medium_term')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    timeRange === 'medium_term'
                      ? 'bg-[#1DB954] text-white shadow-sm'
                      : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                  }`}
                >
                  Last 6 months
                </button>
                <button
                  onClick={() => setTimeRange('long_term')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    timeRange === 'long_term'
                      ? 'bg-[#1DB954] text-white shadow-sm'
                      : 'bg-[#2A2A2D] text-gray-400 hover:text-white hover:bg-[#3A3A3D]'
                  }`}
                >
                  All time
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'recent' && <div className="pt-6"></div>}

            {/* Loading State */}
            {dataLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954]"></div>
              <span className="ml-3 text-gray-400">Loading...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Content */}
            {!dataLoading && !error && (
              <>
                {/* Recent Tracks */}
                {activeTab === 'recent' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium text-lg">Recently Played</h3>
                    <span className="text-gray-400 text-sm">{recentTracks.length} tracks</span>
                    </div>
                    
                    <div className={getContainerClasses()}>
                      {recentTracks.map((track: any, index: number) => (
                        renderTrackItem(track, index)
                      ))}
                    </div>

                  {recentTracks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No recent tracks found. Start listening to see your recent activity!</p>
                    </div>
                  )}
                  </div>
                )}

                {/* Top Tracks */}
                {activeTab === 'tracks' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium text-lg">Tracks</h3>
                    <span className="text-gray-400 text-sm">{getTimeRangeLabel(timeRange)}</span>
                    </div>
                    
                    <div className={getContainerClasses()}>
                      {topTracks.map((track: any, index: number) => (
                        renderTrackItem(track, index)
                      ))}
                    </div>

                  {topTracks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No tracks found for this time period. Listen to more music to see your top tracks!</p>
                    </div>
                  )}
                  </div>
                )}

                {/* Top Artists */}
                {activeTab === 'artists' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium text-lg">Artists</h3>
                    <span className="text-gray-400 text-sm">{getTimeRangeLabel(timeRange)}</span>
                    </div>
                    
                    <div className={getContainerClasses()}>
                      {topArtists.map((artist: any, index: number) => (
                        renderArtistItem(artist, index)
                      ))}
                    </div>

                  {topArtists.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No artists found for this time period. Listen to more music to see your top artists!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Top Albums */}
              {activeTab === 'albums' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium text-lg">Albums</h3>
                    <span className="text-gray-400 text-sm">{getTimeRangeLabel(timeRange)}</span>
                  </div>
                  
                  <div className={getContainerClasses()}>
                    {topAlbums.map((album, index) => (
                      <div key={album.id} className={getItemClasses()}>
                        <div className="flex items-center">
                          <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>
                          {album.image_url && (
                            <img 
                              src={album.image_url} 
                              alt={album.name}
                              className="w-12 h-12 rounded-lg mr-4"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{album.name}</h4>
                            <p className="text-gray-400 text-sm truncate">{album.artists}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-400">{album.total_tracks} tracks</span>
                              <span className="text-gray-400 mx-1">•</span>
                              <span className="text-xs text-[#1DB954]">{album.track_count} in your top tracks</span>
                              {album.release_date && (
                                <>
                                  <span className="text-gray-400 mx-1">•</span>
                                  <span className="text-xs text-gray-400">{new Date(album.release_date).getFullYear()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <a 
                            href={album.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {topAlbums.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No albums found for this time period. Listen to more music to see your top albums!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Top Genres */}
              {activeTab === 'genres' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium text-lg">Genres</h3>
                    <span className="text-gray-400 text-sm">Based on your artists</span>
                    </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getTopGenres().map(({ genre, count }, index) => {
                      const genreCount = Number(count);
                      const maxCount = Math.max(...getTopGenres().map(g => Number(g.count)));
                      return (
                        <div key={genre} className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all">
                          <div className="flex items-center justify-between">
                        <div className="flex items-center">
                              <span className="text-[#1DB954] font-bold text-lg mr-4 w-8">#{index + 1}</span>
                              <div>
                                <h4 className="text-white font-medium capitalize">{genre}</h4>
                                <p className="text-gray-400 text-sm">{genreCount} {genreCount === 1 ? 'artist' : 'artists'}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-full"
                                  style={{ width: `${Math.min((genreCount / maxCount) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-[#1DB954] text-sm font-medium ml-2">{genreCount}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {getTopGenres().length === 0 && (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <p className="text-gray-400 mb-4">No genre data available for this time period.</p>
                        <button
                          onClick={retryGenreData}
                          className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg transition-colors"
                          disabled={genreRetryCount >= 3}
                        >
                          {genreRetryCount >= 3 ? 'Max retries reached' : 'Try different time period'}
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </>
            )}
        </div>

        {/* Shareable Cards Modal */}
        {showShareCards && (
          <ShareableCards
            onClose={() => setShowShareCards(false)}
            data={{
              tracks: topTracks,
              artists: topArtists,
              albums: topAlbums,
              genres: getTopGenres(),
              timeRange
            }}
          />
        )}
      </div>
    </>
  );
} 