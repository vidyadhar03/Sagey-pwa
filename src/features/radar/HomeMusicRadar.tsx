"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useMusicRadar } from '../../hooks/useMusicRadar';
import RadarSkeleton from './RadarSkeleton';
import { MusicRadarDetailSheet } from './MusicRadarDetailSheet';

export default function HomeMusicRadar() {
  const { payload, ai, isLoading } = useMusicRadar();
  const [isDetailSheetOpen, setDetailSheetOpen] = useState(false);

  // The AI hook has its own loading state
  const isContentLoading = isLoading || ai.isLoading;

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