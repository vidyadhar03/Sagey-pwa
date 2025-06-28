"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp, Music, Sparkles, Heart, Shield, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePsyMetrics } from '../hooks/usePsyMetrics';
import { useMoodData, DailyMoodData } from '../hooks/useMoodData';
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

// Sample data for UI demonstration (for mood and recommendations sections)
const samplePersonality = {
  type: "The Contemplative Explorer",
  score: 78,
  description: "You use music as a tool for introspection and emotional exploration. Your listening patterns suggest a balanced approach to mental wellness.",
  traits: [
    { name: "Emotional Stability", value: 82, color: "from-blue-500 to-blue-600" },
    { name: "Openness", value: 91, color: "from-purple-500 to-purple-600" },
    { name: "Stress Management", value: 67, color: "from-green-500 to-green-600" },
    { name: "Social Connection", value: 74, color: "from-pink-500 to-pink-600" }
  ]
};



const sampleRecommendations = [
  {
    category: "Mood Boosting",
    description: "Uplifting tracks to enhance your positive moments",
    playlists: ["Feel Good Indie", "Morning Motivation", "Sunshine Vibes"]
  },
  {
    category: "Stress Relief", 
    description: "Calming music for when you need to unwind",
    playlists: ["Deep Focus", "Meditation Sounds", "Ambient Chill"]
  },
  {
    category: "Emotional Processing",
    description: "Music that helps you work through complex emotions", 
    playlists: ["Introspective Indie", "Emotional Journey", "Reflective Moments"]
  }
];

