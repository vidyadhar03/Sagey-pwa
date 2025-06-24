import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PsychoPage from '../app/psycho/page';
import { usePsyMetrics } from '../hooks/usePsyMetrics';
import { PsyPayload } from '../features/psycho/types';

// Mock the hooks
jest.mock('../hooks/usePsyMetrics');
jest.mock('../hooks/usePsyHype');
jest.mock('../hooks/useSpotify');

const mockUsePsyMetrics = usePsyMetrics as jest.MockedFunction<typeof usePsyMetrics>;
const mockUsePsyHype = require('../hooks/usePsyHype').usePsyHype as jest.MockedFunction<any>;
const mockUseSpotify = require('../hooks/useSpotify').useSpotify as jest.MockedFunction<any>;

const mockPayload: PsyPayload = {
  scores: {
    musical_diversity: {
      score: 0.75,
      confidence: 'high',
      formula: 'Shannon entropy of genres / log2(unique genres)'
    },
    exploration_rate: {
      score: 0.60,
      confidence: 'medium',
      formula: '(unique artists + unique tracks) / (2 * total tracks)'
    },
    temporal_consistency: {
      score: 0.85,
      confidence: 'high',
      formula: '1 / (1 + variance of listening hours / 100)'
    },
    mainstream_affinity: {
      score: 0.72,
      confidence: 'high',
      formula: '(mean track popularity + log-scaled artist followers) / 2'
    },
    emotional_volatility: {
      score: 0.45,
      confidence: 'medium',
      formula: '√( Σ(valenceTrack - μ)² / N ) normalized to 0-100'
    }
  },
  metadata: {
    tracks_analyzed: 45,
    artists_analyzed: 25,
    genres_found: 12,
    generated_at: '2023-01-01T12:00:00Z'
  }
};

