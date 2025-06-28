import { renderHook, waitFor } from '@testing-library/react';
import { useWellnessPlaylists } from '../hooks/useWellnessPlaylists';
import { useMoodData } from '../hooks/useMoodData';
import { usePsyMetrics } from '../hooks/usePsyMetrics';

// Mock the dependencies
jest.mock('../hooks/useMoodData');
jest.mock('../hooks/usePsyMetrics');

const mockUseMoodData = useMoodData as jest.MockedFunction<typeof useMoodData>;
const mockUsePsyMetrics = usePsyMetrics as jest.MockedFunction<typeof usePsyMetrics>;

// Mock fetch
global.fetch = jest.fn();

describe('useWellnessPlaylists', () => {
  const mockMoodData = [
    { date: '2024-01-01', dayName: 'Mon', moodScore: 75, trackCount: 10, insight: 'Good day' },
    { date: '2024-01-02', dayName: 'Tue', moodScore: 80, trackCount: 12, insight: 'Great day' },
    { date: '2024-01-03', dayName: 'Wed', moodScore: 70, trackCount: 8, insight: 'Decent day' }
  ];

  const mockPsyPayload = {
    scores: {
      musical_diversity: { score: 0.7, confidence: 'high' },
      exploration_rate: { score: 0.8, confidence: 'high' },
      temporal_consistency: { score: 0.6, confidence: 'medium' },
      mainstream_affinity: { score: 0.5, confidence: 'medium' },
      emotional_volatility: { score: 0.4, confidence: 'low' }
    }
  };

  const mockTopArtistsResponse = {
    artists: [
      { id: 'artist1', name: 'Test Artist 1', genres: ['indie', 'rock'] },
      { id: 'artist2', name: 'Test Artist 2', genres: ['pop', 'electronic'] }
    ]
  };

  const mockRecentTracksResponse = {
    items: [
      { track: { id: 'track1', name: 'Test Track 1' } },
      { track: { id: 'track2', name: 'Test Track 2' } }
    ]
  };

  const mockWellnessResponse = {
    emotionalState: {
      state: 'positive',
      averageScore: 75,
      emoji: '😊'
    },
    playlists: [
      {
        id: 'playlist-1',
        name: 'Keep the Vibes High',
        description: 'Tracks to maintain your positive momentum',
        moodTag: 'Uplifting Energy',
        subtext: 'Perfect for maintaining your good vibes',
        tracks: [],
        spotifyUrl: 'https://open.spotify.com/playlist/123'
      }
    ],
    insight: 'Your mood has been positive this week'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    // Default mock implementations
    mockUseMoodData.mockReturnValue({
      moodData: mockMoodData,
      loading: false,
      error: null,
      insights: null,
      aiSummary: '',
      summaryLoading: false
    });

    mockUsePsyMetrics.mockReturnValue({
      payload: mockPsyPayload,
      loading: false,
      error: null,
      isFallback: false
    });
  });

  it('should return loading state initially', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: null,
      loading: true,
      error: null,
      isFallback: false
    });

    const { result } = renderHook(() => useWellnessPlaylists());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should fetch wellness playlists successfully', async () => {
    // Mock successful API responses
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTopArtistsResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecentTracksResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWellnessResponse)
      } as Response);

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockWellnessResponse);
    expect(result.current.error).toBe(null);

    // Verify the wellness API was called with correct data
    expect(fetch).toHaveBeenCalledWith('/api/spotify/wellness-playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moodData: mockMoodData.map(day => ({
          date: day.date,
          moodScore: day.moodScore,
        })),
        personalityType: 'Explorer', // Determined from mock payload
        topGenres: ['indie', 'rock', 'pop'],
        topArtists: [
          { id: 'artist1', name: 'Test Artist 1' },
          { id: 'artist2', name: 'Test Artist 2' }
        ],
        recentTracks: [
          { id: 'track1', name: 'Test Track 1' },
          { id: 'track2', name: 'Test Track 2' }
        ]
      })
    });
  });

  it('should determine personality type correctly', async () => {
    const highDiversityPayload = {
      scores: {
        musical_diversity: { score: 0.8, confidence: 'high' }, // Above 60%
        exploration_rate: { score: 0.5, confidence: 'medium' }, // Below 60%
        temporal_consistency: { score: 0.5, confidence: 'medium' },
        mainstream_affinity: { score: 0.5, confidence: 'medium' },
        emotional_volatility: { score: 0.5, confidence: 'medium' }
      }
    };

    mockUsePsyMetrics.mockReturnValue({
      payload: highDiversityPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTopArtistsResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecentTracksResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWellnessResponse)
      } as Response);

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have determined personality as "Open-minded" due to high musical diversity
    const wellnessCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
      call => call[0] === '/api/spotify/wellness-playlists'
    );
    
    expect(wellnessCall).toBeDefined();
    const callBody = JSON.parse(wellnessCall![1]!.body as string);
    expect(callBody.personalityType).toBe('Open-minded');
  });

  it('should handle API errors gracefully', async () => {
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTopArtistsResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecentTracksResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' })
      } as Response);

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('API Error');
  });

  it('should handle network errors', async () => {
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTopArtistsResponse)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecentTracksResponse)
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle missing Spotify data gracefully', async () => {
    // Mock failed Spotify API calls
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockRejectedValueOnce(new Error('Spotify API error'))
      .mockRejectedValueOnce(new Error('Spotify API error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWellnessResponse)
      } as Response);

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockWellnessResponse);
    
    // Should have called wellness API with empty arrays for missing data
    const wellnessCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
      call => call[0] === '/api/spotify/wellness-playlists'
    );
    
    const callBody = JSON.parse(wellnessCall![1]!.body as string);
    expect(callBody.topGenres).toEqual([]);
    expect(callBody.topArtists).toEqual([]);
    expect(callBody.recentTracks).toEqual([]);
  });

  it('should provide refetch functionality', async () => {
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWellnessResponse)
      } as Response);

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('should handle empty mood data', async () => {
    mockUseMoodData.mockReturnValue({
      moodData: [],
      loading: false,
      error: null,
      insights: null,
      aiSummary: '',
      summaryLoading: false
    });

    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWellnessResponse)
      } as Response);

    const { result } = renderHook(() => useWellnessPlaylists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const wellnessCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
      call => call[0] === '/api/spotify/wellness-playlists'
    );
    
    const callBody = JSON.parse(wellnessCall![1]!.body as string);
    expect(callBody.moodData).toEqual([]);
  });
}); 