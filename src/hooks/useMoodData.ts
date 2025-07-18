"use client";

import { useState, useEffect } from 'react';
import { usePsyMetrics } from './usePsyMetrics';

export interface DailyMoodData {
  date: string;
  dayName: string;
  moodScore: number;
  trackCount: number;
  musicalDiversity: number;
  explorationRate: number;
  temporalConsistency: number;
  mainstreamAffinity: number;
  emotionalVolatility: number;
  insight: string;
  topGenres?: string[];
}

export interface MoodInsights {
  averageMood: number;
  highestMoodDay: DailyMoodData;
  lowestMoodDay: DailyMoodData;
  totalDays: number;
}

export interface MoodDataResponse {
  moodData: DailyMoodData[];
  insights: MoodInsights;
}

export function useMoodData() {
  const [moodData, setMoodData] = useState<DailyMoodData[]>([]);
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get personality payload
  const { payload: psyPayload } = usePsyMetrics();

  const generateAISummary = async (
    moodData: DailyMoodData[],
    insights: MoodInsights,
    personalityType: string
  ) => {
    try {
      setSummaryLoading(true);
      
      const response = await fetch('/api/spotify/mood-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodData,
          averageMood: insights.averageMood,
          highestMoodDay: insights.highestMoodDay,
          personalityType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI summary');
      }

      const data = await response.json();
      setAiSummary(data.summary);
    } catch (err) {
      console.error('Error generating AI summary:', err);
      // Fallback to a simple summary if AI fails
      if (insights.averageMood >= 70) {
        setAiSummary(`• You had a great week with positive music energy! 🌕\n• ${insights.highestMoodDay.dayName} was your peak mood day 🌤`);
      } else if (insights.averageMood >= 50) {
        setAiSummary(`• Your week showed balanced musical mood patterns ☁️\n• ${insights.highestMoodDay.dayName} brought your highest energy levels 🌤`);
      } else {
        setAiSummary(`• This week had its ups and downs musically 🌧\n• ${insights.highestMoodDay.dayName} showed your resilience and strength ☁️`);
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/spotify/mood-data');

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please reconnect your Spotify account');
          }
          if (response.status === 403) {
            throw new Error('Insufficient Spotify permissions. Please reconnect with updated permissions.');
          }
          throw new Error(`Failed to fetch mood data (${response.status})`);
        }

        const data: MoodDataResponse = await response.json();
        
        setMoodData(data.moodData || []);
        setInsights(data.insights || null);

        // Generate AI summary if we have data
        if (data.moodData?.length && data.insights) {
          const personalityType = determinePersonalityType(psyPayload);
          generateAISummary(data.moodData, data.insights, personalityType);
        }

      } catch (err) {
        console.error('Error fetching mood data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch mood data');
        setMoodData([]);
        setInsights(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  return {
    moodData,
    insights,
    aiSummary,
    loading,
    summaryLoading,
    error,
    refetch: () => {
      fetch('/api/spotify/mood-data')
        .then(response => response.json())
        .then(data => {
          setMoodData(data.moodData || []);
          setInsights(data.insights || null);
          if (data.moodData?.length && data.insights) {
            const personalityType = determinePersonalityType(psyPayload);
            generateAISummary(data.moodData, data.insights, personalityType);
          }
        })
        .catch(err => setError(err.message));
    }
  };
}

function determinePersonalityType(psyPayload: any): string {
  if (!psyPayload) return 'Balanced Listener';

  const scores = psyPayload.scores;
  const types: string[] = [];

  const musicalDiversity = scores.musical_diversity.score * 100;
  const explorationRate = scores.exploration_rate.score * 100;
  const temporalConsistency = scores.temporal_consistency.score * 100;
  const mainstreamAffinity = scores.mainstream_affinity.score * 100;
  const emotionalVolatility = scores.emotional_volatility.score * 100;

  if (musicalDiversity >= 60) types.push('Open-minded');
  if (explorationRate >= 60) types.push('Explorer');
  if (temporalConsistency >= 60) types.push('Consistent Listener');
  if (mainstreamAffinity >= 60) types.push('Mainstream Listener');

  if (emotionalVolatility >= 60) {
    types.push('Emotionally Volatile');
  } else if (emotionalVolatility <= 40) {
    types.push('Emotionally Stable');
  }

  return types.length > 0 ? types[0] : 'Balanced Listener';
} 