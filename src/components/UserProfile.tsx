"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useSpotify } from '../hooks/useSpotify';

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, connected } = useSpotify();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (!connected || !user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1A1A1A] rounded-2xl p-6 max-w-md w-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Account</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1DB954]/20 to-[#1AA34A]/20 border border-[#1DB954]/30 mb-6">
          <div className="flex items-center">
            {user?.images?.[0] && (
              <img 
                src={user.images[0].url} 
                alt={user.display_name}
                className="w-16 h-16 rounded-full mr-4 border-2 border-[#1DB954]/50"
              />
            )}
            <div>
              <h3 className="text-white text-xl font-semibold">{user?.display_name}</h3>
              <p className="text-[#1DB954] text-sm">{user?.email}</p>
              {user?.followers && (
                <p className="text-gray-400 text-sm">{formatNumber(user.followers)} followers</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Country</span>
              <span className="text-white text-sm">{user?.country || 'Not specified'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Subscription</span>
              <span className="text-white text-sm capitalize">{user?.product || 'Free'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">User ID</span>
              <span className="text-white text-sm font-mono">{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
            Settings
          </button>
          <button className="w-full p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors">
            Disconnect Spotify
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 