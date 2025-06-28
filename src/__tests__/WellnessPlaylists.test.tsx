import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useWellnessPlaylists } from '../hooks/useWellnessPlaylists';

// Mock the hook
jest.mock('../hooks/useWellnessPlaylists');
const mockUseWellnessPlaylists = useWellnessPlaylists as jest.MockedFunction<typeof useWellnessPlaylists>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Import the component from the parent file
import MentalHealthInsights from '../components/MentalHealthInsights';

// Mock other hooks used in the component
jest.mock('../hooks/usePsyMetrics', () => ({
  usePsyMetrics: () => ({
    payload: {
      scores: {
        musical_diversity: { score: 0.7 },
        exploration_rate: { score: 0.8 },
        temporal_consistency: { score: 0.6 },
        mainstream_affinity: { score: 0.5 },
        emotional_volatility: { score: 0.4 }
      }
    },
    loading: false
  })
}));

jest.mock('../hooks/useMoodData', () => ({
  useMoodData: () => ({
    moodData: [
      { date: '2024-01-01', dayName: 'Mon', moodScore: 75, trackCount: 10, insight: 'Good day' },
      { date: '2024-01-02', dayName: 'Tue', moodScore: 80, trackCount: 12, insight: 'Great day' }
    ],
    loading: false,
    error: null
  })
}));

