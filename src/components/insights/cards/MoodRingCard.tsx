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

  // Calculate floating label positions around the ring
  const getFloatingPositions = () => {
    if (isFallback) return [];
    
    return segments.map((segment, index) => {
      // Calculate the center angle of each segment
      const prevAngle = segments.slice(0, index).reduce((sum, seg) => sum + seg.angle, 0);
      const centerAngle = prevAngle + (segment.angle / 2);
      
      // Convert to radians and adjust for starting position
      const radians = (centerAngle - 90) * (Math.PI / 180);
      
      // Position around the donut (radius from center)
      const radius = 80; // Distance from center
      const x = Math.cos(radians) * radius;
      const y = Math.sin(radians) * radius;
      
      return {
        ...segment,
        x,
        y,
        radians,
        centerAngle
      };
    }).filter(segment => segment.percentage > 5); // Only show segments with >5%
  };

  const floatingPositions = getFloatingPositions();

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

      {/* Donut Chart Container */}
      <div className="flex justify-center mb-4 relative">
        {/* Main Donut Chart */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative w-32 h-32 z-10"
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

        {/* Floating Mood Labels */}
        {!isFallback && floatingPositions.map((position, index) => (
          <motion.div
            key={position.emotion}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: 0,
              y: 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: position.x,
              y: position.y
            }}
            transition={{ 
              delay: 1.2 + index * 0.2,
              duration: 0.6,
              type: "spring",
              bounce: 0.4
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            {/* Floating Label Container */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-40"
                style={{ 
                  backgroundColor: colors[position.emotion as keyof typeof colors],
                  scale: 1.2
                }}
              />
              
              {/* Main Label */}
              <div 
                className="relative px-3 py-1.5 rounded-full text-xs font-medium text-white border backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${colors[position.emotion as keyof typeof colors]}20`,
                  borderColor: colors[position.emotion as keyof typeof colors],
                  boxShadow: `0 0 20px ${colors[position.emotion as keyof typeof colors]}30`
                }}
              >
                <div className="text-center">
                  <div 
                    className="font-bold capitalize text-xs"
                    style={{ color: colors[position.emotion as keyof typeof colors] }}
                  >
                    {position.emotion}
                  </div>
                  <div className="text-white text-xs">
                    {Math.round(position.percentage)}%
                  </div>
                </div>
              </div>

              {/* Connection Line to Ring */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5 + index * 0.2, duration: 0.4 }}
                className="absolute top-1/2 w-6 h-px opacity-50 transform -translate-y-1/2"
                style={{
                  backgroundColor: colors[position.emotion as keyof typeof colors],
                  left: position.x > 0 ? '-24px' : '100%',
                  transformOrigin: position.x > 0 ? 'left' : 'right'
                }}
              />
            </motion.div>
          </motion.div>
        ))}

        {/* Orbital Particles Animation */}
        {!isFallback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: colors[Object.keys(colors)[i % 4] as keyof typeof colors],
                  opacity: 0.6
                }}
                animate={{
                  rotate: 360,
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 50],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 50]
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </motion.div>
        )}
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

      {/* Simplified Legend (less prominent now that we have floating labels) */}
      {isFallback && (
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
              <div className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-zinc-300 capitalize">{segment.emotion}</span>
              <span className="text-zinc-400 ml-auto">0%</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </InsightCard>
  );
} 