function PersonalityCard({ psyPayload, loading }: { psyPayload: PsyPayload | null, loading: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate personality from real data
  const personality = determinePersonality(psyPayload);
  const dominantPersonality = personalityTypes[personality.dominantType];
  
  // Get confidence badge color
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-700 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-zinc-700 rounded w-32"></div>
              <div className="h-3 bg-zinc-700 rounded w-48"></div>
            </div>
          </div>
          <div className="space-y-3 text-center">
            <div className="h-8 bg-zinc-700 rounded w-64 mx-auto"></div>
            <div className="h-12 bg-zinc-700 rounded w-20 mx-auto"></div>
            <div className="h-4 bg-zinc-700 rounded w-80 mx-auto"></div>
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
    <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Personality</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-white mb-2">{dominantPersonality?.name || 'Balanced Listener'}</h4>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-3xl font-bold text-purple-400">{overallScore}%</div>
            <div className="text-sm text-zinc-400">match</div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {dominantPersonality?.description || 'Shows balanced traits across various listening styles.'}
          </p>
          
          {/* Show multiple personality types if applicable */}
          {personality.types.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {personality.types.slice(0, 3).map((type) => (
                <span 
                  key={type}
                  className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${personalityTypes[type]?.color || 'from-gray-500 to-gray-600'} text-white`}
                >
                  {type}
                </span>
              ))}
              {personality.types.length > 3 && (
                <span className="px-3 py-1 rounded-full text-xs bg-zinc-700 text-zinc-300">
                  +{personality.types.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-zinc-700 space-y-4 transition-all duration-300">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="text-zinc-300 text-sm">
                <p className="font-medium text-white mb-3">Your personality type is determined by analyzing 5 key listening attributes:</p>
                <p>Musical Diversity, Exploration Rate, Temporal Consistency, Mainstream Affinity, and Emotional Volatility.</p>
              </div>
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
  
  // Get real mood data
  const { moodData, insights, loading, error, aiSummary, summaryLoading } = useMoodData();

  // Mood emojis for visualization
  const getMoodEmoji = (mood: number) => {
    if (mood >= 75) return "🌞";
    if (mood >= 60) return "🌤";
    if (mood >= 40) return "☁️";
    return "🌧";
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 75) return "Joyful & Stable";
    if (mood >= 60) return "Doing Fine";
    if (mood >= 40) return "Mild Volatility";
    return "Mood Unstable";
  };



  // Loading state
  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-700 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-zinc-700 rounded w-40"></div>
              <div className="h-3 bg-zinc-700 rounded w-56"></div>
            </div>
          </div>
          <div className="h-64 bg-zinc-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isPermissionError = error.includes('permissions') || error.includes('403');
    
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">Your weekly mood tune</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-2">
            {isPermissionError ? 'Spotify Permissions Required' : 'Failed to load mood data'}
          </p>
          <p className="text-zinc-500 text-sm mb-4">{error}</p>
          {isPermissionError && (
            <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 text-sm">
                <strong>Note:</strong> Mood analysis requires access to your listening history. 
                Please ensure your Spotify account is properly connected.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (!moodData.length) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">Your weekly mood tune</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-2">No mood data available</p>
          <p className="text-zinc-500 text-sm mb-4">
            Listen to music on Spotify for a few days to see your mood trends.
          </p>
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Tip:</strong> Your mood score is calculated from musical diversity, exploration rate, 
              temporal consistency, and emotional volatility in your daily listening patterns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Your weekly mood tune</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="space-y-6">
        {/* Simple Clean Bar Chart */}
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-zinc-400 pr-2">
            <span>100</span>
            <span>80</span>
            <span>60</span>
            <span>40</span>
            <span>20</span>
            <span>0</span>
          </div>
          
          {/* Chart container with proper spacing */}
          <div className="ml-8">
            {/* Y-axis line */}
            <div className="absolute left-8 top-0 h-48 w-px bg-zinc-600"></div>
            
            {/* Chart area - animated bars */}
            <div className="flex items-end justify-center gap-6 sm:gap-8 h-48 relative pl-1">
              {moodData.map((data, index) => (
                <div 
                  key={index}
                  className="relative group cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDay(data);
                    // Smart positioning: detect screen boundaries
                    const rect = e.currentTarget.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    
                    // Tooltip dimensions (approximate)
                    const tooltipWidth = window.innerWidth < 640 ? 288 : 320; // w-72 = 288px, w-80 = 320px
                    const tooltipHeight = 140; // approximate height
                    
                    // Vertical positioning
                    const spaceAbove = rect.top;
                    const spaceBelow = viewportHeight - rect.bottom;
                    const vertical = spaceAbove > tooltipHeight + 20 ? 'top' : 'bottom';
                    
                    // Horizontal positioning
                    const centerX = rect.left + rect.width / 2;
                    const tooltipLeft = centerX - tooltipWidth / 2;
                    const tooltipRight = centerX + tooltipWidth / 2;
                    
                    let horizontal: 'left' | 'center' | 'right' = 'center';
                    if (tooltipLeft < 10) {
                      horizontal = 'left';
                    } else if (tooltipRight > viewportWidth - 10) {
                      horizontal = 'right';
                    }
                    
                    setTooltipPosition({ vertical, horizontal });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  onTouchStart={(e) => {
                    setHoveredDay(data);
                    // Smart positioning for mobile
                    const rect = e.currentTarget.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    
                    // Tooltip dimensions (approximate)
                    const tooltipWidth = window.innerWidth < 640 ? 288 : 320;
                    const tooltipHeight = 140;
                    
                    // Vertical positioning
                    const spaceAbove = rect.top;
                    const spaceBelow = viewportHeight - rect.bottom;
                    const vertical = spaceAbove > tooltipHeight + 20 ? 'top' : 'bottom';
                    
                    // Horizontal positioning
                    const centerX = rect.left + rect.width / 2;
                    const tooltipLeft = centerX - tooltipWidth / 2;
                    const tooltipRight = centerX + tooltipWidth / 2;
                    
                    let horizontal: 'left' | 'center' | 'right' = 'center';
                    if (tooltipLeft < 10) {
                      horizontal = 'left';
                    } else if (tooltipRight > viewportWidth - 10) {
                      horizontal = 'right';
                    }
                    
                    setTooltipPosition({ vertical, horizontal });
                  }}
                  onTouchEnd={() => {
                    // Keep tooltip visible for a moment on mobile
                    setTimeout(() => setHoveredDay(null), 3000);
                  }}
                >
                  {/* Redesigned animated bar */}
                  <motion.div 
                    className="w-8 sm:w-12 relative overflow-hidden rounded-t-xl"
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${Math.max(4, (data.moodScore / 100) * 192)}px`
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
                    {/* Main gradient bar */}
                    <div className={`w-full h-full relative ${
                      data.moodScore >= 75 
                        ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-300' 
                        : data.moodScore >= 60 
                        ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-300'
                        : data.moodScore >= 40 
                        ? 'bg-gradient-to-t from-gray-600 via-gray-500 to-gray-300'
                        : 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-300'
                    }`}>
                      {/* Glass overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 backdrop-blur-[1px]"></div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                      
                      {/* Top highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-xl"></div>
                    </div>

                    {/* Value label on hover */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg">
                        {data.moodScore}%
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Enhanced tooltip with smart positioning */}
                  {hoveredDay === data && (
                    <motion.div 
                      className={`absolute z-20 bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl w-72 sm:w-80 ${
                        tooltipPosition.vertical === 'top' 
                          ? 'bottom-full mb-4' 
                          : 'top-full mt-4'
                      } ${
                        tooltipPosition.horizontal === 'left' 
                          ? 'left-0' 
                          : tooltipPosition.horizontal === 'right' 
                          ? 'right-0' 
                          : 'left-1/2 transform -translate-x-1/2'
                      }`}
                      initial={{ opacity: 0, y: tooltipPosition.vertical === 'top' ? 10 : -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Arrow pointing to bar */}
                      <div className={`absolute w-3 h-3 bg-zinc-800 border rotate-45 ${
                        tooltipPosition.vertical === 'top' 
                          ? 'top-full -mt-2 border-r-zinc-700 border-b-zinc-700 border-l-transparent border-t-transparent' 
                          : 'bottom-full -mb-2 border-l-zinc-700 border-t-zinc-700 border-r-transparent border-b-transparent'
                      } ${
                        tooltipPosition.horizontal === 'left' 
                          ? 'left-6' 
                          : tooltipPosition.horizontal === 'right' 
                          ? 'right-6' 
                          : 'left-1/2 transform -translate-x-1/2'
                      }`}></div>
                      
                      <div className="text-white font-medium mb-1">
                        {new Date(data.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-zinc-300 text-sm mb-2">
                        Mood Score: {data.moodScore}% - {getMoodLabel(data.moodScore)} {getMoodEmoji(data.moodScore)}
                      </div>
                      <div className="text-zinc-400 text-xs mb-2">
                        {data.insight}
                      </div>
                      <div className="text-zinc-500 text-xs pt-2 border-t border-zinc-700">
                        {data.trackCount} tracks • Diversity: {data.musicalDiversity}% • Exploration: {data.explorationRate}%
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            
            {/* X-axis line */}
            <div className="border-b border-zinc-600 pl-1"></div>
            
            {/* Day labels with emojis below x-axis */}
            <div className="flex justify-center gap-6 sm:gap-8 pl-1 mt-2">
              {moodData.map((data, index) => (
                <motion.div 
                  key={index}
                  className="w-8 sm:w-12 flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1 + 0.3
                  }}
                >
                  <div className="text-base sm:text-lg mb-1">
                    {getMoodEmoji(data.moodScore)}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-300 font-medium">
                    {data.dayName}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly mood summary */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {summaryLoading ? (
            <div className="flex items-center justify-center gap-2 text-zinc-400">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm">Analyzing your weekly mood...</span>
            </div>
          ) : (
            <div className="text-zinc-300 text-sm leading-relaxed space-y-2">
              {aiSummary ? (
                aiSummary.split(/[•\n]/).filter(point => point.trim()).map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{point.trim()}</span>
                  </div>
                ))
              ) : (
                <p>No summary available.</p>
              )}
            </div>
          )}
        </motion.div>

        {isExpanded && insights && (
          <div className="mt-6 pt-6 border-t border-zinc-700 space-y-4 transition-all duration-300">
            <h5 className="text-lg font-semibold text-white mb-4">Weekly Mood Analysis</h5>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border ${insights.lowestMoodDay.moodScore <= 50 ? 'bg-purple-900/20 border-purple-500/30' : 'bg-gray-900/20 border-gray-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${insights.lowestMoodDay.moodScore <= 50 ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
                  <span className={`font-medium ${insights.lowestMoodDay.moodScore <= 50 ? 'text-purple-300' : 'text-gray-300'}`}>
                    {insights.lowestMoodDay.dayName} - Lowest Mood ({insights.lowestMoodDay.moodScore}%)
                  </span>
                </div>
                <p className="text-zinc-300 text-sm">
                  {insights.lowestMoodDay.insight}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${insights.highestMoodDay.moodScore >= 70 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${insights.highestMoodDay.moodScore >= 70 ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                  <span className={`font-medium ${insights.highestMoodDay.moodScore >= 70 ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {insights.highestMoodDay.dayName} - Peak Mood ({insights.highestMoodDay.moodScore}%)
                  </span>
                </div>
                <p className="text-zinc-300 text-sm">
                  {insights.highestMoodDay.insight}
                </p>
              </div>
            </div>
            

          </div>
        )}
      </div>
    </div>
  );
}

function SpotifyRecommendations() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Wellness Playlists</h3>
          <p className="text-zinc-400 text-sm">Curated music for your mental health</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="space-y-4">
        {sampleRecommendations.map((rec, index) => (
          <div key={index} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded bg-green-500/20">
                {rec.category === "Mood Boosting" && <Heart size={16} className="text-green-400" />}
                {rec.category === "Stress Relief" && <Shield size={16} className="text-blue-400" />}
                {rec.category === "Emotional Processing" && <Compass size={16} className="text-purple-400" />}
              </div>
              <h4 className="text-white font-semibold">{rec.category}</h4>
            </div>
            <p className="text-zinc-300 text-sm mb-3">{rec.description}</p>
            
            {(!isExpanded && index < 2) || isExpanded ? (
              <div className="flex flex-wrap gap-2">
                {rec.playlists.map((playlist, pIndex) => (
                  <button
                    key={pIndex}
                    className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-xs border border-green-500/30 hover:bg-green-900/50 transition-colors"
                  >
                    {playlist}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-zinc-700 transition-all duration-300">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-yellow-400" />
                <h5 className="text-white font-semibold">Personalized Recommendations</h5>
              </div>
              <p className="text-zinc-300 text-sm">
                These playlists are specifically curated for <strong>{samplePersonality.type}</strong> personality types. 
                Research shows that targeted music therapy can improve mood by up to 45% and reduce stress levels significantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MentalHealthInsights() {
  // Get real psycho-analysis data
  const { payload: psyPayload, loading: psyLoading } = usePsyMetrics();

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <PersonalityCard psyPayload={psyPayload} loading={psyLoading} />
      <div className="grid gap-6 md:grid-cols-2">
        <MoodBarChart />
        <SpotifyRecommendations />
      </div>
    </div>
  );
} 