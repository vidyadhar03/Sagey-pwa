"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import TopAppBar from '../TopAppBar';
import { useSpotify } from '../../hooks/useSpotify';

export default function ExploreLayout() {
  const { 
    connected,
    user,
    loading: spotifyLoading,
    error,
    getTopTracks,
    getTopArtists,
    getRecentTracks,
    getAudioFeatures
  } = useSpotify();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [selectedCategory, setSelectedCategory] = useState<'tracks' | 'artists' | 'genres' | 'recent'>('tracks');
  const [topTracks, setTopTracks] = useState<any>({});
  const [topArtists, setTopArtists] = useState<any>({});
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use refs to track loading state and prevent duplicate calls
  const loadingRef = useRef(false);
  const initializedRef = useRef(false);

  const loadData = useCallback(async (timeRange: string, forceRefresh = false) => {
    if (!connected || !user || spotifyLoading) {
      return;
    }

    // Only set loading if we don't have cached data
    const hasTrackData = topTracks[timeRange]?.length > 0;
    const hasArtistData = topArtists[timeRange]?.length > 0;
    const hasRecentData = recentTracks.length > 0;

    if (!forceRefresh && hasTrackData && hasArtistData && hasRecentData) {
      console.log('📊 ExploreLayout: Using existing data for', timeRange);
      return;
    }
    
    setDataLoading(true);
    
    try {
      console.log('🔄 ExploreLayout: Loading data for', timeRange);
      
      const [tracks, artists, recent] = await Promise.all([
        !hasTrackData || forceRefresh ? getTopTracks(timeRange as any) : Promise.resolve(topTracks[timeRange] || []),
        !hasArtistData || forceRefresh ? getTopArtists(timeRange as any) : Promise.resolve(topArtists[timeRange] || []),
        !hasRecentData || forceRefresh ? getRecentTracks() : Promise.resolve(recentTracks)
      ]);
      
      // Ensure we have valid arrays with proper data structure
      const validTracks = Array.isArray(tracks) ? tracks.filter(track => track && track.id) : [];
      const validArtists = Array.isArray(artists) ? artists.filter(artist => artist && artist.id) : [];
      const validRecent = Array.isArray(recent) ? recent.filter((item: any) => item && item.track && item.track.id) : [];
      
      setTopTracks((prev: any) => ({ ...prev, [timeRange]: validTracks }));
      setTopArtists((prev: any) => ({ ...prev, [timeRange]: validArtists }));
      
      // Only update recent tracks if we fetched new data or don't have any
      if (!hasRecentData || forceRefresh) {
        setRecentTracks(validRecent);
      }

      console.log('✅ ExploreLayout: Data loaded successfully', {
        tracks: validTracks.length,
        artists: validArtists.length,
        recent: validRecent.length
      });
      
    } catch (error) {
      console.error('❌ ExploreLayout: Failed to load data:', error);
      // Set empty arrays as fallback only if we don't have existing data
      if (!hasTrackData) {
        setTopTracks((prev: any) => ({ ...prev, [timeRange]: [] }));
      }
      if (!hasArtistData) {
        setTopArtists((prev: any) => ({ ...prev, [timeRange]: [] }));
      }
      if (!hasRecentData) {
        setRecentTracks([]);
      }
    } finally {
      setDataLoading(false);
      setIsInitialLoad(false);
    }
  }, [connected, user, spotifyLoading, getTopTracks, getTopArtists, getRecentTracks, topTracks, topArtists, recentTracks]);

  // Initial data load - only trigger once when connected and user are available
  useEffect(() => {
    if (connected && user && !spotifyLoading && !initializedRef.current) {
      initializedRef.current = true;
      loadData(selectedTimeRange);
    }
  }, [connected, user, spotifyLoading, selectedTimeRange, loadData]);

  // Handle time range changes for already loaded component
  useEffect(() => {
    if (connected && user && !spotifyLoading && !isInitialLoad && initializedRef.current) {
      loadData(selectedTimeRange);
    }
  }, [selectedTimeRange, connected, user, spotifyLoading, isInitialLoad, loadData]);

  const timeRangeLabels = {
    short_term: 'Last 4 Weeks',
    medium_term: 'Last 6 Months', 
    long_term: 'All Time'
  };

  const getGenresFromArtists = () => {
    if (!topArtists?.medium_term || !Array.isArray(topArtists.medium_term)) return [];
    const allGenres = topArtists.medium_term
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
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }));
  };

  const getRecommendationSeeds = () => {
    const seeds: string[] = [];
    if (topTracks?.[selectedTimeRange]?.length > 0) {
      seeds.push(...topTracks[selectedTimeRange].slice(0, 2).map((track: any) => track.id));
    }
    if (topArtists?.[selectedTimeRange]?.length > 0) {
      seeds.push(...topArtists[selectedTimeRange].slice(0, 2).map((artist: any) => artist.id));
    }
    return seeds.slice(0, 5);
  };

  // Show loading screen only during initial Spotify connection check
  if (spotifyLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DB954] mx-auto mb-4"></div>
          <p className="text-gray-400">Checking Spotify connection...</p>
        </div>
      </div>
    );
  }

  if (!connected || !user) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <TopAppBar
          title="Explore"
          showLeftIcon={false}
          showRightIcon={false}
          titleAlign="left"
        />
        <div className="pt-[60px] h-full flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10 text-white">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect Spotify to Explore</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Connect your Spotify account to discover personalized music recommendations and explore your musical taste.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      <TopAppBar
        title="Explore"
        showLeftIcon={false}
        showRightIcon={false}
        titleAlign="left"
      />
      <div className="pt-[60px] p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1DB954] to-[#1ed760] bg-clip-text text-transparent">
            Explore Your Music
          </h1>
          <p className="text-gray-400 mt-2">
            Discover new music based on your listening habits
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4"
        >
          <h3 className="text-lg font-semibold mb-3">Time Period</h3>
          <div className="flex gap-2">
            {Object.entries(timeRangeLabels).map(([range, label]) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range as any)}
                disabled={dataLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                  selectedTimeRange === range
                    ? 'bg-[#1DB954] text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4"
        >
          <h3 className="text-lg font-semibold mb-3">Explore By</h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'tracks', label: 'Top Tracks', icon: '🎵' },
              { key: 'artists', label: 'Top Artists', icon: '🎤' },
              { key: 'recent', label: 'Recent Tracks', icon: '🕒' },
              { key: 'genres', label: 'Genres', icon: '🎼' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-[#1DB954] text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Based on Selected Category */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {selectedCategory === 'tracks' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Your Top Tracks</h3>
              {dataLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/10 h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1DB954]/30 scrollbar-track-transparent">
                  {topTracks?.[selectedTimeRange]?.map((track: any, index: number) => {
                    if (!track || !track.id) return null;
                    return (
                      <div key={track.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-[#1DB954] font-bold w-6">{index + 1}</span>
                        {track.album?.images?.[0] && (
                          <img 
                            src={track.album?.images?.[0]?.url} 
                            alt={track.album?.name || 'Album cover'}
                            className="w-12 h-12 rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name || 'Unknown Track'}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {track.artists?.map((artist: any) => artist?.name || 'Unknown Artist').join(', ') || 'Unknown Artist'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-400">
                          {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}` : '--:--'}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          )}

          {selectedCategory === 'artists' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Your Top Artists</h3>
              {dataLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/10 h-24 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1DB954]/30 scrollbar-track-transparent">
                  {topArtists?.[selectedTimeRange]?.map((artist: any, index: number) => {
                    if (!artist || !artist.id) return null;
                    return (
                      <div key={artist.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-[#1DB954] font-bold text-sm">{index + 1}</span>
                        {artist.images?.[0] && (
                          <img 
                            src={artist.images[0].url} 
                            alt={artist.name || 'Artist'}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{artist.name || 'Unknown Artist'}</p>
                          <p className="text-xs text-gray-400">
                            {artist.followers?.total ? `${artist.followers.total.toLocaleString()} followers` : 'Artist'}
                          </p>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          )}

          {selectedCategory === 'recent' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Recently Played Tracks</h3>
              {dataLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/10 h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1DB954]/30 scrollbar-track-transparent">
                  {recentTracks?.map((item, index) => {
                    if (!item || !item.track || !item.track.id) return null;
                    return (
                      <div key={`${item.track.id}-${index}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        {item.track.album?.images?.[0] && (
                          <img 
                            src={item.track.album?.images?.[0]?.url} 
                            alt={item.track.album?.name || 'Album cover'}
                            className="w-12 h-12 rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.track.name || 'Unknown Track'}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {item.track.artists?.map((artist: any) => artist?.name || 'Unknown Artist').join(', ') || 'Unknown Artist'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 text-right">
                          <div>{item.played_at ? new Date(item.played_at).toLocaleDateString() : '--'}</div>
                          <div>{item.played_at ? new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          )}

          {selectedCategory === 'genres' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Your Music Genres</h3>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1DB954]/30 scrollbar-track-transparent">
                {getGenresFromArtists().map(({ genre, count }, index) => (
                  <div key={genre} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1DB954] font-bold text-sm">{index + 1}</span>
                      <span className="font-medium capitalize text-sm">{genre}</span>
                    </div>
                    <span className="text-xs text-gray-400">{Number(count)} artists</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Discover More Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-[#1DB954]/20 to-[#1ed760]/20 backdrop-blur-sm rounded-2xl p-6 border border-[#1DB954]/30"
        >
          <h3 className="text-xl font-bold mb-2">Discover More</h3>
          <p className="text-gray-300 mb-4">
            Based on your listening habits, we can help you discover new music that matches your taste.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm">
              🎯 Get Recommendations
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm">
              📊 Audio Analysis
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm">
              🎵 Create Playlist
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm">
              🔍 Explore Genres
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 