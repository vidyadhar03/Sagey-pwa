"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InsightCard, { InsightCardSkeleton } from './InsightCard';
import { useMockInsights } from '../../../hooks/useMockInsights';

export default function MusicalAgeCard() {
  const { data, loading } = useMockInsights();
  const [displayAge, setDisplayAge] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Rolling number animation
  useEffect(() => {
    if (data?.musicalAge.age && !loading) {
      const targetAge = data.musicalAge.age;
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
          // Show confetti on first render
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [data?.musicalAge.age, loading]);

  if (loading) {
    return <InsightCardSkeleton delay={0} />;
  }

  if (!data) return null;

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
        {/* Big Age Number */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <span className="text-6xl font-bold bg-gradient-to-r from-[#1DB954] via-[#1ED760] to-[#1AA34A] bg-clip-text text-transparent">
              {displayAge}
            </span>
            <span className="text-white text-xl ml-2">years</span>
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
            {data.musicalAge.description}
          </p>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center items-center mt-4 pt-4 border-t border-white/10"
        >
          <div className="text-center">
            <p className="text-xs text-zinc-400">Avg. Release Year</p>
            <p className="text-[#1DB954] font-semibold">{data.musicalAge.averageYear}</p>
          </div>
        </motion.div>
      </InsightCard>
    </>
  );
} 