import { render, screen } from '@testing-library/react';
import NightOwlCard from '@/components/insights/cards/NightOwlCard';

// Mock the useSpotifyInsights hook
jest.mock('@/hooks/useSpotifyInsights', () => ({
  useSpotifyInsights: jest.fn(() => ({
    insights: {
      nightOwlPattern: {
        hourlyData: [2, 1, 0, 0, 1, 3, 5, 8, 12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 45, 42, 38, 32, 25, 15],
        peakHour: 17,
        isNightOwl: false,
        score: 72,
        histogram: [2, 1, 0, 0, 1, 3, 5, 8, 12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 45, 42, 38, 32, 25, 15]
      },
      isDefault: false,
    },
    isLoading: false,
    isFallback: false,
  })),
}));

// Mock the useAIInsights hook
jest.mock('@/hooks/useAIInsights', () => ({
  useAIInsights: jest.fn(() => ({
    copy: 'Early bird musical energy! 5PM is when your playlist truly comes alive 🎶',
    isLoading: false,
    error: null,
    source: 'mock',
    isFromAI: false,
    isFromMock: true,
    isFromFallback: false,
  })),
}));

describe('NightOwlCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders night owl card with pattern type', () => {
    render(<NightOwlCard />);
    
    expect(screen.getByText('Night Owl Pattern')).toBeInTheDocument();
    expect(screen.getByText('Early Bird')).toBeInTheDocument();
    expect(screen.getByText('Peak listening at 5PM')).toBeInTheDocument();
  });

  it('displays AI generated copy with sparkle badge', () => {
    render(<NightOwlCard />);
    
    expect(screen.getByText('Early bird musical energy! 5PM is when your playlist truly comes alive 🎶')).toBeInTheDocument();
    expect(screen.getByText('✨ AI Generated')).toBeInTheDocument();
  });

  it('displays early bird score', () => {
    render(<NightOwlCard />);
    
    expect(screen.getByText('Early Bird Score')).toBeInTheDocument();
    expect(screen.getByText('72/100')).toBeInTheDocument();
  });

  it('shows night owl pattern when user is night owl', () => {
    const mockUseSpotifyInsights = require('@/hooks/useSpotifyInsights').useSpotifyInsights;
    mockUseSpotifyInsights.mockReturnValueOnce({
      insights: {
        nightOwlPattern: {
          hourlyData: [15, 12, 8, 5, 2, 1, 3, 5, 8, 12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 45, 42, 38, 32, 25],
          peakHour: 23,
          isNightOwl: true,
          score: 85,
          histogram: [15, 12, 8, 5, 2, 1, 3, 5, 8, 12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 45, 42, 38, 32, 25]
        },
        isDefault: false,
      },
      isLoading: false,
      isFallback: false,
    });

    render(<NightOwlCard />);
    
    expect(screen.getByText('Night Owl')).toBeInTheDocument();
    expect(screen.getByText('Peak listening at 11PM')).toBeInTheDocument();
    expect(screen.getByText('Night Owl Score')).toBeInTheDocument();
  });

  it('shows loading state for AI', () => {
    const mockUseAIInsights = require('@/hooks/useAIInsights').useAIInsights;
    mockUseAIInsights.mockReturnValueOnce({
      copy: '',
      isLoading: true,
      error: null,
      source: 'unknown',
      isFromAI: false,
      isFromMock: false,
      isFromFallback: false,
    });

    render(<NightOwlCard />);
    
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error state for AI', () => {
    const mockUseAIInsights = require('@/hooks/useAIInsights').useAIInsights;
    mockUseAIInsights.mockReturnValueOnce({
      copy: '',
      isLoading: false,
      error: 'API Error',
      source: 'unknown',
      isFromAI: false,
      isFromMock: false,
      isFromFallback: false,
    });

    render(<NightOwlCard />);
    
    expect(screen.getByText("We're speechless 🤫")).toBeInTheDocument();
  });

  it('hides AI copy in fallback mode', () => {
    const mockUseSpotifyInsights = require('@/hooks/useSpotifyInsights').useSpotifyInsights;
    mockUseSpotifyInsights.mockReturnValueOnce({
      insights: {
        nightOwlPattern: {
          hourlyData: new Array(24).fill(0),
          peakHour: 12,
          isNightOwl: false,
          score: 0,
          histogram: new Array(24).fill(0)
        },
        isDefault: true,
      },
      isLoading: false,
      isFallback: true,
    });

    render(<NightOwlCard />);
    
    expect(screen.queryByText('✨ AI Generated')).not.toBeInTheDocument();
    expect(screen.getByText('Connect Spotify to unlock this insight')).toBeInTheDocument();
  });
}); 