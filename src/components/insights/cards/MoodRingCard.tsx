"use client";

import React from 'react';
import { motion } from 'framer-motion';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import RefreshButton from './RefreshButton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';
import { useAIInsights } from '../../../hooks/useAIInsights';

export default function MoodRingCard() {
  const { insights, isLoading } = useSpotifyInsights();

  const payload = insights.moodRing;
  const isFallback = (payload?.distribution?.length === 0 || insights.isDefault) ?? true;

  // AI Insights - Only fetch when not in fallback mode
  const aiInsights = useAIInsights(
    'mood_ring', 
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

  // Calculate segments with angles
      const segments = Object.entries(emotions).map(([emotion, value]) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = total > 0 ? (value / total) * 360 : 0;
    return { emotion, value, percentage, angle };
  });

  // SVG properties for the donut
  const outerRadius = 70;
  const innerRadius = 62;
  const center = 90;

  // Calculate path data for each segment
  let accumulatedAngle = 0;
  const pathSegments = segments.map((segment) => {
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + segment.angle;
    
    const x1 = center + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = center + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = center + outerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = center + outerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
    
    const x3 = center + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
    const y3 = center + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
    const x4 = center + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
    const y4 = center + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
    
    const largeArcFlag = segment.angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    accumulatedAngle += segment.angle;
    
    return {
      ...segment,
      pathData,
      startAngle,
      endAngle
    };
  });

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

      {/* Premium Mood Ring */}
      <div className="flex justify-center mb-6 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Very subtle glow with muted colors and less blur */}
          <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-slate-600/20 via-gray-600/20 to-slate-600/20" />
          
          {/* SVG Donut Chart */}
          <svg 
            width="180" 
            height="180" 
            viewBox="0 0 180 180"
            className="relative z-10"
          >
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={(outerRadius + innerRadius) / 2}
              fill="none"
              stroke="#1f2937"
              strokeWidth={outerRadius - innerRadius}
              opacity="0.3"
            />
            
            {/* Gradient definitions */}
            <defs>
              {Object.entries(colors).map(([emotion, color]) => (
                <radialGradient key={emotion} id={`gradient-${emotion}`} cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.7" />
                </radialGradient>
              ))}
            </defs>
            
            {/* Animated segments */}
            {!isFallback && pathSegments.map((segment, segmentIndex) => (
              <motion.path
                key={segment.emotion}
                d={segment.pathData}
                fill={`url(#gradient-${segment.emotion})`}
                stroke={colors[segment.emotion as keyof typeof colors]}
                strokeWidth="1"
                filter="drop-shadow(0 0 8px rgba(255,255,255,0.3))"
                initial={{ 
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                }}
                transition={{ 
                  delay: 0.6 + segmentIndex * 0.2, 
                  duration: 0.8,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  filter: "drop-shadow(0 0 16px rgba(255,255,255,0.5))"
                }}
              />
            ))}

            {/* Pulsing center */}
            <motion.circle
              cx={center}
              cy={center}
              r="20"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              animate={{
                r: [18, 22, 18],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Center icon */}
            <motion.text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-2xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.8, ease: "backOut" }}
            >
              🎵
            </motion.text>
          </svg>

          {/* Floating particles */}
          {!isFallback && (
            <div className="absolute inset-0">
              {[...Array(8)].map((_, particleIndex) => (
                <motion.div
                  key={particleIndex}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: colors[Object.keys(colors)[particleIndex % 4] as keyof typeof colors],
                    opacity: 0.6,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    x: [0, Math.cos(particleIndex * 45 * Math.PI / 180) * 100],
                    y: [0, Math.sin(particleIndex * 45 * Math.PI / 180) * 100],
                    opacity: [0.6, 0, 0.6],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 4 + particleIndex * 0.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Dominant Mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-6"
      >
        <motion.h3 
          className={`text-lg font-bold ${isFallback ? 'text-zinc-500' : 'text-white'} mb-1`}
          animate={{ 
            textShadow: isFallback ? 'none' : '0 0 20px rgba(255,255,255,0.3)' 
          }}
        >
          {payload.dominantMood}
        </motion.h3>
        <p className="text-zinc-400 text-sm">Your musical vibe</p>
      </motion.div>

      {/* AI Generated Copy */}
      {!isFallback && !aiLoading && !aiError && copy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10"
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
          className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10"
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
          className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10"
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

      {/* Clean Legend with Percentages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-3"
      >
        {segments.map((segment, index) => (
          <motion.div
            key={segment.emotion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: isFallback ? '#4a5568' : colors[segment.emotion as keyof typeof colors],
                boxShadow: isFallback ? 'none' : `0 0 8px ${colors[segment.emotion as keyof typeof colors]}50`
              }}
              animate={{
                boxShadow: isFallback ? 'none' : [
                  `0 0 8px ${colors[segment.emotion as keyof typeof colors]}50`,
                  `0 0 16px ${colors[segment.emotion as keyof typeof colors]}80`,
                  `0 0 8px ${colors[segment.emotion as keyof typeof colors]}50`
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="flex items-center gap-2 flex-1">
              <span 
                className="capitalize font-medium text-sm"
                style={{ 
                  color: isFallback ? '#9ca3af' : colors[segment.emotion as keyof typeof colors] 
                }}
              >
                {segment.emotion}
              </span>
              <span 
                className="text-xs font-bold ml-auto"
                style={{ 
                  color: isFallback ? '#6b7280' : colors[segment.emotion as keyof typeof colors] 
                }}
              >
                {Math.round(segment.percentage)}%
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </InsightCard>
  );
} 