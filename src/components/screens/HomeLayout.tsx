"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import UserProfile from '../UserProfile';
import SpotifyDebugPanel from '../SpotifyDebugPanel';

import HomeMusicRadar from '../../features/radar/HomeMusicRadar';
import MentalHealthInsights from '../MentalHealthInsights';
import RecentPlays from '../RecentPlays';
import LastFourWeeksSection from '../LastFourWeeksSection';
import { useSpotify } from '../../hooks/useSpotify';
import { useSpotifyDebug } from '../../hooks/useSpotifyDebug';
import { useSpotifyInsights } from '../../hooks/useSpotifyInsights';
import { getTrackImage } from '../../utils';
import Loader from '../Loader';

interface HomeLayoutProps {
  onTabClick?: (tab: string, options?: { section?: string }) => void;
  onInsightShare?: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export default function HomeLayout({ onTabClick, onInsightShare, scrollContainerRef }: HomeLayoutProps) {
  const { connected, user, loading, error: spotifyHookError, getTopTracks, getTopArtists, connect } = useSpotify();
  const { addLog } = useSpotifyDebug();
  const { 
    insights,
    isLoading: insightsLoading,
  } = useSpotifyInsights();
  
  // Extract values from insights for backwards compatibility
  // Removed today stats variables - now using Last 4 Weeks section
  const topGenre = insights.genrePassport.topGenres[0] || 'Mixed';
  
  // State for this component is now much simpler
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
  }, [addLog, connected, loading, user]);

  // Log connection state changes
  useEffect(() => {
    addLog('info', 'status', 'Spotify connection state changed', {
      connected,
      hasUser: !!user,
      loading,
      userId: user?.id
    });
  }, [addLog, connected, user, loading]);

  // Initialize home data - now only fetches top tracks/artists
  const initializeHomeData = useCallback(async () => {
    console.log('🏠 HomeLayout: Starting initialization (Tops only)...');
    setDataLoading(true);
    
    try {
      console.log('🏠 HomeLayout: Loading top tracks/artists via useSpotify cache...');
      
      const [tracks, artists] = await Promise.all([
        getTopTracks('short_term'),
        getTopArtists('short_term')
      ]);
      
      setTopTracks(tracks?.slice(0, 5) || []);
      setTopArtists(artists?.slice(0, 5) || []);
      setIsInitialized(true);
      dataLoadedRef.current = true;
      
    } catch (error) {
      console.error('🏠 HomeLayout: Failed to initialize data:', error);
      setSpotifyError('Failed to load music data. Please try refreshing.');
    } finally {
      setDataLoading(false);
    }
  }, [getTopTracks, getTopArtists]);

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
      setTopTracks([]);
      setTopArtists([]);
      setDataLoading(false);
      setIsInitialized(false);
      dataLoadedRef.current = false;
    }
  }, [connected, user, isInitialized, initializeHomeData]);

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
    <div 
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]"
    >

      
      {/* Show loading screen while checking connection status */}
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <Loader size={64} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 pb-[120px] pt-16">
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

          {/* Welcome Header */}
          {connected && user && (
            <div className="mt-3 mb-8">
              <h1 className="text-3xl font-bold text-white">
                Welcome, <span className="text-green-400">{user.display_name}</span>
              </h1>
                              <p className="text-zinc-400 mt-1">Here&apos;s what your music says about you.</p>
            </div>
          )}

          {/* Music Radar Overview */}
          {connected && (
            <div className="mb-4">
              <HomeMusicRadar onTabClick={onTabClick} onShareClick={onInsightShare} />
            </div>
          )}

          {/* Mental Health Insights Section */}
          {connected && (
            <div className="mb-8">
              <MentalHealthInsights />
            </div>
          )}

          {/* Recently Played Section */}
          {connected && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Recently Played</h3>
                <button 
                  onClick={() => onTabClick?.('explore', { section: 'recent' })}
                  className="text-[#1AA34A] text-sm font-medium hover:text-[#16803C] transition-colors"
                >
                  View All
                </button>
              </div>
              <RecentPlays limit={1} />
            </div>
          )}

          {/* Main Content: Stats, Top Tracks/Artists */}
          {connected && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Last 4 Weeks Stats */}
              <div className="lg:col-span-1">
                <LastFourWeeksSection />
              </div>

              {/* Top Tracks Section */}
              <div className="lg:col-span-2">
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

                      const trackImage = getTrackImage(track);
                      
                      return (
                        <div key={track.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <span className="text-[#1DB954] font-bold text-lg mr-4 w-6">#{index + 1}</span>
                          {trackImage && (
                            <img 
                              src={trackImage} 
                              alt={typeof track.album === 'string' ? track.album : track.album?.name || 'Album'}
                              className="w-14 h-14 mr-4 rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{track.name || 'Unknown Track'}</h4>
                            <p className="text-gray-400 text-sm truncate">
                              {track.artist || track.artists?.[0]?.name || 'Unknown Artist'} • {typeof track.album === 'string' ? track.album : track.album?.name || 'Unknown Album'}
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
              <div className="lg:col-span-2">
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
            </div>
          )}

          {/* Quick Actions Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 mb-8"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {/* First row - Top Music and Insights */}
              <div className="grid grid-cols-2 gap-3">
                {/* Top Music Tab */}
                <button 
                  onClick={() => onTabClick?.('explore')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#1ed760]/30 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1ed760]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="text-white font-medium text-sm">Top music</span>
                  </div>
                </button>

                {/* AI Insights Tab */}
                <button 
                  onClick={() => onTabClick?.('insights-plus')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#1ed760]/30 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1ed760]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                    </svg>
                    <span className="text-white font-medium text-sm">Insights</span>
                  </div>
                </button>
              </div>

              {/* Second row - Share button full width */}
              <button 
                onClick={onInsightShare}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#1ed760]/30 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1ed760]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  <span className="text-white font-medium text-sm">Share</span>
                </div>
              </button>
            </div>
          </motion.section>
        </div>
      )}
      
      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={handleCloseUserProfile} />
      )}
      
      {/* Spotify Debug Panel - Always visible with improved error handling */}
      <SpotifyDebugPanel />
    </div>
  );
} 