import { render, screen } from '@testing-library/react';
import MusicalAgeCard from '@/components/insights/cards/MusicalAgeCard';

// Mock the useSpotifyInsights hook
jest.mock('@/hooks/useSpotifyInsights', () => ({
  useSpotifyInsights: () => ({
    insights: {
      musicalAge: {
        age: 13,
        era: 'Digital',
        trackCount: 10,
        averageYear: 2012,
        stdDev: 8,
        oldest: { title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975 },
        newest: { title: 'Blinding Lights', artist: 'The Weeknd', year: 2020 },
        decadeBuckets: [
          { decade: 1970, weight: 5.2 },
          { decade: 2010, weight: 25.3 }
        ],
        description: 'Your music taste spans 13 years of musical history',
      },
      isDefault: false,
    },
    isLoading: false,
  }),
}));

// Mock the useAIInsights hook
jest.mock('@/hooks/useAIInsights', () => ({
  useAIInsights: jest.fn(() => ({
    copy: 'Your musical journey reveals a fascinating timeline of sonic evolution.',
    isLoading: false,
    error: null,
    source: 'mock',
    isFromAI: false,
    isFromMock: true,
    isFromFallback: false,
  })),
}));

describe('MusicalAgeCard', () => {
  it('renders without crashing', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('Musical Age')).toBeInTheDocument();
  });

  it('displays the musical age number starting from 0', () => {
    render(<MusicalAgeCard />);
    // Animation starts from 0, should show initial state
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('years')).toBeInTheDocument();
  });

  it('displays the average year', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('2012')).toBeInTheDocument();
  });

  it('shows description text', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('Your music taste spans 13 years of musical history')).toBeInTheDocument();
  });

  it('displays release year information', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('Avg. Release Year')).toBeInTheDocument();
    expect(screen.getByText('2012')).toBeInTheDocument();
  });

  it('displays AI generated copy when available', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('Your musical journey reveals a fascinating timeline of sonic evolution.')).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
    expect(screen.getByText('AI Generated')).toBeInTheDocument();
  });

  it('displays era badge when era is available', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('Digital Era')).toBeInTheDocument();
  });
});

describe('MusicalAgeCard AI States', () => {
  it('shows loading spinner when AI is loading', () => {
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

    render(<MusicalAgeCard />);
    expect(screen.getByText('Generating insight...')).toBeInTheDocument();
  });

  it('shows fallback message when AI has error', () => {
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

    render(<MusicalAgeCard />);
    expect(screen.getByText('We\'re speechless 🤫')).toBeInTheDocument();
  });
});

describe('MusicalAgeCard Loading State', () => {
  beforeEach(() => {
    // Mock loading state
    jest.doMock('@/hooks/useSpotifyInsights', () => ({
      useSpotifyInsights: () => ({
        insights: null,
        isLoading: true,
        isFallback: false,
      }),
    }));
  });

  afterEach(() => {
    jest.dontMock('@/hooks/useSpotifyInsights');
  });

  it('shows loading skeleton when data is loading', () => {
    // Re-require the component to get the new mock  
    const LoadingMusicalAgeCard = require('@/components/insights/cards/MusicalAgeCard').default;
    
    render(<LoadingMusicalAgeCard />);
    
    // Should render without crashing during loading
    expect(screen.getByText('Musical Age')).toBeInTheDocument();
  });
}); 