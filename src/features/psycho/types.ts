export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient';

export interface PsyMetric {
  score: number; // 0-1 range
  confidence: ConfidenceLevel;
  formula: string;
  // Optional tracking for insufficient data scenarios
  mappedTrackCount?: number;
  minRequired?: number;
}

export interface PsyScore {
  musical_diversity: PsyMetric;
  exploration_rate: PsyMetric;
  temporal_consistency: PsyMetric;
  mainstream_affinity: PsyMetric;
  emotional_volatility: PsyMetric;
}

export interface PsyPayload {
  scores: PsyScore;
  metadata: {
    tracks_analyzed: number;
    artists_analyzed: number;
    genres_found: number;
    generated_at: string;
  };
}

export interface RawPsyInput {
  recentTracks: any[]; // Will use SpotifyTrack from useSpotify
  topArtists: any[];   // Will use SpotifyArtist from useSpotify
} 