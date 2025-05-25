"use client";

import React from 'react';
import { useSpotify } from '../hooks/useSpotify';

export default function SpotifyConnection() {
  const { connected, user, loading, connect, error } = useSpotify();

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10 animate-pulse">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 mr-3"></div>
          <div>
            <div className="w-24 h-4 bg-white/10 rounded mb-1"></div>
            <div className="w-16 h-3 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (connected && user) {
    return (
      <div className="p-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-[#1DB954]">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Spotify Connected</h3>
              <p className="text-secondary text-sm">Welcome, {user.display_name}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#1DB954] rounded-full mr-2"></div>
            <span className="text-[#1DB954] text-sm font-medium">Active</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/spotify-data'}
          className="w-full py-2 bg-[#1DB954]/20 hover:bg-[#1DB954]/30 border border-[#1DB954]/30 rounded-lg text-[#1DB954] text-sm font-medium transition-all flex items-center justify-center"
        >
          View Music Data & Insights
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-white/60">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">Connect Spotify</h3>
            <p className="text-secondary text-sm">Get personalized music insights</p>
          </div>
        </div>
        <button 
          onClick={connect}
          className="px-4 py-2 bg-[#1DB954] hover:bg-[#1DB954]/90 rounded-full text-white text-sm font-medium transition-all"
        >
          Connect
        </button>
      </div>
      {error && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
} 