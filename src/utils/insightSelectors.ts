// Insight selectors for calculating musical insights from Spotify data

import { weightedMedianReleaseYear, weightedStandardDeviation, WeightedData } from './stats';

export interface TrackBrief {
  title: string;
  artist: string;
  year: number;
}

export interface MusicalAgePayload {
  age: number;
  era: "Vinyl" | "Analog" | "Digital" | "Streaming";
  trackCount: number;
  averageYear: number;
  stdDev: number;
  oldest: TrackBrief;
  newest: TrackBrief;
  decadeBuckets: { decade: number; weight: number }[];
  description: string;
}

export interface MoodRingPayload {
  emotions: {
    happy: number;
    energetic: number;
    chill: number;
    melancholy: number;
  };
  dominantMood: string;
  distribution: Array<{ label: string; pct: number; color: string }>;
}

export interface GenrePassportPayload {
  totalGenres: number;
  topGenres: string[];
  explorationScore: number;
  distinctCount: number;
  newDiscoveries: number;
}

export interface NightOwlPayload {
  hourlyData: number[];
  peakHour: number;
  isNightOwl: boolean;
  score: number;
  histogram: number[];
}

// Calculate musical age from track data
export function getMusicalAgePayload(data: any): MusicalAgePayload {
  const tracks = data.tracks || [];
  
  if (tracks.length === 0) {
    const currentYear = new Date().getFullYear();
    return {
      age: 0,
      averageYear: currentYear,
      description: 'No tracks available',
      oldest: { title: '', artist: '', year: currentYear },
      newest: { title: '', artist: '', year: currentYear },
      trackCount: 0,
      era: 'Streaming',
      stdDev: 0,
      decadeBuckets: []
    };
  }

  // Sample last 200 plays with ≥30s duration
  const validTracks = tracks
    .filter((track: any) => {
      const duration = track.duration_ms || 0;
      return duration >= 30000; // 30 seconds in milliseconds
    })
    .slice(0, 200);

  if (validTracks.length === 0) {
    const currentYear = new Date().getFullYear();
    return {
      age: 0,
      averageYear: currentYear,
      description: 'No valid tracks',
      oldest: { title: '', artist: '', year: currentYear },
      newest: { title: '', artist: '', year: currentYear },
      trackCount: 0,
      era: 'Streaming',
      stdDev: 0,
      decadeBuckets: []
    };
  }

  // Group tracks by ID and calculate play counts and last play dates
  const trackGroups = new Map<string, {
    track: any;
    playCount: number;
    lastPlayedAt: Date;
    year: number;
  }>();

  const now = new Date();

  validTracks.forEach((track: any) => {
    const trackId = track.id || `${track.name}-${track.artist || track.artists?.[0]?.name}`;
    const releaseDate = track.release_date || track.album?.release_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();
    const playedAt = track.played_at ? new Date(track.played_at) : now;

    if (!trackGroups.has(trackId)) {
      trackGroups.set(trackId, {
        track,
        playCount: 0,
        lastPlayedAt: playedAt,
        year
      });
    }

    const group = trackGroups.get(trackId)!;
    group.playCount++;
    if (playedAt > group.lastPlayedAt) {
      group.lastPlayedAt = playedAt;
    }
  });

  // Calculate weights and prepare data for weighted calculations
  const weightedData: WeightedData[] = [];
  let totalWeight = 0;
  let weightedYearSum = 0;

  Array.from(trackGroups.values()).forEach(group => {
    const deltasDays = Math.max(0, (now.getTime() - group.lastPlayedAt.getTime()) / (1000 * 60 * 60 * 24));
    const weight = group.playCount * Math.exp(-deltasDays / 60); // λ = 60 days
    
    weightedData.push({ year: group.year, weight });
    totalWeight += weight;
    weightedYearSum += group.year * weight;
  });

  if (totalWeight === 0) {
    const currentYear = new Date().getFullYear();
    return {
      age: 0,
      averageYear: currentYear,
      description: 'No weighted data available',
      oldest: { title: '', artist: '', year: currentYear },
      newest: { title: '', artist: '', year: currentYear },
      trackCount: validTracks.length,
      era: 'Streaming',
      stdDev: 0,
      decadeBuckets: []
    };
  }

  // Calculate core stats
  const medianYear = weightedMedianReleaseYear(weightedData);
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, Math.round(currentYear - medianYear));
  const averageYear = Math.round(weightedYearSum / totalWeight);
  const stdDev = Math.round(weightedStandardDeviation(weightedData, averageYear));

  // Find oldest and newest tracks
  const sortedGroups = Array.from(trackGroups.values()).sort((a, b) => a.year - b.year);
  const oldestGroup = sortedGroups[0];
  const newestGroup = sortedGroups[sortedGroups.length - 1];

  const oldest: TrackBrief = {
    title: oldestGroup.track.name || 'Unknown',
    artist: oldestGroup.track.artist || oldestGroup.track.artists?.[0]?.name || 'Unknown Artist',
    year: oldestGroup.year
  };

  const newest: TrackBrief = {
    title: newestGroup.track.name || 'Unknown',
    artist: newestGroup.track.artist || newestGroup.track.artists?.[0]?.name || 'Unknown Artist',
    year: newestGroup.year
  };

  // Calculate decade buckets
  const decadeBuckets: { decade: number; weight: number }[] = [];
  const decadeWeights = new Map<number, number>();

  weightedData.forEach(({ year, weight }) => {
    const decade = Math.floor(year / 10) * 10;
    decadeWeights.set(decade, (decadeWeights.get(decade) || 0) + weight);
  });

  Array.from(decadeWeights.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([decade, weight]) => {
      decadeBuckets.push({ decade, weight: Math.round(weight * 100) / 100 });
    });

  // Determine era based on median year
  let era: "Vinyl" | "Analog" | "Digital" | "Streaming";
  if (medianYear < 1970) {
    era = "Vinyl";
  } else if (medianYear < 1990) {
    era = "Analog";
  } else if (medianYear < 2010) {
    era = "Digital";
  } else {
    era = "Streaming";
  }

  return {
    age,
    era,
    trackCount: validTracks.length,
    averageYear,
    stdDev,
    oldest,
    newest,
    decadeBuckets,
    description: `Your music taste spans ${age} years of musical history`
  };
}

