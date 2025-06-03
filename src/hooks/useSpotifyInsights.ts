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
    console.log('🎂 calculateMusicalAge called with:', { tracksLength: tracks?.length, firstTrack: tracks?.[0] });
    
    if (!tracks || tracks.length === 0) {
      console.log('❌ calculateMusicalAge: No tracks provided');
      return DEFAULT_INSIGHTS.musicalAge;
    }

    console.log('🔍 calculateMusicalAge: Processing tracks for release years...');
    
    const releaseYears = tracks
      .map((track, index) => {
        const album = track.album || track.track?.album;
        console.log(`Track ${index + 1}:`, {
          trackName: track.name || track.track?.name,
          album: album,
          releaseDate: album?.release_date,
          trackStructure: Object.keys(track)
        });
        
        if (album?.release_date) {
          const year = parseInt(album.release_date.substring(0, 4));
          console.log(`  -> Year extracted: ${year}`);
          return year;
        }
        console.log(`  -> No valid release date found`);
        return null;
      })
      .filter((year): year is number => {
        const isValid = year !== null && year > 1900 && year <= new Date().getFullYear();
        if (!isValid && year !== null) {
          console.log(`  -> Filtered out invalid year: ${year}`);
        }
        return isValid;
      });

    console.log('📊 calculateMusicalAge: Release years extracted:', { 
      totalTracks: tracks.length,
      validYears: releaseYears.length,
      years: releaseYears.slice(0, 10),
      sample: releaseYears.length > 10 ? '...' : 'complete'
    });

    if (releaseYears.length === 0) {
      console.log('❌ calculateMusicalAge: No valid release years found');
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

    const result = {
      age,
      description,
      averageYear,
      oldest,
      newest,
      trackCount: tracks.length
    };

    console.log('✅ calculateMusicalAge: Success!', result);
    return result;
  }, []);

  // Calculate mood distribution from audio features
  const calculateMoodRing = useCallback(async (tracks: any[]) => {
    console.log('🎭 calculateMoodRing called with:', { 
      tracksLength: tracks?.length, 
      connected,
      firstTrack: tracks?.[0] ? {
        id: tracks[0].id,
        name: tracks[0].name,
        structure: Object.keys(tracks[0])
      } : null
    });
    
    if (!tracks || tracks.length === 0) {
      console.log('❌ calculateMoodRing: No tracks provided');
      return DEFAULT_INSIGHTS.moodRing;
    }

    try {
      // Check if we're connected before trying to fetch audio features
      if (!connected) {
        console.log('⚠️ calculateMoodRing: Not connected to Spotify, using fallback mood ring data');
        return DEFAULT_INSIGHTS.moodRing;
      }

      // Get track IDs for audio features
      const trackIds = tracks
        .map((track, index) => {
          const id = track.id || track.track?.id;
          console.log(`Track ${index + 1} ID extraction:`, {
            directId: track.id,
            nestedId: track.track?.id,
            finalId: id,
            trackName: track.name || track.track?.name
          });
          return id;
        })
        .filter(Boolean)
        .slice(0, 50); // Limit to 50 tracks for API efficiency

      console.log('🔍 calculateMoodRing: Track IDs processed:', { 
        totalTracks: tracks.length,
        validIds: trackIds.length,
        sampleIds: trackIds.slice(0, 5),
        allIds: trackIds
      });

      if (trackIds.length === 0) {
        console.log('⚠️ calculateMoodRing: No valid track IDs found for audio features');
        return DEFAULT_INSIGHTS.moodRing;
      }

      console.log('🎵 calculateMoodRing: Calling getAudioFeatures with', trackIds.length, 'track IDs...');

      const audioFeaturesResponse = await getAudioFeatures(trackIds);
      
      console.log('📡 calculateMoodRing: getAudioFeatures response:', {
        response: audioFeaturesResponse,
        responseType: typeof audioFeaturesResponse,
        hasAudioFeatures: !!audioFeaturesResponse?.audio_features,
        audioFeaturesType: Array.isArray(audioFeaturesResponse?.audio_features) ? 'array' : typeof audioFeaturesResponse?.audio_features,
        audioFeaturesLength: audioFeaturesResponse?.audio_features?.length
      });
      
      // Handle different response formats from the API
      let audioFeatures: any[] = [];
      if (audioFeaturesResponse && Array.isArray(audioFeaturesResponse)) {
        audioFeatures = audioFeaturesResponse;
        console.log('📊 calculateMoodRing: Using direct array response');
      } else if (audioFeaturesResponse && audioFeaturesResponse.audio_features) {
        audioFeatures = audioFeaturesResponse.audio_features;
        console.log('📊 calculateMoodRing: Using nested audio_features array');
      }
      
      console.log('🎼 calculateMoodRing: Final audio features:', {
        audioFeaturesLength: audioFeatures?.length,
        firstFeature: audioFeatures?.[0],
        sampleFeatures: audioFeatures?.slice(0, 3).map(f => ({
          id: f?.id,
          valence: f?.valence,
          energy: f?.energy,
          danceability: f?.danceability
        }))
      });
      
      if (!audioFeatures || audioFeatures.length === 0) {
        console.log('⚠️ calculateMoodRing: No audio features returned from API');
        return DEFAULT_INSIGHTS.moodRing;
      }

      // Calculate mood distribution based on audio features
      let totalValence = 0, totalEnergy = 0, totalDanceability = 0;
      let validFeatures = 0;

      audioFeatures.forEach((features: any, index: number) => {
        console.log(`Feature ${index + 1}:`, {
          hasFeatures: !!features,
          valence: features?.valence,
          energy: features?.energy,
          danceability: features?.danceability,
          isValidValence: typeof features?.valence === 'number'
        });
        
        if (features && typeof features.valence === 'number') {
          totalValence += features.valence;
          totalEnergy += features.energy || 0;
          totalDanceability += features.danceability || 0;
          validFeatures++;
        }
      });

      console.log('📊 calculateMoodRing: Aggregated values:', {
        validFeatures,
        totalValence,
        totalEnergy,
        totalDanceability
      });

      if (validFeatures === 0) {
        console.log('⚠️ calculateMoodRing: No valid audio features found');
        return DEFAULT_INSIGHTS.moodRing;
      }

      const avgValence = totalValence / validFeatures;
      const avgEnergy = totalEnergy / validFeatures;
      const avgDance = totalDanceability / validFeatures;

      console.log('📊 calculateMoodRing: Average values calculated:', { avgValence, avgEnergy, avgDance, validFeatures });

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

      console.log('✅ calculateMoodRing: Success!', result);

      return result;
    } catch (error) {
      console.error('❌ calculateMoodRing: Error occurred:', error);
      console.error('🔍 calculateMoodRing: Error details:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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
      console.log('🚫 Rate limited: Too soon since last load, skipping...');
      return;
    }
    
    console.log('🔄 loadInsights called, connected:', connected);
    
    if (!connected) {
      console.log('❌ Not connected to Spotify, setting default insights');
      setInsights(DEFAULT_INSIGHTS);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastLoadTime(now);

    try {
      console.log('🔄 Loading comprehensive Spotify insights...');
      
      // Fetch data in parallel
      const [recentTracks, topTracks] = await Promise.all([
        getRecentTracks().catch(error => {
          console.error('Failed to fetch recent tracks:', error);
          return [];
        }),
        getTopTracks('medium_term').catch(error => {
          console.error('Failed to fetch top tracks:', error);
          return [];
        })
      ]);

      console.log('📊 Data fetched successfully:', { 
        recentTracksCount: recentTracks?.length, 
        topTracksCount: topTracks?.length,
        recentTracksSample: recentTracks?.slice(0, 2).map(t => ({
          id: t?.id,
          name: t?.name,
          hasAlbum: !!t?.album,
          albumType: typeof t?.album,
          structure: Object.keys(t || {})
        })),
        topTracksSample: topTracks?.slice(0, 2).map(t => ({
          id: t?.id,
          name: t?.name,
          hasAlbum: !!t?.album,
          albumType: typeof t?.album,
          structure: Object.keys(t || {})
        }))
      });

      // Use top tracks for more comprehensive analysis, fallback to recent tracks
      const tracksToAnalyze = topTracks && topTracks.length > 0 ? topTracks : recentTracks;
      
      console.log('🎯 Tracks selected for analysis:', {
        source: topTracks && topTracks.length > 0 ? 'top tracks' : 'recent tracks',
        count: tracksToAnalyze?.length,
        firstTrack: tracksToAnalyze?.[0] ? {
          id: tracksToAnalyze[0].id,
          name: tracksToAnalyze[0].name,
          hasAlbum: !!tracksToAnalyze[0].album,
          albumType: typeof tracksToAnalyze[0].album,
          structure: Object.keys(tracksToAnalyze[0])
        } : null
      });
      
      if (!tracksToAnalyze || tracksToAnalyze.length === 0) {
        console.log('⚠️ No tracks found, using fallback data');
        setInsights({ ...DEFAULT_INSIGHTS, isDefault: true });
        setIsLoading(false);
        return;
      }

      console.log('🧮 Starting calculations with', tracksToAnalyze.length, 'tracks...');

      // Calculate Musical Age first (no API calls)
      console.log('🎂 Starting Musical Age calculation...');
      const musicalAge = calculateMusicalAge(tracksToAnalyze);
      console.log('🎂 Musical Age result:', musicalAge);

      // Calculate all insights in parallel where possible
      const [moodRing, genrePassport] = await Promise.all([
        (async () => {
          console.log('🎭 Starting Mood Ring calculation...');
          try {
            const result = await calculateMoodRing(tracksToAnalyze);
            console.log('🎭 Mood Ring result:', result);
            return result;
          } catch (error) {
            console.error('🎭 Mood ring calculation failed, using defaults:', error);
            return DEFAULT_INSIGHTS.moodRing;
          }
        })(),
        (async () => {
          console.log('🎤 Starting Genre Passport calculation...');
          try {
            const result = await calculateGenrePassport();
            console.log('🎤 Genre Passport result:', result);
            return result;
          } catch (error) {
            console.error('🎤 Genre passport calculation failed, using defaults:', error);
            return DEFAULT_INSIGHTS.genrePassport;
          }
        })()
      ]);

      // Night owl pattern needs recent tracks with timestamps
      console.log('🦉 Starting Night Owl Pattern calculation...');
      const nightOwlPattern = calculateNightOwlPattern(recentTracks || []);
      console.log('🦉 Night Owl Pattern result:', nightOwlPattern);

      const comprehensiveInsights: SpotifyInsightsData = {
        musicalAge,
        moodRing,
        genrePassport,
        nightOwlPattern,
        isDefault: false
      };

      console.log('✅ All calculations completed successfully:', {
        musicalAge: musicalAge.age,
        moodRingValid: moodRing.dominantMood !== 'Unknown',
        genrePassportValid: genrePassport.totalGenres > 0,
        nightOwlValid: nightOwlPattern.score > 0
      });
      
      setInsights(comprehensiveInsights);

    } catch (error) {
      console.error('💥 Failed to load comprehensive insights:', error);
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