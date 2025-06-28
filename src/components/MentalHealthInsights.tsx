"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp, Music, Sparkles, Heart, Shield, Compass, Play, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePsyMetrics } from '../hooks/usePsyMetrics';
import { useMoodData, DailyMoodData } from '../hooks/useMoodData';
import { useWellnessPlaylists } from '../hooks/useWellnessPlaylists';
import { PsyPayload } from '../features/psycho/types';

// Personality calculation logic
interface PersonalityType {
  name: string;
  description: string;
  color: string;
}

const personalityTypes: Record<string, PersonalityType> = {
  'Open-minded': {
    name: 'Open-minded',
    description: 'Loves diverse, complex, and varied music experiences.',
    color: 'from-purple-500 to-purple-600'
  },
  'Explorer': {
    name: 'Explorer',
    description: 'Actively seeks new artists and tracks regularly.',
    color: 'from-blue-500 to-blue-600'
  },
  'Consistent Listener': {
    name: 'Consistent Listener', 
    description: 'Maintains regular listening routines and habits.',
    color: 'from-green-500 to-green-600'
  },
  'Mainstream Listener': {
    name: 'Mainstream Listener',
    description: 'Prefers popular, widely-appreciated music.',
    color: 'from-pink-500 to-pink-600'
  },
  'Emotionally Volatile': {
    name: 'Emotionally Volatile',
    description: 'Often selects music with varied emotional intensity.',
    color: 'from-red-500 to-red-600'
  },
  'Emotionally Stable': {
    name: 'Emotionally Stable',
    description: 'Prefers consistent, balanced emotional experiences.',
    color: 'from-teal-500 to-teal-600'
  },
  'Balanced Listener': {
    name: 'Balanced Listener',
    description: 'Shows balanced traits across various listening styles.',
    color: 'from-gray-500 to-gray-600'
  }
};

function determinePersonality(psyPayload: PsyPayload | null): { types: string[], dominantType: string, confidence: string } {
  if (!psyPayload) {
    return { types: ['Balanced Listener'], dominantType: 'Balanced Listener', confidence: 'insufficient' };
  }

  const scores = psyPayload.scores;
  const types: string[] = [];
  const typeScores: { type: string, score: number }[] = [];

  // Convert 0-1 range to percentage and apply thresholds
  const musicalDiversity = scores.musical_diversity.score * 100;
  const explorationRate = scores.exploration_rate.score * 100;
  const temporalConsistency = scores.temporal_consistency.score * 100;
  const mainstreamAffinity = scores.mainstream_affinity.score * 100;
  const emotionalVolatility = scores.emotional_volatility.score * 100;

  if (musicalDiversity >= 60) {
    types.push('Open-minded');
    typeScores.push({ type: 'Open-minded', score: musicalDiversity });
  }

  if (explorationRate >= 60) {
    types.push('Explorer');
    typeScores.push({ type: 'Explorer', score: explorationRate });
  }

  if (temporalConsistency >= 60) {
    types.push('Consistent Listener');
    typeScores.push({ type: 'Consistent Listener', score: temporalConsistency });
  }

  if (mainstreamAffinity >= 60) {
    types.push('Mainstream Listener');
    typeScores.push({ type: 'Mainstream Listener', score: mainstreamAffinity });
  }

  if (emotionalVolatility >= 60) {
    types.push('Emotionally Volatile');
    typeScores.push({ type: 'Emotionally Volatile', score: emotionalVolatility });
  } else if (emotionalVolatility <= 40) {
    types.push('Emotionally Stable');
    typeScores.push({ type: 'Emotionally Stable', score: 100 - emotionalVolatility });
  }

  // If no types qualify, use Balanced Listener
  if (types.length === 0) {
    types.push('Balanced Listener');
    typeScores.push({ type: 'Balanced Listener', score: 50 });
  }

  // Sort by score to get dominant type
  typeScores.sort((a, b) => b.score - a.score);
  const dominantType = typeScores[0].type;

  // Determine overall confidence based on individual metric confidences
  const confidences = Object.values(scores).map(metric => metric.confidence);
  const highCount = confidences.filter(c => c === 'high').length;
  const mediumCount = confidences.filter(c => c === 'medium').length;
  
  let overallConfidence = 'low';
  if (highCount >= 3) overallConfidence = 'high';
  else if (highCount >= 2 || mediumCount >= 3) overallConfidence = 'medium';

  return { types, dominantType, confidence: overallConfidence };
}

