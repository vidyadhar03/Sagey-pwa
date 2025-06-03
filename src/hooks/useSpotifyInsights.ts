"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from './useSpotify';

// Match the interface from useMockInsights.ts for compatibility
export interface SpotifyInsightsData {
  musicalAge: {
    age: number;
    description: string;
    averageYear: number;
    oldest: number;
    newest: number;
    trackCount: number;
  };
  moodRing: {
    emotions: {
      happy: number;
      energetic: number;
      chill: number;
      melancholy: number;
    };
    dominantMood: string;
    distribution: Array<{ label: string; pct: number; color: string }>;
  };
  genrePassport: {
    totalGenres: number;
    topGenres: string[];
    explorationScore: number;
    distinctCount: number;
    newDiscoveries: number;
  };
  nightOwlPattern: {
    hourlyData: number[];
    peakHour: number;
    isNightOwl: boolean;
    score: number;
    histogram: number[];
  };
  isDefault: boolean; // Flag to indicate if using fallback data
}

// Default fallback data when no Spotify connection
const DEFAULT_INSIGHTS: SpotifyInsightsData = {
  musicalAge: {
    age: 0,
    description: "Connect Spotify to discover your musical age",
    averageYear: new Date().getFullYear(),
    oldest: new Date().getFullYear(),
    newest: new Date().getFullYear(),
    trackCount: 0
  },
  moodRing: {
    emotions: { happy: 0, energetic: 0, chill: 0, melancholy: 0 },
    dominantMood: "Unknown",
    distribution: []
  },
  genrePassport: {
    totalGenres: 0,
    topGenres: [],
    explorationScore: 0,
    distinctCount: 0,
    newDiscoveries: 0
  },
  nightOwlPattern: {
    hourlyData: new Array(24).fill(0),
    peakHour: 12,
    isNightOwl: false,
    score: 0,
    histogram: new Array(24).fill(0)
  },
  isDefault: true
};

interface GenreCount {
  [key: string]: number;
}

