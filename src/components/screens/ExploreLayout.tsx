"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSpotify } from '../../hooks/useSpotify';

export default function ExploreLayout() {
  const { 
    connected,
    user,
    loading,
    error,
    getTopTracks,
    getTopArtists,
    getRecentTracks,
    getAudioFeatures
  } = useSpotify();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [selectedCategory, setSelectedCategory] = useState<'tracks' | 'artists' | 'genres'>('tracks');
  const [topTracks, setTopTracks] = useState<any>({});
  const [topArtists, setTopArtists] = useState<any>({});
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (connected && user) {
      loadData();
    }
  }, [connected, user, selectedTimeRange]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [tracks, artists, recent] = await Promise.all([
        getTopTracks(selectedTimeRange).catch(() => []),
        getTopArtists(selectedTimeRange).catch(() => []),
        getRecentTracks().catch(() => [])
      ]);
      
      // Ensure we have valid arrays with proper data structure
      const validTracks = Array.isArray(tracks) ? tracks.filter(track => track && track.id) : [];
      const validArtists = Array.isArray(artists) ? artists.filter(artist => artist && artist.id) : [];
      const validRecent = Array.isArray(recent) ? recent.filter((item: any) => item && item.track && item.track.id) : [];
      
      setTopTracks((prev: any) => ({ ...prev, [selectedTimeRange]: validTracks }));
      setTopArtists((prev: any) => ({ ...prev, [selectedTimeRange]: validArtists }));
      setRecentTracks(validRecent);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays as fallback
      setTopTracks((prev: any) => ({ ...prev, [selectedTimeRange]: [] }));
      setTopArtists((prev: any) => ({ ...prev, [selectedTimeRange]: [] }));
      setRecentTracks([]);
    } finally {
      setDataLoading(false);
    }
  };

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

  if (!connected || !user) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Spotify to Explore</h2>
          <p className="text-gray-400 mb-6">
            Connect your Spotify account to discover personalized music recommendations and explore your musical taste.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      <div className="p-6 space-y-6">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
          <div className="flex gap-2">
            {[
              { key: 'tracks', label: 'Top Tracks', icon: '🎵' },
              { key: 'artists', label: 'Top Artists', icon: '🎤' },
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
                <div className="space-y-3">
                  {topTracks?.[selectedTimeRange]?.slice(0, 10).map((track: any, index: number) => {
                    if (!track || !track.id) return null;
                    return (
                      <div key={track.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-[#1DB954] font-bold w-6">{index + 1}</span>
                        {track.album?.images?.[0] && (
                          <img 
                            src={track.album.images[0].url} 
                            alt={track.album.name || 'Album cover'}
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
                <div className="grid grid-cols-2 gap-4">
                  {topArtists?.[selectedTimeRange]?.slice(0, 8).map((artist: any, index: number) => {
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

          {selectedCategory === 'genres' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Your Music Genres</h3>
              <div className="grid grid-cols-2 gap-3">
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Recently Played</h3>
          {dataLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/10 h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentTracks?.slice(0, 5).map((item, index) => {
                if (!item || !item.track || !item.track.id) return null;
                return (
                  <div key={`${item.track.id}-${index}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    {item.track.album?.images?.[0] && (
                      <img 
                        src={item.track.album.images[0].url} 
                        alt={item.track.album.name || 'Album cover'}
                        className="w-12 h-12 rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.track.name || 'Unknown Track'}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {item.track.artists?.map((artist: any) => artist?.name || 'Unknown Artist').join(', ') || 'Unknown Artist'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.played_at ? new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}
        </motion.div>

        {/* Discover More Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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