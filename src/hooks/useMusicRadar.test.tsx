import { renderHook, waitFor } from '@testing-library/react';
import { useMusicRadar } from './useMusicRadar';
import { useAIInsights } from './useAIInsights';

// Mock the useAIInsights hook
jest.mock('./useAIInsights', () => ({
  useAIInsights: jest.fn(),
}));

// Mock the useSpotify hook to control its output
jest.mock('./useSpotify', () => ({
  useSpotify: () => ({
    connected: true,
    getRecentTracks: jest.fn().mockResolvedValue([{ 
      played_at: new Date().toISOString(),
      track: { 
        id: 'test', 
        album: { release_date: '2022-01-01' } 
      } 
    }]),
    getTopArtists: jest.fn().mockResolvedValue([{ id: 'test', genres: ['test'], track_count: 1 }]),
    getAudioFeatures: jest.fn().mockResolvedValue([{ id: 'test', valence: 0.5, energy: 0.5, tempo: 120 }]),
  }),
}));

describe('useMusicRadar', () => {
  it('should return AI copy from the mocked useAIInsights hook', async () => {
    const mockAICopy = "This is a test from your friendly neighborhood AI.";
    
    // Setup the mock implementation for useAIInsights
    (useAIInsights as jest.Mock).mockReturnValue({
      copy: mockAICopy,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useMusicRadar());

    // Wait for the hook to process and update its state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert that the AI copy from the hook matches our mock
    expect(result.current.ai.copy).toBe(mockAICopy);
    expect(useAIInsights).toHaveBeenCalledWith('radar_summary', expect.any(Object), expect.any(Boolean));
  });
}); 