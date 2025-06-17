"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RotateCw } from 'lucide-react';
import { useMusicRadar } from '../../hooks/useMusicRadar';
import RadarSkeleton from './RadarSkeleton';
import { MusicRadarDetailSheet } from './MusicRadarDetailSheet';
import { cn } from '@/utils';
import InsightCard from '@/components/insights/cards/InsightCard';

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
    <InsightCard title="This Month's Music Radar" className="border-0">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid gridType="polygon" stroke="transparent" />
            <PolarAngleAxis dataKey="axis" tick={false} />
            <Radar
              name="Features"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              data-testid="radar-fill"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-zinc-300 leading-relaxed">{ai.copy || 'Calculating your AI summary...'}</p>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setDetailSheetOpen(true)}
          className="text-sm underline text-green-400 hover:text-green-300 transition-colors"
        >
          View details ▸
        </button>
      </div>
      <div className="absolute top-4 right-4">
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
      <MusicRadarDetailSheet 
        open={isDetailSheetOpen} 
        onClose={() => setDetailSheetOpen(false)}
        payload={payload}
        aiSummary={ai.copy}
      />
    </InsightCard>
  );
} 