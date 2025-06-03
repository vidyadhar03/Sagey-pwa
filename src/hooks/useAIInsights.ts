"use client";

import { useState, useEffect } from 'react';
import { InsightType, InsightPayloadMap } from '../lib/openaiClient';
import { getMockCopy } from '../mocks/aiCopyMock';

/**
 * Hook for fetching AI-generated insight copy
 */
export function useAIInsights<T extends InsightType>(
  type: T,
  payload: InsightPayloadMap[T],
  enabled: boolean = true
) {
  const [data, setData] = useState<{ copy: string; source: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchInsight = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if AI is disabled for development
        if (process.env.NEXT_PUBLIC_DISABLE_AI === 'true') {
          console.log('🎭 Using mock AI copy for development');
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setData({
            copy: getMockCopy(type),
            source: 'mock'
          });
          setIsLoading(false);
          return;
        }

        console.log(`🔍 Fetching AI insight for ${type}`);
        
        const response = await fetch('/api/insights/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
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

        setData({
          copy: result.copy || 'Your musical insight is being generated...',
          source: result.source || 'unknown'
        });

      } catch (err) {
        console.error('❌ Failed to fetch AI insight:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to mock copy on error
        setData({
          copy: getMockCopy(type),
          source: 'fallback'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [type, JSON.stringify(payload), enabled]);

  return {
    copy: data?.copy || '',
    source: data?.source || 'unknown',
    isLoading,
    error,
    // Utility functions
    isFromAI: data?.source === 'ai',
    isFromMock: data?.source === 'mock',
    isFromFallback: data?.source === 'fallback',
  };
}

/**
 * Hook for batch fetching multiple AI insights
 */
export function useBatchAIInsights(
  insights: Array<{ type: InsightType; payload: any }>,
  enabled: boolean = true
) {
  const [data, setData] = useState<Record<string, { copy: string; source: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || insights.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchBatchInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results: Record<string, { copy: string; source: string }> = {};

        // Fetch all insights in parallel
        await Promise.all(
          insights.map(async ({ type, payload }) => {
            try {
              if (process.env.NEXT_PUBLIC_DISABLE_AI === 'true') {
                results[type] = {
                  copy: getMockCopy(type as InsightType),
                  source: 'mock'
                };
                return;
              }

              const response = await fetch('/api/insights/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, payload }),
              });

              const result = await response.json();
              results[type] = {
                copy: result.copy || 'Insight being generated...',
                source: result.source || 'unknown'
              };
            } catch (err) {
              console.error(`Failed to fetch ${type} insight:`, err);
              results[type] = {
                copy: getMockCopy(type as InsightType),
                source: 'fallback'
              };
            }
          })
        );

        setData(results);
      } catch (err) {
        console.error('Batch AI insights failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchInsights();
  }, [JSON.stringify(insights), enabled]);

  return {
    data,
    isLoading,
    error,
    getCopy: (type: InsightType) => data[type]?.copy || '',
    getSource: (type: InsightType) => data[type]?.source || 'unknown',
  };
}

/**
 * Simple hook to check if AI is enabled
 */
export function useAIStatus() {
  const [status, setStatus] = useState<{
    enabled: boolean;
    loading: boolean;
    error: string | null;
  }>({
    enabled: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/insights/ai');
        const result = await response.json();
        setStatus({
          enabled: result.aiEnabled || false,
          loading: false,
          error: null,
        });
      } catch (err) {
        setStatus({
          enabled: false,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    checkStatus();
  }, []);

  return status;
} 