// Calculate mood ring from track audio features
export function getMoodRingPayload(data: any): MoodRingPayload {
  const tracks = data.tracks || [];
  
  if (tracks.length === 0) {
    return {
      emotions: { happy: 0, energetic: 0, chill: 0, melancholy: 0 },
      dominantMood: 'Unknown',
      distribution: []
    };
  }

  const emotions = {
    happy: 0,
    energetic: 0,
    chill: 0,
    melancholy: 0
  };

  tracks.forEach((track: any) => {
    const features = track.audio_features;
    if (!features) return;

    // Classify based on audio features
    const energy = features.energy || 0;
    const valence = features.valence || 0;
    const danceability = features.danceability || 0;

    if (valence > 0.6 && energy > 0.6) {
      emotions.happy++;
    } else if (energy > 0.7) {
      emotions.energetic++;
    } else if (energy < 0.4 && valence > 0.4) {
      emotions.chill++;
    } else {
      emotions.melancholy++;
    }
  });

  const total = Object.values(emotions).reduce((sum: number, val: number) => sum + val, 0);
  
  // Find dominant mood
  let dominantMood = 'happy';
  let maxCount = 0;
  for (const [mood, count] of Object.entries(emotions)) {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = mood;
    }
  }

  const distribution = Object.entries(emotions).map(([label, count]) => ({
    label,
    pct: total > 0 ? (count / total) * 100 : 0,
    color: getColorForMood(label)
  }));

  return {
    emotions,
    dominantMood,
    distribution
  };
}

// Calculate genre passport from artist data
export function getGenrePassportPayload(data: any): GenrePassportPayload {
  const artists = data.artists || [];
  
  if (artists.length === 0) {
    return {
      totalGenres: 0,
      topGenres: [],
      explorationScore: 0,
      distinctCount: 0,
      newDiscoveries: 0
    };
  }

  const genreSet = new Set<string>();
  const genreCounts: Record<string, number> = {};

  artists.forEach((artist: any) => {
    if (artist.genres && Array.isArray(artist.genres)) {
      artist.genres.forEach((genre: string) => {
        genreSet.add(genre);
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  const distinctCount = genreSet.size;
  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([genre]) => genre);

  const explorationScore = Math.min(100, Math.round((distinctCount / 20) * 100));

  return {
    totalGenres: distinctCount,
    topGenres,
    explorationScore,
    distinctCount,
    newDiscoveries: Math.floor(distinctCount * 0.2)
  };
}

// Calculate night owl pattern from played_at timestamps
export function getNightOwlPayload(data: any): NightOwlPayload {
  const tracks = data.tracks || [];
  
  const histogram = new Array(24).fill(0);
  
  tracks.forEach((track: any) => {
    if (track.played_at) {
      const hour = new Date(track.played_at).getHours();
      histogram[hour]++;
    }
  });

  const maxCount = Math.max(...histogram);
  const peakHour = histogram.indexOf(maxCount);
  
  // Night owl if peak listening is between 10 PM and 4 AM
  const isNightOwl = peakHour >= 22 || peakHour <= 4;
  
  // Calculate score based on late-night listening
  const nightCounts = histogram.slice(22).concat(histogram.slice(0, 5));
  const totalNightListening = nightCounts.reduce((sum, count) => sum + count, 0);
  const totalListening = histogram.reduce((sum, count) => sum + count, 0);
  
  const score = totalListening > 0 ? Math.round((totalNightListening / totalListening) * 100) : 0;

  return {
    hourlyData: histogram,
    peakHour,
    isNightOwl,
    score,
    histogram
  };
}

// Helper function to get color for mood
function getColorForMood(mood: string): string {
  const colors = {
    happy: '#1DB954',
    energetic: '#FF6B6B',
    chill: '#4ECDC4',
    melancholy: '#9B59B6'
  };
  return colors[mood as keyof typeof colors] || '#666666';
} 