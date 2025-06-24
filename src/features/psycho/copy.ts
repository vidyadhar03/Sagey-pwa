// Dynamic copy configuration for psycho-analysis metrics
// Score ranges: low (0-0.34), medium (0.35-0.67), high (0.68-1)

export interface MetricCopy {
  headline: string;
  subtitle: string;
}

export interface MetricCopyConfig {
  low: MetricCopy;
  medium: MetricCopy;
  high: MetricCopy;
}

export const psychoCopyConfig: Record<string, MetricCopyConfig> = {
  musical_diversity: {
    low: {
      headline: "Genre comfort zone",
      subtitle: "You've got your favorites locked down"
    },
    medium: {
      headline: "Genre explorer",
      subtitle: "Mixing it up with different sounds"
    },
    high: {
      headline: "Genre globe-trotter!",
      subtitle: "Your playlist spans musical worlds"
    }
  },
  
  exploration_rate: {
    low: {
      headline: "Comfort repeat mode",
      subtitle: "Sticking with the classics you love"
    },
    medium: {
      headline: "Balanced discoverer",
      subtitle: "Finding new gems while keeping favorites"
    },
    high: {
      headline: "Music treasure hunter!",
      subtitle: "Always chasing the next great track"
    }
  },
  
  temporal_consistency: {
    low: {
      headline: "Musical mood swinger",
      subtitle: "Your listening schedule is beautifully chaotic"
    },
    medium: {
      headline: "Rhythm in routine",
      subtitle: "Some patterns emerging in your music time"
    },
    high: {
      headline: "Clock-work curator!",
      subtitle: "Your music schedule is surprisingly steady"
    }
  },
  
  mainstream_affinity: {
    low: {
      headline: "Underground connoisseur",
      subtitle: "You're digging deep for hidden gems"
    },
    medium: {
      headline: "Chart-curious",
      subtitle: "Mixing hits with personal discoveries"
    },
    high: {
      headline: "Pop culture pulse!",
      subtitle: "You're riding the wave of what's trending"
    }
  },
  
  emotional_volatility: {
    low: {
      headline: "Steady mood soundtrack",
      subtitle: "Your music keeps an even emotional keel"
    },
    medium: {
      headline: "Emotional range rider",
      subtitle: "Your playlists paint different feelings"
    },
    high: {
      headline: "Mood swing maestro!",
      subtitle: "Your music takes wild emotional journeys"
    }
  }
};

// Get copy based on metric name and score
export function getMetricCopy(metricName: string, score: number): MetricCopy {
  const config = psychoCopyConfig[metricName];
  
  if (!config) {
    // Fallback for unknown metrics
    return {
      headline: "Musical metric",
      subtitle: "Analyzing your listening patterns"
    };
  }
  
  // Determine score bucket
  if (score <= 0.34) {
    return config.low;
  } else if (score <= 0.67) {
    return config.medium;
  } else {
    return config.high;
  }
}

// Confidence level descriptions for tooltips
export const confidenceDescriptions = {
  high: {
    title: "High Confidence",
    description: "Plenty of data for reliable analysis (40+ tracks)"
  },
  medium: {
    title: "Medium Confidence", 
    description: "Good data sample for solid insights (20-39 tracks)"
  },
  low: {
    title: "Low Confidence",
    description: "Limited data - insights may vary (10-19 tracks)"
  },
  insufficient: {
    title: "Insufficient Data",
    description: "Not enough data yet for meaningful analysis (<10 tracks)"
  }
}; 