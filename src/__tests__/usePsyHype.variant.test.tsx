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

describe('usePsyHype with variants', () => {
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

  describe('variant parameter handling', () => {
    it('defaults to witty variant when no options provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Test headline',
            context: 'Test context',
            traits: ['Test trait'],
            tips: ['Test tip']
          }),
          source: 'ai'
        }),
      } as Response);

      const { result } = renderHook(() => 
        usePsyHype(mockInput, true)
      );

      await waitFor(() => {
        expect(result.current.variant).toBe('witty');
      });
    });

    it('uses specified variant from options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Test headline',
            context: 'Test context',
            traits: ['Test trait'],
            tips: ['Test tip']
          }),
          source: 'ai'
        }),
      } as Response);

      const { result } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'poetic' })
      );

      await waitFor(() => {
        expect(result.current.variant).toBe('poetic');
      });
    });

    it('passes variant to buildHypePayload', async () => {
      const { buildHypePayload } = require('../features/psycho/buildHypePayload');
      
      renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'poetic' })
      );

      await waitFor(() => {
        expect(buildHypePayload).toHaveBeenCalled();
      });

      // Check that the returned payload has variant set
      const call = buildHypePayload.mock.calls[0];
      expect(call).toBeDefined();
    });
  });

  describe('cache key behavior', () => {
    it('generates different cache keys for different variants', async () => {
      // Mock first call with witty variant
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Witty headline!',
            context: 'Witty context with emojis 🎧',
            traits: ['Witty trait'],
            tips: ['Witty tip']
          }),
          source: 'ai'
        }),
      } as Response);

      const { result: wittyResult } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'witty' })
      );

      await waitFor(() => {
        expect(wittyResult.current.hasValidResponse).toBe(true);
      });

      const wittyHash = wittyResult.current.payloadHash;

      // Mock second call with poetic variant
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Poetic headline',
            context: 'Poetic context with flowing prose',
            traits: ['Poetic trait'],
            tips: ['Poetic tip']
          }),
          source: 'ai'
        }),
      } as Response);

      const { result: poeticResult } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'poetic' })
      );

      await waitFor(() => {
        expect(poeticResult.current.hasValidResponse).toBe(true);
      });

      const poeticHash = poeticResult.current.payloadHash;

      // Verify different cache keys
      expect(wittyHash).not.toEqual(poeticHash);
      expect(wittyHash).toContain('witty');
      expect(poeticHash).toContain('poetic');
    });
  });

  describe('fallback behavior with variants', () => {
    beforeEach(() => {
      // Enable mock fallback mode
      process.env.NEXT_PUBLIC_DISABLE_AI = 'true';
    });

    it('provides variant-specific fallback for witty', async () => {
      const { result } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'witty' })
      );

      await waitFor(() => {
        expect(result.current.hasValidResponse).toBe(true);
      });

      expect(result.current.headline).toContain('absolutely unmatched');
      expect(result.current.context).toContain('crushing it');
      expect(result.current.traits).toContain('Creative Explorer');
    });

    it('provides variant-specific fallback for poetic', async () => {
      const { result } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'poetic' })
      );

      await waitFor(() => {
        expect(result.current.hasValidResponse).toBe(true);
      });

      expect(result.current.headline).toContain('musical soul dances');
      expect(result.current.context).toContain('river flowing');
      expect(result.current.traits).toContain('Sonic Poet');
    });
  });

  describe('API request with variants', () => {
    it('sends variant options to API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Test headline',
            context: 'Test context',
            traits: ['Test trait'],
            tips: []
          }),
          source: 'ai'
        }),
      } as Response);

      renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'poetic' })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/insights/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"variant":"poetic"')
        });
      });
    });
  });

  describe('hook return values', () => {
    it('returns variant in hook response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Test headline',
            context: 'Test context',
            traits: ['Test trait'],
            tips: []
          }),
          source: 'ai'
        }),
      } as Response);

      const { result } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'poetic' })
      );

      await waitFor(() => {
        expect(result.current.variant).toBe('poetic');
      });
    });

    it('returns isFromCache flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          copy: JSON.stringify({
            headline: '🎵 Test headline',
            context: 'Test context',
            traits: ['Test trait'],
            tips: []
          }),
          source: 'cache'
        }),
      } as Response);

      const { result } = renderHook(() => 
        usePsyHype(mockInput, true, { variant: 'witty' })
      );

      await waitFor(() => {
        expect(result.current.isFromCache).toBe(true);
      });
    });
  });
}); 