"use client";

import { Fragment, useState, useMemo, useRef } from 'react';
import { Dialog, Transition, Switch } from '@headlessui/react';
import { X, Share2, TrendingUp, TrendingDown, Music, Sparkles } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
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

export function MusicRadarDetailSheet({ open, onClose, payload, aiSummary }: MusicRadarDetailSheetProps) {
  const [showTrends, setShowTrends] = useState(false);
  const sheetContentRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    if (!payload) return [];
    return Object.entries(payload.scores).map(([axis, value]) => ({
      axis,
      value,
      fullMark: 100,
    }));
  }, [payload]);

  const trendsMap = useMemo(() => {
    if (!payload?.trends) return new Map();
    return new Map(payload.trends.map(t => [t.axis, t.value]));
  }, [payload]);

  const { strongest, weakest } = useMemo(() => {
    if (!payload?.scores) return { strongest: 'Positivity', weakest: 'Positivity' };
    return getStrongestAndWeakest(payload.scores);
  }, [payload?.scores]);

  const handleShare = async () => {
    const target = document.getElementById('shareable-radar');
    if (!target) return;

    try {
      const canvas = await html2canvas(target, {
        backgroundColor: '#18181b', // A zinc-900 color
        useCORS: true,
        logging: process.env.NODE_ENV === 'development',
        scale: 2, // Higher resolution for better sharing quality
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
      });

      // Try native sharing first if available
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'music-radar.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Music Radar',
            text: 'Check out my music persona from Sagey!',
          });
          return;
        }
      }

      // Fallback to download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'music-radar.png';
      link.click();
      URL.revokeObjectURL(url);

      // Show toast notification for fallback
      console.log('📱 Radar saved to downloads!');
      // You could add a proper toast notification here if you have a toast system

    } catch (error) {
      console.error('Failed to share radar:', error);
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
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-24"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-24"
            >
              <Dialog.Panel
                ref={sheetContentRef}
                className="w-full max-w-4xl h-[95vh] transform overflow-hidden rounded-2xl bg-gray-900/80
                           border border-gray-700/50 p-6 text-left align-middle shadow-2xl transition-all
                           flex flex-col"
              >
                <Dialog.Title
                  as="h3"
                  id="music-radar-title"
                  className="text-lg font-medium leading-6 text-gray-50 flex justify-between items-center"
                >
                  <span>Music Radar</span>
                  <div className="flex items-center gap-4">
                    <button onClick={handleShare} className="text-gray-400 hover:text-white transition-colors" data-testid="share-button"><Share2 size={20} /></button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" data-testid="close-button"><X size={24} /></button>
                  </div>
                </Dialog.Title>

                <div className="mt-4 flex-grow flex flex-col md:flex-row gap-8">
                  {/* Left Column: Chart and Toggles */}
                  <div id="shareable-radar" data-testid="shareable-radar" className="w-full md:w-2/3 h-full flex flex-col p-4 rounded-xl bg-zinc-900">
                    <div
                      className="rounded-xl p-6 flex flex-col justify-center items-center text-center
                                 bg-gradient-to-br from-indigo-900/50 to-purple-900/30"
                    >
                      <h1 className="text-3xl md:text-4xl font-bold text-white">Your Music Persona</h1>
                      <div className="mt-4 flex gap-2 text-sm">
                        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">Strongest: {strongest}</span>
                        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30">Weakest: {weakest}</span>
                      </div>
                    </div>

                    <div className="flex-grow w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                          <defs>
                            <radialGradient id="radar-fill">
                              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.4)" />
                              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.2)" />
                            </radialGradient>
                          </defs>
                          <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                          <PolarAngleAxis
                            dataKey="axis"
                            tick={({ payload, x, y, cx, cy, ...rest }) => {
                              const trendValue = trendsMap.get(payload.value);
                              return (
                                <g>
                                  <text
                                    {...rest}
                                    y={y + (y - cy) / 10}
                                    x={x + (x - cx) / 10}
                                    fill="#a1a1aa"
                                    fontSize="14"
                                    textAnchor="middle"
                                  >
                                    {payload.value}
                                  </text>
                                  {showTrends && trendValue !== undefined && (
                                    <g transform={`translate(${x + (x - cx) / 8}, ${y + (y - cy) / 14})`}>
                                      {trendValue > 0 ? (
                                        <TrendingUp size={14} className="text-green-400" />
                                      ) : (
                                        <TrendingDown size={14} className="text-red-400" />
                                      )}
                                    </g>
                                  )}
                                </g>
                              );
                            }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              borderColor: '#4b5563',
                              borderRadius: '0.5rem'
                            }}
                            labelStyle={{ color: '#f9fafb' }}
                          />
                          <Radar name="You" dataKey="value" stroke="#a78bfa" fill="url(#radar-fill)" fillOpacity={0.8} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center items-center gap-3 p-4">
                        <Switch
                          checked={showTrends}
                          onChange={setShowTrends}
                          aria-label="Show trends"
                          className={cn(
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                            showTrends ? 'bg-indigo-600' : 'bg-gray-700'
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                              showTrends ? 'translate-x-5' : 'translate-x-0'
                            )}
                          />
                        </Switch>
                        <span className="text-sm text-gray-300">Show trends (Δ 30 days)</span>
                      </div>
                  </div>

                  {/* Right Column: Suggestions */}
                  <div className="w-full md:w-1/3 flex flex-col gap-4 border-l border-gray-700/50 px-6">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Sparkles size={20}/>
                        <h3 className="font-semibold text-lg">AI Summary</h3>
                      </div>
                      <p className="text-sm text-gray-400 italic">
                        {aiSummary || "No summary available."}
                      </p>
                      
                      <div className="border-t border-gray-700/50 my-2"></div>

                      <div className="flex items-center gap-2 text-purple-300">
                        <Music size={20}/>
                        <h3 className="font-semibold text-lg">Suggestions For You</h3>
                      </div>
                      <p className="text-sm text-gray-400">Based on your recent listening, here are some new vibes to explore.</p>
                      <div className="flex flex-wrap gap-2 mt-2">
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
                            className="px-4 py-2 text-sm rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                          >
                           <Music size={12} className="inline mr-2"/> {suggestion.label}
                          </a>
                        ))}
                      </div>
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