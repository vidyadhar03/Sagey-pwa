"use client";

import { Fragment, useState, useMemo, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Share2, TrendingUp, TrendingDown, Music, Sparkles, BarChart3, Clock, Heart, Zap, Compass, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';

import type { RadarPayload, RadarAxis } from './types';
import { cn } from '@/utils';

interface MusicRadarDetailSheetProps {
  open: boolean;
  onClose: () => void;
  payload: RadarPayload | null;
  aiSummary: string | null;
}

const getStrongestAndWeakest = (scores: Record<RadarAxis, number>): { strongest: RadarAxis, weakest: RadarAxis } => {
  const entries = Object.entries(scores) as [RadarAxis, number][];
  if (entries.length === 0) {
    return { strongest: 'Positivity', weakest: 'Positivity' };
  }
  const sorted = entries.sort(([, a], [, b]) => b - a);
  return {
    strongest: sorted[0][0],
    weakest: sorted[sorted.length - 1][0],
  };
};

const axisIcons = {
  'Positivity': Heart,
  'Energy': Zap,
  'Exploration': Compass,
  'Nostalgia': Clock,
  'Night-Owl': Calendar,
};

const axisColors = {
  'Positivity': 'from-pink-500 to-rose-500',
  'Energy': 'from-yellow-500 to-orange-500',
  'Exploration': 'from-green-500 to-emerald-500',
  'Nostalgia': 'from-purple-500 to-violet-500',
  'Night-Owl': 'from-blue-500 to-indigo-500',
};

export function MusicRadarDetailSheet({ open, onClose, payload, aiSummary }: MusicRadarDetailSheetProps) {
  const sheetContentRef = useRef<HTMLDivElement>(null);

  const { strongest, weakest } = useMemo(() => {
    if (!payload?.scores) return { strongest: 'Positivity', weakest: 'Positivity' };
    return getStrongestAndWeakest(payload.scores);
  }, [payload?.scores]);

  const handleShare = async () => {
    const target = document.getElementById('shareable-content');
    if (!target) return;

    try {
      const canvas = await html2canvas(target, {
        backgroundColor: '#18181b',
        useCORS: true,
        logging: process.env.NODE_ENV === 'development',
        scale: 2,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
      });

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'music-insights.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Music Insights',
            text: 'Check out my music persona from Vynce!',
          });
          return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'music-insights.png';
      link.click();
      URL.revokeObjectURL(url);

      console.log('📱 Music insights saved to downloads!');

    } catch (error) {
      console.error('Failed to share insights:', error);
    }
  };

  if (!payload) return null;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel
                ref={sheetContentRef}
                className="w-full max-w-2xl max-h-[90vh] transform overflow-hidden rounded-2xl 
                           bg-zinc-900 border border-zinc-700/50 shadow-2xl transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                  <h2 className="text-2xl font-bold text-white">Music Radar Details</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={onClose} 
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" 
                      data-testid="close-button"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]" id="shareable-content">
                  <div className="p-6 space-y-6">
                    
                    {/* AI Summary Section */}
                    {aiSummary && (
                      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles size={24} className="text-purple-400" />
                          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">{aiSummary}</p>
                      </div>
                    )}

                    {/* Music Persona Scores */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-green-400" />
                        Your Music Persona
                      </h3>
                      <div className="grid gap-3">
                        {Object.entries(payload.scores).map(([axis, score]) => {
                          const IconComponent = axisIcons[axis as RadarAxis];
                          const colorClass = axisColors[axis as RadarAxis];
                          const isStrongest = axis === strongest;
                          const isWeakest = axis === weakest;
                          
                          return (
                            <div 
                              key={axis} 
                              className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-all",
                                isStrongest ? "bg-green-900/20 border-green-500/30" : 
                                isWeakest ? "bg-red-900/20 border-red-500/30" : 
                                "bg-zinc-800/50 border-zinc-700/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-gradient-to-r", colorClass)}>
                                  <IconComponent size={20} className="text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{axis}</p>
                                  {isStrongest && <p className="text-xs text-green-400">Your strongest trait</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-zinc-700 rounded-full h-2">
                                  <div 
                                    className={cn("h-2 rounded-full bg-gradient-to-r", colorClass)}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <span className="text-white font-semibold min-w-[3rem] text-right">
                                  {Math.round(score)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Music Stats */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-400" />
                        Your Music Stats
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <p className="text-zinc-400 text-sm">Tracks Analyzed</p>
                          <p className="text-2xl font-bold text-white">{payload.trackCount}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <p className="text-zinc-400 text-sm">Time Period</p>
                          <p className="text-2xl font-bold text-white">{payload.weeks} weeks</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <p className="text-zinc-400 text-sm">Top Genre</p>
                          <p className="text-lg font-semibold text-white">{payload.topGenre}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <p className="text-zinc-400 text-sm">Recent Track</p>
                          <p className="text-sm font-medium text-white truncate">{payload.sampleTrack.title}</p>
                          <p className="text-xs text-zinc-400 truncate">by {payload.sampleTrack.artist}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-orange-400" />
                        Detailed Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white flex items-center gap-2">
                              <Heart size={16} className="text-pink-400" />
                              Positivity Level
                            </p>
                            <span className="text-pink-400 font-semibold">{payload.stats.positivity.percentage.toFixed(1)}%</span>
                          </div>
                          <p className="text-sm text-zinc-400">Based on track valence and genre characteristics</p>
                        </div>
                        
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white flex items-center gap-2">
                              <Compass size={16} className="text-green-400" />
                              Musical Exploration
                            </p>
                            <span className="text-green-400 font-semibold">{payload.stats.exploration.genreCount} genres</span>
                          </div>
                          <p className="text-sm text-zinc-400">Diversity score: {payload.stats.exploration.normalizedEntropy.toFixed(1)}%</p>
                        </div>
                        
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white flex items-center gap-2">
                              <Calendar size={16} className="text-blue-400" />
                              Night Owl Behavior
                            </p>
                            <span className="text-blue-400 font-semibold">{payload.stats.nightOwl.percentage.toFixed(1)}%</span>
                          </div>
                          <p className="text-sm text-zinc-400">{payload.stats.nightOwl.nightPlayCount} of {payload.stats.nightOwl.totalPlayCount} tracks played after 10PM</p>
                        </div>
                        
                        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white flex items-center gap-2">
                              <Clock size={16} className="text-purple-400" />
                              Nostalgia Factor
                            </p>
                            <span className="text-purple-400 font-semibold">{payload.stats.nostalgia.medianTrackAge.toFixed(1)} years</span>
                          </div>
                          <p className="text-sm text-zinc-400">Median age of tracks in your rotation</p>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {payload.suggestions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Music size={20} className="text-green-400" />
                          Suggestions For You
                        </h3>
                        <p className="text-zinc-400 text-sm">Based on your music persona, here are some curated playlists to explore:</p>
                        <div className="flex flex-wrap gap-3">
                          {payload.suggestions.map((suggestion) => (
                            <a
                              key={suggestion.label}
                              href={suggestion.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(suggestion.url, '_blank', 'noopener noreferrer');
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/20 text-green-300 
                                       border border-green-500/30 hover:bg-green-900/30 transition-all group"
                            >
                              <Music size={14} />
                              <span className="text-sm font-medium">{suggestion.label}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 