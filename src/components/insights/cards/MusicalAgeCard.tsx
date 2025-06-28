"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import RefreshButton from './RefreshButton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';
import { useAIInsights } from '../../../hooks/useAIInsights';
import { InsightDetailSheet } from '../detail/InsightDetailSheet';

export default function MusicalAgeCard() {
  const { insights, isLoading } = useSpotifyInsights();
  const [displayAge, setDisplayAge] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [open, setOpen] = useState(false);

  const payload = insights.musicalAge;
  const isFallback = payload.trackCount === 0 || insights.isDefault;

  // AI Insights - Only fetch when not in fallback mode
  const aiInsights = useAIInsights(
    'musical_age', 
    payload,
    !isFallback && !isLoading // Pass enabled flag as third parameter
  );
  const { copy, isLoading: aiLoading, error: aiError, mutate } = aiInsights;

  const handleRefreshInsight = async () => {
    if (mutate) {
      await mutate({ regenerate: true });
    }
  };

  // Rolling number animation
  useEffect(() => {
    if (payload.age && !isLoading) {
      const targetAge = payload.age;
      const duration = 2000; // 2 seconds
      const steps = 50;
      const increment = targetAge / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(Math.floor(increment * step), targetAge);
        setDisplayAge(current);

        if (current >= targetAge) {
          clearInterval(timer);
          // Show confetti on first render only if not fallback
          if (!isFallback) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [payload.age, isLoading, isFallback]);

  if (isLoading) {
    return <InsightSkeleton />;
  }

  const handleShare = () => {
    console.log('Sharing Musical Age insight...');
  };

  const handleInfo = () => {
    setOpen(true);
  };

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                opacity: 0
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5
              }}
              className="absolute w-2 h-2 bg-[#1DB954] rounded"
              style={{
                backgroundColor: ['#1DB954', '#1ED760', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 4)]
              }}
            />
          ))}
        </div>
      )}

      <InsightCard
        title="Musical Age"
        onInfo={handleInfo}
        delay={0}
      >
        {/* Fallback Notice */}
        {isFallback && (
          <div className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 rounded-lg border border-white/10">
            <p className="text-xs text-zinc-400">Connect Spotify to unlock this insight</p>
          </div>
        )}

        {/* Big Age Number */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-baseline">
                <span className={`text-6xl font-bold ${isFallback ? 'text-zinc-500' : 'bg-gradient-to-r from-[#1DB954] via-[#1ED760] to-[#1AA34A] bg-clip-text text-transparent'}`}>
                  {displayAge}
                </span>
                <span className="text-white text-xl ml-2" data-testid="age-years">years</span>
              </div>
              {!isFallback && (payload as any)?.era && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-green-400 border border-white/10"
                  data-testid="era-badge"
                >
                  {(payload as any).era} Era
                </motion.span>
              )}
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-zinc-400 text-sm mt-2"
            >
              Average age of your music
            </motion.p>
          </motion.div>
        </div>

        {/* Clear Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-4"
        >
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-zinc-300 text-sm font-medium mb-2">
              Your music taste centers around {payload.averageYear}
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Musical Age = how old your music is on average
              <br />
              (Current year - Your average release year = {new Date().getFullYear()} - {payload.averageYear})
            </p>
          </div>
        </motion.div>

        {/* Decade Bar Graph */}
        {!isFallback && payload.decadeBuckets && payload.decadeBuckets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <div className="text-center mb-3">
              <p className="text-zinc-400 text-xs font-medium mb-1">Music Distribution Across Decades</p>
              <p className="text-zinc-500 text-xs">Shows what eras you listen to (not your Musical Age)</p>
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {payload.decadeBuckets.map((bucket, index) => {
                const maxWeight = Math.max(...payload.decadeBuckets.map(b => b.weight));
                const height = maxWeight > 0 ? Math.max(8, (bucket.weight / maxWeight) * 40) : 8;
                const decadeLabel = bucket.decade < 2000 ? `${bucket.decade.toString().slice(-2)}s` : `${bucket.decade.toString().slice(-2)}s`;
                
                return (
                  <motion.div
                    key={bucket.decade}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-6 bg-gradient-to-t from-[#1DB954] to-[#1ED760] rounded-sm transition-all duration-300"
                      style={{ height: `${height}px` }}
                      title={`${bucket.decade}s: ${Math.round(bucket.weight)} tracks`}
                    />
                    <span className="text-xs text-zinc-400 font-medium">
                      {decadeLabel}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* AI Generated Copy */}
        {!isFallback && !aiLoading && !aiError && copy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
          >
            <p className="text-xs text-zinc-300 leading-relaxed" data-testid="ai-copy">
              {copy}
            </p>
            <div className="flex justify-between items-center mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400" data-testid="ai-generated-label">
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
            <p className="text-xs text-zinc-400 leading-relaxed">We&apos;re speechless 🤫</p>
            <div className="flex justify-between items-center mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                ✨ AI Generated
              </span>
              <RefreshButton 
                onRefresh={handleRefreshInsight}
              />
            </div>
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex justify-center items-center mt-4 pt-4 border-t border-white/10"
        >
          <div className="text-center">
            <p className="text-xs text-zinc-400">Your Music Centers Around</p>
            <p className={`font-semibold text-lg ${isFallback ? 'text-zinc-500' : 'text-[#1DB954]'}`}>
              {payload.averageYear}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {!isFallback && `${new Date().getFullYear() - payload.averageYear} years ago`}
            </p>
          </div>
        </motion.div>


      </InsightCard>

      {/* Musical Age Detail Sheet */}
      <InsightDetailSheet
        open={open}
        onClose={() => setOpen(false)}
        type="musical_age"
        title="Musical Age"
        payload={payload}
      />
    </>
  );
} 