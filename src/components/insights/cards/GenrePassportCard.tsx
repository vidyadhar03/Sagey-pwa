"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import RefreshButton from './RefreshButton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';
import { useAIInsights } from '../../../hooks/useAIInsights';
import { InsightDetailSheet } from '../detail/InsightDetailSheet';

export default function GenrePassportCard() {
  const { insights, isLoading } = useSpotifyInsights();
  const [showModal, setShowModal] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

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
    setDetailSheetOpen(true);
  };

  const handleBadgeClick = () => {
    if (!isFallback) {
      setShowModal(true);
    }
  };

  // Get top 3 genres for display
  const topThreeGenres = payload?.topGenres?.slice(0, 3) || [];

  return (
    <>
      <InsightCard
        title="Genre Passport"
        onInfo={handleInfo}
        delay={0.2}
      >
        {/* Fallback Notice */}
        {isFallback && (
          <div className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 rounded-lg border border-white/10">
            <p className="text-xs text-zinc-400">Connect Spotify to unlock this insight</p>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-4">
          {/* Exploration Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className={`text-lg font-semibold ${isFallback ? 'text-zinc-500' : 'text-white'}`}>
              You have explored
            </p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={`text-3xl font-bold ${isFallback ? 'text-zinc-400' : 'text-[#1DB954]'}`}
            >
              {payload?.totalGenres || 0} genres
            </motion.div>
          </motion.div>

          {/* Top 3 Genres Visual */}
          {!isFallback && topThreeGenres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h4 className="text-white/80 text-sm font-medium text-center mb-4">Your Top Genres</h4>
              {topThreeGenres.map((genre, index) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                        'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                      }`}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Genre Name */}
                    <div className="flex-1">
                      <span className="text-white font-medium capitalize">{genre}</span>
                    </div>
                    
                    {/* Musical Note Icon */}
                    <div className="text-[#1DB954] text-lg">🎵</div>
                  </div>
                  
                  {/* Connecting line for visual flow */}
                  {index < 2 && (
                    <div className="absolute left-7 top-full w-0.5 h-3 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Fallback state for genres */}
          {isFallback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h4 className="text-zinc-500 text-sm font-medium text-center mb-4">Your Top Genres</h4>
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3 border border-zinc-700">
                  <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-sm font-bold text-zinc-400">
                    {index}
                  </div>
                  <div className="flex-1">
                    <span className="text-zinc-500 font-medium">Connect Spotify to see genres</span>
                  </div>
                  <div className="text-zinc-600 text-lg">🎵</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* AI Generated Copy */}
          {!isFallback && !aiLoading && !aiError && copy && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <p className="text-xs text-zinc-300 leading-relaxed">{copy}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                  ✨ AI Generated
                </span>
                <RefreshButton 
                  onRefresh={handleRefreshInsight}
                />
              </div>
            </motion.div>
          )}

          {/* Loading skeleton for AI */}
          {!isFallback && aiLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
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
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <p className="text-xs text-zinc-400 leading-relaxed">We&apos;re speechless 🤫</p>
              <div className="flex justify-between items-center mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  ✨ AI Generated
                </span>
                <RefreshButton 
                  onRefresh={handleRefreshInsight}
                />
              </div>
            </motion.div>
          )}

          {/* Tap to view all hint */}
          {!isFallback && payload?.topGenres?.length > 3 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              onClick={handleBadgeClick}
              className="w-full text-zinc-500 text-xs text-center py-2 hover:text-zinc-400 transition-colors"
            >
              Tap to view all {payload.totalGenres} genres
            </motion.button>
          )}
        </div>
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
                {payload?.topGenres?.map((genre, index) => (
                  <motion.div
                    key={genre}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
                    <span className="text-white text-sm capitalize">{genre}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Sheet */}
      <InsightDetailSheet
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        type="genre_passport"
        title="Genre Passport"
        payload={payload}
      />
    </>
  );
} 