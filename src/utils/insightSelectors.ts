// Insight selectors for calculating musical insights from Spotify data

export interface MusicalAgePayload {
  age: number;
  averageYear: number;
  description: string;
  oldest: number;
  newest: number;
  trackCount: number;
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
    return {
      age: 0,
      averageYear: new Date().getFullYear(),
      description: 'No tracks available',
      oldest: new Date().getFullYear(),
      newest: new Date().getFullYear(),
      trackCount: 0
    };
  }

  const releaseYears = tracks
    .map((track: any) => {
      const releaseDate = track.release_date || track.album?.release_date;
      return releaseDate ? new Date(releaseDate).getFullYear() : null;
    })
    .filter((year: number | null): year is number => year !== null);

  if (releaseYears.length === 0) {
    return {
      age: 0,
      averageYear: new Date().getFullYear(),
      description: 'No valid release dates',
      oldest: new Date().getFullYear(),
      newest: new Date().getFullYear(),
      trackCount: tracks.length
    };
  }

  // Calculate average year
  const averageYear = Math.round(releaseYears.reduce((sum: number, year: number) => sum + year, 0) / releaseYears.length);
  
  // Calculate musical age (current year - average year)
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - averageYear);

  const oldest = Math.min(...releaseYears);
  const newest = Math.max(...releaseYears);

  return {
    age,
    averageYear,
    description: `Your music taste spans ${age} years of musical history`,
    oldest,
    newest,
    trackCount: tracks.length
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