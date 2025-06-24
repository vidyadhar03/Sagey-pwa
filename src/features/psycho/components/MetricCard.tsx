"use client";

import { ConfidenceLevel } from '../types';
import ConfidenceBadge from './ConfidenceBadge';

interface MetricCardProps {
  title: string;
  score: number;
  confidence: ConfidenceLevel;
  headline: string;
  subtitle: string;
}

export default function MetricCard({ 
  title, 
  score, 
  confidence, 
  headline,
  subtitle
}: MetricCardProps) {
  const percentage = (score * 100).toFixed(1);

  // Show "Need more data" for insufficient confidence
  const showPercentage = confidence !== 'insufficient';

  return (
    <div className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <ConfidenceBadge confidence={confidence} />
      </div>
      
      <div className="text-center">
        {showPercentage ? (
          <div className="text-4xl font-bold text-white mb-2">
            {percentage}%
          </div>
        ) : (
          <div className="text-2xl font-bold text-zinc-500 mb-2">
            Need more data
          </div>
        )}
        
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-white">
            {headline}
          </h4>
          <p className="text-sm text-zinc-400">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
} 