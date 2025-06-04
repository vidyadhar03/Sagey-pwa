"use client";

import React from 'react';
import { motion } from 'framer-motion';
import InsightsGrid from '../insights/InsightsGrid';
import TopAppBar from '../TopAppBar';
import { useSpotify } from '../../hooks/useSpotify';

export default function NewInsightsLayout() {
  // Get Spotify connection status
  const { connected } = useSpotify();
  
  return (
    <div className="w-full h-full overflow-y-auto">
      {/* TopAppBar - Only show when Spotify is not connected */}
      {!connected && (
        <TopAppBar 
          title="Insights"
          titleAlign="left"
        />
      )}
      
      <div className={`max-w-7xl mx-auto px-4 pb-[120px] ${!connected ? 'pt-4' : ''}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-3">Your Fresh Insights</h2>
          <p className="text-zinc-400">
            Discover share-worthy insights about your musical personality and listening patterns.
          </p>
        </motion.div>

        {/* Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <InsightsGrid />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-zinc-500 text-sm">
            Insights refresh daily based on your listening activity
          </p>
        </motion.div>
      </div>
    </div>
  );
} 