describe('WellnessPlaylists Component', () => {
  const mockWellnessData = {
    emotionalState: {
      state: 'positive' as const,
      averageScore: 78,
      emoji: '😊'
    },
    playlists: [
      {
        id: 'playlist-1',
        name: 'Keep the Vibes High',
        description: 'Tracks to maintain your positive momentum',
        moodTag: 'Uplifting Energy',
        subtext: 'Perfect for maintaining your good vibes',
        tracks: [
          {
            id: 'track-1',
            name: 'Happy Song',
            artists: ['Artist 1', 'Artist 2'],
            preview_url: 'https://example.com/preview.mp3'
          },
          {
            id: 'track-2',
            name: 'Uplifting Tune',
            artists: ['Artist 3'],
            preview_url: null
          }
        ],
        spotifyUrl: 'https://open.spotify.com/playlist/123'
      }
    ],
    insight: 'Your mood has been positive this week - let these uplifting tracks keep your energy flowing'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseWellnessPlaylists.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    expect(screen.getByTestId('wellness-loading') || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseWellnessPlaylists.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load playlists',
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    expect(screen.getByText('What Can Help You Feel Better?')).toBeInTheDocument();
    expect(screen.getByText('Unable to load wellness playlists')).toBeInTheDocument();
    expect(screen.getByText('Failed to load playlists')).toBeInTheDocument();
  });

  it('should render no data state', () => {
    mockUseWellnessPlaylists.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    expect(screen.getByText('What Can Help You Feel Better?')).toBeInTheDocument();
    expect(screen.getByText('No wellness data available')).toBeInTheDocument();
    expect(screen.getByText('Connect your Spotify account to get personalized recommendations')).toBeInTheDocument();
  });

  it('should render wellness playlists with data', async () => {
    mockUseWellnessPlaylists.mockReturnValue({
      data: mockWellnessData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    await waitFor(() => {
      expect(screen.getByText('What Can Help You Feel Better?')).toBeInTheDocument();
    });

    // Check mood insight card
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText(/positive mood/i)).toBeInTheDocument();
    expect(screen.getByText(mockWellnessData.insight)).toBeInTheDocument();

    // Check playlist card
    expect(screen.getByText('Keep the Vibes High')).toBeInTheDocument();
    expect(screen.getByText('Uplifting Energy')).toBeInTheDocument();
    expect(screen.getByText('Tracks to maintain your positive momentum')).toBeInTheDocument();
    expect(screen.getByText('Perfect for maintaining your good vibes')).toBeInTheDocument();

    // Check track count
    expect(screen.getByText('2 tracks')).toBeInTheDocument();

    // Check sample tracks
    expect(screen.getByText(/Happy Song - Artist 1, Artist 2/)).toBeInTheDocument();
    expect(screen.getByText(/Uplifting Tune - Artist 3/)).toBeInTheDocument();
  });

  it('should render playlist with multiple tracks and show +more indicator', async () => {
    const playlistWithManyTracks = {
      ...mockWellnessData,
      playlists: [{
        ...mockWellnessData.playlists[0],
        tracks: [
          { id: 'track-1', name: 'Song 1', artists: ['Artist 1'], preview_url: null },
          { id: 'track-2', name: 'Song 2', artists: ['Artist 2'], preview_url: null },
          { id: 'track-3', name: 'Song 3', artists: ['Artist 3'], preview_url: null },
          { id: 'track-4', name: 'Song 4', artists: ['Artist 4'], preview_url: null },
          { id: 'track-5', name: 'Song 5', artists: ['Artist 5'], preview_url: null }
        ]
      }]
    };

    mockUseWellnessPlaylists.mockReturnValue({
      data: playlistWithManyTracks,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    await waitFor(() => {
      expect(screen.getByText('5 tracks')).toBeInTheDocument();
    });

    // Should show only first 3 tracks + more indicator
    expect(screen.getByText(/Song 1 - Artist 1/)).toBeInTheDocument();
    expect(screen.getByText(/Song 2 - Artist 2/)).toBeInTheDocument();
    expect(screen.getByText(/Song 3 - Artist 3/)).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    
    // Should not show tracks 4 and 5 individually
    expect(screen.queryByText(/Song 4 - Artist 4/)).not.toBeInTheDocument();
  });

  it('should render playlist without tracks', async () => {
    const playlistWithoutTracks = {
      ...mockWellnessData,
      playlists: [{
        ...mockWellnessData.playlists[0],
        tracks: []
      }]
    };

    mockUseWellnessPlaylists.mockReturnValue({
      data: playlistWithoutTracks,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    await waitFor(() => {
      expect(screen.getByText('Keep the Vibes High')).toBeInTheDocument();
    });

    // Should not show track count or sample tracks section
    expect(screen.queryByText(/tracks/)).not.toBeInTheDocument();
    expect(screen.queryByText('Sample tracks:')).not.toBeInTheDocument();
  });

  it('should render correct emotional states', async () => {
    // Test neutral state
    const neutralData = {
      ...mockWellnessData,
      emotionalState: {
        state: 'neutral' as const,
        averageScore: 65,
        emoji: '😌'
      }
    };

    mockUseWellnessPlaylists.mockReturnValue({
      data: neutralData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    const { rerender } = render(<MentalHealthInsights />);

    await waitFor(() => {
      expect(screen.getByText('😌')).toBeInTheDocument();
      expect(screen.getByText(/neutral mood/i)).toBeInTheDocument();
    });

    // Test low state
    const lowData = {
      ...mockWellnessData,
      emotionalState: {
        state: 'low' as const,
        averageScore: 45,
        emoji: '😔'
      }
    };

    mockUseWellnessPlaylists.mockReturnValue({
      data: lowData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    rerender(<MentalHealthInsights />);

    await waitFor(() => {
      expect(screen.getByText('😔')).toBeInTheDocument();
      expect(screen.getByText(/low mood/i)).toBeInTheDocument();
    });
  });

  it('should have accessible play button links', async () => {
    mockUseWellnessPlaylists.mockReturnValue({
      data: mockWellnessData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    await waitFor(() => {
      const playButton = screen.getByRole('link', { name: /open in spotify/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveAttribute('href', 'https://open.spotify.com/playlist/123');
      expect(playButton).toHaveAttribute('target', '_blank');
      expect(playButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('should render footer note', async () => {
    mockUseWellnessPlaylists.mockReturnValue({
      data: mockWellnessData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<MentalHealthInsights />);

    await waitFor(() => {
      expect(screen.getByText('Playlists personalized based on your recent mood patterns and musical preferences')).toBeInTheDocument();
    });
  });
}); 