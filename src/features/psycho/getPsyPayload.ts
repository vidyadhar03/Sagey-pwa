import { SpotifyTrack, SpotifyArtist, RecentlyPlayedTrack } from '../../hooks/useSpotify';
import { PsyPayload, PsyMetric, RawPsyInput, ConfidenceLevel } from './types';
import { normalizedShannonEntropy, uniqueRatio } from './utils';
import { genreValence, normalizeGenre } from '../radar/genreMaps';

/**
 * Creates a default metric with zero score and insufficient confidence
 */
function createDefaultMetric(formula: string): PsyMetric {
  return {
    score: 0,
    confidence: 'insufficient' as ConfidenceLevel,
    formula
  };
}

/**
 * Compute musical diversity metric based on genre entropy
 */
function computeMusicalDiversity(topArtists: SpotifyArtist[]): PsyMetric {
  const formula = "Shannon entropy of genres / log2(unique genres)";

  if (!topArtists || topArtists.length === 0) {
    return createDefaultMetric(formula);
  }

  // Collect all genres from artists
  const allGenres: string[] = [];
  for (const artist of topArtists) {
    if (artist.genres && Array.isArray(artist.genres)) {
      allGenres.push(...artist.genres);
    }
  }

  if (allGenres.length === 0) {
    return createDefaultMetric(formula);
  }

  // Calculate normalized Shannon entropy
  const diversityScore = normalizedShannonEntropy(allGenres);

  // Determine confidence based on total genre tokens
  let confidence: ConfidenceLevel;
  if (allGenres.length >= 20) {
    confidence = 'high';
  } else if (allGenres.length >= 10) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    score: diversityScore,
    confidence,
    formula
  };
}

/**
 * Compute exploration rate metric based on unique artists/tracks ratio
 */
function computeExplorationRate(recentTracks: RecentlyPlayedTrack[]): PsyMetric {
  const formula = "(unique artists + unique tracks) / (2 * total tracks)";

  if (!recentTracks || recentTracks.length === 0) {
    return createDefaultMetric(formula);
  }

  // Extract artist and track IDs
  const artistIds = recentTracks.map(item => 
    item.track.artists.map(artist => artist.id).join(',')
  );
  const trackIds = recentTracks.map(item => item.track.id);

  // Calculate unique ratios
  const uniqueArtistRatio = uniqueRatio(artistIds);
  const uniqueTrackRatio = uniqueRatio(trackIds);

  // Combined exploration score
  const explorationScore = (uniqueArtistRatio + uniqueTrackRatio) / 2;

  // Determine confidence based on sample size
  let confidence: ConfidenceLevel;
  if (recentTracks.length >= 40) {
    confidence = 'high';
  } else if (recentTracks.length >= 20) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    score: explorationScore,
    confidence,
    formula
  };
}

/**
 * Compute temporal consistency metric based on listening hour patterns
 */
function computeTemporalConsistency(recentTracks: RecentlyPlayedTrack[]): PsyMetric {
  const formula = "1 / (1 + variance of listening hours / 100)";

  if (!recentTracks || recentTracks.length === 0) {
    return createDefaultMetric(formula);
  }

  // Extract hour from each play timestamp
  const hours: number[] = [];
  for (const item of recentTracks) {
    try {
      const playedDate = new Date(item.played_at);
      const hour = playedDate.getHours(); // 0-23
      hours.push(hour);
    } catch (error) {
      // Skip invalid timestamps
      continue;
    }
  }

  if (hours.length === 0) {
    return createDefaultMetric(formula);
  }

  // Count plays per hour (0-23)
  const hourCounts = new Array(24).fill(0);
  for (const hour of hours) {
    hourCounts[hour]++;
  }

  // Calculate variance of hourly play counts
  const mean = hours.length / 24;
  const variance = hourCounts.reduce((sum, count) => {
    return sum + Math.pow(count - mean, 2);
  }, 0) / 24;

  // Convert to consistency score (0-1)
  const consistencyScore = 1 / (1 + variance / 100);

  // Determine confidence based on sample size
  let confidence: ConfidenceLevel;
  if (hours.length >= 40) {
    confidence = 'high';
  } else if (hours.length >= 25) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    score: consistencyScore,
    confidence,
    formula
  };
}

/**
 * Compute mainstream affinity metric based on track and artist popularity
 */
