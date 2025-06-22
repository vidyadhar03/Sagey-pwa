"use client";

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { XMarkIcon, ShareIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MusicalAgePayload } from '../../../utils/insightSelectors';
import { useAIInsights } from '../../../hooks/useAIInsights';
import Loader from '../../Loader';

export interface Props {
  payload: MusicalAgePayload;
  open: boolean;
  onClose(): void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800/80 backdrop-blur-sm text-white p-3 rounded-lg border border-neutral-600">
        <p className="font-bold text-lg">{`${label}`}</p>
        <p className="text-sm">{`Popularity: ${payload[0].value.toFixed(1)}%`}</p>
      </div>
    );
  }

  return null;
};

export default function MusicalAgeDetailSheet({ payload, open, onClose }: Props) {
  // Get AI insights for richer text content
  const aiInsights = useAIInsights('musical_age', payload, true);

  // Prepare chart data for decade histogram
  const chartData = payload.decadeBuckets.map(bucket => ({
    decade: `${bucket.decade}s`,
    weight: bucket.weight,
    year: bucket.decade
  }));

  const handleShare = () => {
    console.log('Sharing Musical Age details...');
    // TODO: Implement sharing functionality
  };

  // Animation variants for staggered sections
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      x: -30,
      y: 20 
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        aria-labelledby="musical-age-sheet-title"
        role="dialog"
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Full-screen container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-8 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-gradient-to-br from-purple-700/40 to-pink-600/30 backdrop-blur-xl border border-white/10"
                >
                  {/* Header with close button */}
                  <div className="flex justify-end p-4">
                    <button
                      onClick={onClose}
                      className="text-neutral-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                      aria-label="Close"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <motion.div
                    className="px-6 pb-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Hero gradient panel */}
                    <motion.div 
                      variants={sectionVariants}
                      className="bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-xl p-6 mb-6 border border-white/10"
                    >
                      <Dialog.Title
                        id="musical-age-sheet-title"
                        className="flex items-center text-2xl font-bold text-neutral-100 mb-4"
                      >
                        <motion.div
                          className="mr-3 p-2 rounded-full bg-white/10 border border-white/20"
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <MusicalNoteIcon className="h-6 w-6 text-green-400" />
                        </motion.div>
                        Your Musical Age
                      </Dialog.Title>
                      
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-6xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">
                            {payload.age}
                          </span>
                          <span className="text-xl text-neutral-200">years</span>
                          <div className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-green-400 border border-white/10">
                            {payload.era} Era
                          </div>
                        </div>
                        {payload.stdDev > 0 && (
                          <div className="text-sm text-neutral-300">
                            ±{payload.stdDev} yr confidence
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div 
                      variants={sectionVariants}
                      className="flex flex-wrap gap-2 text-sm text-neutral-300 mb-6 justify-center"
                    >
                      <span>Based on {payload.trackCount} tracks</span>
                      <span>•</span>
                      <span>Avg. year {payload.averageYear}</span>
                      {payload.stdDev > 0 && (
                        <>
                          <span>•</span>
                          <span>±{payload.stdDev} yrs</span>
                        </>
                      )}
                    </motion.div>

                    {/* Oldest / Newest tracks panel */}
                    <motion.div 
                      variants={sectionVariants}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                    >
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h3 className="text-sm font-semibold text-neutral-300 mb-2">Oldest Track</h3>
                        <div className="text-neutral-100">
                          <div className="font-medium">{payload.oldest.title}</div>
                          <div className="text-sm text-neutral-300">{payload.oldest.artist}</div>
                          <div className="text-xs text-neutral-400">{payload.oldest.year}</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h3 className="text-sm font-semibold text-neutral-300 mb-2">Newest Track</h3>
                        <div className="text-neutral-100">
                          <div className="font-medium">{payload.newest.title}</div>
                          <div className="text-sm text-neutral-300">{payload.newest.artist}</div>
                          <div className="text-xs text-neutral-400">{payload.newest.year}</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Decade histogram */}
                    {chartData.length > 0 && (
                      <motion.div 
                        variants={sectionVariants}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6"
                      >
                        <h3 className="text-lg font-semibold text-neutral-100 mb-4">Music Across Decades</h3>
                        <div className="text-sm text-neutral-300 mb-4">How your music taste spreads out over time.</div>
                        <div style={{'--chart-gradient-start': '#22c55e', '--chart-gradient-end': '#16a34a'} as React.CSSProperties} data-testid="chart-container">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--chart-gradient-start)" />
                                  <stop offset="95%" stopColor="var(--chart-gradient-end)" />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="decade" tickLine={false} axisLine={false} tick={{ fill: '#a3a3a3' }} />
                              <YAxis hide={true} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                              <Bar 
                                dataKey="weight" 
                                fill="url(#barGradient)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    )}

                    {/* AI Generated paragraph */}
                    <motion.div 
                      variants={sectionVariants}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6"
                    >
                      <h3 className="text-lg font-semibold text-neutral-100 mb-3">Musical Insights</h3>
                      {aiInsights.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader size={16} />
                          <span className="text-sm text-neutral-400">Generating insights...</span>
                        </div>
                      ) : aiInsights.error ? (
                        <p className="text-neutral-300 leading-relaxed">
                          {payload.description}
                        </p>
                      ) : (
                        <div>
                          <p className="text-neutral-300 leading-relaxed mb-2">
                            {aiInsights.copy}
                          </p>
                          <div className="flex items-center text-xs text-neutral-500">
                            <span>✨</span>
                            <span className="ml-1">AI Generated</span>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Share button */}
                    <motion.div 
                      variants={sectionVariants}
                      className="flex justify-center"
                    >
                      <motion.button
                        onClick={handleShare}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShareIcon className="h-5 w-5" />
                        <span>Share Musical Age</span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 