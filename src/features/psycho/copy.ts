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

// Seed adjectives for trait generation - organized by score buckets
export interface TraitSeeds {
  low: string[];
  medium: string[];
  high: string[];
}

// Coach tip seeds - verbs and nouns for actionable advice
export interface CoachTipSeeds {
  verbs: string[];
  nouns: string[];
}

export const traitSeeds: Record<string, TraitSeeds> = {
  musical_diversity: {
    low: ["focused", "loyal", "devoted", "consistent", "steadfast", "committed", "reliable", "dedicated"],
    medium: ["balanced", "curious", "selective", "adventurous", "flexible", "open-minded", "exploring", "sampling"],
    high: ["eclectic", "omnivorous", "boundless", "genre-fluid", "kaleidoscopic", "chameleon-like", "expansive", "limitless"]
  },
  
  exploration_rate: {
    low: ["comfortable", "nostalgic", "trustful", "rooted", "grounded", "anchored", "secure", "familiar"],
    medium: ["discovering", "curious", "measured", "thoughtful", "calculated", "strategic", "balanced", "selective"],
    high: ["restless", "adventurous", "pioneering", "relentless", "insatiable", "fearless", "boundary-pushing", "trailblazing"]
  },
  
  temporal_consistency: {
    low: ["spontaneous", "impulsive", "free-spirited", "unpredictable", "whimsical", "mercurial", "dynamic", "fluid"],
    medium: ["rhythmic", "structured", "habitual", "organized", "patterned", "cyclical", "routine-friendly", "methodical"],
    high: ["clockwork", "disciplined", "ritualistic", "precise", "systematic", "regimented", "steady", "unwavering"]
  },
  
  mainstream_affinity: {
    low: ["underground", "indie", "rebellious", "counter-cultural", "alternative", "subversive", "niche", "avant-garde"],
    medium: ["trend-aware", "selective", "mainstream-curious", "chart-conscious", "socially-tuned", "culturally-fluent", "balanced", "discerning"],
    high: ["zeitgeist", "pulse-reading", "trend-riding", "culturally-current", "mainstream-loving", "chart-chasing", "popularity-driven", "crowd-pleasing"]
  },
  
  emotional_volatility: {
    low: ["steady", "consistent", "even-keeled", "stable", "balanced", "centered", "harmonious", "tranquil"],
    medium: ["expressive", "mood-responsive", "emotionally-aware", "feeling-driven", "heart-led", "sentiment-guided", "reactive", "passionate"],
    high: ["intense", "dramatic", "explosive", "turbulent", "roller-coasting", "storm-chasing", "emotionally-dynamic", "cathartic"]
  }
};

export const coachTipSeeds: CoachTipSeeds = {
  verbs: ["explore", "discover", "venture", "experiment", "sample", "dive", "embrace", "expand", "unlock", "cultivate"],
  nouns: ["horizons", "territories", "soundscapes", "genres", "artists", "moods", "vibes", "experiences", "dimensions", "worlds"]
};

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

// Helper function to get trait seed for a metric and score
export function getTraitSeed(metricName: string, score: number): string[] {
  const seeds = traitSeeds[metricName];
  if (!seeds) return [];
  
  if (score <= 0.34) {
    return seeds.low;
  } else if (score <= 0.67) {
    return seeds.medium;
  } else {
    return seeds.high;
  }
}

// Helper function to randomly select unique seeds from arrays
export function selectUniqueSeeds<T>(array: T[], count: number = 1): T[] {
  if (array.length === 0) return [];
  
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
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