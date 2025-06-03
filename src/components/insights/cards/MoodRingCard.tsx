"use client";

import React from 'react';
import { motion } from 'framer-motion';
import InsightCard, { InsightCardSkeleton } from './InsightCard';
import { useMockInsights } from '../../../hooks/useMockInsights';

export default function MoodRingCard() {
  const { data, loading } = useMockInsights();

  if (loading) {
    return <InsightCardSkeleton delay={0.1} />;
  }

  if (!data) return null;

  const handleShare = () => {
    console.log('Sharing Mood Ring insight...');
  };

  const handleInfo = () => {
    console.log('Mood Ring info...');
  };

  const emotions = data.moodRing.emotions;
  const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
  
  // Calculate angles for donut chart
  const segments = Object.entries(emotions).map(([emotion, value], index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
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
      {/* Donut Chart */}
      <div className="flex justify-center mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative w-32 h-32"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${gradientStops.join(', ')})`
            }}
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
        <p className="text-white font-semibold">{data.moodRing.dominantMood}</p>
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
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[segment.emotion as keyof typeof colors] }}
            />
            <span className="text-zinc-300 capitalize">{segment.emotion}</span>
            <span className="text-zinc-400 ml-auto">{Math.round(segment.percentage)}%</span>
          </motion.div>
        ))}
      </motion.div>
    </InsightCard>
  );
} 