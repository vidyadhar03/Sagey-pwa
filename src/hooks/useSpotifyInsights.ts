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
  const { connected, getRecentTracks, getTopTracks, getTopArtists, getAudioFeatures } = useSpotify();
  const [insights, setInsights] = useState<SpotifyInsightsData>(DEFAULT_INSIGHTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  // Circuit breaker: prevent API spam by enforcing minimum time between calls
  const MIN_LOAD_INTERVAL = 2000; // 2 seconds minimum between loads

  // Calculate musical age from track data
  const calculateMusicalAge = useCallback((tracks: any[]) => {
    console.error('🎂 SAGEY DEBUG: calculateMusicalAge - processing', tracks?.length, 'tracks');
    
    if (!tracks || tracks.length === 0) {
      console.error('❌ SAGEY DEBUG: calculateMusicalAge - No tracks provided');
      return DEFAULT_INSIGHTS.musicalAge;
    }

    console.error('🔍 SAGEY DEBUG: Extracting release years from track data...');
    
    const releaseYears: number[] = [];
    
    tracks.forEach((track, index) => {
      try {
        // Handle different track structures
        const actualTrack = track.track || track;
        const album = actualTrack.album;
        
        if (index < 3) { // Log first 3 tracks for debugging
          console.error(`SAGEY DEBUG Track ${index + 1}:`, {
            name: actualTrack?.name,
            hasAlbum: !!album,
            albumType: typeof album,
            releaseDate: album?.release_date,
            fullAlbum: album
          });
        }
        
        // Extract release date from album
        if (album && album.release_date && typeof album.release_date === 'string' && album.release_date.length >= 4) {
          const year = parseInt(album.release_date.substring(0, 4));
          if (year > 1900 && year <= new Date().getFullYear()) {
            releaseYears.push(year);
            if (index < 3) {
              console.error(`SAGEY DEBUG: ✅ Valid year ${year} extracted from track:`, actualTrack?.name);
            }
          } else if (index < 3) {
            console.error(`SAGEY DEBUG: ❌ Invalid year ${year} for track:`, actualTrack?.name);
          }
        } else if (index < 3) {
          console.error(`SAGEY DEBUG: ❌ No valid release date for track:`, actualTrack?.name, 'Found:', album?.release_date);
        }
      } catch (error) {
        if (index < 3) {
          console.error(`SAGEY DEBUG: ❌ Error processing track ${index + 1}:`, error);
        }
      }
    });

    console.error('📊 SAGEY DEBUG: Release years extracted:', {
      totalTracks: tracks.length,
      validYears: releaseYears.length,
      yearRange: releaseYears.length > 0 ? 
        `${Math.min(...releaseYears)}-${Math.max(...releaseYears)}` : 'none',
      firstFewYears: releaseYears.slice(0, 10)
    });

    if (releaseYears.length === 0) {
      console.error('❌ SAGEY DEBUG: No valid release years found - using current year as fallback');
      const currentYear = new Date().getFullYear();
      return {
        age: 0,
        description: "Connect Spotify to discover your musical age",
        averageYear: currentYear,
        oldest: currentYear,
        newest: currentYear,
        trackCount: tracks.length
      };
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

    const result = {
      age,
      description,
      averageYear,
      oldest,
      newest,
      trackCount: tracks.length
    };

    console.error('✅ SAGEY DEBUG: Musical Age calculated successfully!', {
      age: result.age,
      averageYear: result.averageYear,
      trackCount: result.trackCount,
      validYearsCount: releaseYears.length
    });
    
    return result;
  }, []);

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
      // Get track IDs for audio features
      const trackIds = tracks
        .map((track) => {
          const id = track.id || track.track?.id;
          return id;
        })
        .filter(Boolean)
        .slice(0, 20); // Reduce to 20 tracks to avoid API limits

      console.warn('🔍 SAGEY: calculateMoodRing - Got', trackIds.length, 'track IDs');

      if (trackIds.length < 5) {
        console.warn('⚠️ SAGEY: calculateMoodRing - Not enough valid track IDs, using defaults');
        return DEFAULT_INSIGHTS.moodRing;
      }

      console.warn('🎵 SAGEY: Calling getAudioFeatures API...');
      const audioFeaturesResponse = await getAudioFeatures(trackIds);
      
      console.warn('📡 SAGEY: Audio features response received:', {
        hasResponse: !!audioFeaturesResponse,
        responseType: typeof audioFeaturesResponse
      });
      
      // Handle different response formats from the API
      let audioFeatures: any[] = [];
      if (audioFeaturesResponse && Array.isArray(audioFeaturesResponse)) {
        audioFeatures = audioFeaturesResponse;
      } else if (audioFeaturesResponse && audioFeaturesResponse.audio_features) {
        audioFeatures = audioFeaturesResponse.audio_features;
      }
      
      console.warn('🎼 SAGEY: Processed audio features:', {
        count: audioFeatures?.length,
        firstFeatureValid: !!audioFeatures?.[0]?.valence
      });
      
      if (!audioFeatures || audioFeatures.length === 0) {
        console.warn('⚠️ SAGEY: No audio features returned, using defaults');
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

      console.warn('📊 SAGEY: Audio feature stats:', {
        validFeatures,
        avgValence: validFeatures > 0 ? (totalValence / validFeatures).toFixed(2) : 0
      });

      if (validFeatures === 0) {
        console.warn('⚠️ SAGEY: No valid audio features found, using defaults');
        return DEFAULT_INSIGHTS.moodRing;
      }

      const avgValence = totalValence / validFeatures;
      const avgEnergy = totalEnergy / validFeatures;

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

      const result = {
        emotions,
        dominantMood: dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1),
        distribution
      };

      console.warn('✅ SAGEY: Mood Ring calculated successfully!', {
        dominantMood: result.dominantMood,
        validFeatures
      });

      return result;
    } catch (error) {
      console.error('❌ SAGEY: calculateMoodRing error:', error);
      return DEFAULT_INSIGHTS.moodRing;
    }
  }, [connected, getAudioFeatures]);

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
        const album = firstTrack?.album;
        console.error('🔍 SAGEY DEBUG: First track structure:', {
          track: firstTrack,
          hasAlbum: !!album,
          albumReleaseDate: album && typeof album === 'object' && 'release_date' in album ? (album as any).release_date : 'N/A',
          trackName: firstTrack?.name
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
      const musicalAge = calculateMusicalAge(tracksToAnalyze);
      
      console.error('🎂 SAGEY DEBUG: Musical Age result:', {
        age: musicalAge.age,
        description: musicalAge.description,
        trackCount: musicalAge.trackCount,
        averageYear: musicalAge.averageYear
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
  }, [connected, getRecentTracks, getTopTracks, calculateMusicalAge, calculateMoodRing, calculateGenrePassport, calculateNightOwlPattern, lastLoadTime]);

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