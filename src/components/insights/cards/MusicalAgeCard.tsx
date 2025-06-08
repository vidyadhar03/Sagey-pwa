"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';
import { useAIInsights } from '../../../hooks/useAIInsights';

export default function MusicalAgeCard() {
  const { insights, isLoading } = useSpotifyInsights();
  const [displayAge, setDisplayAge] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const payload = insights.musicalAge;
  const isFallback = payload.trackCount === 0 || insights.isDefault;

  // AI insights for musical age - pass the full payload now that it includes all fields
  const aiInsights = useAIInsights('musical_age', payload, !isFallback); // Only fetch AI when we have real data

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
    console.log('Musical Age info...');
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
        onShare={handleShare}
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
                <span className="text-white text-xl ml-2">years</span>
              </div>
              {!isFallback && (payload as any)?.era && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-green-400 border border-white/10"
                >
                  {(payload as any).era} Era
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-zinc-300 text-sm leading-relaxed">
            {payload.description}
          </p>
        </motion.div>

        {/* AI Generated Copy */}
        {!isFallback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            {aiInsights.isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1DB954]"></div>
                <span className="text-xs text-zinc-400">Generating insight...</span>
              </div>
            ) : aiInsights.error ? (
              <p className="text-xs text-zinc-400 text-center">We&apos;re speechless 🤫</p>
            ) : (
              <div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {aiInsights.copy}
                </p>
                <div className="flex justify-center mt-2">
                  <span className="text-xs text-zinc-500 flex items-center space-x-1">
                    <span>✨</span>
                    <span>AI Generated</span>
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center items-center mt-4 pt-4 border-t border-white/10"
        >
          <div className="text-center">
            <p className="text-xs text-zinc-400">Avg. Release Year</p>
            <p className={`font-semibold ${isFallback ? 'text-zinc-500' : 'text-[#1DB954]'}`}>
              {payload.averageYear}
            </p>
          </div>
        </motion.div>
      </InsightCard>
    </>
  );
} 