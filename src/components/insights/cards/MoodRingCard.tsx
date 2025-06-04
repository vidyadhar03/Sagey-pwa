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
  
  const colors = {
    happy: '#1DB954',
    energetic: '#FF6B6B', 
    chill: '#4ECDC4',
    melancholy: '#9B59B6'
  };

  // Calculate SVG donut segments
  const segments = Object.entries(emotions).map(([emotion, value], index) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = total > 0 ? (value / total) * 360 : 0;
    return { emotion, value, percentage, angle };
  });

  // SVG circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const center = 60; // SVG center point

  // Calculate stroke-dasharray values for each segment
  let accumulatedAngle = 0;
  const svgSegments = segments.map((segment, index) => {
    const strokeLength = (segment.percentage / 100) * circumference;
    const gapLength = circumference - strokeLength;
    const rotation = accumulatedAngle;
    
    accumulatedAngle += segment.angle;
    
    return {
      ...segment,
      strokeDasharray: `${strokeLength} ${gapLength}`,
      rotation,
      strokeLength
    };
  });

  // Calculate floating label positions
  const getFloatingPositions = () => {
    if (isFallback) return [];
    
    let currentAngle = -90; // Start at top
    return segments.map((segment) => {
      const centerAngle = currentAngle + (segment.angle / 2);
      const radians = (centerAngle * Math.PI) / 180;
      
      // Position at a good distance from the donut
      const labelRadius = 85;
      const x = Math.cos(radians) * labelRadius;
      const y = Math.sin(radians) * labelRadius;
      
      currentAngle += segment.angle;
      
      return {
        ...segment,
        x,
        y,
        centerAngle
      };
    }).filter(segment => segment.percentage > 1);
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

      {/* SVG Donut Chart Container */}
      <div className="flex justify-center mb-4 relative h-48 w-full">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative"
        >
          {/* SVG Donut Chart */}
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120"
            className="transform -rotate-90" // Rotate to start from top
          >
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth="8"
              opacity="0.3"
            />
            
            {/* Animated segments */}
            {!isFallback && svgSegments.map((segment, index) => (
              <motion.circle
                key={segment.emotion}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[segment.emotion as keyof typeof colors]}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={segment.strokeDasharray}
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transform: `rotate(${segment.rotation}deg)`
                }}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: segment.strokeDasharray }}
                transition={{ 
                  delay: 0.8 + index * 0.2, 
                  duration: 1.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </svg>

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">🎵</div>
          </div>
        </motion.div>

        {/* Floating Percentage Labels */}
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
              delay: 1.5 + index * 0.2,
              duration: 0.6,
              type: "spring",
              bounce: 0.4
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            {/* Floating Percentage */}
            <motion.div
              animate={{
                y: [0, -4, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2.5 + index * 0.4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Connection line to ring */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8 + index * 0.2, duration: 0.5 }}
                className="absolute top-1/2 h-px transform -translate-y-1/2"
                style={{
                  backgroundColor: colors[position.emotion as keyof typeof colors],
                  width: '24px',
                  opacity: 0.6,
                  left: position.x > 0 ? '-24px' : '100%',
                  transformOrigin: position.x > 0 ? 'left' : 'right'
                }}
              />

              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full blur-sm opacity-40"
                style={{ 
                  backgroundColor: colors[position.emotion as keyof typeof colors],
                  scale: 1.4
                }}
              />
              
              {/* Percentage badge */}
              <div 
                className="relative px-2.5 py-1.5 rounded-full text-xs font-bold border-2 backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${colors[position.emotion as keyof typeof colors]}20`,
                  borderColor: colors[position.emotion as keyof typeof colors],
                  color: 'white',
                  boxShadow: `0 0 16px ${colors[position.emotion as keyof typeof colors]}30`
                }}
              >
                {Math.round(position.percentage)}%
              </div>
            </motion.div>
          </motion.div>
        ))}
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

      {/* Mood Legend */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-3 text-sm"
      >
        {segments.map((segment, index) => (
          <motion.div
            key={segment.emotion}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: isFallback ? '#4a5568' : colors[segment.emotion as keyof typeof colors] 
              }}
            />
            <span 
              className="capitalize font-medium"
              style={{ 
                color: isFallback ? '#9ca3af' : colors[segment.emotion as keyof typeof colors] 
              }}
            >
              {segment.emotion}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </InsightCard>
  );
} 