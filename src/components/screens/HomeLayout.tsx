"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopAppBar from '../TopAppBar';
import ChatInterface from '../ChatInterface';
import { useSpotify } from '../../hooks/useSpotify';

interface HomeLayoutProps {
  onTabClick?: (tab: string) => void;
}

export default function HomeLayout({ onTabClick }: HomeLayoutProps) {
  const { connected, user, loading, getTopTracks, getTopArtists, getRecentTracks, connect } = useSpotify();
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (connected && user) {
      loadQuickData();
    }
  }, [connected, user]);

  const loadQuickData = async () => {
    setDataLoading(true);
    try {
      const [recent, tracks, artists] = await Promise.all([
        getRecentTracks(),
        getTopTracks('short_term'),
        getTopArtists('short_term')
      ]);
      
      setRecentTracks(recent?.slice(0, 3) || []);
      setTopTracks(tracks?.slice(0, 3) || []);
      setTopArtists(artists?.slice(0, 3) || []);
    } catch (error) {
      console.error('Failed to load quick data:', error);
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

  return (
    <>
      <TopAppBar
        title="Sagey"
        showLeftIcon={false}
        showRightIcon={true}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 pb-[280px]">
          {/* Welcome Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] flex items-center justify-center overflow-hidden mr-4 border-2 border-[#1DB954]/30">
                {user?.images?.[0] ? (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Hello, {user?.display_name || 'Music Lover'}
                </h2>
                <p className="text-[#1DB954] text-sm">Your musical journey awaits</p>
              </div>
            </div>
          </motion.section>

          {/* Quick Stats Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 mb-8"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Your Music at a Glance</h3>
            
            {connected ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Listening Time */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#1DB954]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium text-sm">Today</h4>
                  </div>
                  <p className="text-[#1DB954] text-xl font-bold">2h 34m</p>
                  <p className="text-gray-400 text-xs">+12% vs yesterday</p>
                </div>

                {/* Top Genre */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1ed760]/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#1ed760]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium text-sm">Top Genre</h4>
                  </div>
                  <p className="text-[#1ed760] text-lg font-bold">Electronic</p>
                  <p className="text-gray-400 text-xs">35% of listening</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={connect}
                className="w-full p-6 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/20 hover:border-[#1DB954]/40 hover:bg-[#1DB954]/15 text-center transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-[#1DB954]">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-2">Connect Spotify</h4>
                <p className="text-[#1DB954]/80 text-sm">Connect to see your music insights</p>
              </button>
            )}
          </motion.section>

          {/* Recently Played Section */}
          {connected && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Recently Played</h3>
                <button 
                  onClick={() => onTabClick?.('stats')}
                  className="text-[#1DB954] text-sm font-medium hover:text-[#1ed760] transition-colors"
                >
                  View All
                </button>
              </div>
              
              {dataLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/5 h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTracks.map((track, index) => (
                    <div key={`${track.track?.id || track.id}-${index}`} className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#1DB954]/30 transition-all">
                      <div className="flex items-center">
                        {(track.track?.album?.images?.[0] || track.album?.images?.[0]) && (
                          <img 
                            src={(track.track?.album?.images?.[0] || track.album?.images?.[0]).url} 
                            alt={(track.track?.album?.name || track.album?.name)}
                            className="w-12 h-12 rounded-lg mr-3"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate text-sm">
                            {track.track?.name || track.name}
                          </p>
                                                     <p className="text-gray-400 text-xs truncate">
                             {(track.track?.artists || track.artists)?.map((artist: any) => artist.name).join(', ')}
                           </p>
                        </div>
                        {track.played_at && (
                          <span className="text-[#1DB954] text-xs">
                            {formatPlayedAt(track.played_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {/* Top Tracks & Artists Section */}
          {connected && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Tracks */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Top Tracks</h4>
                    <span className="text-[#1DB954] text-xs">This month</span>
                  </div>
                  
                  {dataLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topTracks.map((track, index) => (
                        <div key={track.id} className="flex items-center">
                          <span className="text-[#1DB954] font-bold text-sm w-6">#{index + 1}</span>
                          {track.album?.images?.[0] && (
                            <img 
                              src={track.album.images[0].url} 
                              alt={track.album.name}
                              className="w-8 h-8 rounded mr-2"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{track.name}</p>
                            <p className="text-gray-400 text-xs truncate">
                              {track.artists?.map((artist: any) => artist.name).join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Artists */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Top Artists</h4>
                    <span className="text-[#1ed760] text-xs">This month</span>
                  </div>
                  
                  {dataLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                                              {topArtists.map((artist: any, index: number) => (
                        <div key={artist.id} className="flex items-center">
                          <span className="text-[#1ed760] font-bold text-sm w-6">#{index + 1}</span>
                          {artist.images?.[0] && (
                            <img 
                              src={artist.images[0].url} 
                              alt={artist.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                            <p className="text-gray-400 text-xs">
                              {artist.followers?.total ? `${Math.floor(artist.followers.total / 1000)}K followers` : 'Artist'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* Quick Actions Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 mb-8"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
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
                onClick={() => onTabClick?.('insights')}
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

              {/* AI Chat CTA */}
              <button 
                onClick={() => {
                  // Scroll to bottom to focus on chat interface
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#16803C]/20 to-[#0F5D2E]/20 border border-[#16803C]/30 hover:border-[#16803C]/50 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#16803C]/30 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#16803C]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm">Ask Sagey</span>
                  <span className="text-[#16803C]/80 text-xs mt-1">Music insights</span>
                </div>
              </button>
            </div>
          </motion.section>


        </div>
      </div>
      
      <ChatInterface />
    </>
  );
} 