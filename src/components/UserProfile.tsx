"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSpotify } from '../hooks/useSpotify';
import { useRouter } from 'next/navigation';
import Loader from './Loader';

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, connected, logout, checkStatus } = useSpotify();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debug logging to check user data
  console.log('🔍 UserProfile Debug:', {
    userExists: !!user,
    userId: user?.id,
    displayName: user?.display_name,
    email: user?.email,
    product: user?.product,
    productType: typeof user?.product,
    fullUser: user
  });

  const handleRefreshData = async () => {
    console.log('🔄 Manually refreshing Spotify status...');
    await checkStatus();
  };

  // Function to determine if user has premium features
  // Sometimes the product field is not returned by Spotify API
  const isPremiumUser = () => {
    // Primary check: explicit product field
    if (user?.product === 'premium') return true;
    
    // Fallback: If user exists and product is undefined, 
    // we'll assume premium for now (can be refined later)
    // This is a temporary fix while we investigate the API issue
    if (user && user.product === undefined) {
      console.log('⚠️ Product field undefined, assuming premium status');
      return true; // Temporary assumption
    }
    
    return false;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleDisconnect = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Navigate to onboarding immediately
      router.push('/onboarding');
      // Close the modal (in case route keeps component mounted during transition)
      onClose();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      // Still close modal even if logout had issues
      onClose();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!connected || !user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
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
        <div className="bg-gradient-to-r from-[#1DB954]/20 to-[#1AA34A]/20 rounded-xl p-4 mb-6 border border-[#1DB954]/30">
          <div className="flex items-center">
            {user?.images?.[0] ? (
              <img 
                src={user.images[0].url} 
                alt={user.display_name}
                className="w-16 h-16 rounded-full mr-4 border-2 border-[#1DB954]/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full mr-4 border-2 border-[#1DB954]/50 bg-gradient-to-br from-[#1DB954]/30 to-[#1AA34A]/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#1DB954]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-white text-xl font-semibold">{user?.display_name}</h3>
              <p className="text-[#1DB954] text-sm">{user?.email}</p>
              {user?.followers && (
                <p className="text-gray-400 text-sm">{formatNumber(user.followers)} followers</p>
              )}
            </div>
          </div>
        </div>

        {/* Music Stats Section - Relevant to Vynce */}
        <div className="space-y-3 mb-6">
          {/* Spotify Premium Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#1DB954]">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <span className="text-gray-300 text-sm font-medium">Spotify Plan</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-semibold capitalize ${
                isPremiumUser() ? 'text-[#1DB954]' : 'text-gray-400'
              }`}>
                {isPremiumUser() ? 'Premium' : 'Free'}
              </span>
            </div>
          </div>

          {/* Music Discovery Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09z" />
                </svg>
              </div>
              <span className="text-gray-300 text-sm font-medium">Music Explorer</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-purple-400">Active</span>
              <div className="text-xs text-purple-400/70">Analyzing your taste</div>
            </div>
          </div>

          {/* Vynce Insights Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-orange-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <span className="text-gray-300 text-sm font-medium">Insights Access</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-orange-400">Unlimited</span>
              <div className="text-xs text-orange-400/70">AI-powered insights</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={handleDisconnect}
            disabled={isLoggingOut}
            className="w-full p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 text-red-400 font-medium transition-colors flex items-center justify-center"
          >
            {isLoggingOut ? (
              <>
                <Loader size={16} className="-ml-1 mr-3" />
                Disconnecting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Disconnect Spotify
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 