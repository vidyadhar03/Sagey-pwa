"use client";

import { useState, useEffect } from 'react';
import { usePsyMetrics } from '../../hooks/usePsyMetrics';
import { usePsyHype } from '../../hooks/usePsyHype';
import { ConfidenceLevel } from '../../features/psycho/types';
import { getMetricCopy } from '../../features/psycho/copy';
import MetricCard from '../../features/psycho/components/MetricCard';
import ConfidenceBadge from '../../features/psycho/components/ConfidenceBadge';
import PsyHypeCard from '../../features/psycho/ui/PsyHypeCard';
import VariantToggle from '../../components/VariantToggle';
import Link from 'next/link';
import { useSpotify } from '../../hooks/useSpotify';
import { useVariantMemory } from '../../hooks/useVariantMemory';
import { useGamification } from '../../hooks/useGamification';
import { trackPsyHypeView, trackPsyHypeShare, trackVariantSwitch } from '../../utils/analytics';
import AnalysisProgressComponent from '../../features/psycho/gamification/components/AnalysisProgress';
import BadgeCollection from '../../features/psycho/gamification/components/BadgeCollection';
import AchievementNotification from '../../features/psycho/gamification/components/AchievementNotification';

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
    <div className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <ConfidenceBadge confidence={confidence} />
      </div>
      
      <div className="text-center">
        {showPercentage ? (
          <div className="text-3xl font-bold text-white mb-2">
            {percentage}%
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xl font-bold text-zinc-500">
              Need more data
            </div>
            {mappedTrackCount !== undefined && minRequired !== undefined && (
              <div className="text-xs text-zinc-400">
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
            <h4 className="text-sm font-semibold text-white">
              {headline}
            </h4>
            <p className="text-xs text-zinc-400">
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
  
  // Persistent variant selection with memory
  const { variant: selectedVariant, setVariant: setSelectedVariant, isHydrated } = useVariantMemory();
  
  // Gamification system
  const gamification = useGamification(payload);
  
  // Handle variant change with analytics
  const handleVariantChange = (newVariant: "witty" | "poetic") => {
    if (newVariant !== selectedVariant) {
      trackVariantSwitch(selectedVariant, newVariant);
    }
    setSelectedVariant(newVariant);
  };
  
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
    hasValidResponse: hypeHasResponse,
    variant: currentVariant
  } = usePsyHype(
    spotifyData, 
    connected && !loading && !!payload,
    { variant: selectedVariant }
  );

  // Track view when hype response is ready
  useEffect(() => {
    if (hypeHasResponse && headline) {
      trackPsyHypeView(currentVariant);
    }
  }, [hypeHasResponse, headline, currentVariant]);

  // Handle sharing
  const handleShare = async () => {
    const target = document.getElementById('shareable-psycho');
    if (!target || !hypeHasResponse) return;

    // Track share event
    trackPsyHypeShare(currentVariant);

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

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <>
      {/* Custom Header - Following FrameLayout's DynamicTopBar design */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-[60px]"
        style={{
          background: 'rgba(18, 18, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', // For Safari
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left side - Back button and title */}
          <div className="flex items-center">
            <button 
              onClick={handleBackClick}
              className="p-2 mr-2 hover:bg-white/10 rounded-lg transition-colors" 
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-xl text-white font-semibold tracking-wide">
              Psycho-analysis
            </h1>
          </div>

          {/* Right side - Share button */}
          <div className="flex items-center">
            {hypeHasResponse && headline && (
              <button
                onClick={handleShare}
                className="p-2 hover:text-[#1ed760] transition-all"
                title="Share psycho-analysis"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#1DB954] hover:text-[#1ed760] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] pt-[60px] p-6">
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
            Your Musical Psycho-analysis
          </h1>
          <p className="text-zinc-400 mb-4">
            Based on {metadata.tracks_analyzed} tracks, {metadata.artists_analyzed} artists, and {metadata.genres_found} genres
          </p>
        </div>

        {/* AI Personality Insight - Primary Section */}
        <div className="mb-8">
          {/* Variant Toggle */}  
          <VariantToggle 
            variant={selectedVariant}
            onVariantChange={handleVariantChange}
            disabled={hypeLoading}
            isHydrated={isHydrated}
          />

          {/* AI Personality Insight Card */}
          <PsyHypeCard
            headline={headline}
            context={context}
            traits={traits}
            tips={tips}
            isLoading={hypeLoading}
            hasValidResponse={hypeHasResponse}
            variant={currentVariant}
          />
        </div>

        {/* Gamification Section */}
        <div className="space-y-6 mb-8">
          {/* Analysis Progress */}
          <AnalysisProgressComponent progress={gamification.progress} />
          
          {/* Badge Collection */}
          <BadgeCollection badges={gamification.badges} />
        </div>

        {/* Attribute Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Musical Attributes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="sm:col-span-2">
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
          </div>
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

        {/* Action Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleBackClick}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Achievement Notifications */}
      <AchievementNotification
        achievements={gamification.recentAchievements}
        onDismiss={gamification.dismissAchievement}
      />
    </main>
    </>
  );
} 