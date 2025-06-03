"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InsightCardProps {
  title: string;
  children: ReactNode;
  onShare?: () => void;
  onInfo?: () => void;
  className?: string;
  delay?: number;
}

export default function InsightCard({ 
  title, 
  children, 
  onShare, 
  onInfo, 
  className = "",
  delay = 0 
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`
        bg-zinc-900 rounded-2xl p-6 border border-white/10 
        shadow-lg hover:shadow-xl transition-all duration-300
        hover:border-[#1DB954]/30 group
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          {onInfo && (
            <button
              onClick={onInfo}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                       hover:bg-white/20 transition-colors"
              aria-label="More info"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                       hover:bg-[#1DB954]/20 hover:text-[#1DB954] transition-colors"
              aria-label="Share insight"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

// Loading skeleton component
export function InsightCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-zinc-900 rounded-2xl p-6 border border-white/10"
    >
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-zinc-800 rounded w-24"></div>
          <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
        </div>
        <div className="h-32 bg-zinc-800 rounded-xl mb-3"></div>
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
      </div>
    </motion.div>
  );
} 