function computeMainstreamAffinity(recentTracks: RecentlyPlayedTrack[], topArtists: SpotifyArtist[]): PsyMetric {
  const formula = "(mean track popularity + log-scaled artist followers) / 2";

  // Calculate mean track popularity (always available)
  let meanTrackPop = 0;
  if (recentTracks && recentTracks.length > 0) {
    const totalPopularity = recentTracks.reduce((sum, item) => {
      return sum + (item.track.popularity || 0);
    }, 0);
    meanTrackPop = totalPopularity / recentTracks.length / 100; // Normalize to 0-1
  }

  // Calculate mean artist popularity (log-scaled followers)
  let meanArtistPop = 0;
  if (topArtists && topArtists.length > 0) {
    const totalLogFollowers = topArtists.reduce((sum, artist) => {
      const followers = artist.followers || 0;
      return sum + Math.log10(followers + 1) / 7; // Log-scale and normalize
    }, 0);
    meanArtistPop = totalLogFollowers / topArtists.length;
  }

  // Combined mainstream score
  const mainstreamScore = (meanTrackPop + meanArtistPop) / 2;

  return {
    score: Math.min(1, Math.max(0, mainstreamScore)), // Clamp to 0-1
    confidence: 'high' as ConfidenceLevel, // Always high (popularity always available)
    formula
  };
}

/**
 * Compute emotional volatility metric based on valence variance from genre mapping
 */
function computeEmotionalVolatility(recentTracks: RecentlyPlayedTrack[], topArtists: SpotifyArtist[]): PsyMetric {
  const formula = "√( Σ(valenceTrack - μ)² / N ) normalized to 0-100";

  if (!recentTracks || recentTracks.length === 0) {
    return createDefaultMetric(formula);
  }

  // Map each track to its valence based on artist genres
  const trackValences: number[] = [];
  
  for (const recentTrack of recentTracks) {
    // Find the artist for this track
    let primaryGenres: string[] = [];
    
    // Try to match by artist ID first, then by name
    for (const trackArtist of recentTrack.track.artists) {
      const matchedArtist = topArtists.find(artist => 
        artist.id === trackArtist.id || artist.name === trackArtist.name
      );
      
      if (matchedArtist && matchedArtist.genres && matchedArtist.genres.length > 0) {
        primaryGenres = matchedArtist.genres;
        break;
      }
    }
    
    // Get valence from primary genre (first genre of the artist)
    let trackValence = 0.5; // Default valence if no genre found
    
    if (primaryGenres.length > 0) {
      const normalizedGenre = normalizeGenre(primaryGenres[0]);
      trackValence = genreValence[normalizedGenre] || 0.5;
    }
    
    trackValences.push(trackValence);
  }

  // Need at least 10 tracks with mapped genres for meaningful analysis
  const mappedTracks = trackValences.filter(val => val !== 0.5).length;
  const minRequired = 10;
  
  if (mappedTracks < minRequired) {
    return {
      score: 0,
      confidence: 'insufficient' as ConfidenceLevel,
      formula,
      mappedTrackCount: mappedTracks,
      minRequired: minRequired
    };
  }

  // Calculate variance of valence scores
  const mean = trackValences.reduce((sum, val) => sum + val, 0) / trackValences.length;
  const variance = trackValences.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / trackValences.length;
  const volatility = Math.sqrt(variance);

  // Normalize to 0-100 scale (0.4 is considered max reasonable volatility)
  const normalizedScore = Math.min(100, Math.max(0, (volatility * 100) / 0.4));

  // Determine confidence based on sample size with mapped genres
  let confidence: ConfidenceLevel;
  if (mappedTracks >= 40) {
    confidence = 'high';
  } else if (mappedTracks >= 25) {
    confidence = 'medium';
  } else if (mappedTracks >= 10) {
    confidence = 'low';
  } else {
    confidence = 'insufficient';
  }

  return {
    score: normalizedScore / 100, // Convert back to 0-1 range
    confidence,
    formula
  };
}

/**
 * Main selector function that computes psycho-analysis payload
 */
export function getPsyPayload(input: RawPsyInput): PsyPayload {
  const { recentTracks, topArtists } = input;

  // Compute all implemented metrics
  const musical_diversity = computeMusicalDiversity(topArtists);
  const exploration_rate = computeExplorationRate(recentTracks);
  const temporal_consistency = computeTemporalConsistency(recentTracks);
  const mainstream_affinity = computeMainstreamAffinity(recentTracks, topArtists);
  const emotional_volatility = computeEmotionalVolatility(recentTracks, topArtists);

  // Count genres for metadata
  const allGenres = new Set<string>();
  if (topArtists) {
    for (const artist of topArtists) {
      if (artist.genres && Array.isArray(artist.genres)) {
        artist.genres.forEach((genre: string) => allGenres.add(genre));
      }
    }
  }

  return {
    scores: {
      musical_diversity,
      exploration_rate,
      temporal_consistency,
      mainstream_affinity,
      emotional_volatility
    },
    metadata: {
      tracks_analyzed: recentTracks?.length || 0,
      artists_analyzed: topArtists?.length || 0,
      genres_found: allGenres.size,
      generated_at: new Date().toISOString()
    }
  };
} 