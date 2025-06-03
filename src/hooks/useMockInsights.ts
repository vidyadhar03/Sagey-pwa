"use client";

import { useState, useEffect } from 'react';

export interface MockInsightsData {
  musicalAge: {
    age: number;
    description: string;
    averageYear: number;
  };
  moodRing: {
    emotions: {
      happy: number;
      energetic: number;
      chill: number;
      melancholy: number;
    };
    dominantMood: string;
  };
  genrePassport: {
    totalGenres: number;
    topGenres: string[];
    explorationScore: number;
  };
  nightOwlPattern: {
    hourlyData: number[];
    peakHour: number;
    isNightOwl: boolean;
    score: number;
  };
}

export function useMockInsights() {
  const [data, setData] = useState<MockInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setData({
        musicalAge: {
          age: 27,
          description: "Your music taste reflects the golden era of indie rock",
          averageYear: 2010
        },
        moodRing: {
          emotions: {
            happy: 34,
            energetic: 26,
            chill: 22,
            melancholy: 18
          },
          dominantMood: "Happy & Uplifting"
        },
        genrePassport: {
          totalGenres: 18,
          topGenres: [
            "Indie Rock",
            "Electronic Pop", 
            "Lo-fi Hip Hop",
            "Ambient",
            "Synthwave",
            "Dream Pop",
            "Chillwave",
            "Post-Rock"
          ],
          explorationScore: 85
        },
        nightOwlPattern: {
          hourlyData: [2, 1, 1, 0, 0, 0, 1, 3, 5, 4, 6, 8, 12, 15, 18, 22, 25, 28, 24, 18, 12, 8, 6, 4],
          peakHour: 17,
          isNightOwl: true,
          score: 72
        }
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
} 