"use client";

import React from 'react';
import { motion } from 'framer-motion';
import InsightCard, { InsightCardSkeleton } from './InsightCard';
import { useMockInsights } from '../../../hooks/useMockInsights';

export default function NightOwlCard() {
  const { data, loading } = useMockInsights();

  if (loading) {
    return <InsightCardSkeleton delay={0.3} />;
  }

  if (!data) return null;

  const handleShare = () => {
    console.log('Sharing Night Owl Pattern insight...');
  };

  const handleInfo = () => {
    console.log('Night Owl Pattern info...');
  };

  const hourlyData = data.nightOwlPattern.hourlyData;
  const maxValue = Math.max(...hourlyData);
  const peakHour = data.nightOwlPattern.peakHour;

  // Get color intensity based on listening activity
  const getBarColor = (value: number, hour: number) => {
    const intensity = value / maxValue;
    if (hour === peakHour) {
      return `rgba(29, 185, 84, ${0.8 + intensity * 0.2})`; // Peak hour - brightest green
    }
    if (intensity > 0.8) return 'rgba(29, 185, 84, 0.9)'; // High activity
    if (intensity > 0.6) return 'rgba(29, 185, 84, 0.7)'; 
    if (intensity > 0.4) return 'rgba(29, 185, 84, 0.5)';
    if (intensity > 0.2) return 'rgba(29, 185, 84, 0.3)';
    return 'rgba(255, 255, 255, 0.1)'; // Low/no activity
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12AM';
    if (hour === 12) return '12PM';
    return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
  };

  return (
    <InsightCard
      title="Night Owl Pattern"
      onShare={handleShare}
      onInfo={handleInfo}
      delay={0.3}
    >
      {/* Peak Time Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex items-center justify-center mb-4"
      >
        <div className="bg-gradient-to-r from-[#1DB954] to-[#1AA34A] rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-lg">{data.nightOwlPattern.isNightOwl ? '🌙' : '☀️'}</span>
          <div className="text-white text-sm font-semibold">
            Peak: {formatHour(peakHour)}
          </div>
        </div>
      </motion.div>

      {/* 24-Hour Heatmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-4"
      >
        <div className="grid grid-cols-12 gap-1 mb-2">
          {hourlyData.map((value, hour) => (
            <motion.div
              key={hour}
              initial={{ height: 0 }}
              animate={{ height: Math.max((value / maxValue) * 40, 4) }}
              transition={{ delay: 0.8 + hour * 0.02, duration: 0.3 }}
              className="rounded-sm relative group cursor-pointer"
              style={{ 
                backgroundColor: getBarColor(value, hour),
                height: Math.max((value / maxValue) * 40, 4)
              }}
              title={`${formatHour(hour)}: ${value} tracks`}
            >
              {/* Peak hour indicator */}
              {hour === peakHour && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                >
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Time Labels */}
        <div className="grid grid-cols-4 text-xs text-zinc-400 mt-2">
          <span className="text-center">6AM</span>
          <span className="text-center">12PM</span>
          <span className="text-center">6PM</span>
          <span className="text-center">12AM</span>
        </div>
      </motion.div>

      {/* Night Owl Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-white/5 rounded-xl p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-300 text-sm">
            {data.nightOwlPattern.isNightOwl ? 'Night Owl' : 'Early Bird'} Score
          </span>
          <span className="text-[#1DB954] font-semibold">{data.nightOwlPattern.score}/100</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.nightOwlPattern.score}%` }}
            transition={{ delay: 1.4, duration: 1 }}
            className="h-full bg-gradient-to-r from-[#1DB954] to-[#1AA34A] rounded-full"
          />
        </div>
      </motion.div>

      {/* Pattern Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="text-zinc-400 text-xs text-center mt-2"
      >
        {data.nightOwlPattern.isNightOwl 
          ? "You prefer late-night listening sessions" 
          : "You're most active during daytime hours"
        }
      </motion.p>
    </InsightCard>
  );
} 