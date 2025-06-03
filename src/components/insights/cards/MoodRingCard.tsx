"use client";

import React from 'react';
import { motion } from 'framer-motion';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';

export default function MoodRingCard() {
  const { insights, isLoading } = useSpotifyInsights();

  if (isLoading) {
    return <InsightSkeleton />;
  }

  const payload = insights.moodRing;
  const isFallback = payload.distribution.length === 0 || insights.isDefault;

  const handleShare = () => {
    console.log('Sharing Mood Ring insight...');
  };

  const handleInfo = () => {
    console.log('Mood Ring info...');
  };

  const emotions = payload.emotions;
  const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
  
  // Calculate angles for donut chart
  const segments = Object.entries(emotions).map(([emotion, value], index) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = total > 0 ? (value / total) * 360 : 0;
    return { emotion, value, percentage, angle };
  });

  const colors = {
    happy: '#1DB954',
    energetic: '#FF6B6B', 
    chill: '#4ECDC4',
    melancholy: '#9B59B6'
  };

  // Simple donut chart using CSS conic-gradient
  const gradientStops = segments.reduce((acc, segment, index) => {
    const prevAngle = segments.slice(0, index).reduce((sum, seg) => sum + seg.angle, 0);
    const currentAngle = prevAngle + segment.angle;
    const color = colors[segment.emotion as keyof typeof colors];
    
    if (index === 0) {
      acc.push(`${color} 0deg ${currentAngle}deg`);
    } else {
      acc.push(`${color} ${prevAngle}deg ${currentAngle}deg`);
    }
    return acc;
  }, [] as string[]);

  return (
    <InsightCard
      title="Mood Ring"
      onShare={handleShare}
      onInfo={handleInfo}
      delay={0.1}
    >
      {/* Fallback Notice */}
      {isFallback && (
        <div className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 rounded-lg border border-white/10">
          <p className="text-xs text-zinc-400">Connect Spotify to unlock this insight</p>
        </div>
      )}

      {/* Donut Chart */}
      <div className="flex justify-center mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative w-32 h-32"
        >
          <div
            className={`w-full h-full rounded-full ${isFallback ? 'bg-zinc-700' : ''}`}
            style={!isFallback ? {
              background: `conic-gradient(${gradientStops.join(', ')})`
            } : {}}
          />
          <div className="absolute inset-4 bg-zinc-900 rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl">🎵</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dominant Mood */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-4"
      >
        <p className={`font-semibold ${isFallback ? 'text-zinc-500' : 'text-white'}`}>
          {payload.dominantMood}
        </p>
        <p className="text-zinc-400 text-sm">Your musical vibe</p>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-2 text-xs"
      >
        {segments.map((segment, index) => (
          <motion.div
            key={segment.emotion}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div
              className={`w-3 h-3 rounded-full ${isFallback ? 'bg-zinc-600' : ''}`}
              style={!isFallback ? { backgroundColor: colors[segment.emotion as keyof typeof colors] } : {}}
            />
            <span className="text-zinc-300 capitalize">{segment.emotion}</span>
            <span className="text-zinc-400 ml-auto">{Math.round(segment.percentage)}%</span>
          </motion.div>
        ))}
      </motion.div>
    </InsightCard>
  );
} 