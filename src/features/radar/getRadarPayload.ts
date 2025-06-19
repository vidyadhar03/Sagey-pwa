import { RadarPayload, RadarDataPoint } from './types';
import type { SpotifyTrack, SpotifyArtist, RecentlyPlayedTrack } from '../../hooks/useSpotify';
import { genreValence, genreEnergy, genreTempo, normalizeGenre } from './genreMaps';

// --- UTILITY FUNCTIONS ---

/** Clamps a number between a minimum and maximum value. */
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/** Calculates an exponential decay weight for a track based on how recently it was played. */
const getRecencyWeight = (playedAt: string, lambda = 10): number => {
  const playedAtDate = new Date(playedAt);
  const now = new Date();
  const daysAgo = (now.getTime() - playedAtDate.getTime()) / (1000 * 3600 * 24);
  
  // The decay factor λ (lambda) controls how quickly the weight decreases.
  // A smaller lambda means faster decay.
  return Math.exp(-daysAgo / lambda);
};

// --- AXIS CALCULATION FUNCTIONS ---

/**
 * Calculates the weighted mean of a set of values (e.g., valence, energy).
 * @param items - The items to process (e.g., recent tracks).
 * @param valueSelector - A function to select the numeric value from an item.
 * @param weightSelector - A function to select the weight for an item.
 * @returns The weighted mean, or 0 if total weight is zero.
 */
