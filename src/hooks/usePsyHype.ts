"use client";

import { useState, useEffect } from 'react';
import { useAIInsights } from './useAIInsights';
import { buildHypePayload, HypePayload, HypePayloadInput } from '../features/psycho/buildHypePayload';

export interface PsychoHypeResponse {
  headline: string;
  context: string;
  traits: string[];
  tips?: string[];
}

export interface PsyHypeOptions {
  variant?: "witty" | "poetic";
}

/**
 * Hook for fetching AI-generated psycho hype personality headlines
 */
export function usePsyHype(
  input: HypePayloadInput, 
  enabled: boolean = true,
  options: PsyHypeOptions = {}
) {
  const { variant = "witty" } = options;
  const [hypePayload, setHypePayload] = useState<HypePayload | null>(null);
  const [parsedResponse, setParsedResponse] = useState<PsychoHypeResponse | null>(null);

  // Build the hype payload when input changes
  useEffect(() => {
    if (enabled && input.recentTracks.length > 0) {
      const payload = buildHypePayload(input);
      // Add variant to payload for cache key differentiation
      payload.variant = variant;
      setHypePayload(payload);
    } else {
      setHypePayload(null);
    }
  }, [enabled, JSON.stringify(input), variant]);

  // Create a stable hash of the payload for cache key (includes variant)
  const payloadHash = hypePayload ? 
    `${variant}-${JSON.stringify(hypePayload).length.toString(36)}` : '';

  const {
    copy,
    source,
    isLoading,
    error,
    mutate,
    isFromAI,
    isFromMock,
    isFromFallback,
  } = useAIInsights(
    'psycho_hype_v2',
    hypePayload || {} as HypePayload,
    enabled && hypePayload !== null,
    { variant } // Pass variant options to useAIInsights
  );

  // Parse the JSON response when copy changes
  useEffect(() => {
    if (copy && isFromAI) {
      try {
        const parsed = JSON.parse(copy) as PsychoHypeResponse;
        setParsedResponse(parsed);
      } catch (err) {
        console.error('Failed to parse psycho hype response:', err);
        setParsedResponse(null);
      }
    } else if (copy && (isFromMock || isFromFallback)) {
      // For mock/fallback, create a basic response structure
      const fallbackHeadline = variant === "poetic" 
        ? "🎵 Your musical soul dances through sonic landscapes"
        : "🎵 Your vibe is absolutely unmatched!";
      
      const fallbackContext = variant === "poetic"
        ? "Like a river flowing through diverse musical terrain, your taste reflects artistic depth."
        : "Your music taste is uniquely yours and totally crushing it! 🎧✨";
      
      setParsedResponse({
        headline: copy.length > 90 ? copy.substring(0, 87) + '...' : fallbackHeadline,
        context: fallbackContext,
        traits: variant === "poetic" 
          ? ['Sonic Poet', 'Musical Wanderer']
          : ['Creative Explorer', 'Musical Adventurer'],
        tips: ['Keep discovering new genres!']
      });
    } else {
      setParsedResponse(null);
    }
  }, [copy, isFromAI, isFromMock, isFromFallback, variant]);

  return {
    // Raw data
    copy,
    source,
    isLoading,
    error,
    mutate,
    
    // Parsed response
    headline: parsedResponse?.headline || '',
    context: parsedResponse?.context || '',
    traits: parsedResponse?.traits || [],
    tips: parsedResponse?.tips || [],
    
    // Utility flags
    isFromAI,
    isFromMock,
    isFromFallback,
    hasValidResponse: parsedResponse !== null,
    isFromCache: source === 'cache',
    
    // Variant info
    variant,
    
    // Debug info
    payloadHash,
    hypePayload,
  };
} 