export function useSpotifyInsights() {
  const { connected, getRecentTracks, getTopArtists, getTopTracks, getAudioFeatures } = useSpotify();
  const [insights, setInsights] = useState<SpotifyInsightsData>(DEFAULT_INSIGHTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate musical age from track data
  const calculateMusicalAge = useCallback((tracks: any[]) => {
    if (!tracks || tracks.length === 0) {
      return DEFAULT_INSIGHTS.musicalAge;
    }

    const releaseYears = tracks
      .map(track => {
        const album = track.album || track.track?.album;
        if (album?.release_date) {
          return parseInt(album.release_date.substring(0, 4));
        }
        return null;
      })
      .filter((year): year is number => year !== null && year > 1900 && year <= new Date().getFullYear());

    if (releaseYears.length === 0) {
      return DEFAULT_INSIGHTS.musicalAge;
    }

    const averageYear = Math.round(releaseYears.reduce((sum, year) => sum + year, 0) / releaseYears.length);
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - averageYear);
    const oldest = Math.min(...releaseYears);
    const newest = Math.max(...releaseYears);

    let description = "Your music taste spans multiple eras";
    if (age < 5) description = "Your taste is cutting-edge and contemporary";
    else if (age < 15) description = "You have a modern musical palette";
    else if (age < 25) description = "Your taste reflects the golden era of digital music";
    else description = "You appreciate the classics and timeless hits";

    return {
      age,
      description,
      averageYear,
      oldest,
      newest,
      trackCount: tracks.length
    };
  }, []);

  // Calculate mood distribution from audio features
  const calculateMoodRing = useCallback(async (tracks: any[]) => {
    if (!tracks || tracks.length === 0) {
      return DEFAULT_INSIGHTS.moodRing;
    }

    try {
      // Get track IDs for audio features
      const trackIds = tracks
        .map(track => track.id || track.track?.id)
        .filter(Boolean)
        .slice(0, 50); // Limit to 50 tracks for API efficiency

      if (trackIds.length === 0) {
        return DEFAULT_INSIGHTS.moodRing;
      }

      const audioFeaturesResponse = await getAudioFeatures(trackIds);
      
      // Handle different response formats from the API
      let audioFeatures: any[] = [];
      if (audioFeaturesResponse && Array.isArray(audioFeaturesResponse)) {
        audioFeatures = audioFeaturesResponse;
      } else if (audioFeaturesResponse && audioFeaturesResponse.audio_features) {
        audioFeatures = audioFeaturesResponse.audio_features;
      }
      
      if (!audioFeatures || audioFeatures.length === 0) {
        return DEFAULT_INSIGHTS.moodRing;
      }

      // Calculate mood distribution based on audio features
      let totalValence = 0, totalEnergy = 0, totalDanceability = 0;
      let validFeatures = 0;

      audioFeatures.forEach((features: any) => {
        if (features && typeof features.valence === 'number') {
          totalValence += features.valence;
          totalEnergy += features.energy || 0;
          totalDanceability += features.danceability || 0;
          validFeatures++;
        }
      });

      if (validFeatures === 0) {
        return DEFAULT_INSIGHTS.moodRing;
      }

      const avgValence = totalValence / validFeatures;
      const avgEnergy = totalEnergy / validFeatures;
      const avgDance = totalDanceability / validFeatures;

      // Map audio features to emotions (simplified mapping)
      const happy = Math.round(avgValence * 100);
      const energetic = Math.round(avgEnergy * 100);
      const chill = Math.round((1 - avgEnergy) * 100);
      const melancholy = Math.round((1 - avgValence) * 100);

      // Normalize to 100%
      const total = happy + energetic + chill + melancholy;
      const emotions = {
        happy: Math.round((happy / total) * 100),
        energetic: Math.round((energetic / total) * 100),
        chill: Math.round((chill / total) * 100),
        melancholy: Math.round((melancholy / total) * 100)
      };

      // Find dominant mood
      const moodEntries = Object.entries(emotions);
      const dominantMood = moodEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];

      const distribution = [
        { label: 'Happy', pct: emotions.happy, color: '#FFD700' },
        { label: 'Energetic', pct: emotions.energetic, color: '#FF6B6B' },
        { label: 'Chill', pct: emotions.chill, color: '#4ECDC4' },
        { label: 'Melancholy', pct: emotions.melancholy, color: '#9B59B6' }
      ];

      return {
        emotions,
        dominantMood: dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1),
        distribution
      };
    } catch (error) {
      console.error('Error calculating mood ring:', error);
      return DEFAULT_INSIGHTS.moodRing;
    }
  }, [getAudioFeatures]);

  // Calculate genre passport from artists
  const calculateGenrePassport = useCallback(async () => {
    try {
      const topArtists = await getTopArtists('medium_term');
      
      if (!topArtists || topArtists.length === 0) {
        return DEFAULT_INSIGHTS.genrePassport;
      }

      const genreSet = new Set<string>();
      const genreCounts: GenreCount = {};

      topArtists.forEach(artist => {
        if (artist.genres && artist.genres.length > 0) {
          artist.genres.forEach(genre => {
            genreSet.add(genre);
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });

      const totalGenres = genreSet.size;
      const topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([genre]) => genre.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '));

      // Calculate exploration score based on genre diversity
      const explorationScore = Math.min(100, Math.round((totalGenres / 20) * 100));
      
      return {
        totalGenres,
        topGenres,
        explorationScore,
        distinctCount: totalGenres,
        newDiscoveries: Math.floor(totalGenres * 0.2) // Estimate
      };
    } catch (error) {
      console.error('Error calculating genre passport:', error);
      return DEFAULT_INSIGHTS.genrePassport;
    }
  }, [getTopArtists]);

  // Calculate night owl pattern from recent tracks
  const calculateNightOwlPattern = useCallback((tracks: any[]) => {
    if (!tracks || tracks.length === 0) {
      return DEFAULT_INSIGHTS.nightOwlPattern;
    }

    const hourlyData = new Array(24).fill(0);
    
    tracks.forEach(trackItem => {
      const playedAt = trackItem.played_at;
      if (playedAt) {
        try {
          const date = new Date(playedAt);
          const hour = date.getHours();
          hourlyData[hour]++;
        } catch (error) {
          console.error('Error parsing played_at date:', playedAt);
        }
      }
    });

    // Find peak hour
    const peakHour = hourlyData.indexOf(Math.max(...hourlyData));
    
    // Determine if user is a night owl (peak activity after 6 PM or before 6 AM)
    const isNightOwl = peakHour >= 18 || peakHour <= 6;
    
    // Calculate night owl score based on late-night listening
    const nightHours = hourlyData.slice(22).concat(hourlyData.slice(0, 6));
    const totalNightListening = nightHours.reduce((sum, count) => sum + count, 0);
    const totalListening = hourlyData.reduce((sum, count) => sum + count, 0);
    const score = totalListening > 0 ? Math.round((totalNightListening / totalListening) * 100) : 0;

    return {
      hourlyData,
      peakHour,
      isNightOwl,
      score,
      histogram: hourlyData // Alias for compatibility
    };
  }, []);

  const loadInsights = useCallback(async () => {
    if (!connected) {
      setInsights(DEFAULT_INSIGHTS);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading comprehensive Spotify insights...');
      
      // Fetch data in parallel
      const [recentTracks, topTracks] = await Promise.all([
        getRecentTracks(),
        getTopTracks('medium_term')
      ]);

      console.log('📊 Data fetched:', { recentTracks: recentTracks?.length, topTracks: topTracks?.length });

      // Use top tracks for more comprehensive analysis, fallback to recent tracks
      const tracksToAnalyze = topTracks && topTracks.length > 0 ? topTracks : recentTracks;
      
      if (!tracksToAnalyze || tracksToAnalyze.length === 0) {
        console.log('⚠️ No tracks found, using fallback data');
        setInsights({ ...DEFAULT_INSIGHTS, isDefault: true });
        setIsLoading(false);
        return;
      }

      // Calculate all insights in parallel where possible
      const [musicalAge, moodRing, genrePassport] = await Promise.all([
        Promise.resolve(calculateMusicalAge(tracksToAnalyze)),
        calculateMoodRing(tracksToAnalyze),
        calculateGenrePassport()
      ]);

      // Night owl pattern needs recent tracks with timestamps
      const nightOwlPattern = calculateNightOwlPattern(recentTracks || []);

      const comprehensiveInsights: SpotifyInsightsData = {
        musicalAge,
        moodRing,
        genrePassport,
        nightOwlPattern,
        isDefault: false
      };

      console.log('✅ Comprehensive insights calculated:', comprehensiveInsights);
      setInsights(comprehensiveInsights);

    } catch (error) {
      console.error('💥 Failed to load comprehensive insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load insights');
      setInsights({ ...DEFAULT_INSIGHTS, isDefault: true });
    } finally {
      setIsLoading(false);
    }
  }, [connected, getRecentTracks, getTopTracks, calculateMusicalAge, calculateMoodRing, calculateGenrePassport, calculateNightOwlPattern]);

  useEffect(() => {
    loadInsights();
  }, [connected, loadInsights]);

  return {
    insights,
    isLoading,
    error,
    refresh: loadInsights
  };
} 