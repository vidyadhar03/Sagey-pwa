"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface InsightCardProps {
  title: string;
  children: ReactNode;
  onInfo?: () => void;
  className?: string;
  delay?: number;
}

export default function InsightCard({ 
  title, 
  children, 
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
              className="p-2 rounded-lg transition-all duration-200 text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="View insight details"
            >
              <Info size={22} />
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