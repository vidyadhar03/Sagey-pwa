import { renderHook, waitFor } from '@testing-library/react';
import { usePsyHype } from '../hooks/usePsyHype';
import { HypePayloadInput } from '../features/psycho/buildHypePayload';

// Mock the buildHypePayload function
jest.mock('../features/psycho/buildHypePayload', () => ({
  buildHypePayload: jest.fn(),
  HypePayload: {},
  HypePayloadInput: {},
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('usePsyHype', () => {
  const mockInput: HypePayloadInput = {
    recentTracks: [
      {
        track: {
          id: 'track1',
          name: 'Test Track',
          artists: [{ 
            id: 'artist1', 
            name: 'Test Artist', 
            external_urls: { spotify: 'https://spotify.com' } 
          }],
          duration_ms: 180000,
          popularity: 75,
          album: {
            id: 'album1',
            name: 'Test Album',
            release_date: '2020-01-01',
            release_date_precision: 'day',
            images: [],
            external_urls: { spotify: 'https://spotify.com' }
          },
          explicit: false,
          preview_url: null,
          external_urls: { spotify: 'https://spotify.com' },
          uri: 'spotify:track:track1'
        },
        played_at: '2024-01-01T12:00:00Z',
      },
    ],
    topArtists: [
      {
        id: 'artist1',
        name: 'Test Artist',
        genres: ['pop', 'indie'],
        popularity: 80,
        followers: 10000,
        external_urls: { spotify: 'https://spotify.com' },
        track_count: 50,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Enable AI mode for testing (disable mock fallback)
    process.env.NEXT_PUBLIC_DISABLE_AI = 'false';
    
    // Mock the buildHypePayload function
    const { buildHypePayload } = require('../features/psycho/buildHypePayload');
    buildHypePayload.mockReturnValue({
      psycho: { scores: {}, metadata: {} },
      radar: {},
      musicalAge: {},
      nightOwl: {},
      moodRing: {},
      counts: {},
      topGenre: 'Pop',
      sampleTrack: { title: 'Test', artist: 'Artist' },
    });
  });

  it('should return initial state when not enabled', () => {
    const { result } = renderHook(() => usePsyHype(mockInput, false));

    expect(result.current.isLoading).toBe(false); // Should not be loading when disabled
    expect(result.current.headline).toBe('');
    expect(result.current.context).toBe('');
    expect(result.current.traits).toEqual([]);
    expect(result.current.tips).toEqual([]);
    expect(result.current.hasValidResponse).toBe(false);
  });

  it('should parse valid AI JSON response correctly', async () => {
    const mockResponse = {
      headline: '🎵 Musical Maverick Detected!',
      context: 'Your diverse taste spans genres like a true explorer.',
      traits: ['Creative Explorer', 'Genre Chameleon', 'Trend Setter'],
      tips: ['Try exploring ambient music for relaxation'],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        copy: JSON.stringify(mockResponse),
        source: 'ai',
        cached: false,
      }),
    } as Response);

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.headline).toBe('🎵 Musical Maverick Detected!');
    expect(result.current.context).toBe('Your diverse taste spans genres like a true explorer.');
    expect(result.current.traits).toEqual(['Creative Explorer', 'Genre Chameleon', 'Trend Setter']);
    expect(result.current.tips).toEqual(['Try exploring ambient music for relaxation']);
    expect(result.current.hasValidResponse).toBe(true);
    expect(result.current.isFromAI).toBe(true);
  });

  it('should handle mock/fallback responses correctly', async () => {
    const mockCopy = '🎶 Your musical DNA is truly unique! Keep exploring those beats ✨';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        copy: mockCopy,
        source: 'mock',
        cached: false,
      }),
    } as Response);

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.headline).toBe(mockCopy);
    expect(result.current.context).toBe('Your music taste is uniquely yours!');
    expect(result.current.traits).toEqual(['Creative Explorer', 'Musical Adventurer']);
    expect(result.current.tips).toEqual(['Keep discovering new genres!']);
    expect(result.current.hasValidResponse).toBe(true);
    expect(result.current.isFromMock).toBe(true);
  });

  it('should handle long headlines correctly in mock responses', async () => {
    const longMockCopy = '🎶 '.repeat(50); // Very long copy

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        copy: longMockCopy,
        source: 'fallback',
        cached: false,
      }),
    } as Response);

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should truncate to 90 chars
    expect(result.current.headline.length).toBeLessThanOrEqual(90);
    expect(result.current.headline).toContain('...');
    expect(result.current.isFromFallback).toBe(true);
  });

  it('should handle invalid JSON gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        copy: 'Invalid JSON content',
        source: 'ai',
        cached: false,
      }),
    } as Response);

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasValidResponse).toBe(false);
    expect(result.current.headline).toBe('');
    expect(result.current.context).toBe('');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should provide mutate function for regeneration', async () => {
    const mockResponse = {
      headline: '🎵 Original Response',
      context: 'Original context',
      traits: ['Original Trait'],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        copy: JSON.stringify(mockResponse),
        source: 'ai',
        cached: false,
      }),
    } as Response);

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.headline).toBe('🎵 Original Response');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('should create stable payload hash for caching', () => {
    const { result: result1 } = renderHook(() => usePsyHype(mockInput, true));
    const { result: result2 } = renderHook(() => usePsyHype(mockInput, true));

    expect(result1.current.payloadHash).toBe(result2.current.payloadHash);
    expect(result1.current.payloadHash).toBeTruthy();
  });

  it('should call buildHypePayload with correct input', () => {
    const { buildHypePayload } = require('../features/psycho/buildHypePayload');
    
    renderHook(() => usePsyHype(mockInput, true));

    expect(buildHypePayload).toHaveBeenCalledWith(mockInput);
  });

  it('should not call API when input has no tracks', () => {
    const emptyInput: HypePayloadInput = {
      recentTracks: [],
      topArtists: [],
    };

    renderHook(() => usePsyHype(emptyInput, true));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should validate response structure with all required fields', async () => {
    const completeResponse = {
      headline: '🎵 Complete Response',
      context: 'Full context provided',
      traits: ['Trait 1', 'Trait 2'],
      tips: ['Tip 1', 'Tip 2'],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        copy: JSON.stringify(completeResponse),
        source: 'ai',
        cached: false,
      }),
    } as Response);

    const { result } = renderHook(() => usePsyHype(mockInput, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.headline).toBe('🎵 Complete Response');
    expect(result.current.context).toBe('Full context provided');
    expect(result.current.traits).toHaveLength(2);
    expect(result.current.tips).toHaveLength(2);
    expect(result.current.hasValidResponse).toBe(true);
  });
}); 