function PersonalityCard({ psyPayload, loading }: { psyPayload: PsyPayload | null, loading: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate personality from real data
  const personality = determinePersonality(psyPayload);
  const dominantPersonality = personalityTypes[personality.dominantType];

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-700 rounded-lg flex-shrink-0"></div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-zinc-700 rounded w-2/3 max-w-48"></div>
              <div className="h-3 bg-zinc-700 rounded w-3/4 max-w-56"></div>
            </div>
          </div>
          <div className="space-y-3 text-center">
            <div className="h-8 bg-zinc-700 rounded w-4/5 max-w-64 mx-auto"></div>
            <div className="h-12 bg-zinc-700 rounded w-20 mx-auto"></div>
            <div className="h-4 bg-zinc-700 rounded w-full max-w-72 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get raw score values for display
  const rawScores = psyPayload ? {
    'Musical Diversity': Math.round(psyPayload.scores.musical_diversity.score * 100),
    'Exploration Rate': Math.round(psyPayload.scores.exploration_rate.score * 100),
    'Temporal Consistency': Math.round(psyPayload.scores.temporal_consistency.score * 100),
    'Mainstream Affinity': Math.round(psyPayload.scores.mainstream_affinity.score * 100),
    'Emotional Volatility': Math.round(psyPayload.scores.emotional_volatility.score * 100)
  } : {};

  // Calculate overall personality score (average of qualifying traits)
  const overallScore = personality.types.length > 0 ? 
    Math.round(personality.types.reduce((sum, type) => {
      if (type === 'Open-minded') return sum + (rawScores['Musical Diversity'] || 0);
      if (type === 'Explorer') return sum + (rawScores['Exploration Rate'] || 0);
      if (type === 'Consistent Listener') return sum + (rawScores['Temporal Consistency'] || 0);
      if (type === 'Mainstream Listener') return sum + (rawScores['Mainstream Affinity'] || 0);
      if (type === 'Emotionally Volatile') return sum + (rawScores['Emotional Volatility'] || 0);
      if (type === 'Emotionally Stable') return sum + (100 - (rawScores['Emotional Volatility'] || 0));
      return sum + 50; // Balanced Listener
    }, 0) / personality.types.length) : 50;

  return (
    <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4 min-w-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-white truncate">Personality</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">{dominantPersonality?.name || 'Balanced Listener'}</h4>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">{overallScore}%</div>
            <div className="text-sm text-zinc-400">match</div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed px-2 break-words">
            {dominantPersonality?.description || 'Shows balanced traits across various listening styles.'}
          </p>
          
          {/* Show multiple personality types if applicable */}
          {personality.types.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center px-2">
              {personality.types.slice(0, 3).map((type) => (
                <span 
                  key={type}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs bg-gradient-to-r ${personalityTypes[type]?.color || 'from-gray-500 to-gray-600'} text-white break-words`}
                >
                  {type}
                </span>
              ))}
              {personality.types.length > 3 && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-zinc-700 text-zinc-300">
                  +{personality.types.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-zinc-700 space-y-4 transition-all duration-300">
            <div className="text-center">
              <p className="text-zinc-400 text-sm break-words">
                Based on your <span className="text-white font-medium">Musical Diversity</span>, <span className="text-white font-medium">Exploration Rate</span>, <span className="text-white font-medium">Temporal Consistency</span>, <span className="text-white font-medium">Mainstream Affinity</span>, and <span className="text-white font-medium">Emotional Volatility</span> patterns.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MoodBarChart() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<DailyMoodData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{vertical: 'top' | 'bottom', horizontal: 'left' | 'center' | 'right'}>({
    vertical: 'top',
    horizontal: 'center'
  });
  
  // Get real mood data from the hook. The backend is now responsible for providing a full 5-day array.
  const { moodData, insights, loading, error, aiSummary, summaryLoading } = useMoodData();

  // Mood emojis for visualization
  const getMoodEmoji = (mood: number) => {
    if (mood === 0) return "⚪"; // No data
    if (mood >= 75) return "🌞";
    if (mood >= 60) return "🌤";
    if (mood >= 40) return "☁️";
    return "🌧";
  };

  const getMoodLabel = (mood: number) => {
    if (mood === 0) return "No Data";
    if (mood >= 75) return "Joyful & Stable";
    if (mood >= 60) return "Doing Fine";
    if (mood >= 40) return "Mild Volatility";
    return "Mood Unstable";
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-700 rounded-lg flex-shrink-0"></div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-zinc-700 rounded w-3/4 max-w-48"></div>
              <div className="h-3 bg-zinc-700 rounded w-full max-w-64"></div>
            </div>
          </div>
          <div className="h-48 sm:h-64 bg-zinc-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isPermissionError = error.includes('permissions') || error.includes('403');
    
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white break-words">Your weekly mood tune</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-2 break-words">
            {isPermissionError ? 'Spotify Permissions Required' : 'Failed to load mood data'}
          </p>
          <p className="text-zinc-500 text-sm mb-4 break-words">{error}</p>
          {isPermissionError && (
            <div className="mt-4 p-3 sm:p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 text-sm break-words">
                <strong>Note:</strong> Mood analysis requires access to your listening history. 
                Please ensure your Spotify account is properly connected.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state - check for moodData being null or empty
  if (!moodData || moodData.length === 0) {
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white break-words">Your weekly mood tune</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-2 break-words">No mood data available</p>
          <p className="text-zinc-500 text-sm mb-4 break-words">
            Listen to music on Spotify for a few days to see your mood trends.
          </p>
          <div className="mt-4 p-3 sm:p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm break-words">
              <strong>Tip:</strong> Your mood score is calculated from musical diversity, exploration rate, 
              temporal consistency, and emotional volatility in your daily listening patterns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4 min-w-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-white truncate">Your weekly mood tune</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6">
        {/* Fully Responsive Bar Chart with proper axis lines */}
        <div className="w-full max-w-full">
          {/* Chart container */}
          <div className="w-full max-w-full relative">
            {/* Y-axis labels - positioned absolutely */}
            <div className="absolute left-0 top-0 h-60 sm:h-72 flex flex-col justify-between text-xs text-zinc-400 z-10 pr-2">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            
            {/* Y-axis line */}
            <div className="absolute left-8 top-0 w-px h-60 sm:h-72 bg-zinc-600 z-5"></div>
            
            {/* Chart area with proper left margin for y-axis and right padding */}
            <div className="ml-8 pr-4 w-full max-w-full relative">
              {/* Bars container */}
              <div className="flex items-end justify-evenly gap-0.5 sm:gap-1 h-60 sm:h-72 w-full relative">
                {moodData.filter(d=>d.moodScore>0).map((data, index) => (
                  <div 
                    key={data.date}
                    className="flex flex-col items-center group cursor-pointer flex-1 min-w-0 relative"
                    onMouseEnter={(e) => {
                      setHoveredDay(data);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = e.currentTarget.closest('.w-full')?.getBoundingClientRect();
                      if (containerRect) {
                        const relativeLeft = rect.left - containerRect.left;
                        const containerWidth = containerRect.width;
                        
                        let horizontal: 'left' | 'center' | 'right' = 'center';
                        if (relativeLeft < containerWidth * 0.25) horizontal = 'left';
                        else if (relativeLeft > containerWidth * 0.75) horizontal = 'right';
                        
                        let vertical: 'top' | 'bottom' = 'top';
                        if (data.moodScore > 50) vertical = 'bottom';
                        
                        setTooltipPosition({ vertical, horizontal });
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Minimal Tooltip */}
                    {hoveredDay?.date === data.date && (
                      <motion.div 
                        className={`absolute z-20 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-2 text-white shadow-xl pointer-events-none min-w-0 max-w-32 ${
                          tooltipPosition.vertical === 'top' ? 'mb-2 bottom-full' : 'mt-2 top-full'
                        } ${
                          tooltipPosition.horizontal === 'left' ? 'left-0' : 
                          tooltipPosition.horizontal === 'right' ? 'right-0' : 
                          'left-1/2 transform -translate-x-1/2'
                        }`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium text-zinc-300 truncate">{data.dayName}</div>
                          <div className="text-sm font-bold">{data.moodScore}%</div>
                          <div className="text-xs text-zinc-400 truncate">{getMoodLabel(data.moodScore)}</div>
                        </div>
                      </motion.div>
                    )}

                    {/* Bar */}
                    <motion.div 
                      className="w-full max-w-8 sm:max-w-12 relative overflow-hidden rounded-t-lg border border-white/20 bg-white/10 backdrop-blur-sm shadow-md"
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${data.moodScore === 0 ? 40 : Math.max(20, (data.moodScore / 100) * 240)}px`
                      }}
                      transition={{ 
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {/* Main gradient bar with enhanced styling */}
                      <div className={`w-full h-full relative rounded-t-lg ${
                        data.moodScore === 0
                          ? 'bg-gradient-to-t from-zinc-600 via-zinc-500 to-zinc-400 shadow-zinc-400/30 border border-zinc-400/20'
                          : data.moodScore >= 75 
                          ? 'bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 shadow-emerald-500/20' 
                          : data.moodScore >= 60 
                          ? 'bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300 shadow-blue-500/20'
                          : data.moodScore >= 40 
                          ? 'bg-gradient-to-t from-gray-700 via-gray-500 to-gray-300 shadow-gray-500/20'
                          : 'bg-gradient-to-t from-purple-700 via-purple-500 to-purple-300 shadow-purple-500/20'
                      } shadow-lg`}>
                        {/* Glass overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 backdrop-blur-[1px] rounded-t-lg"></div>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                        
                        {/* Top highlight */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-lg"></div>
                        
                        {/* No data indicator */}
                        {data.moodScore === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs text-white/60 font-medium">—</div>
                          </div>
                        )}
                      </div>


                    </motion.div>
                  </div>
                ))}
              </div>
              
              {/* X-axis line */}
              <div className="w-full h-px bg-zinc-600 relative"></div>
              
              {/* Day labels and emojis - positioned below x-axis */}
              <div className="flex items-start justify-evenly gap-0.5 sm:gap-1 w-full mt-2">
                {moodData.filter(d=>d.moodScore>0).map((data) => (
                  <div key={`label-${data.date}`} className="flex flex-col items-center flex-1 min-w-0">
                    <div className="text-zinc-400 text-xs truncate">{data.dayName.slice(0, 3)}</div>
                    <div className="text-lg mt-1">{getMoodEmoji(data.moodScore)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {summaryLoading ? (
            <div className="flex items-center justify-center gap-2 text-zinc-400">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm break-words">Analyzing your weekly mood...</span>
            </div>
          ) : (
            <div className="text-zinc-300 text-sm leading-relaxed space-y-2">
              {aiSummary ? (
                aiSummary.split(/[•\n]/).filter(point => point.trim()).map((point, index) => {
                  const icons = [
                    Brain,
                    Sparkles,
                    Compass
                  ];
                  const IconComp = icons[index % icons.length];
                  return (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-zinc-800/40 border border-zinc-700/60 rounded-lg"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <IconComp size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-zinc-300 text-sm leading-snug break-words">{point.replace(/^[-–—\s]+/, '').trim()}</p>
                    </motion.div>
                  );
                })
              ) : (
                <p className="break-words">No summary available.</p>
              )}
            </div>
          )}
        </motion.div>

        {isExpanded && insights && (
          <div className="mt-6 pt-6 border-t border-zinc-700 space-y-4 transition-all duration-300">
            <h5 className="text-lg font-semibold text-white mb-4 break-words">Weekly Mood Analysis</h5>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border ${insights.lowestMoodDay.moodScore <= 50 ? 'bg-purple-900/20 border-purple-500/30' : 'bg-gray-900/20 border-gray-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${insights.lowestMoodDay.moodScore <= 50 ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
                  <span className={`font-medium break-words ${insights.lowestMoodDay.moodScore <= 50 ? 'text-purple-300' : 'text-gray-300'}`}>
                    {insights.lowestMoodDay.dayName} - Lowest Mood ({insights.lowestMoodDay.moodScore}%)
                  </span>
                </div>
                <p className="text-zinc-400 text-sm break-words">
                   Energy dipped—take a mindful moment to recharge.
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${insights.highestMoodDay.moodScore >= 70 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${insights.highestMoodDay.moodScore >= 70 ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                  <span className={`font-medium break-words ${insights.highestMoodDay.moodScore >= 70 ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {insights.highestMoodDay.dayName} - Peak Mood ({insights.highestMoodDay.moodScore}%)
                  </span>
                </div>
                <p className="text-zinc-400 text-sm break-words">
                   Sky-high vibes—ride that positive momentum!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WellnessPlaylists() {
  const { data, loading, error } = useWellnessPlaylists();

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-700 rounded-lg flex-shrink-0"></div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-zinc-700 rounded w-3/4 max-w-48"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/2 max-w-32"></div>
            </div>
          </div>
          <div className="h-20 bg-zinc-700 rounded w-full"></div>
          <div className="h-32 bg-zinc-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white break-words">Sounds to Soothe You</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-2 break-words">Unable to load wellness playlists</p>
          <p className="text-zinc-500 text-sm break-words">{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white break-words">Sounds to Soothe You</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-2 break-words">No wellness data available</p>
          <p className="text-zinc-500 text-sm break-words">Connect your Spotify account to get personalized recommendations</p>
        </div>
      </div>
    );
  }

  const { emotionalState, playlists, insight } = data;
  
  const moodTitleMap: Record<string, string> = {
    positive: 'Positivity Boost',
    neutral: 'Balanced Vibes',
    low: 'Gentle Lift'
  };

  // Debug logging
  console.log('🎵 Wellness Playlists Data:', { emotionalState, playlists: playlists?.length, insight });

  return (
    <div className="w-full max-w-full overflow-hidden bg-zinc-900 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 break-words">Sounds to Soothe You</h3>
        
        {/* Horizontally Scrollable Playlist Boxes */}
        <div className="relative mb-6">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                className="group bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-4 hover:bg-zinc-800/50 transition-all duration-300 flex-shrink-0 w-48"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                                 <div className="flex flex-col items-center text-center h-full">
                   {/* Playlist Cover Image */}
                   <div className="mb-3">
                     {playlist.coverImage ? (
                       <img
                         src={playlist.coverImage}
                         alt={playlist.name}
                         className="w-24 h-24 rounded-xl object-cover shadow-lg"
                         onError={(e) => {
                           // If image fails to load, hide it and show fallback
                           (e.target as HTMLImageElement).style.display = 'none';
                           const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                           if (fallback) fallback.style.display = 'flex';
                         }}
                       />
                     ) : null}
                     <div 
                       className={`w-24 h-24 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg ${playlist.coverImage ? 'hidden' : 'flex'}`}
                     >
                       <Music size={28} className="text-white" />
                     </div>
                   </div>
                   
                   {/* Playlist Info */}
                   <div className="flex-1 min-w-0 w-full flex flex-col h-full">
                     <div className="mb-2">
                       <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30 mb-2">
                         {playlist.moodTag}
                       </span>
                     </div>
                     <h4 className="text-white font-semibold text-base mb-2 line-clamp-2 leading-tight">{playlist.name}</h4>
                     
                     {/* Spotify CTA - Always at bottom */}
                     <div className="mt-auto pt-3">
                       <a
                         href={playlist.spotifyUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-600 hover:border-zinc-500 rounded-lg transition-all duration-200 group-hover:scale-105"
                         title="Open in Spotify"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3 text-[#1DB954]">
                           <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                         </svg>
                         <span className="text-zinc-300 text-xs font-medium">Open</span>
                       </a>
                     </div>
                   </div>
                 </div>
              </motion.div>
            ))}
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              {playlists.map((_, index) => (
                <div key={index} className="w-1 h-1 rounded-full bg-zinc-600"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall mood insight card */}
        <motion.div 
          className="p-3 sm:p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0">
              <Brain size={16} className="text-white" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-zinc-300 text-sm capitalize truncate">{moodTitleMap[emotionalState.state] || 'Mood Insight'}</span>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed break-words">
            {insight || "Music can be a powerful companion for emotional wellness - these playlists are chosen just for you."}
          </p>
        </motion.div>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs">
          <Sparkles size={12} className="flex-shrink-0" />
          <span>Personalized for your mood</span>
        </div>
      </div>
    </div>
  );
}

export default function MentalHealthInsights() {
  // Get real psycho-analysis data
  const { payload: psyPayload, loading: psyLoading } = usePsyMetrics();

  return (
    <div className="w-full max-w-full overflow-hidden px-0">
      <div className="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6">
        <PersonalityCard psyPayload={psyPayload} loading={psyLoading} />
        <div className="w-full max-w-full overflow-hidden grid gap-4 sm:gap-6 xl:grid-cols-2">
          <MoodBarChart />
          <WellnessPlaylists />
        </div>
      </div>
    </div>
  );
} 