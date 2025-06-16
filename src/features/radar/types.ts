/**
 * The five axes of the Music Radar.
 */
export type RadarAxis = 
  | 'Positivity' 
  | 'Energy' 
  | 'Exploration' 
  | 'Nostalgia' 
  | 'Night-Owl';

/**
 * A single data point for the radar chart, pairing an axis with a value.
 */
export interface RadarDataPoint {
  axis: RadarAxis;
  value: number;
}

/**
 * Represents the data payload for the Music Radar, including calculated scores
 * for each axis and the raw statistics used for the calculations.
 */
export interface RadarPayload {
  scores: Record<RadarAxis, number>; // Scores from 0-100 for each axis
  stats: {
    // Raw values used for calculation and display
    positivity: {
      weightedMeanValence: number;
      percentage: number;
    };
    energy: {
      weightedMeanEnergy: number;
      weightedMeanTempo: number; // Store normalized tempo as well
    };
    exploration: {
      genreCount: number;
      entropy: number;
      normalizedEntropy: number;
    };
    nostalgia: {
      medianTrackAge: number;
      userDOB?: string; // Optional user date of birth
    };
    nightOwl: {
      nightPlayCount: number;
      totalPlayCount: number;
      percentage: number;
    };
  };
  suggestions: Array<{ label: string; url: string }>; // For suggestion chips
  trackCount: number; // Total tracks considered for the calculation
  isDefault?: boolean; // True if using default/fallback data
  trends: RadarDataPoint[];
} 