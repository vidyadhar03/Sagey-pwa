"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RotateCw } from 'lucide-react';
import { useMusicRadar } from '../../hooks/useMusicRadar';
import RadarSkeleton from './RadarSkeleton';
import { MusicRadarDetailSheet } from './MusicRadarDetailSheet';
import { cn } from '@/utils';

export default function HomeMusicRadar() {
  const { payload, ai, isLoading } = useMusicRadar();
  const [isDetailSheetOpen, setDetailSheetOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 15-second cooldown for refresh
  const REFRESH_COOLDOWN = 15000;
  const now = Date.now();
  const canRefresh = now - lastRefresh > REFRESH_COOLDOWN;
  const cooldownRemaining = Math.max(0, REFRESH_COOLDOWN - (now - lastRefresh));

  // The AI hook has its own loading state
  const isContentLoading = isLoading || ai.isLoading;

  const handleRefresh = async () => {
    if (!canRefresh || isRefreshing) return;

    setIsRefreshing(true);
    setLastRefresh(now);

    try {
      await ai.mutate({ regenerate: true });
    } catch (error) {
      console.error('Failed to refresh radar:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isContentLoading) {
    return <RadarSkeleton />;
  }

  // Transform payload for Recharts
  const chartData = Object.entries(payload.scores).map(([name, value]) => ({
    axis: name,
    value: value,
  }));
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 w-full"
      >
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Music Radar</h2>
          <button
            onClick={handleRefresh}
            disabled={!canRefresh || isRefreshing}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed",
              canRefresh ? "text-blue-400 hover:text-blue-300" : "text-zinc-600"
            )}
            title={
              !canRefresh
                ? `Refresh available in ${Math.ceil(cooldownRemaining / 1000)}s`
                : "Refresh AI insights"
            }
          >
            <RotateCw 
              size={16} 
              className={cn(
                "transition-transform duration-200",
                isRefreshing && "animate-spin"
              )} 
            />
          </button>
        </div>

        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#4A4A4A" />
                    <PolarAngleAxis dataKey="axis" stroke="#E5E5E5" tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4A4A4A" />
                    <Radar 
                        name="Music Radar" 
                        dataKey="value" 
                        stroke="#1DB954" 
                        fill="#1DB954" 
                        fillOpacity={0.6} 
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-zinc-300 leading-relaxed">{ai.copy || 'Calculating your AI summary...'}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
            {(payload.suggestions || []).slice(0, 3).map((suggestion) => (
                <a 
                    key={suggestion.label} 
                    href={suggestion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-zinc-800 text-xs text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                >
                    {suggestion.label}
                </a>
            ))}
        </div>

        <div className="flex justify-center mt-6">
            <button
                onClick={() => setDetailSheetOpen(true)}
                className="text-sm underline text-green-400 hover:text-green-300 transition-colors"
            >
                View details ▸
            </button>
        </div>
      </motion.div>

      <MusicRadarDetailSheet
        open={isDetailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        payload={payload}
        aiSummary={ai.copy}
      />
    </>
  );
} 