"use client";

import { motion } from 'framer-motion';
import { AnalysisProgress } from '../types';

interface AnalysisProgressProps {
  progress: AnalysisProgress;
}

export default function AnalysisProgressComponent({ progress }: AnalysisProgressProps) {
  const { overall, tracks, artists, genres, confidence } = progress;
  
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📊 Analysis Progress
          </h3>
          <p className="text-sm text-zinc-400">
            More data = better insights
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getProgressTextColor(overall)}`}>
            {Math.round(overall)}%
          </div>
          <div className="text-xs text-zinc-500">Complete</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-300">Overall Analysis</span>
          <span className="text-xs text-zinc-500">{Math.round(overall)}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full ${getProgressColor(overall)} transition-colors duration-500`}
            initial={{ width: 0 }}
            animate={{ width: `${overall}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tracks Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">🎵 {tracks.label}</span>
            <span className="text-xs text-zinc-500">
              {tracks.current}/{tracks.target}
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColor(tracks.percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(tracks.percentage, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Artists Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">👥 {artists.label}</span>
            <span className="text-xs text-zinc-500">
              {artists.current}/{artists.target}
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColor(artists.percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(artists.percentage, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
        </div>

        {/* Genres Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">🎼 {genres.label}</span>
            <span className="text-xs text-zinc-500">
              {genres.current}/{genres.target}
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColor(genres.percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(genres.percentage, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </div>
        </div>

        {/* Confidence Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">✨ {confidence.label}</span>
            <span className="text-xs text-zinc-500">
              {Math.round(confidence.percentage)}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColor(confidence.percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      {overall < 80 && (
        <motion.div
          className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-zinc-400 text-center">
            💡 Keep listening to unlock more insights and badges!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
} 