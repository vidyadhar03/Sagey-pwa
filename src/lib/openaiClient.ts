import OpenAI from 'openai';
import { RadarPayload } from '../features/radar/types';

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openaiClient = new OpenAI({
      apiKey,
      // Optional: configure other settings
      timeout: 30000, // 30 seconds
      maxRetries: 2,
    });
  }

  return openaiClient;
}

// Type definitions for AI insight types
export type InsightType = 'musical_age' | 'mood_ring' | 'genre_passport' | 'night_owl_pattern' | 'radar_summary';

export interface MusicalAgePayload {
  age: number;
  averageYear: number;
  description: string;
  actualAge?: number;
}

export interface MoodRingPayload {
  emotions: {
    happy: number;
    energetic: number;
    chill: number;
    melancholy: number;
  };
  dominantMood: string;
}

export interface GenrePassportPayload {
  totalGenres: number;
  topGenres: string[];
  explorationScore: number;
}

export interface NightOwlPatternPayload {
  hourlyData: number[];
  peakHour: number;
  isNightOwl: boolean;
  score: number;
}

export interface InsightPayloadMap {
  musical_age: MusicalAgePayload;
  mood_ring: MoodRingPayload;
  genre_passport: GenrePassportPayload;
  night_owl_pattern: NightOwlPatternPayload;
  radar_summary: RadarPayload;
}

export type InsightPayload = InsightPayloadMap[InsightType]; 