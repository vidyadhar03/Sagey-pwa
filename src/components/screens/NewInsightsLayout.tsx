"use client";

import React from 'react';
import { motion } from 'framer-motion';
import TopAppBar from '../TopAppBar';
import InsightsGrid from '../insights/InsightsGrid';

export default function NewInsightsLayout() {
  return (
    <>
      <TopAppBar
        title="Insights +"
        showLeftIcon={false}
        showRightIcon={true}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 pb-[120px]">
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
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-2">Share Your Musical DNA</h3>
              <p className="text-zinc-400 text-sm mb-4">
                These insights are perfect for sharing on social media. 
                Each card captures a unique aspect of your music personality.
              </p>
              <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs">
                <span>🎵</span>
                <span>Powered by your Spotify listening data</span>
                <span>🎵</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 