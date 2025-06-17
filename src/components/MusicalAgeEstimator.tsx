"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useMusicalAge } from '../hooks/useMusicalAge';

/**
 * Musical Age Estimator Component
 * 
 * This component displays the user's "Musical Age" - a fun metric that compares
 * their actual age to the average release year of their top Spotify tracks.
 * 
 * Features:
 * - Real-time calculation based on Spotify data
 * - AI-generated personalized insights
 * - Retro-style visual design with animations
 * - Responsive layout with Tailwind CSS
 * - Comprehensive error handling and loading states
 */
export default function MusicalAgeEstimator() {
  const { data, loading, error, refetch } = useMusicalAge();

  // Loading state with animated skeleton
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30"
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse mr-4" />
          <div>
            <div className="h-6 bg-white/20 rounded animate-pulse mb-2 w-32" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-24" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
        </div>
      </motion.div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 border border-red-500/30"
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Musical Age Unavailable</h3>
            <p className="text-red-200 text-sm">Unable to calculate your musical age</p>
          </div>
        </div>
        
        <div className="bg-red-500/10 rounded-xl p-4 mb-4">
          <p className="text-red-200 text-sm mb-3">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  // Success state with musical age data
  if (!data) return null;

  const getAgeColor = (ageDiff: number) => {
    if (Math.abs(ageDiff) <= 3) return 'from-green-500 to-emerald-500';
    if (ageDiff > 3) return 'from-purple-500 to-indigo-500';
    return 'from-orange-500 to-pink-500';
  };

  const getAgeIcon = (ageDiff: number) => {
    if (Math.abs(ageDiff) <= 3) return '🎯'; // Perfect match
    if (ageDiff > 3) return '👴'; // Old soul
    return '🚀'; // Young at heart
  };

  const getEraDescription = (year: number) => {
    if (year >= 2020) return 'Ultra-Modern Era';
    if (year >= 2010) return 'Digital Era';
    if (year >= 2000) return 'Millennium Era';
    if (year >= 1990) return 'Golden 90s';
    if (year >= 1980) return 'Retro 80s';
    if (year >= 1970) return 'Classic 70s';
    if (year >= 1960) return 'Vintage 60s';
    return 'Timeless Classics';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAgeColor(data.ageDifference)} flex items-center justify-center mr-4 shadow-lg`}
        >
          <span className="text-2xl">{getAgeIcon(data.ageDifference)}</span>
        </motion.div>
        <div>
          <h3 className="text-white font-bold text-xl">Musical Age Estimator</h3>
          <p className="text-purple-200 text-sm">Your musical DNA revealed</p>
        </div>
      </div>

      {/* Main Musical Age Display */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 rounded-xl p-6 mb-6 backdrop-blur-sm border border-white/20"
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <span className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              {data.musicalAge}
            </span>
            <span className="text-white text-2xl ml-2">years</span>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-purple-200 text-lg mb-2"
          >
            Your Musical Age
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-4 text-sm"
          >
            <span className="text-white/80">
              Based on {data.totalTracks} tracks
            </span>
            <span className="text-purple-300">•</span>
            <span className="text-white/80">
              Avg. year: {data.averageReleaseYear}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Age Comparison */}
      {data.actualAge && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Actual Age</p>
            <p className="text-white text-2xl font-bold">{data.actualAge}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Difference</p>
            <p className={`text-2xl font-bold ${data.ageDifference > 0 ? 'text-purple-400' : data.ageDifference < 0 ? 'text-orange-400' : 'text-green-400'}`}>
              {data.ageDifference > 0 ? '+' : ''}{data.ageDifference}
            </p>
          </div>
        </motion.div>
      )}

      {/* Era Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 mb-6 border border-purple-500/20"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Your Musical Era</h4>
          <span className="text-purple-300 text-sm">{getEraDescription(data.averageReleaseYear)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60 mb-1">Oldest Track</p>
            <p className="text-white font-medium truncate">&quot;{data.oldestTrack.name}&quot;</p>
            <p className="text-purple-300 text-xs">{data.oldestTrack.artist} • {data.oldestTrack.year}</p>
          </div>
          <div>
            <p className="text-white/60 mb-1">Newest Track</p>
            <p className="text-white font-medium truncate">&quot;{data.newestTrack.name}&quot;</p>
            <p className="text-orange-300 text-xs">{data.newestTrack.artist} • {data.newestTrack.year}</p>
          </div>
        </div>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20"
      >
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center">
              AI Insight
              <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">GPT-4</span>
            </h4>
            <p className="text-white/90 text-sm leading-relaxed">{data.aiInsight}</p>
          </div>
        </div>
      </motion.div>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-center"
      >
        <button
          onClick={refetch}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Recalculate Musical Age
        </button>
      </motion.div>
    </motion.div>
  );
} 