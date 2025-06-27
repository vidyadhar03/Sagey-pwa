"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp, Music, Sparkles, Heart, Shield, Compass } from 'lucide-react';
import { usePsyMetrics } from '../hooks/usePsyMetrics';
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

const sampleMoodData = [
  { week: "Week 1", mood: 7.2, dominantGenre: "Indie Folk" },
  { week: "Week 2", mood: 5.8, dominantGenre: "Alternative Rock" },
  { week: "Week 3", mood: 8.1, dominantGenre: "Lo-fi Hip Hop" },
  { week: "Week 4", mood: 4.3, dominantGenre: "Sad Pop" },
];

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
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${dominantPersonality?.color || 'from-purple-500 to-pink-500'}`}>
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Personality</h3>
          </div>
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
            <h5 className="text-lg font-semibold text-white mb-4">How Your Personality is Determined</h5>
            
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

  const getMoodColor = (mood: number) => {
    if (mood >= 7) return "bg-green-500";
    if (mood >= 5) return "bg-yellow-500"; 
    return "bg-red-500";
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return "Excellent";
    if (mood >= 7) return "Good";
    if (mood >= 5) return "Moderate";
    if (mood >= 3) return "Low";
    return "Very Low";
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Weekly Mood Trends</h3>
            <p className="text-zinc-400 text-sm">Your emotional journey through music</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {sampleMoodData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{data.week}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm">{data.dominantGenre}</span>
                  <span className="text-white font-semibold">{data.mood}/10</span>
                </div>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getMoodColor(data.mood)} transition-all duration-500`}
                  style={{ width: `${data.mood * 10}%` }}
                />
              </div>
              <div className="text-xs text-zinc-400">{getMoodLabel(data.mood)}</div>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-zinc-700 space-y-4 transition-all duration-300">
            <h5 className="text-lg font-semibold text-white mb-4">Mood Analysis</h5>
            <div className="space-y-3">
              <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-300 font-medium">Week 4 - Lowest Point</span>
                </div>
                <p className="text-zinc-300 text-sm">
                  You were feeling low while listening to <strong>Sad Pop</strong>. This genre typically reflects 
                  periods of introspection or emotional processing.
                </p>
              </div>
              <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-300 font-medium">Week 3 - Peak Mood</span>
                </div>
                <p className="text-zinc-300 text-sm">
                  Your highest mood coincided with <strong>Lo-fi Hip Hop</strong>, suggesting this genre 
                  helps you feel calm and focused.
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <p className="text-zinc-300 text-sm">
                <strong>How it's calculated:</strong> Mood scores are derived from track valence, energy, 
                listening duration, skip rates, and genre emotional associations across your weekly listening patterns.
              </p>
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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
            <Music size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Wellness Playlists</h3>
            <p className="text-zinc-400 text-sm">Curated music for your mental health</p>
          </div>
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