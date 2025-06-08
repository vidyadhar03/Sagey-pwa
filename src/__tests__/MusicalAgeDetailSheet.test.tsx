import { render, screen, fireEvent } from '@testing-library/react';
import MusicalAgeDetailSheet from '@/components/insights/detail/MusicalAgeDetailSheet';
import { MusicalAgePayload } from '@/utils/insightSelectors';

// Mock the useAIInsights hook
jest.mock('@/hooks/useAIInsights', () => ({
  useAIInsights: jest.fn(() => ({
    copy: 'Your musical journey spans decades of sonic evolution, from Queen to The Weeknd.',
    isLoading: false,
    error: null,
    source: 'mock',
    isFromAI: false,
    isFromMock: true,
    isFromFallback: false,
  })),
}));

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockPayload: MusicalAgePayload = {
  age: 15,
  era: 'Digital',
  trackCount: 150,
  averageYear: 2009,
  stdDev: 8,
  oldest: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975
  },
  newest: {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    year: 2020
  },
  decadeBuckets: [
    { decade: 1970, weight: 5.2 },
    { decade: 2000, weight: 15.8 },
    { decade: 2010, weight: 25.3 }
  ],
  description: 'Your music taste spans 15 years of musical history'
};

describe('MusicalAgeDetailSheet', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when open with all content sections', () => {
    render(
      <MusicalAgeDetailSheet
        payload={mockPayload}
        open={true}
        onClose={mockOnClose}
      />
    );

    // Hero section
    expect(screen.getByText('Your Musical Age')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('years')).toBeInTheDocument();
    expect(screen.getByText('Digital Era')).toBeInTheDocument();
    expect(screen.getByText('±8 yr confidence')).toBeInTheDocument();

    // Stats row
    expect(screen.getByText('Based on 150 tracks')).toBeInTheDocument();
    expect(screen.getByText('Avg. year 2009')).toBeInTheDocument();
    expect(screen.getByText('±8 yrs')).toBeInTheDocument();

    // Oldest/Newest tracks
    expect(screen.getByText('Oldest Track')).toBeInTheDocument();
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('Queen')).toBeInTheDocument();
    expect(screen.getByText('1975')).toBeInTheDocument();

    expect(screen.getByText('Newest Track')).toBeInTheDocument();
    expect(screen.getByText('Blinding Lights')).toBeInTheDocument();
    expect(screen.getByText('The Weeknd')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();

    // Chart section
    expect(screen.getByText('Music Across Decades')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();

    // AI insights
    expect(screen.getByText('Musical Insights')).toBeInTheDocument();
    expect(screen.getByText('Your musical journey spans decades of sonic evolution, from Queen to The Weeknd.')).toBeInTheDocument();
    expect(screen.getByText('AI Generated')).toBeInTheDocument();

    // Share button
    expect(screen.getByText('Share Musical Age')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MusicalAgeDetailSheet
        payload={mockPayload}
        open={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Your Musical Age')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    // Clear any previous calls
    mockOnClose.mockClear();
    
    render(
      <MusicalAgeDetailSheet
        payload={mockPayload}
        open={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    // Should be called at least once (headless UI might call multiple times due to transitions)
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles AI loading state', () => {
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

    render(
      <MusicalAgeDetailSheet
        payload={mockPayload}
        open={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Generating insights...')).toBeInTheDocument();
  });

  it('handles AI error state', () => {
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

    render(
      <MusicalAgeDetailSheet
        payload={mockPayload}
        open={true}
        onClose={mockOnClose}
      />
    );

    // Should show fallback description when AI fails
    expect(screen.getByText('Your music taste spans 15 years of musical history')).toBeInTheDocument();
  });

  it('handles payload without stdDev', () => {
    const payloadWithoutStdDev = {
      ...mockPayload,
      stdDev: 0
    };

    render(
      <MusicalAgeDetailSheet
        payload={payloadWithoutStdDev}
        open={true}
        onClose={mockOnClose}
      />
    );

    // Should not show confidence interval when stdDev is 0
    expect(screen.queryByText('±0 yr confidence')).not.toBeInTheDocument();
    expect(screen.queryByText('±0 yrs')).not.toBeInTheDocument();
  });

  it('handles empty decade buckets', () => {
    const payloadWithoutBuckets = {
      ...mockPayload,
      decadeBuckets: []
    };

    render(
      <MusicalAgeDetailSheet
        payload={payloadWithoutBuckets}
        open={true}
        onClose={mockOnClose}
      />
    );

    // Chart section should not render when no data
    expect(screen.queryByText('Music Across Decades')).not.toBeInTheDocument();
  });
}); 