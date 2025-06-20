"use client";

import { useState, useEffect } from 'react';
import { RadarPayload } from '../features/radar/types';
import { RadarHypeCopy } from '../features/radar/radarNarrativeConfig';
import { getMockCopy } from '../mocks/aiCopyMock';

/**
 * Hook for fetching AI-generated radar hype copy with structured format
 */
export function useRadarHype(
  payload: RadarPayload,
  enabled: boolean = true
) {
  // Simple cache keyed by type (radar_hype)
  const staticCache = (globalThis as any).__radarHypeCache ?? ((globalThis as any).__radarHypeCache = new Map<string, RadarHypeCopy>());

  const cacheKey = 'radar-hype';
  const cachedInitial = staticCache.get(cacheKey) || null;

  const [data, setData] = useState<RadarHypeCopy | null>(cachedInitial);
  const [isLoading, setIsLoading] = useState(!cachedInitial);
  const [error, setError] = useState<string | null>(null);

  const parseRadarHypeCopy = (rawCopy: string): RadarHypeCopy => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(rawCopy);
      if (parsed.mainInsight) {
        return {
          mainInsight: parsed.mainInsight,
          tip: parsed.tip
        };
      }
    } catch {
      // If JSON parsing fails, fall back to mock format
    }
    
    // Fallback to a simple structure from mock
    return {
      mainInsight: "🎵 Your music radar is looking amazing! Based on your recent listening patterns, you're creating some incredible musical vibes.",
      tip: undefined
    };
  };

  useEffect(() => {
    // If we already have cached data, skip fetching unless regenerate is explicitly requested later
    if (cachedInitial) {
      setIsLoading(false);
      return;
    }

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchRadarHype = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if AI is disabled for development
        if (process.env.NEXT_PUBLIC_DISABLE_AI === 'true') {
          console.log('🎭 Using mock radar hype copy for development');
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockCopy = getMockCopy('radar_hype');
          const parsed = parseRadarHypeCopy(mockCopy);
          setData(parsed);
          staticCache.set(cacheKey, parsed);
          setIsLoading(false);
          return;
        }

        console.log('🔍 Fetching AI radar hype insight');
        
        const response = await fetch('/api/insights/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'radar_hype',
            payload
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.error) {
          console.warn('⚠️ AI API returned error:', result.error);
        }

        const parsedCopy = parseRadarHypeCopy(result.copy || '');
        setData(parsedCopy);
        staticCache.set(cacheKey, parsedCopy);

      } catch (err) {
        console.error('❌ Failed to fetch radar hype insight:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to mock copy on error
        const mockCopy = getMockCopy('radar_hype');
        const parsed = parseRadarHypeCopy(mockCopy);
        setData(parsed);
        staticCache.set(cacheKey, parsed);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRadarHype();
  }, [JSON.stringify(payload), enabled]);

  const mutate = async (options?: { regenerate?: boolean }) => {
    const regenerate = options?.regenerate || false;
    
    setIsLoading(true);
    setError(null);

    try {
      // Check if AI is disabled for development
      if (process.env.NEXT_PUBLIC_DISABLE_AI === 'true') {
        console.log(`🎭 ${regenerate ? 'Refreshing with new' : 'Using'} mock radar hype copy`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockCopy = getMockCopy('radar_hype');
        const parsed = parseRadarHypeCopy(mockCopy);
        setData(parsed);
        staticCache.set(cacheKey, parsed);
        setIsLoading(false);
        return;
      }

      console.log(`🔍 ${regenerate ? 'Regenerating' : 'Fetching'} radar hype insight`);
      
      const response = await fetch('/api/insights/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'radar_hype',
          payload,
          regenerate
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        console.warn('⚠️ AI API returned error:', result.error);
      }

      const parsedCopy = parseRadarHypeCopy(result.copy || '');
      setData(parsedCopy);
      staticCache.set(cacheKey, parsedCopy);

    } catch (err) {
      console.error('❌ Failed to fetch radar hype insight:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock copy on error
      const mockCopy = getMockCopy('radar_hype');
      const parsed = parseRadarHypeCopy(mockCopy);
      setData(parsed);
      staticCache.set(cacheKey, parsed);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mainInsight: data?.mainInsight || '',
    tip: data?.tip,
    isLoading,
    error,
    mutate,
    // Utility functions
    hasData: !!data,
    hasTip: !!data?.tip,
  };
} 