describe('PsychoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseSpotify.mockReturnValue({
      getRecentTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([]),
      connected: true
    });
    
    mockUsePsyHype.mockReturnValue({
      headline: '',
      context: '',
      traits: [],
      tips: [],
      isLoading: false,
      hasValidResponse: false
    });
  });

  it('renders loading state correctly', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: null,
      loading: true,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    expect(screen.getByText('Analyzing your musical psyche...')).toBeInTheDocument();
    expect(screen.getByText('Crunching the numbers on your listening patterns')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: null,
      loading: false,
      error: 'Spotify not connected',
      isFallback: false
    });

    render(<PsychoPage />);

    expect(screen.getByText('Analysis Error')).toBeInTheDocument();
    expect(screen.getByText('Spotify not connected')).toBeInTheDocument();
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
  });

  it('renders no data state correctly', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: null,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText('Connect to Spotify to analyze your musical patterns')).toBeInTheDocument();
  });

  it('renders metrics correctly when data is available', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Check header
    expect(screen.getByText('Your Psycho-analysis (alpha)')).toBeInTheDocument();
    expect(screen.getAllByText('Based on 45 tracks, 25 artists, and 12 genres')).toHaveLength(2); // One in main page, one in hidden shareable

    // Check Musical Diversity metric
    expect(screen.getByText('Musical Diversity')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    expect(screen.getByText('Genre globe-trotter!')).toBeInTheDocument();
    expect(screen.getByText('Your playlist spans musical worlds')).toBeInTheDocument();

    // Check Exploration Rate metric
    expect(screen.getByText('Exploration Rate')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('Balanced discoverer')).toBeInTheDocument();
    expect(screen.getByText('Finding new gems while keeping favorites')).toBeInTheDocument();

    // Check Temporal Consistency metric
    expect(screen.getByText('Temporal Consistency')).toBeInTheDocument();
    expect(screen.getByText('Clock-work curator!')).toBeInTheDocument();
    expect(screen.getByText('Your music schedule is surprisingly steady')).toBeInTheDocument();

    // Check Mainstream Affinity metric
    expect(screen.getByText('Mainstream Affinity')).toBeInTheDocument();
    expect(screen.getByText('Pop culture pulse!')).toBeInTheDocument();
    expect(screen.getByText("You're riding the wave of what's trending")).toBeInTheDocument();

    // Check Emotional Volatility metric
    expect(screen.getByText('Emotional Volatility')).toBeInTheDocument();
    expect(screen.getByText('45.0%')).toBeInTheDocument();
    expect(screen.getByText('Emotional range rider')).toBeInTheDocument();
    expect(screen.getByText('Your playlists paint different feelings')).toBeInTheDocument();
  });

  it('displays confidence badges with correct styling', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Check for confidence badges
    const highConfidenceBadges = screen.getAllByText('high');
    const mediumConfidenceBadges = screen.getAllByText('medium');

    expect(highConfidenceBadges).toHaveLength(3); // Musical Diversity, Temporal Consistency, Mainstream Affinity
    expect(mediumConfidenceBadges).toHaveLength(2); // Exploration Rate, Emotional Volatility

    // Check that badges have appropriate styling classes  
    expect(highConfidenceBadges[0].parentElement).toHaveClass('text-green-400');
    expect(mediumConfidenceBadges[0].parentElement).toHaveClass('text-yellow-400');
  });

  it('displays "Need more data" for insufficient confidence metrics', () => {
    const payloadWithInsufficientData: PsyPayload = {
      ...mockPayload,
      scores: {
        ...mockPayload.scores,
        emotional_volatility: {
          score: 0,
          confidence: 'insufficient',
          formula: '√( Σ(valenceTrack - μ)² / N ) normalized to 0-100'
        }
      }
    };

    mockUsePsyMetrics.mockReturnValue({
      payload: payloadWithInsufficientData,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Should show "Need more data" instead of percentage for insufficient confidence
    expect(screen.getByText('Need more data')).toBeInTheDocument();
    expect(screen.getByText('insufficient')).toBeInTheDocument();
    
    // Should not show a percentage for this metric
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument();
  });

  it('displays enhanced insufficient state with tracking data for emotional volatility', () => {
    const payloadWithTrackingData: PsyPayload = {
      ...mockPayload,
      scores: {
        ...mockPayload.scores,
        emotional_volatility: {
          score: 0,
          confidence: 'insufficient',
          formula: '√( Σ(valenceTrack - μ)² / N ) normalized to 0-100',
          mappedTrackCount: 6,
          minRequired: 10
        }
      }
    };

    mockUsePsyMetrics.mockReturnValue({
      payload: payloadWithTrackingData,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Should show enhanced insufficient state
    expect(screen.getByText('Need more data')).toBeInTheDocument();
    expect(screen.getByText('Only 6 of 10 genre-tagged tracks so far')).toBeInTheDocument();
    expect(screen.getByText('Play a few new songs on Spotify and refresh 🔄')).toBeInTheDocument();
    expect(screen.getByText('insufficient')).toBeInTheDocument();
  });

  it('does not show tracking data when emotional volatility has sufficient confidence', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Should not show tracking data when confidence is sufficient
    expect(screen.queryByText(/genre-tagged tracks so far/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Play a few new songs/)).not.toBeInTheDocument();
    
    // Should show normal percentage instead
    expect(screen.getByText('45.0%')).toBeInTheDocument();
  });

  it('displays dynamic headlines and subtitles based on scores', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Check for dynamic copy based on scores 
    expect(screen.getByText('Genre globe-trotter!')).toBeInTheDocument(); // Musical Diversity 75% -> high (0.75)
    expect(screen.getByText('Balanced discoverer')).toBeInTheDocument(); // Exploration Rate 60% -> medium (0.60)
    expect(screen.getByText('Clock-work curator!')).toBeInTheDocument(); // Temporal Consistency 85% -> high (0.85)
    expect(screen.getByText('Pop culture pulse!')).toBeInTheDocument(); // Mainstream Affinity 72% -> high (0.72)
    expect(screen.getByText('Emotional range rider')).toBeInTheDocument(); // Emotional Volatility 45% -> medium (0.45)
  });

  it('shows confidence badge toast on click', async () => {
    const user = userEvent.setup();
    
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    // Find a confidence badge and click it
    const highConfidenceBadge = screen.getAllByText(/high/)[0]; // Get first high badge
    
    await user.click(highConfidenceBadge);

    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByText('High Confidence')).toBeInTheDocument();
      expect(screen.getByText(/Plenty of data for reliable analysis/)).toBeInTheDocument();
    });
  });

  it('displays methodology link', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    render(<PsychoPage />);

    const methodologyLink = screen.getByText('How we calculate this →');
    expect(methodologyLink).toBeInTheDocument();
    expect(methodologyLink.closest('a')).toHaveAttribute('href', '/psycho/methodology');
  });

  it('displays AI personality insight when available', async () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    mockUsePsyHype.mockReturnValue({
      headline: '🎵 Musical Maverick Detected!',
      context: 'Your diverse taste spans genres like a true explorer.',
      traits: ['Creative Explorer', 'Genre Chameleon'],
      tips: ['Try exploring ambient music for relaxation'],
      isLoading: false,
      hasValidResponse: true
    });

    render(<PsychoPage />);

    await waitFor(() => {
      expect(screen.getAllByText('🎵 Musical Maverick Detected!')).toHaveLength(2); // One in main page, one in hidden shareable
      expect(screen.getAllByText('Your diverse taste spans genres like a true explorer.')).toHaveLength(2);
      expect(screen.getAllByText('Creative Explorer')).toHaveLength(2);
      expect(screen.getAllByText('Genre Chameleon')).toHaveLength(2);
      expect(screen.getByText('Coach Tips')).toBeInTheDocument(); // Only shown in main page
      expect(screen.getByText('Try exploring ambient music for relaxation')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton for AI insight when loading', () => {
    mockUsePsyMetrics.mockReturnValue({
      payload: mockPayload,
      loading: false,
      error: null,
      isFallback: false
    });

    mockUsePsyHype.mockReturnValue({
      headline: '',
      context: '',
      traits: [],
      tips: [],
      isLoading: true,
      hasValidResponse: false
    });

    render(<PsychoPage />);

    // Check for skeleton animation
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
}); 