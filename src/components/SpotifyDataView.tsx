"use client";

import React, { useState, useEffect } from 'react';
import { useSpotify } from '../hooks/useSpotify';

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
  const { connected, user, loading, connect, checkStatus } = useSpotify();
  const spotify = useSpotify();
  
  const [activeTab, setActiveTab] = useState<'recent' | 'tracks' | 'artists' | 'genres' | 'albums'>('recent');
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<SpotifyAlbum[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status when component mounts
  useEffect(() => {
    if (!connected && !loading) {
      checkStatus();
    }
  }, []);

  useEffect(() => {
    if (connected) {
      loadData();
    }
  }, [connected, timeRange, activeTab]);

  const loadData = async () => {
    if (!connected) return;
    
    setDataLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'recent') {
        const recent = await spotify.getRecentTracks();
        setRecentTracks(recent);
      } else if (activeTab === 'tracks') {
        const tracks = await spotify.getTopTracks(timeRange);
        setTopTracks(tracks);
      } else if (activeTab === 'artists') {
        const artists = await spotify.getTopArtists(timeRange);
        setTopArtists(artists);
      } else if (activeTab === 'albums') {
        const albums = await spotify.getTopAlbums(timeRange);
        setTopAlbums(albums);
      } else if (activeTab === 'genres') {
        // Load artists for genre analysis
        const artists = await spotify.getTopArtists(timeRange);
        setTopArtists(artists);
      }
    } catch (err) {
      console.error('Failed to load Spotify data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
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
    
    const allGenres = topArtists
      .filter((artist: any) => artist && Array.isArray(artist.genres))
      .flatMap((artist: any) => artist.genres || []);
    
    const genreCounts = allGenres.reduce((acc: Record<string, number>, genre: string) => {
      if (genre && typeof genre === 'string') {
        acc[genre] = (acc[genre] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 20)
      .map(([genre, count]) => ({ genre, count }));
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

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Spotify connection...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10 text-[#1DB954]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Connect to Spotify</h2>
          <p className="text-gray-400 mb-6">Connect your Spotify account to view your music data and insights.</p>
          <button
            onClick={connect}
            className="px-6 py-3 bg-[#1DB954] hover:bg-[#1AA34A] rounded-full text-white font-medium transition-all"
          >
            Connect Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      {/* Fixed Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-white text-2xl font-bold">Top</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-[120px]">
        {/* Tab Switcher - Horizontally Scrollable */}
        <div className="mt-6 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
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
          </div>
        </div>

        {/* Time Range Selector (for tracks, artists, albums, and genres) */}
        {(activeTab === 'tracks' || activeTab === 'artists' || activeTab === 'albums' || activeTab === 'genres') && (
          <div className="mb-6">
            <div className="flex bg-[#2A2A2D] p-1 rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => setTimeRange('short_term')}
                className={`py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  timeRange === 'short_term'
                    ? 'bg-[#1DB954] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                4 weeks
              </button>
              <button
                onClick={() => setTimeRange('medium_term')}
                className={`py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  timeRange === 'medium_term'
                    ? 'bg-[#1DB954] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                6 months
              </button>
              <button
                onClick={() => setTimeRange('long_term')}
                className={`py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  timeRange === 'long_term'
                    ? 'bg-[#1DB954] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All time
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {dataLoading && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 text-red-400 text-sm font-medium hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )}

          {/* Content */}
          {!dataLoading && !error && (
            <>
              {/* Recent Tracks */}
              {activeTab === 'recent' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">Recently Played</h3>
                    <span className="text-gray-400 text-sm">{recentTracks.length} tracks</span>
                  </div>
                  
                  {recentTracks.map((track, index) => (
                    <div key={`${track.id}-${index}`} className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all">
                      <div className="flex items-center">
                        {track.image_url && (
                          <img 
                            src={track.image_url} 
                            alt={track.album}
                            className="w-12 h-12 rounded-lg mr-4"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{track.name}</h4>
                          <p className="text-gray-400 text-sm truncate">{track.artist} • {track.album}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-400">{formatDuration(track.duration_ms)}</span>
                            {track.played_at && (
                              <>
                                <span className="text-gray-400 mx-1">•</span>
                                <span className="text-xs text-[#1DB954]">{formatPlayedAt(track.played_at)}</span>
                              </>
                            )}
                          </div>
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Tracks */}
              {activeTab === 'tracks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">Tracks</h3>
                    <span className="text-gray-400 text-sm">{getTimeRangeLabel(timeRange)}</span>
                  </div>
                  
                  {topTracks.map((track, index) => (
                    <div key={track.id} className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all">
                      <div className="flex items-center">
                        <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>
                        {track.image_url && (
                          <img 
                            src={track.image_url} 
                            alt={track.album}
                            className="w-12 h-12 rounded-lg mr-4"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{track.name}</h4>
                          <p className="text-gray-400 text-sm truncate">{track.artist} • {track.album}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-400">{formatDuration(track.duration_ms)}</span>
                            {track.popularity && (
                              <>
                                <span className="text-gray-400 mx-1">•</span>
                                <span className="text-xs text-[#1DB954]">{track.popularity}% popularity</span>
                              </>
                            )}
                          </div>
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Artists */}
              {activeTab === 'artists' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">Artists</h3>
                    <span className="text-gray-400 text-sm">{getTimeRangeLabel(timeRange)}</span>
                  </div>
                  
                  {topArtists.map((artist: any, index: number) => (
                    <div key={artist.id} className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all">
                      <div className="flex items-center">
                        <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>
                        {artist.image_url && (
                          <img 
                            src={artist.image_url} 
                            alt={artist.name}
                            className="w-16 h-16 rounded-full mr-4 border-2 border-[#1DB954]/20"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-lg truncate">{artist.name}</h4>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-400">{formatNumber(artist.followers)} followers</span>
                            <span className="text-gray-400 mx-1">•</span>
                            <span className="text-xs text-[#1DB954]">{artist.popularity}% popularity</span>
                          </div>
                          {artist.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {artist.genres.slice(0, 3).map((genre: string, genreIndex: number) => (
                                <span 
                                  key={genreIndex}
                                  className="px-2 py-1 bg-[#1DB954]/20 text-[#1DB954] text-xs rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                              {artist.genres.length > 3 && (
                                <span className="text-gray-400 text-xs py-1">
                                  +{artist.genres.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Albums */}
              {activeTab === 'albums' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">Albums</h3>
                    <span className="text-gray-400 text-sm">{getTimeRangeLabel(timeRange)}</span>
                  </div>
                  
                  {topAlbums.map((album, index) => (
                    <div key={album.id} className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 hover:border-[#1DB954]/30 transition-all">
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
              )}

              {/* Top Genres */}
              {activeTab === 'genres' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
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
                      <p className="text-gray-400">No genre data available. Listen to more music to see your genres!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    );
} 