"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import RefreshButton from './RefreshButton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';
import { useAIInsights } from '../../../hooks/useAIInsights';

export default function GenrePassportCard() {
  const { insights, isLoading } = useSpotifyInsights();
  const [showModal, setShowModal] = useState(false);

  const payload = insights.genrePassport;
  const isFallback = (payload?.totalGenres === 0 || insights.isDefault) ?? true;

  // AI Insights - Only fetch when not in fallback mode
  const aiInsights = useAIInsights(
    'genre_passport', 
    payload,
    !isFallback && !isLoading // Pass enabled flag as third parameter
  );
  const { copy, isLoading: aiLoading, error: aiError, mutate } = aiInsights;

  const handleRefreshInsight = async () => {
    if (mutate) {
      await mutate({ regenerate: true });
    }
  };

  if (isLoading) {
    return <InsightSkeleton />;
  }

  const handleShare = () => {
    console.log('Sharing Genre Passport insight...');
  };

  const handleInfo = () => {
    console.log('Genre Passport info...');
  };

  const handleBadgeClick = () => {
    if (!isFallback) {
      setShowModal(true);
    }
  };

  return (
    <>
      <InsightCard
        title="Genre Passport"
        onShare={handleShare}
        onInfo={handleInfo}
        delay={0.2}
      >
        {/* Fallback Notice */}
        {isFallback && (
          <div className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 rounded-lg border border-white/10">
            <p className="text-xs text-zinc-400">Connect Spotify to unlock this insight</p>
          </div>
        )}

        {/* Genre Count Badge */}
        <div className="flex justify-center mb-4">
          <motion.button
            onClick={handleBadgeClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            whileHover={!isFallback ? { scale: 1.05 } : {}}
            whileTap={!isFallback ? { scale: 0.95 } : {}}
            className={`relative rounded-full w-24 h-24 
                     flex items-center justify-center shadow-lg transition-shadow
                     border-4 ${
                       isFallback 
                         ? 'bg-zinc-700 border-zinc-600 cursor-default' 
                         : 'bg-gradient-to-br from-[#1DB954] to-[#1AA34A] border-white/20 hover:shadow-xl cursor-pointer'
                     }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${isFallback ? 'text-zinc-400' : 'text-white'}`}>
                {payload.totalGenres}
              </div>
              <div className={`text-xs ${isFallback ? 'text-zinc-500' : 'text-white/90'}`}>
                genres
              </div>
            </div>
            
            {/* Passport stamps effect */}
            {!isFallback && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                <span className="text-xs">🌟</span>
              </div>
            )}
          </motion.button>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-4"
        >
          <p className={`font-semibold ${isFallback ? 'text-zinc-500' : 'text-white'}`}>
            {isFallback ? 'Musical Explorer' : 'Musical Explorer'}
          </p>
          <p className="text-zinc-400 text-sm">Your taste spans {payload.totalGenres} genres</p>
        </motion.div>

        {/* AI Generated Copy */}
        {!isFallback && !aiLoading && !aiError && copy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
          >
            <p className="text-sm leading-snug">{copy}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                ✨ AI Generated
              </span>
              <RefreshButton 
                onRefresh={handleRefreshInsight}
                isLoading={aiLoading}
              />
            </div>
          </motion.div>
        )}

        {/* Loading skeleton for AI */}
        {!isFallback && aiLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {!isFallback && aiError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
          >
            <p className="text-sm leading-snug text-zinc-400">We&apos;re speechless 🤫</p>
            <div className="flex justify-between items-center mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                ✨ AI Generated
              </span>
              <RefreshButton 
                onRefresh={handleRefreshInsight}
                isLoading={aiLoading}
              />
            </div>
          </motion.div>
        )}

        {/* Exploration Score */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 rounded-xl p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-300 text-sm">Exploration Score</span>
            <span className={`font-semibold ${isFallback ? 'text-zinc-500' : 'text-[#1DB954]'}`}>
              {payload.explorationScore}/100
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${payload.explorationScore}%` }}
              transition={{ delay: 1, duration: 1.2 }}
              className={`h-full rounded-full ${
                isFallback 
                  ? 'bg-zinc-600' 
                  : 'bg-gradient-to-r from-[#1DB954] to-[#1AA34A]'
              }`}
            />
          </div>
        </motion.div>

        {/* Tap to view hint */}
        {!isFallback && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-zinc-500 text-xs text-center mt-2"
          >
            Tap badge to view all genres
          </motion.p>
        )}
      </InsightCard>

      {/* Modal */}
      <AnimatePresence>
        {showModal && !isFallback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-hidden
                       border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Your Genre Collection</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white/20 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-60 space-y-2">
                {payload.topGenres.map((genre, index) => (
                  <motion.div
                    key={genre}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
                    <span className="text-white text-sm">{genre}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 