"use client";

import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, BarChart3, Clock, Heart, Compass, Calendar, Palette, Globe, Music } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/utils';
import { useAIInsights } from '../../../hooks/useAIInsights';
import Loader from '../../Loader';

// Custom Tooltip for Musical Age chart
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

interface InsightDetailSheetProps {
  open: boolean;
  onClose: () => void;
  type: 'night_owl' | 'mood_ring' | 'genre_passport' | 'musical_age';
  title: string;
  payload: any;
}

// Define icons and colors for each metric type
const metricConfig = {
  // Night Owl metrics
  night_owl_score: { icon: Calendar, color: 'from-blue-500 to-indigo-500', label: 'Night Owl Score' },
  peak_hour: { icon: Clock, color: 'from-purple-500 to-violet-500', label: 'Peak Hour' },
  night_listening: { icon: Calendar, color: 'from-blue-600 to-blue-700', label: 'Night Listening' },
  
  // Mood Ring metrics
  happy: { icon: Heart, color: 'from-yellow-500 to-orange-500', label: 'Happy' },
  energetic: { icon: Heart, color: 'from-red-500 to-pink-500', label: 'Energetic' },
  chill: { icon: Heart, color: 'from-blue-500 to-cyan-500', label: 'Chill' },
  melancholy: { icon: Heart, color: 'from-purple-500 to-indigo-500', label: 'Melancholy' },
  
  // Genre Passport metrics
  total_genres: { icon: Globe, color: 'from-green-500 to-emerald-500', label: 'Total Genres' },
  exploration_score: { icon: Compass, color: 'from-blue-500 to-teal-500', label: 'Exploration Score' },
  top_genre: { icon: Palette, color: 'from-purple-500 to-pink-500', label: 'Top Genre' },
  
  // Musical Age metrics
  musical_age: { icon: Music, color: 'from-green-400 to-green-500', label: 'Musical Age' },
  era: { icon: Calendar, color: 'from-purple-500 to-pink-500', label: 'Era' },
  avg_year: { icon: Clock, color: 'from-blue-500 to-indigo-500', label: 'Average Year' },
};

// Helper function to format hour display
const formatHour = (hour: number) => {
  if (hour === 0) return '12AM';
  if (hour === 12) return '12PM';
  return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
};

// Helper function to get the strongest emotion
const getStrongestEmotion = (emotions: any) => {
  let strongest = 'happy';
  let maxValue = 0;
  Object.entries(emotions).forEach(([emotion, value]) => {
    if (typeof value === 'number' && value > maxValue) {
      maxValue = value;
      strongest = emotion;
    }
  });
  return strongest;
};

