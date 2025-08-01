"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Share2, Info } from 'lucide-react';
import { useMusicRadar } from '../../hooks/useMusicRadar';
import RadarSkeleton from './RadarSkeleton';
import { MusicRadarDetailSheet } from './MusicRadarDetailSheet';
import { cn } from '@/utils';
import InsightCard from '@/components/insights/cards/InsightCard';
import TypingInsight from '@/components/TypingInsight';

interface HomeMusicRadarProps {
  onTabClick?: (tab: string, options?: { section?: string }) => void;
  onShareClick?: () => void;
}

export default function HomeMusicRadar({ onTabClick, onShareClick }: HomeMusicRadarProps) {
  const { payload, ai, isLoading } = useMusicRadar();
  const [isDetailSheetOpen, setDetailSheetOpen] = useState(false);

  // The AI hook has its own loading state
  const isContentLoading = isLoading || payload.isDefault || ai.isLoading;

  // Determine whether to skip typing animation based on session flag
  const [skipTyping, setSkipTyping] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('shownRadarTyping');
      if (shown === 'true') {
        setSkipTyping(true);
      } else {
        setSkipTyping(false);
        sessionStorage.setItem('shownRadarTyping', 'true');
      }
    }
  }, []);

  const handleShare = () => {
    // Use global share if available, otherwise fallback to detail sheet
    if (onShareClick) {
      onShareClick();
    } else {
      setDetailSheetOpen(true);
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
    <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#1DB954]/30 group relative">
      {/* Header with title, info icon, and share icon */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Your Music Radar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailSheetOpen(true)}
            className="p-2 rounded-lg transition-all duration-200 text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="View radar details"
          >
            <Info size={22} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg transition-all duration-200 text-green-400 hover:text-green-300 hover:bg-zinc-800"
            title="Share music radar"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Chart with animated background */}
      <div className="h-64 relative overflow-hidden rounded-xl">
        {/* Subtle Animated Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Gentle pulsing radar waves - reduced count and opacity */}
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={`wave-${i}`}
              className="absolute rounded-full border border-green-400/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.8, 2.2],
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 3,
                ease: "easeOut"
              }}
              style={{
                width: '180px',
                height: '180px',
                borderWidth: '0.5px',
              }}
            />
          ))}
          
          {/* Very subtle rotating gradient */}
          <motion.div
            className="absolute w-48 h-48 rounded-full opacity-[0.1]"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #1DB954, transparent)'
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Minimal floating particles - reduced count and opacity */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-green-400/30 rounded-full"
              initial={{ 
                x: Math.cos((i * 90) * Math.PI / 180) * 70,
                y: Math.sin((i * 90) * Math.PI / 180) * 70,
                opacity: 0
              }}
              animate={{
                x: Math.cos((i * 90) * Math.PI / 180) * 100,
                y: Math.sin((i * 90) * Math.PI / 180) * 100,
                opacity: [0, 0.6, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Very subtle central pulse */}
          <motion.div
            className="absolute w-3 h-3 bg-green-400/40 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Chart overlay */}
        <div className="relative z-10 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid 
                gridType="polygon" 
                stroke="#ffffff14" 
                radialLines={true}
              />
              <PolarAngleAxis
                dataKey="axis"
                tick={({ payload, x, y, cx, cy, ...rest }) => {
                  const label = payload.value;
                  return (
                    <g>
                      <text
                        {...rest}
                        y={y + (y - cy) / 10}
                        x={x + (x - cx) / 10}
                        fill="#d1d5db"
                        fontSize="11"
                        textAnchor="middle"
                        className="text-gray-300"
                      >
                        {label}
                      </text>
                    </g>
                  );
                }}
              />
              <Radar
                name="Features"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                fill="#22c55e"
                fillOpacity={0.20}
                data-testid="radar-fill"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => onTabClick?.('insights-plus')}
          className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-blue-400 hover:text-blue-300 border border-blue-400/30 hover:border-blue-300/50 font-medium py-3 px-4 rounded-xl transition-all duration-200 text-sm"
        >
          More insights ▸
        </button>
      </div>
      
      <MusicRadarDetailSheet 
        open={isDetailSheetOpen} 
        onClose={() => setDetailSheetOpen(false)}
        payload={payload}
      />
    </div>
  );
} 