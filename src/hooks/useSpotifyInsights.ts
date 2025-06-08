"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from './useSpotify';
import { getMusicalAgePayload, getMoodRingPayload, getGenrePassportPayload, getNightOwlPayload, type MusicalAgePayload } from '../utils/insightSelectors';

// Match the interface from useMockInsights.ts for compatibility
export interface SpotifyInsightsData {
  musicalAge: MusicalAgePayload;
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
    era: 'Streaming',
    trackCount: 0,
    averageYear: new Date().getFullYear(),
    stdDev: 0,
    oldest: { title: 'Connect Spotify', artist: 'to unlock insights', year: new Date().getFullYear() },
    newest: { title: 'Connect Spotify', artist: 'to unlock insights', year: new Date().getFullYear() },
    decadeBuckets: [],
    description: 'Connect Spotify to discover your musical age'
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
  const { connected, getRecentTracks, getTopTracks, getTopArtists, getAudioFeatures } = useSpotify();
  const [insights, setInsights] = useState<SpotifyInsightsData>(DEFAULT_INSIGHTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  // Circuit breaker: prevent API spam by enforcing minimum time between calls
  const MIN_LOAD_INTERVAL = 2000; // 2 seconds minimum between loads

  // Calculate mood distribution from audio features
  const calculateMoodRing = useCallback(async (tracks: any[]) => {
    console.warn('🎭 SAGEY: calculateMoodRing starting with', tracks?.length, 'tracks');
    
    if (!tracks || tracks.length === 0) {
      console.warn('❌ SAGEY: calculateMoodRing - No tracks provided');
      return DEFAULT_INSIGHTS.moodRing;
    }

    // Check connection first - if not connected, return defaults immediately
    if (!connected) {
      console.warn('⚠️ SAGEY: calculateMoodRing - Not connected, using defaults');
      return DEFAULT_INSIGHTS.moodRing;
    }

    try {
      console.warn('🎭 SAGEY: Audio Features API deprecated for new apps - using genre-based mood estimation');
      
      // Get artist data to analyze genres for mood estimation
      const topArtists = await getTopArtists('medium_term').catch(() => []);
      
      if (!topArtists || topArtists.length === 0) {
        console.warn('⚠️ SAGEY: No artists available for genre-based mood calculation');
        return DEFAULT_INSIGHTS.moodRing;
      }

      // Extract all genres from artists
      const allGenres: string[] = [];
      topArtists.forEach(artist => {
        if (artist.genres && Array.isArray(artist.genres)) {
          allGenres.push(...artist.genres);
        }
      });

      if (allGenres.length === 0) {
        console.warn('⚠️ SAGEY: No genres found for mood calculation');
        return DEFAULT_INSIGHTS.moodRing;
      }

      // Genre-to-mood mapping based on music characteristics
      const genreMoodMap = {
        // Happy/Upbeat genres
        happy: ['pop', 'dance', 'disco', 'funk', 'reggae', 'ska', 'latin', 'salsa', 'bossa nova', 'happy hardcore', 'eurobeat', 'bubblegum pop'],
        
        // Energetic/High-energy genres  
        energetic: ['rock', 'metal', 'punk', 'hardcore', 'electronic', 'edm', 'drum and bass', 'dubstep', 'techno', 'trance', 'house', 'hip hop', 'rap', 'trap'],
        
        // Chill/Relaxed genres
        chill: ['ambient', 'chillout', 'lo-fi', 'downtempo', 'jazz', 'blues', 'acoustic', 'folk', 'indie folk', 'new age', 'classical', 'instrumental', 'lounge'],
        
        // Melancholy/Emotional genres
        melancholy: ['emo', 'post-rock', 'shoegaze', 'alternative', 'indie rock', 'slowcore', 'sadcore', 'dark ambient', 'gothic', 'post-punk', 'grunge']
      };

      // Calculate mood scores based on genre matches
      const moodScores = { happy: 0, energetic: 0, chill: 0, melancholy: 0 };
      
      allGenres.forEach(genre => {
        const lowerGenre = genre.toLowerCase();
        
        // Check each mood category for genre matches
        Object.entries(genreMoodMap).forEach(([mood, moodGenres]) => {
          const matches = moodGenres.some(moodGenre => 
            lowerGenre.includes(moodGenre) || moodGenre.includes(lowerGenre)
          );
          if (matches) {
            moodScores[mood as keyof typeof moodScores]++;
          }
        });
      });

      // If no direct matches, use heuristics based on common genre characteristics
      if (Object.values(moodScores).every(score => score === 0)) {
        allGenres.forEach(genre => {
          const lowerGenre = genre.toLowerCase();
          
          // Heuristic matching for broader categorization
          if (lowerGenre.includes('rock') || lowerGenre.includes('metal') || lowerGenre.includes('punk')) {
            moodScores.energetic++;
          } else if (lowerGenre.includes('pop') || lowerGenre.includes('dance')) {
            moodScores.happy++;
          } else if (lowerGenre.includes('jazz') || lowerGenre.includes('classical') || lowerGenre.includes('ambient')) {
            moodScores.chill++;
          } else if (lowerGenre.includes('alternative') || lowerGenre.includes('indie')) {
            moodScores.melancholy++;
          } else {
            // Default distribution for unknown genres
            moodScores.happy += 0.25;
            moodScores.energetic += 0.25;
            moodScores.chill += 0.25;
            moodScores.melancholy += 0.25;
          }
        });
      }

      // Normalize scores to percentages
      const totalScore = Object.values(moodScores).reduce((sum, score) => sum + score, 0);
      
      if (totalScore === 0) {
        // Fallback: balanced distribution
        const emotions = { happy: 25, energetic: 25, chill: 25, melancholy: 25 };
        const dominantMood = 'Balanced';
        
        const distribution = [
          { label: 'Happy', pct: 25, color: '#FFD700' },
          { label: 'Energetic', pct: 25, color: '#FF6B6B' },
          { label: 'Chill', pct: 25, color: '#4ECDC4' },
          { label: 'Melancholy', pct: 25, color: '#9B59B6' }
        ];

        console.warn('✅ SAGEY: Mood Ring calculated (balanced fallback)');
        return { emotions, dominantMood, distribution };
      }

      // Convert to percentages
      const emotions = {
        happy: Math.round((moodScores.happy / totalScore) * 100),
        energetic: Math.round((moodScores.energetic / totalScore) * 100),
        chill: Math.round((moodScores.chill / totalScore) * 100),
        melancholy: Math.round((moodScores.melancholy / totalScore) * 100)
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

      const result = {
        emotions,
        dominantMood: dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1),
        distribution
      };

      console.warn('✅ SAGEY: Mood Ring calculated via genre analysis!', {
        dominantMood: result.dominantMood,
        genreCount: allGenres.length,
        artistCount: topArtists.length
      });

      return result;
    } catch (error) {
      console.error('❌ SAGEY: calculateMoodRing error:', error);
      return DEFAULT_INSIGHTS.moodRing;
    }
  }, [connected, getTopArtists]);

  // Calculate genre passport from artists
  const calculateGenrePassport = useCallback(async () => {
    try {
      // Check if we're connected before trying to fetch artists
      if (!connected) {
        console.log('⚠️ Not connected to Spotify, using fallback genre passport data');
        return DEFAULT_INSIGHTS.genrePassport;
      }

      console.log('🎤 Fetching top artists for genre calculation...');
      const topArtists = await getTopArtists('medium_term');
      
      if (!topArtists || topArtists.length === 0) {
        console.log('⚠️ No top artists found');
        return DEFAULT_INSIGHTS.genrePassport;
      }

      console.log('📊 Processing genres from artists...', { artistCount: topArtists.length });

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
      
      console.log('✅ Genre passport calculated successfully:', { totalGenres, topGenres: topGenres.slice(0, 3), explorationScore });

      return { 
        totalGenres,
        topGenres,
        explorationScore,
        distinctCount: totalGenres,
        newDiscoveries: Math.floor(totalGenres * 0.2) // Estimate
      };
    } catch (error) {
      console.error('❌ Error calculating genre passport (falling back to defaults):', error);
      return DEFAULT_INSIGHTS.genrePassport;
    }
  }, [connected, getTopArtists]);

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
    const now = Date.now();
    
    // Circuit breaker: prevent API spam
    if (now - lastLoadTime < MIN_LOAD_INTERVAL) {
      console.error('🚫 SAGEY DEBUG: Rate limited - too soon since last load');
      return;
    }
    
    console.error('🔄 SAGEY DEBUG: loadInsights started, connected:', connected);
    
    if (!connected) {
      console.error('❌ SAGEY DEBUG: Not connected to Spotify, using defaults');
      setInsights(DEFAULT_INSIGHTS);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastLoadTime(now);

    try {
      console.error('🔄 SAGEY DEBUG: Fetching Spotify data...');
      
      // Fetch data in parallel
      const [recentTracks, topTracks] = await Promise.all([
        getRecentTracks().catch(error => {
          console.error('SAGEY DEBUG: Failed to fetch recent tracks:', error);
          return [];
        }),
        getTopTracks('medium_term').catch(error => {
          console.error('SAGEY DEBUG: Failed to fetch top tracks:', error);
          return [];
        })
      ]);

      console.error('📊 SAGEY DEBUG: Data fetched - recent:', recentTracks?.length, 'top:', topTracks?.length);

      // Use top tracks for more comprehensive analysis, fallback to recent tracks
      const tracksToAnalyze = topTracks && topTracks.length > 0 ? topTracks : recentTracks;
      
      console.error('🎯 SAGEY DEBUG: Analyzing', tracksToAnalyze?.length, 'tracks from', 
        topTracks && topTracks.length > 0 ? 'top tracks' : 'recent tracks');
      
      // Debug: Log first track structure
      if (tracksToAnalyze && tracksToAnalyze.length > 0) {
        const firstTrack = tracksToAnalyze[0];
        // Cast to any to handle different track structures from Spotify API
        const actualTrack = (firstTrack as any)?.track || firstTrack;
        const album = actualTrack?.album;
        
        console.error('🔍 SAGEY DEBUG: First track structure:', {
          track: firstTrack,
          actualTrack: actualTrack,
          hasAlbum: !!album,
          albumType: typeof album,
          albumReleaseDate: album && typeof album === 'object' && 'release_date' in album ? (album as any).release_date : 'N/A',
          trackName: actualTrack?.name
        });
      }
      
      if (!tracksToAnalyze || tracksToAnalyze.length === 0) {
        console.error('⚠️ SAGEY DEBUG: No tracks found, using fallback data');
        setInsights({ ...DEFAULT_INSIGHTS, isDefault: true });
        setIsLoading(false);
        return;
      }

      // Calculate Musical Age first (no API calls needed) - ADD DEBUGGING INFO TO DESCRIPTION
      console.error('🎂 SAGEY DEBUG: Starting Musical Age calculation with', tracksToAnalyze.length, 'tracks...');
      const musicalAge = getMusicalAgePayload({ tracks: tracksToAnalyze });
      
      console.error('🎂 SAGEY DEBUG: Musical Age result:', {
        age: musicalAge.age,
        era: musicalAge.era,
        description: musicalAge.description,
        trackCount: musicalAge.trackCount,
        averageYear: musicalAge.averageYear,
        stdDev: musicalAge.stdDev
      });

      // Calculate Genre Passport (uses artist data, should work)
      console.error('🎤 SAGEY DEBUG: Calculating Genre Passport...');
      let genrePassport;
      try {
        genrePassport = await calculateGenrePassport();
        console.error('🎤 SAGEY DEBUG: Genre Passport calculated:', genrePassport.totalGenres, 'genres');
      } catch (error) {
        console.error('🎤 SAGEY DEBUG: Genre passport failed:', error);
        genrePassport = DEFAULT_INSIGHTS.genrePassport;
      }

      // Calculate Night Owl Pattern (uses recent tracks, no API calls)
      console.error('🦉 SAGEY DEBUG: Calculating Night Owl Pattern...');
      const nightOwlPattern = calculateNightOwlPattern(recentTracks || []);
      console.error('🦉 SAGEY DEBUG: Night Owl Pattern calculated, score:', nightOwlPattern.score);

      // Calculate Mood Ring (try to get audio features)
      console.error('🎭 SAGEY DEBUG: Calculating Mood Ring...');
      let moodRing;
      try {
        moodRing = await calculateMoodRing(tracksToAnalyze || []);
        console.error('🎭 SAGEY DEBUG: Mood Ring calculated successfully');
      } catch (error) {
        console.error('🎭 SAGEY DEBUG: Mood Ring failed, using defaults:', error);
        moodRing = DEFAULT_INSIGHTS.moodRing;
      }

      const comprehensiveInsights: SpotifyInsightsData = {
        musicalAge,
        moodRing,
        genrePassport,
        nightOwlPattern,
        isDefault: false
      };

      console.error('✅ SAGEY DEBUG: All calculations completed!', {
        musicalAge: musicalAge.age,
        genreCount: genrePassport.totalGenres,
        nightOwlScore: nightOwlPattern.score,
        usingDefaults: false
      });
      
      setInsights(comprehensiveInsights);

    } catch (error) {
      console.error('💥 SAGEY DEBUG: Failed to load insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load insights');
      setInsights({ ...DEFAULT_INSIGHTS, isDefault: true });
    } finally {
      setIsLoading(false);
    }
  }, [connected, getRecentTracks, getTopTracks, calculateMoodRing, calculateGenrePassport, calculateNightOwlPattern, lastLoadTime]);

  // Fixed useEffect - only depend on connected, not loadInsights to prevent infinite loop
  useEffect(() => {
      loadInsights();
  }, [connected]); // Removed loadInsights dependency to fix infinite loop

  return {
    insights,
    isLoading,
    error,
    refresh: loadInsights
  };
} 