"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MusicalAgeEstimator from '../MusicalAgeEstimator';
import UserProfile from '../UserProfile';
import SpotifyDebugPanel from '../SpotifyDebugPanel';
import TopAppBar from '../TopAppBar';
import { useSpotify } from '../../hooks/useSpotify';
import { useSpotifyDebug } from '../../hooks/useSpotifyDebug';
import { useSpotifyInsights } from '../../hooks/useSpotifyInsights';

interface HomeLayoutProps {
  onTabClick?: (tab: string, options?: { section?: string }) => void;
}

export default function HomeLayout({ onTabClick }: HomeLayoutProps) {
  const { connected, user, loading, error: spotifyHookError, getTopTracks, getTopArtists, getRecentTracks, connect } = useSpotify();
  const { addLog } = useSpotifyDebug();
  const { 
    insights,
    isLoading: insightsLoading,
    refresh: refreshInsights
  } = useSpotifyInsights();
  
  // Extract values from insights for backwards compatibility
  const todayMinutes = 0; // This was for daily stats, not available in comprehensive insights
  const todayComparison = '+0%'; // This was for daily stats comparison
  const topGenre = insights.genrePassport.topGenres[0] || 'Mixed';
  const topGenrePercentage = insights.genrePassport.explorationScore;
  
  // Remove separate data state - use the global cache from useSpotify
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track if data has been loaded to prevent re-loading on tab switches
  const dataLoadedRef = useRef(false);

  // Combine errors from URL params and hook
  const displayError = spotifyError || spotifyHookError;

  console.log('🏠 HomeLayout rendering:', { 
    connected, 
    loading, 
    hasUser: !!user, 
    spotifyError,
    spotifyHookError,
    displayError,
    todayMinutes,
    topGenre,
    insightsLoading
  });

  // Log HomeLayout initialization
  useEffect(() => {
    console.log('🏠 HomeLayout mounted');
    addLog('info', 'status', 'HomeLayout component mounted', {
      connected,
      hasUser: !!user,
      loading
    });
  }, []);

  // Log connection state changes
  useEffect(() => {
    addLog('info', 'status', 'Spotify connection state changed', {
      connected,
      hasUser: !!user,
      loading,
      userId: user?.id
    });
  }, [connected, user, loading]);

  useEffect(() => {
    // Check for Spotify authentication errors in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyStatus = urlParams.get('spotify');
    const errorReason = urlParams.get('reason');

    addLog('info', 'redirect', 'HomeLayout checking URL parameters', {
      spotifyStatus,
      errorReason,
      fullUrl: window.location.href
    });

    if (spotifyStatus === 'error') {
      let errorMessage = 'Failed to connect to Spotify. Please try again.';
      
      switch (errorReason) {
        case 'config_error':
          errorMessage = 'Spotify configuration error. Please contact support.';
          break;
        case 'auth_error':
          errorMessage = 'Spotify authorization was denied or failed.';
          break;
        case 'state_mismatch':
          errorMessage = 'Security validation failed. Please try connecting again.';
          break;
        case 'token_exchange':
          errorMessage = 'Failed to exchange authorization code. Please try again.';
          break;
        case 'profile_fetch':
          errorMessage = 'Failed to fetch your Spotify profile. Please try again.';
          break;
        case 'server_error':
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        case 'missing_params':
          errorMessage = 'Invalid authorization response. Please try again.';
          break;
      }
      
      addLog('error', 'auth', `Spotify authentication error: ${errorReason}`, {
        errorMessage,
        errorReason,
        url: window.location.href
      });
      
      setSpotifyError(errorMessage);
      
      // Auto-show debug panel on error for easier troubleshooting
      setShowDebugPanel(true);
      
      // Clear the error parameters from URL after showing the error
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (spotifyStatus === 'connected') {
      addLog('success', 'auth', 'Spotify authentication successful', {
        url: window.location.href
      });
      
      setSpotifyError(null);
      // Clear the success parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [addLog]);

  useEffect(() => {
    // Initialize data when connected (same pattern as SpotifyDataView)
    if (connected && user && !isInitialized) {
      console.log('🏠 HomeLayout: Starting initialization...');
      initializeHomeData();
    } else if (!connected) {
      // Reset when disconnected
      console.log('🏠 HomeLayout: Disconnected, resetting state');
      setRecentTracks([]);
      setTopTracks([]);
      setTopArtists([]);
      setDataLoading(false);
      setIsInitialized(false);
      dataLoadedRef.current = false;
    }
  }, [connected, user]);

  // Initialize home data (same pattern as SpotifyDataView)
  const initializeHomeData = async () => {
    console.log('🏠 HomeLayout: Starting initialization...');
    setDataLoading(true);
    
    try {
      // Load recent tracks, top tracks, and top artists using global cache
      console.log('🏠 HomeLayout: Loading data via useSpotify cache...');
      
      const [recent, tracks, artists] = await Promise.all([
        getRecentTracks(),
        getTopTracks('short_term'),
        getTopArtists('short_term')
      ]);
      
      console.log('🏠 HomeLayout: Data loaded successfully', {
        recentCount: recent?.length || 0,
        tracksCount: tracks?.length || 0,
        artistsCount: artists?.length || 0,
        recentSample: recent?.[0],
        trackSample: tracks?.[0],
        artistSample: artists?.[0]
      });
      
      // Set data for display (limit to what we need for home)
      setRecentTracks(recent || []);
      setTopTracks(tracks?.slice(0, 3) || []);
      setTopArtists(artists?.slice(0, 3) || []);
      setIsInitialized(true);
      dataLoadedRef.current = true;
      
    } catch (error) {
      console.error('🏠 HomeLayout: Failed to initialize data:', error);
      setSpotifyError('Failed to load music data. Please try refreshing.');
    } finally {
      setDataLoading(false);
    }
  };

  const formatPlayedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${Math.floor(diffHours / 24)}d ago`;
    }
  };

  const dismissError = () => {
    setSpotifyError(null);
    // Note: We can't clear spotifyHookError as it's managed by the hook
    // Users will need to reconnect to clear permission-related errors
  };

  const handleAccountClick = () => {
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      {/* TopAppBar - Only show when Spotify is not connected */}
      {!connected && (
        <TopAppBar 
          title="Sagey"
          showRightIcon={true}
          onRightClick={handleAccountClick}
          titleAlign="left"
        />
      )}
      
      <div className={`max-w-7xl mx-auto px-4 pb-[120px] ${!connected ? 'pt-16' : 'pt-6'}`}>
        {/* Spotify Error Alert */}
        {displayError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-red-400 font-medium text-sm mb-1">Spotify Connection Failed</h4>
                  <p className="text-red-300/80 text-sm">{displayError}</p>
                  <button 
                    onClick={connect}
                    className="mt-2 text-red-400 text-sm font-medium hover:text-red-300 underline"
                  >
                    Try connecting again
                  </button>
                </div>
              </div>
              <button 
                onClick={dismissError}
                className="text-red-400/60 hover:text-red-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Show loading screen while checking connection status */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1DB954] mx-auto mb-4"></div>
              <h3 className="text-white font-semibold text-lg mb-2">Loading your music data...</h3>
              <p className="text-gray-400 text-sm">Just a moment while we get things ready</p>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 mb-8"
            >
              {connected ? (
                <>
                  {/* Personalized Welcome Greeting */}
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Hello, {user?.display_name || 'Music Lover'}! 👋
                    </h1>
                    <p className="text-gray-400 text-lg">
                      Your musical journey awaits
                    </p>
                  </div>
                  
                  {/* Quick Stats Header - Removed Refresh Button and Title */}
                  
                  {/* Debug Info (Development Only) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30 text-xs">
                      <p className="text-blue-400 mb-1">Debug Info:</p>
                      <ul className="text-blue-300 space-y-1">
                        <li>Connected: {connected ? '✅' : '❌'}</li>
                        <li>Loading: {insightsLoading ? '⏳' : '✅'}</li>
                        <li>Today Minutes: {todayMinutes}</li>
                        <li>Top Genre: {topGenre}</li>
                        <li>Genre %: {topGenrePercentage}</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1DB954]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Today</p>
                        </div>
                      </div>
                      {insightsLoading ? (
                        <>
                          <div className="animate-pulse bg-[#1DB954]/20 h-8 w-20 rounded mb-1"></div>
                          <div className="animate-pulse bg-gray-600/20 h-3 w-24 rounded"></div>
                        </>
                      ) : (
                        <>
                          <div className="text-[#1DB954] text-2xl font-bold mb-1">
                            {todayMinutes > 0 ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m` : `${todayMinutes}m`}
                          </div>
                          <p className="text-gray-400 text-xs">{todayComparison} vs yesterday</p>
                        </>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1ed760]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Top Genre</p>
                        </div>
                      </div>
                      {insightsLoading ? (
                        <>
                          <div className="animate-pulse bg-[#1ed760]/20 h-6 w-24 rounded mb-1"></div>
                          <div className="animate-pulse bg-gray-600/20 h-3 w-20 rounded"></div>
                        </>
                      ) : (
                        <>
                          <div className="text-[#1ed760] text-lg font-bold mb-1">{topGenre}</div>
                          <p className="text-gray-400 text-xs">for the last 4 weeks</p>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-12 h-12 text-[#1DB954]">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-3">Welcome to Sagey</h2>
                  <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Connect your Spotify account to unlock personalized music insights and discover your musical DNA.
                  </p>
                  <button 
                    onClick={connect}
                    disabled={loading}
                    className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    {loading ? 'Connecting...' : 'Connect Spotify'}
                  </button>
                </div>
              )}
            </motion.section>

            {/* Musical Age Section */}
            {connected && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <MusicalAgeEstimator />
              </motion.section>
            )}

            {/* Data Display Section - Only show if connected */}
            {connected && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                {/* Recent Tracks Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">Recently Played</h3>
                    <button 
                      onClick={() => onTabClick?.('explore', { section: 'recent' })}
                      className="text-[#1DB954] text-sm font-medium hover:text-[#1ed760] transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  {dataLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentTracks.slice(0, 1).map((item: any, index: number) => {
                        // Add null safety checks
                        if (!item || !item.track) {
                          return null;
                        }
                        
                        const track = item.track;
                        
                        // Additional safety check for track
                        if (!track || !track.id) {
                          return null;
                        }
                        
                        const formatDuration = (ms: number) => {
                          const minutes = Math.floor(ms / 60000);
                          const seconds = Math.floor((ms % 60000) / 1000);
                          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        };

                        const formatPlayedAt = (dateString: string) => {
                          const date = new Date(dateString);
                          const now = new Date();
                          const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                          
                          if (diffInMinutes < 60) {
                            return `${diffInMinutes}m ago`;
                          } else if (diffInMinutes < 1440) {
                            return `${Math.floor(diffInMinutes / 60)}h ago`;
                          } else {
                            return date.toLocaleDateString();
                          }
                        };

                        return (
                          <div key={`${track.id}-${item.played_at}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            {track.album?.images?.[0]?.url && (
                              <img 
                                src={track.album?.images?.[0]?.url} 
                                alt={track.album?.name || 'Album'}
                                className="w-12 h-12 mr-4 rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{track.name || 'Unknown Track'}</h4>
                              <p className="text-gray-400 text-sm truncate">
                                {track.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist'} • {track.album?.name || 'Unknown Album'}
                              </p>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-400">{track.duration_ms ? formatDuration(track.duration_ms) : '--:--'}</span>
                                <span className="text-gray-400 mx-1">•</span>
                                <span className="text-xs text-[#1DB954]">{formatPlayedAt(item.played_at)}</span>
                              </div>
                            </div>
                            <a 
                              href={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                            </a>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )}
                </div>

                {/* Top Tracks Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">Top Tracks</h3>
                    <button 
                      onClick={() => onTabClick?.('explore', { section: 'tracks' })}
                      className="text-[#1DB954] text-sm font-medium hover:text-[#1ed760] transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  {dataLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topTracks.slice(0, 3).map((track: any, index: number) => {
                        // Add null safety checks
                        if (!track || !track.id) {
                          return null;
                        }
                        
                        const formatDuration = (ms: number) => {
                          const minutes = Math.floor(ms / 60000);
                          const seconds = Math.floor((ms % 60000) / 1000);
                          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        };

                        return (
                          <div key={track.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>
                            {track.image_url && (
                              <img 
                                src={track.image_url} 
                                alt={typeof track.album === 'string' ? track.album : track.album?.name || 'Album'}
                                className="w-12 h-12 mr-4 rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{track.name || 'Unknown Track'}</h4>
                              <p className="text-gray-400 text-sm truncate">
                                {track.artist || 'Unknown Artist'} • {typeof track.album === 'string' ? track.album : track.album?.name || 'Unknown Album'}
                              </p>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-400">{track.duration_ms ? formatDuration(track.duration_ms) : '--:--'}</span>
                                {track.popularity && (
                                  <>
                                    <span className="text-gray-400 mx-1">•</span>
                                    <span className="text-xs text-[#1DB954]">{track.popularity}% popularity</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <a 
                              href={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-2 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                            </a>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )}
                </div>

                {/* Top Artists Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">Top Artists</h3>
                    <button 
                      onClick={() => onTabClick?.('explore', { section: 'artists' })}
                      className="text-[#1ed760] text-sm font-medium hover:text-[#1AA34A] transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  
                  {dataLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topArtists.slice(0, 3).map((artist: any, index: number) => {
                        // Add null safety checks
                        if (!artist || !artist.id) {
                          return null;
                        }
                        
                        // Format number helper
                        const formatNumber = (num: number) => {
                          if (num >= 1000000) {
                            return (num / 1000000).toFixed(1) + 'M';
                          } else if (num >= 1000) {
                            return (num / 1000).toFixed(1) + 'K';
                          }
                          return num.toString();
                        };

                        return (
                          <div key={artist.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <span className="text-[#1ed760] font-bold text-lg mr-4 w-6">#{index + 1}</span>
                            {artist.image_url && (
                              <img 
                                src={artist.image_url} 
                                alt={artist.name || 'Artist'}
                                className="w-16 h-16 mr-4 rounded-full border-2 border-[#1ed760]/20"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-lg truncate">{artist.name || 'Unknown Artist'}</h4>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-400">{artist.followers ? formatNumber(artist.followers) : '0'} followers</span>
                                <span className="text-gray-400 mx-1">•</span>
                                <span className="text-xs text-[#1ed760]">{artist.popularity || 0}% popularity</span>
                              </div>
                              {artist.genres?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {artist.genres.slice(0, 3).map((genre: string, genreIndex: number) => (
                                    <span 
                                      key={genreIndex}
                                      className="px-2 py-1 bg-[#1ed760]/20 text-[#1ed760] text-xs rounded-full"
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
                              href={artist.external_urls?.spotify || `https://open.spotify.com/artist/${artist.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-2 rounded-full bg-[#1ed760]/20 hover:bg-[#1ed760]/30 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1ed760]">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                            </a>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Quick Actions Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 mb-8"
            >
              <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Explore Tab CTA */}
                <button 
                  onClick={() => onTabClick?.('explore')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#1DB954]/20 to-[#1ed760]/20 border border-[#1DB954]/30 hover:border-[#1DB954]/50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#1DB954]/30 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#1DB954]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-sm">Explore Music</span>
                    <span className="text-[#1DB954]/80 text-xs mt-1">Discover new tracks</span>
                  </div>
                </button>

                {/* Insights Tab CTA */}
                <button 
                  onClick={() => onTabClick?.('insights-plus')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#1ed760]/20 to-[#1AA34A]/20 border border-[#1ed760]/30 hover:border-[#1ed760]/50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#1ed760]/30 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#1ed760]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-sm">View Insights</span>
                    <span className="text-[#1ed760]/80 text-xs mt-1">Your music DNA</span>
                  </div>
                </button>

                {/* Stats Tab CTA */}
                <button 
                  onClick={() => onTabClick?.('stats')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#1AA34A]/20 to-[#16803C]/20 border border-[#1AA34A]/30 hover:border-[#1AA34A]/50 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#1AA34A]/30 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#1AA34A]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v10l-4-4-4 4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h.01M10 18h.01M14 18h.01M18 18h.01M6 14h12v6H6z" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-sm">Full Stats</span>
                    <span className="text-[#1AA34A]/80 text-xs mt-1">Complete data</span>
                  </div>
                </button>
              </div>
            </motion.section>
          </>
        )}
      </div>
      
      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={handleCloseUserProfile} />
      )}
      
      {/* Spotify Debug Panel - Always visible with improved error handling */}
      <SpotifyDebugPanel />
    </div>
  );
} 