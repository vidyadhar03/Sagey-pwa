"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import InsightCard from './InsightCard';
import InsightSkeleton from './InsightSkeleton';
import RefreshButton from './RefreshButton';
import { useSpotifyInsights } from '../../../hooks/useSpotifyInsights';
import { useAIInsights } from '../../../hooks/useAIInsights';
import { InsightDetailSheet } from '../detail/InsightDetailSheet';

export default function NightOwlCard() {
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const { insights, isLoading } = useSpotifyInsights();

  const payload = insights.nightOwlPattern;
  const isFallback = (payload?.histogram?.every(val => val === 0) || insights.isDefault) ?? true;

  // AI Insights - Only fetch when not in fallback mode
  const aiInsights = useAIInsights(
    'night_owl_pattern', 
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
    console.log('Sharing Night Owl Pattern insight...');
  };

  const handleInfo = () => {
    setDetailSheetOpen(true);
  };

  const hourlyData = payload.histogram;
  const maxValue = Math.max(...hourlyData);
  const peakHour = payload.peakHour;

  // Get color intensity based on listening activity
  const getBarColor = (value: number, hour: number) => {
    if (isFallback) {
      return 'rgba(255, 255, 255, 0.1)';
    }
    
    const intensity = maxValue > 0 ? value / maxValue : 0;
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
      onInfo={handleInfo}
      delay={0.3}
    >
      {/* Fallback Notice */}
      {isFallback && (
        <div className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 rounded-lg border border-white/10">
          <p className="text-xs text-zinc-400">Connect Spotify to unlock this insight</p>
        </div>
      )}

      {/* 24-hour Heatmap */}
      <div className="mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-12 gap-1"
        >
          {hourlyData.map((value, hour) => (
            <motion.div
              key={hour}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.4 + hour * 0.02, duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-full h-8 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: getBarColor(value, hour),
                  height: isFallback ? '8px' : `${Math.max(8, (value / (maxValue || 1)) * 32)}px`
                }}
                title={`${formatHour(hour)}: ${value} tracks`}
              />
              {/* Show hour labels for key times */}
              {[0, 6, 12, 18].includes(hour) && (
                <span className="text-xs text-zinc-500 mt-1">
                  {formatHour(hour)}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Pattern Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">
            {isFallback ? '🎵' : payload.isNightOwl ? '🌙' : '☀️'}
          </span>
          <p className={`font-semibold ${isFallback ? 'text-zinc-500' : 'text-white'}`}>
            {isFallback ? 'Night Owl Pattern' : payload.isNightOwl ? 'Night Owl' : 'Early Bird'}
          </p>
        </div>
        <p className="text-zinc-400 text-sm">
          Peak listening at {formatHour(peakHour)}
        </p>
      </motion.div>

      {/* AI Generated Copy */}
      {!isFallback && !aiLoading && !aiError && copy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10"
        >
          <p className="text-xs text-zinc-300 leading-relaxed">{copy}</p>
          <div className="flex justify-between items-center mt-1">
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

      {/* Score */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-white/5 rounded-xl p-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 text-sm">
            {isFallback ? 'Pattern Score' : payload.isNightOwl ? 'Night Owl Score' : 'Early Bird Score'}
          </span>
          <span className={`font-semibold ${isFallback ? 'text-zinc-500' : 'text-[#1DB954]'}`}>
            {payload.score}/100
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${payload.score}%` }}
            transition={{ delay: 1.2, duration: 1 }}
            className={`h-full rounded-full ${
              isFallback 
                ? 'bg-zinc-600' 
                : 'bg-gradient-to-r from-[#1DB954] to-[#1AA34A]'
            }`}
          />
        </div>
      </motion.div>

      {/* Detail Sheet */}
      <InsightDetailSheet
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        type="night_owl"
        title="Night Owl Pattern"
        payload={payload}
      />
    </InsightCard>
  );
} 