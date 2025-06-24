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

/**
 * Hook for fetching AI-generated psycho hype personality headlines
 */
export function usePsyHype(input: HypePayloadInput, enabled: boolean = true) {
  const [hypePayload, setHypePayload] = useState<HypePayload | null>(null);
  const [parsedResponse, setParsedResponse] = useState<PsychoHypeResponse | null>(null);

  // Build the hype payload when input changes
  useEffect(() => {
    if (enabled && input.recentTracks.length > 0) {
      const payload = buildHypePayload(input);
      setHypePayload(payload);
    } else {
      setHypePayload(null);
    }
  }, [enabled, JSON.stringify(input)]);

  // Create a stable hash of the payload for cache key
  const payloadHash = hypePayload ? JSON.stringify(hypePayload).length.toString(36) : '';

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
    enabled && hypePayload !== null
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
      setParsedResponse({
        headline: copy.length > 90 ? copy.substring(0, 87) + '...' : copy,
        context: 'Your music taste is uniquely yours!',
        traits: ['Creative Explorer', 'Musical Adventurer'],
        tips: ['Keep discovering new genres!']
      });
    } else {
      setParsedResponse(null);
    }
  }, [copy, isFromAI, isFromMock, isFromFallback]);

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
    
    // Debug info
    payloadHash,
    hypePayload,
  };
} 