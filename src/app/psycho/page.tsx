"use client";

import { useState, useEffect } from 'react';
import { usePsyMetrics } from '../../hooks/usePsyMetrics';
import { usePsyHype } from '../../hooks/usePsyHype';
import { ConfidenceLevel } from '../../features/psycho/types';
import { getMetricCopy } from '../../features/psycho/copy';
import MetricCard from '../../features/psycho/components/MetricCard';
import ConfidenceBadge from '../../features/psycho/components/ConfidenceBadge';
import PsyHypeCard from '../../features/psycho/ui/PsyHypeCard';
import Link from 'next/link';
import { useSpotify } from '../../hooks/useSpotify';



function EmotionalVolatilityCard({ 
  title, 
  score, 
  confidence, 
  headline,
  subtitle,
  mappedTrackCount,
  minRequired
}: { 
  title: string;
  score: number;
  confidence: ConfidenceLevel;
  headline: string;
  subtitle: string;
  mappedTrackCount?: number;
  minRequired?: number;
}) {
  const percentage = (score * 100).toFixed(1);

  // Show enhanced insufficient state for emotional volatility
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
          <div className="space-y-2">
            <div className="text-2xl font-bold text-zinc-500">
              Need more data
            </div>
            {mappedTrackCount !== undefined && minRequired !== undefined && (
              <div className="text-sm text-zinc-400">
                Only {mappedTrackCount} of {minRequired} genre-tagged tracks so far
              </div>
            )}
            <div className="text-xs text-zinc-300">
              Play a few new songs on Spotify and refresh 🔄
            </div>
          </div>
        )}
        {showPercentage && (
          <div className="space-y-1 mt-2">
            <h4 className="text-lg font-semibold text-white">
              {headline}
            </h4>
            <p className="text-sm text-zinc-400">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PsychoPage() {
  const { payload, loading, error } = usePsyMetrics();
  const { getRecentTracks, getTopArtists, connected } = useSpotify();
  
  // State for Spotify data
  const [spotifyData, setSpotifyData] = useState<{
    recentTracks: any[];
    topArtists: any[];
  }>({ recentTracks: [], topArtists: [] });
  
  // Fetch Spotify data when connected and not loading
  useEffect(() => {
    const fetchSpotifyData = async () => {
      if (connected && !loading && payload) {
        try {
          const [recentTracks, topArtists] = await Promise.all([
            getRecentTracks(),
            getTopArtists('medium_term')
          ]);
          setSpotifyData({ recentTracks, topArtists });
        } catch (err) {
          console.error('Failed to fetch Spotify data for hype:', err);
        }
      }
    };
    
    fetchSpotifyData();
  }, [connected, loading, payload, getRecentTracks, getTopArtists]);
  
  const {
    headline,
    context,
    traits,
    tips,
    isLoading: hypeLoading,
    hasValidResponse: hypeHasResponse
  } = usePsyHype(spotifyData, connected && !loading && !!payload);

  // Handle sharing
  const handleShare = async () => {
    const target = document.getElementById('shareable-psycho');
    if (!target || !hypeHasResponse) return;

    try {
      // Show the shareable content temporarily
      target.style.display = 'block';
      
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(target, {
        backgroundColor: '#0A0A0A',
        useCORS: true,
        logging: false,
        scale: 2,
      });

      // Hide the shareable content again
      target.style.display = 'none';

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
      });

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'psycho-analysis.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Musical Psycho-analysis',
            text: 'Check out my personality analysis from Vynce!',
          });
          return;
        }
      }

      // Fallback to download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'psycho-analysis.png';
      link.click();
      URL.revokeObjectURL(url);

      console.log('📱 Psycho-analysis saved to downloads!');

    } catch (error) {
      console.error('Failed to share psycho-analysis:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mb-4"></div>
        <h1 className="text-2xl font-bold mb-2 text-white">
          Analyzing your musical psyche...
        </h1>
        <p className="text-zinc-400">
          Crunching the numbers on your listening patterns
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <h1 className="text-2xl font-bold mb-2 text-white">
          Analysis Error
        </h1>
        <p className="text-red-400 mb-6 max-w-md">
          {error}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          ← Back to Home
        </button>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <h1 className="text-2xl font-bold mb-2 text-white">
          No Data Available
        </h1>
        <p className="text-zinc-400 mb-6">
          Connect to Spotify to analyze your musical patterns
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          ← Back to Home
        </button>
      </main>
    );
  }

  const { scores, metadata } = payload;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Shareable Content Container */}
        <div id="shareable-psycho" className="bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] p-6"
             style={{ display: 'none' }}>
          {/* This div will be made visible when sharing */}
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">
                Your Psycho-analysis
              </h1>
              {payload && (
                <p className="text-zinc-400 mb-4">
                  Based on {payload.metadata.tracks_analyzed} tracks, {payload.metadata.artists_analyzed} artists, and {payload.metadata.genres_found} genres
                </p>
              )}
            </div>

            {/* AI Personality Insight for Share */}
            {hypeHasResponse && headline && (
              <div className="mb-8">
                <div className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl md:px-6 py-5 px-4 backdrop-blur-sm">
                  <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight mb-1">
                    {headline}
                  </h2>
                  {context && (
                    <p className="text-sm md:text-base text-zinc-300 mb-4">
                      {context}
                    </p>
                  )}
                  {traits.length > 0 && (
                    <div className="mb-4">
                      <ul className="space-y-1">
                        {traits.map((trait, index) => (
                          <li key={index} className="text-sm text-zinc-200 flex items-start">
                            <span className="text-zinc-500 mr-2">•</span>
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8">
              <div className="text-lg font-bold text-green-400">Vynce</div>
              <div className="text-sm text-zinc-400">Your music, analyzed</div>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Your Psycho-analysis (alpha)
          </h1>
          <p className="text-zinc-400 mb-4">
            Based on {metadata.tracks_analyzed} tracks, {metadata.artists_analyzed} artists, and {metadata.genres_found} genres
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-6 mb-8">
          <MetricCard
            title="Musical Diversity"
            score={scores.musical_diversity.score}
            confidence={scores.musical_diversity.confidence}
            headline={getMetricCopy('musical_diversity', scores.musical_diversity.score).headline}
            subtitle={getMetricCopy('musical_diversity', scores.musical_diversity.score).subtitle}
          />
          
          <MetricCard
            title="Exploration Rate"
            score={scores.exploration_rate.score}
            confidence={scores.exploration_rate.confidence}
            headline={getMetricCopy('exploration_rate', scores.exploration_rate.score).headline}
            subtitle={getMetricCopy('exploration_rate', scores.exploration_rate.score).subtitle}
          />

          <MetricCard
            title="Temporal Consistency"
            score={scores.temporal_consistency.score}
            confidence={scores.temporal_consistency.confidence}
            headline={getMetricCopy('temporal_consistency', scores.temporal_consistency.score).headline}
            subtitle={getMetricCopy('temporal_consistency', scores.temporal_consistency.score).subtitle}
          />

          <MetricCard
            title="Mainstream Affinity"
            score={scores.mainstream_affinity.score}
            confidence={scores.mainstream_affinity.confidence}
            headline={getMetricCopy('mainstream_affinity', scores.mainstream_affinity.score).headline}
            subtitle={getMetricCopy('mainstream_affinity', scores.mainstream_affinity.score).subtitle}
          />

          <EmotionalVolatilityCard
            title="Emotional Volatility"
            score={scores.emotional_volatility.score}
            confidence={scores.emotional_volatility.confidence}
            headline={getMetricCopy('emotional_volatility', scores.emotional_volatility.score).headline}
            subtitle={getMetricCopy('emotional_volatility', scores.emotional_volatility.score).subtitle}
            mappedTrackCount={scores.emotional_volatility.mappedTrackCount}
            minRequired={scores.emotional_volatility.minRequired}
          />
        </div>

        {/* AI Personality Insight */}
        <div className="mb-8">
          <PsyHypeCard
            headline={headline}
            context={context}
            traits={traits}
            tips={tips}
            isLoading={hypeLoading}
            hasValidResponse={hypeHasResponse}
          />
        </div>

        {/* Methodology Link */}
        <div className="text-center mb-6">
          <Link 
            href="/psycho/methodology"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            How we calculate this →
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {hypeHasResponse && headline && (
            <button 
              onClick={handleShare}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share Insight
            </button>
          )}
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
} 