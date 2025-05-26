import { useState, useEffect } from 'react';

export interface MusicalAgeData {
  actualAge: number | null;
  averageReleaseYear: number;
  musicalAge: number;
  ageDifference: number;
  totalTracks: number;
  oldestTrack: {
    name: string;
    artist: string;
    year: number;
  };
  newestTrack: {
    name: string;
    artist: string;
    year: number;
  };
  aiInsight: string;
}

interface UseMusicalAgeReturn {
  data: MusicalAgeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage musical age data
 * Provides loading states, error handling, and refetch functionality
 */
export function useMusicalAge(): UseMusicalAgeReturn {
  const [data, setData] = useState<MusicalAgeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMusicalAge = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/musical-age', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const musicalAgeData: MusicalAgeData = await response.json();
      setData(musicalAgeData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch musical age data';
      setError(errorMessage);
      console.error('Musical Age Hook Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchMusicalAge();
  };

  useEffect(() => {
    // Auto-fetch on mount
    fetchMusicalAge();
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
} 