export function InsightDetailSheet({ open, onClose, type, title, payload }: InsightDetailSheetProps) {
  const sheetContentRef = useRef<HTMLDivElement>(null);
  
  // AI insights for Musical Age
  const aiInsights = type === 'musical_age' ? useAIInsights('musical_age', payload, true) : null;

  if (!payload) return null;

  // Generate metrics based on insight type
  const generateMetrics = () => {
    switch (type) {
      case 'night_owl':
        const totalListening = payload.histogram?.reduce((sum: number, count: number) => sum + count, 0) || 0;
        const nightHours = payload.histogram?.slice(22).concat(payload.histogram?.slice(0, 5)) || [];
        const nightListening = nightHours.reduce((sum: number, count: number) => sum + count, 0);
        const nightPercentage = totalListening > 0 ? Math.round((nightListening / totalListening) * 100) : 0;
        
        return [
          {
            key: 'night_owl_score',
            label: payload.isNightOwl ? 'Night Owl Score' : 'Early Bird Score',
            value: `${payload.score}%`,
            isStrongest: true,
            description: payload.isNightOwl ? 'Late-night listening activity' : 'Early-day listening activity'
          },
          {
            key: 'peak_hour',
            label: 'Peak Listening Hour',
            value: formatHour(payload.peakHour),
            isStrongest: false,
            description: 'Your most active listening time'
          },
          {
            key: 'night_listening',
            label: 'Night Activity',
            value: `${nightPercentage}%`,
            isStrongest: false,
            description: 'Tracks played between 10PM - 5AM'
          }
        ];

      case 'mood_ring':
        const strongestEmotion = getStrongestEmotion(payload.emotions);
        const totalEmotions = Object.values(payload.emotions).reduce((sum: number, val: any) => sum + (val as number), 0);
        
        return Object.entries(payload.emotions).map(([emotion, count]) => {
          const percentage = totalEmotions > 0 ? Math.round(((count as number) / totalEmotions) * 100) : 0;
          return {
            key: emotion,
            label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            value: `${percentage}%`,
            isStrongest: emotion === strongestEmotion,
            description: `${count} tracks classified as ${emotion}`
          };
        });

      case 'genre_passport':
        return [
          {
            key: 'total_genres',
            label: 'Total Genres',
            value: `${payload.totalGenres}`,
            isStrongest: true,
            description: 'Unique genres in your music library'
          },
          {
            key: 'exploration_score',
            label: 'Exploration Score',
            value: `${payload.explorationScore}%`,
            isStrongest: false,
            description: 'Musical diversity and discovery rate'
          },
          {
            key: 'top_genre',
            label: 'Top Genre',
            value: payload.topGenres?.[0] || 'Unknown',
            isStrongest: false,
            description: 'Your most-played musical genre'
          }
        ];

      case 'musical_age':
        return [
          {
            key: 'musical_age',
            label: 'Musical Age',
            value: `${payload.age} years`,
            isStrongest: true,
            description: 'Average age of your music taste'
          },
          {
            key: 'era',
            label: 'Era',
            value: `${payload.era} Era`,
            isStrongest: false,
            description: 'Musical generation your taste represents'
          },
          {
            key: 'avg_year',
            label: 'Average Year',
            value: `${payload.averageYear}`,
            isStrongest: false,
            description: 'Center point of your music collection'
          }
        ];

      default:
        return [];
    }
  };

  // Generate stats based on insight type
  const generateStats = () => {
    switch (type) {
      case 'night_owl':
        return [
          { label: 'Pattern Type', value: payload.isNightOwl ? 'Night Owl' : 'Early Bird' },
          { label: 'Peak Hour', value: formatHour(payload.peakHour) },
          { label: 'Activity Score', value: `${payload.score}/100` },
          { label: 'Total Hours', value: '24h analyzed' }
        ];

      case 'mood_ring':
        const totalTracks = Object.values(payload.emotions).reduce((sum: number, val: any) => sum + (val as number), 0);
        return [
          { label: 'Dominant Mood', value: payload.dominantMood.charAt(0).toUpperCase() + payload.dominantMood.slice(1) },
          { label: 'Tracks Analyzed', value: `${totalTracks}` },
          { label: 'Mood Diversity', value: `${Object.keys(payload.emotions).length} types` },
          { label: 'Top Emotion', value: getStrongestEmotion(payload.emotions).charAt(0).toUpperCase() + getStrongestEmotion(payload.emotions).slice(1) }
        ];

      case 'genre_passport':
        return [
          { label: 'Total Genres', value: `${payload.totalGenres}` },
          { label: 'Exploration Score', value: `${payload.explorationScore}%` },
          { label: 'Top Genre', value: payload.topGenres?.[0] || 'Unknown' },
          { label: 'Discovery Rate', value: payload.newDiscoveries ? `${payload.newDiscoveries} new` : 'N/A' }
        ];

      case 'musical_age':
        return [
          { label: 'Musical Age', value: `${payload.age} years` },
          { label: 'Era', value: `${payload.era}` },
          { label: 'Tracks Analyzed', value: `${payload.trackCount}` },
          { label: 'Confidence', value: payload.stdDev ? `±${payload.stdDev} yrs` : 'N/A' }
        ];

      default:
        return [];
    }
  };

  const metrics = generateMetrics();
  const stats = generateStats();

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
                className="w-full max-w-2xl max-h-[70vh] transform overflow-hidden rounded-2xl 
                           bg-zinc-900 border border-zinc-700/50 shadow-2xl transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                  <h2 className="text-2xl font-bold text-white">{title} Details</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={onClose} 
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
                  <div className="p-6 space-y-6">
                    
                    {/* Musical Age Hero Section */}
                    {type === 'musical_age' && (
                      <div className="bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-xl p-6 border border-white/10">
                        <div className="flex flex-col items-center text-center">
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
                          <div className="flex flex-wrap gap-2 text-sm text-neutral-300 mt-4 justify-center">
                            <span>Based on {payload.trackCount} tracks</span>
                            <span>•</span>
                            <span>Avg. year {payload.averageYear}</span>
                            {payload.stdDev > 0 && (
                              <>
                                <span>•</span>
                                <span>±{payload.stdDev} yrs</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Main Metrics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-green-400" />
                        {type === 'night_owl' ? 'Listening Pattern' : 
                         type === 'mood_ring' ? 'Emotional Breakdown' : 
                         type === 'musical_age' ? 'Musical Age Breakdown' :
                         'Genre Analysis'}
                      </h3>
                      <div className="grid gap-3">
                        {metrics.map((metric) => {
                          const config = metricConfig[metric.key as keyof typeof metricConfig];
                          const IconComponent = config?.icon || BarChart3;
                          const colorClass = config?.color || 'from-gray-500 to-gray-600';
                          
                          return (
                            <div 
                              key={metric.key}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-all",
                                metric.isStrongest ? "bg-green-900/20 border-green-500/30" : 
                                "bg-zinc-800/50 border-zinc-700/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-gradient-to-r", colorClass)}>
                                  <IconComponent size={20} className="text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{metric.label}</p>
                                  {metric.isStrongest && <p className="text-xs text-green-400">Strongest trait</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {typeof metric.value === 'string' && metric.value.includes('%') && (
                                  <div className="w-24 bg-zinc-700 rounded-full h-2">
                                    <div 
                                      className={cn("h-2 rounded-full bg-gradient-to-r", colorClass)}
                                      style={{ width: metric.value }}
                                    />
                                  </div>
                                )}
                                <span className="text-white font-semibold min-w-[3rem] text-right">
                                  {metric.value}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-400" />
                        Insight Stats
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                          <div key={index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                            <p className="text-zinc-400 text-sm">{stat.label}</p>
                            <p className="text-lg font-semibold text-white truncate">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Musical Age - Oldest/Newest Tracks */}
                    {type === 'musical_age' && payload.oldest && payload.newest && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Clock size={20} className="text-blue-400" />
                          Track Extremes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Oldest Track</h4>
                            <div className="text-neutral-100">
                              <div className="font-medium">{payload.oldest.title}</div>
                              <div className="text-sm text-neutral-300">{payload.oldest.artist}</div>
                              <div className="text-xs text-neutral-400">{payload.oldest.year}</div>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Newest Track</h4>
                            <div className="text-neutral-100">
                              <div className="font-medium">{payload.newest.title}</div>
                              <div className="text-sm text-neutral-300">{payload.newest.artist}</div>
                              <div className="text-xs text-neutral-400">{payload.newest.year}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Musical Age - Decade Histogram */}
                    {type === 'musical_age' && payload.decadeBuckets && payload.decadeBuckets.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <BarChart3 size={20} className="text-green-400" />
                          Music Across Decades
                        </h3>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-neutral-300 mb-4">How your music taste spreads out over time.</div>
                          <div style={{'--chart-gradient-start': '#22c55e', '--chart-gradient-end': '#16a34a'} as React.CSSProperties}>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={payload.decadeBuckets.map((bucket: any) => ({
                                decade: `${bucket.decade}s`,
                                weight: bucket.weight,
                                year: bucket.decade
                              }))} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
                        </div>
                      </div>
                    )}

                    {/* Musical Age - AI Generated Insights */}
                    {type === 'musical_age' && aiInsights && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Music size={20} className="text-purple-400" />
                          Musical Insights
                        </h3>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
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
                        </div>
                      </div>
                    )}

                    {/* Additional Content for Genre Passport */}
                    {type === 'genre_passport' && payload.topGenres && payload.topGenres.length > 1 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Globe size={20} className="text-purple-400" />
                          Top Genres
                        </h3>
                        <div className="space-y-2">
                          {payload.topGenres.slice(0, 5).map((genre: string, index: number) => (
                            <div key={genre} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">#{index + 1} {genre}</span>
                                <span className="text-zinc-400 text-sm">Most played</span>
                              </div>
                            </div>
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