const getWeightedMean = <T>(
  items: T[],
  valueSelector: (item: T) => number,
  weightSelector: (item: T) => number
): number => {
  let weightedSum = 0;
  let totalWeight = 0;

  items.forEach(item => {
    const value = valueSelector(item);
    const weight = weightSelector(item);
    weightedSum += value * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

/**
 * Normalizes tempo from its typical BPM range to a 0-1 scale.
 * @param tempo - The tempo in beats per minute.
 * @param minTempo - The minimum expected tempo.
 * @param maxTempo - The maximum expected tempo.
 * @returns A normalized value between 0 and 1.
 */
const normalizeTempo = (tempo: number, minTempo = 50, maxTempo = 220): number => {
  if (tempo < minTempo) return 0;
  if (tempo > maxTempo) return 1;
  return (tempo - minTempo) / (maxTempo - minTempo);
};


/**
 * Calculates genre entropy, a measure of musical exploration.
 * @param artists - A list of top artists.
 * @returns An object with genre count, entropy, and normalized entropy score (0-100).
 */
const calculateExploration = (artists: SpotifyArtist[]) => {
  const genreCounts: { [genre: string]: number } = {};
  let totalGenreMentions = 0;

  artists.forEach(artist => {
    artist.genres.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      totalGenreMentions++;
    });
  });

  if (totalGenreMentions === 0) {
    return { genreCount: 0, entropy: 0, normalizedEntropy: 0 };
  }

  let entropy = 0;
  const distinctGenres = Object.keys(genreCounts);

  distinctGenres.forEach(genre => {
    const probability = genreCounts[genre] / totalGenreMentions;
    entropy -= probability * Math.log2(probability);
  });

  // Normalize the entropy score to a 0-100 scale.
  // The maximum possible entropy is log2 of the number of distinct genres.
  const maxEntropy = distinctGenres.length > 1 ? Math.log2(distinctGenres.length) : 1;
  const normalizedEntropy = (entropy / maxEntropy) * 100;

  return {
    genreCount: distinctGenres.length,
    entropy,
    normalizedEntropy: isNaN(normalizedEntropy) ? 0 : clamp(normalizedEntropy, 0, 100),
  };
};

/**
 * Calculates the median age of a list of tracks.
 * @param tracks - A list of tracks with their release dates.
 * @returns The median age in years.
 */
const calculateMedianTrackAge = (tracks: (SpotifyTrack | RecentlyPlayedTrack['track'])[]): number => {
  if (tracks.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  const ages = tracks
    .map(track => {
      // Handle different release date precisions ('year', 'month', 'day')
      const releaseYear = new Date(track.album.release_date).getFullYear();
      return currentYear - releaseYear;
    })
    .sort((a, b) => a - b);

  const mid = Math.floor(ages.length / 2);
  
  return ages.length % 2 !== 0 ? ages[mid] : (ages[mid - 1] + ages[mid]) / 2;
};

// --- MAIN PAYLOAD SELECTOR ---

interface RadarDataInput {
  recentTracks: RecentlyPlayedTrack[];
  topArtists: SpotifyArtist[];
}

// Helper to estimate valence and energy from genre, popularity, explicit, and tempo
export function getProxyFeatures(track: SpotifyTrack, genres: string[]) {
  const genre = (genres && genres.length > 0)
    ? normalizeGenre(genres[0])
    : 'pop';
  const genreVal = genreValence[genre] ?? 0.6;
  const genreEng = genreEnergy[genre] ?? 0.6;
  const genreTmp = genreTempo[genre] ?? 120;
  let valence = genreVal;
  if (track.popularity > 70) valence += 0.05;
  if (track.explicit) valence -= 0.05;
  valence = clamp(valence, 0, 1);
  const energy = clamp(0.7 * genreEng + 0.3 * normalizeTempo(genreTmp), 0, 1);
  return { valence, energy, tempo: genreTmp };
}

/**
 * Computes the complete Music Radar payload from raw Spotify data.
 */
export const getRadarPayload = (data: RadarDataInput): RadarPayload => {
  const { recentTracks, topArtists } = data;

  if (recentTracks.length === 0 || topArtists.length === 0) {
    // Return a default/fallback state if there's no data
    return {
      scores: { 'Positivity': 0, 'Energy': 0, 'Exploration': 0, 'Nostalgia': 0, 'Night-Owl': 0 },
      stats: {
        positivity: { weightedMeanValence: 0, percentage: 0 },
        energy: { weightedMeanEnergy: 0, weightedMeanTempo: 0 },
        exploration: { genreCount: 0, entropy: 0, normalizedEntropy: 0 },
        nostalgia: { medianTrackAge: 0 },
        nightOwl: { nightPlayCount: 0, totalPlayCount: 0, percentage: 0 },
      },
      suggestions: [],
      trackCount: 0,
      isDefault: true,
      trends: [], // No trend data for default
      topGenre: 'Pop',
      sampleTrack: { title: 'Unknown Track', artist: 'Unknown Artist' },
      weeks: 4,
    };
  }

  // --- Positivity (Valence) ---
  const weightedMeanValence = getWeightedMean(
    recentTracks,
    (item: RecentlyPlayedTrack) => {
      const artistKey = (item.track as any).artist || item.track.artists?.[0]?.name || item.track.artists?.[0]?.id;
      const artist = topArtists.find(a => a.name === artistKey || a.id === artistKey);
      const genres = artist ? artist.genres : ['pop'];
      return getProxyFeatures(item.track, genres).valence;
    },
    (item: RecentlyPlayedTrack) => getRecencyWeight(item.played_at)
  );
  const positivityScore = clamp(weightedMeanValence * 100, 0, 100);

  // --- Energy (Energy + Tempo) ---
  const weightedMeanEnergy = getWeightedMean(
    recentTracks,
    (item: RecentlyPlayedTrack) => {
      const artistKey = (item.track as any).artist || item.track.artists?.[0]?.name || item.track.artists?.[0]?.id;
      const artist = topArtists.find(a => a.name === artistKey || a.id === artistKey);
      const genres = artist ? artist.genres : ['pop'];
      return getProxyFeatures(item.track, genres).energy;
    },
    (item: RecentlyPlayedTrack) => getRecencyWeight(item.played_at)
  );
  const weightedMeanTempo = getWeightedMean(
    recentTracks,
    (item: RecentlyPlayedTrack) => {
      const artistKey = (item.track as any).artist || item.track.artists?.[0]?.name || item.track.artists?.[0]?.id;
      const artist = topArtists.find(a => a.name === artistKey || a.id === artistKey);
      const genres = artist ? artist.genres : ['pop'];
      return normalizeTempo(getProxyFeatures(item.track, genres).tempo);
    },
    (item: RecentlyPlayedTrack) => getRecencyWeight(item.played_at)
  );
  const energyScore = clamp(((weightedMeanEnergy + weightedMeanTempo) / 2) * 100, 0, 100);
  
  // --- Exploration (Genre Entropy) ---
  const explorationData = calculateExploration(topArtists);
  const explorationScore = explorationData.normalizedEntropy;

  // --- Nostalgia (Median Track Age) ---
  const recentTrackDetails = recentTracks.map(t => t.track);
  const medianTrackAge = calculateMedianTrackAge(recentTrackDetails);
  // The formula scales age so that 40 years old = 100 nostalgia score.
  const nostalgiaScore = clamp((medianTrackAge / 40) * 100, 0, 100);

  // --- Night-Owl (Listening Times) ---
  const nightPlays = recentTracks.filter((t: RecentlyPlayedTrack & { _test_hour?: number }) => {
    // Use the test hour if available for robust testing
    const hour = t._test_hour ?? new Date(t.played_at).getHours();
    return hour >= 22 || hour < 4; // 10 PM to 3:59 AM
  });
  const nightOwlPercentage = recentTracks.length > 0 ? (nightPlays.length / recentTracks.length) * 100 : 0;
  const nightOwlScore = clamp(nightOwlPercentage, 0, 100);
  
  // TODO: Replace with real suggestion logic
  const placeholderSuggestions = [
    { label: 'Discover Weekly', url: 'spotify:playlist:37i9dQZEVXcWeekly' },
    { label: '80s Rock Anthems', url: 'spotify:playlist:37i9dQZF1DX1rVvRgjX59F' },
    { label: 'Chill Vibes', url: 'spotify:playlist:37i9dQZF1DX889U0CL85jj' },
  ];

  // TODO: Replace with real trend data
  const placeholderTrends: RadarDataPoint[] = [
    { axis: 'Positivity', value: 5.2 },
    { axis: 'Energy', value: -2.1 },
    { axis: 'Exploration', value: 15.8 },
    { axis: 'Nostalgia', value: 0.5 },
    { axis: 'Night-Owl', value: -8.0 },
  ];

  // --- Calculate top genre from artists ---
  const genreCounts: { [genre: string]: number } = {};
  topArtists.forEach(artist => {
    artist.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  
  const topGenre = Object.keys(genreCounts).length > 0 
    ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
    : 'Pop';

  // --- Get sample track (first non-explicit track with clean name) ---
  const cleanTrack = recentTracks.find(t => 
    !t.track.explicit && 
    t.track.name && 
    t.track.artists?.[0]?.name &&
    t.track.name.length > 0 &&
    t.track.artists[0].name.length > 0
  ) || recentTracks[0];

  const sampleTrack = cleanTrack ? {
    title: cleanTrack.track.name || 'Unknown Track',
    artist: cleanTrack.track.artists?.[0]?.name || 'Unknown Artist'
  } : { title: 'Unknown Track', artist: 'Unknown Artist' };

  return {
    scores: {
      'Positivity': positivityScore,
      'Energy': energyScore,
      'Exploration': explorationScore,
      'Nostalgia': nostalgiaScore,
      'Night-Owl': nightOwlScore,
    },
    stats: {
      positivity: { weightedMeanValence, percentage: positivityScore },
      energy: { weightedMeanEnergy, weightedMeanTempo },
      exploration: explorationData,
      nostalgia: { medianTrackAge },
      nightOwl: { 
        nightPlayCount: nightPlays.length,
        totalPlayCount: recentTracks.length,
        percentage: nightOwlPercentage,
      },
    },
    suggestions: placeholderSuggestions,
    trackCount: recentTracks.length,
    isDefault: false,
    trends: placeholderTrends,
    topGenre,
    sampleTrack,
    weeks: 4,
  };
}; 