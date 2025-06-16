import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MusicalAgeCard from '@/components/insights/cards/MusicalAgeCard';

// Mock recharts specifically for this test file
jest.mock("recharts", () => {
    const React = require("react");
    return {
      __esModule: true,
      ResponsiveContainer: (props: any) => <div className="recharts-responsive-container" style={{ width: 800, height: 500 }} {...props} />,
      BarChart: (props: any) => <svg data-testid="BarChart" {...props} />,
      Bar: (props: any) => <g data-testid="Bar" {...props} />,
      XAxis: (props: any) => <g data-testid="XAxis" {...props} />,
      YAxis: (props: any) => <g data-testid="YAxis" {...props} />,
      Cell: (props: any) => <g data-testid="Cell" {...props} />,
      Tooltip: () => null,
    };
});

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
    mutate: jest.fn(),
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
    expect(screen.getByTestId('age-years')).toBeInTheDocument();
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
    expect(screen.getByTestId('ai-copy')).toBeInTheDocument();
    expect(screen.getByTestId('ai-generated-label')).toBeInTheDocument();
  });

  it('displays refresh button in AI copy section', () => {
    render(<MusicalAgeCard />);
    
    // Should have a refresh button
    const refreshButton = screen.getByLabelText('Refresh AI insight');
    expect(refreshButton).toBeInTheDocument();
  });

  it('calls mutate with regenerate flag when refresh button is clicked', async () => {
    const mockMutate = jest.fn().mockResolvedValueOnce(undefined);
    const mockUseAIInsights = require('@/hooks/useAIInsights').useAIInsights;
    mockUseAIInsights.mockReturnValueOnce({
      copy: 'Your musical journey reveals a fascinating timeline of sonic evolution.',
      isLoading: false,
      error: null,
      source: 'mock',
      mutate: mockMutate,
      isFromAI: false,
      isFromMock: true,
      isFromFallback: false,
    });

    render(<MusicalAgeCard />);
    
    const refreshButton = screen.getByLabelText('Refresh AI insight');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ regenerate: true });
    });
  });

  it('updates UI with different text after mutate', () => {
    let callCount = 0;
    const mockMutate = jest.fn();
    const mockUseAIInsights = require('@/hooks/useAIInsights').useAIInsights;
    
    // Mock different responses for each render
    mockUseAIInsights.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          copy: 'Your musical journey reveals a fascinating timeline of sonic evolution.',
          isLoading: false,
          error: null,
          source: 'mock',
          mutate: mockMutate,
          isFromAI: false,
          isFromMock: true,
          isFromFallback: false,
        };
      } else {
        return {
          copy: 'Your sonic DNA spans decades of musical evolution and taste.',
          isLoading: false,
          error: null,
          source: 'mock',
          mutate: mockMutate,
          isFromAI: false,
          isFromMock: true,
          isFromFallback: false,
        };
      }
    });

    const { rerender } = render(<MusicalAgeCard />);
    
    // First render shows first text
    expect(screen.getByTestId('ai-copy')).toHaveTextContent('Your musical journey reveals a fascinating timeline of sonic evolution.');
    
    // Simulate refresh by re-rendering
    rerender(<MusicalAgeCard />);
    
    // Second render shows different text
    expect(screen.getByTestId('ai-copy')).toHaveTextContent('Your sonic DNA spans decades of musical evolution and taste.');
  });

  it('displays era badge when era is available', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByTestId('era-badge')).toBeInTheDocument();
  });

  it('displays "View details" CTA when not in fallback mode', () => {
    render(<MusicalAgeCard />);
    expect(screen.getByText('View details ▸')).toBeInTheDocument();
  });

  it('opens detail sheet when CTA is clicked', () => {
    render(<MusicalAgeCard />);
    
    const ctaButton = screen.getByText('View details ▸');
    fireEvent.click(ctaButton);
    
    // Should open the detail sheet
    expect(screen.getByText('Your Musical Age')).toBeInTheDocument();
    expect(screen.getByText('Musical Insights')).toBeInTheDocument();
  });

  it('closes detail sheet when close button is clicked', async () => {
    render(<MusicalAgeCard />);

    // Open the sheet
    const ctaButton = screen.getByText('View details ▸');
    fireEvent.click(ctaButton);
    
    // Verify it's open
    expect(screen.getByText('Your Musical Age')).toBeInTheDocument();

    // Close it
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    // Wait for the sheet to close completely
    await waitFor(() => {
      // Check that the sheet-specific content is gone
      expect(screen.queryByText('Your Musical Age')).not.toBeInTheDocument();
    });
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
      mutate: jest.fn(),
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
      mutate: jest.fn(),
      isFromAI: false,
      isFromMock: false,
      isFromFallback: false,
    });

    render(<MusicalAgeCard />);
    expect(screen.getByText('We\'re speechless 🤫')).toBeInTheDocument();
  });
});

describe('MusicalAgeCard Fallback State', () => {
  it('hides "View details" CTA when in fallback mode', () => {
    // Store original mock
    const originalMock = require('@/hooks/useSpotifyInsights').useSpotifyInsights;
    
    // Mock fallback state directly on the module
    require('@/hooks/useSpotifyInsights').useSpotifyInsights = jest.fn(() => ({
      insights: {
        musicalAge: {
          age: 0,
          era: 'Streaming',
          trackCount: 0,
          averageYear: 2024,
          stdDev: 0,
          oldest: { title: 'Connect Spotify', artist: 'to unlock insights', year: 2024 },
          newest: { title: 'Connect Spotify', artist: 'to unlock insights', year: 2024 },
          decadeBuckets: [],
          description: 'Connect Spotify to discover your musical age'
        },
        isDefault: true,
      },
      isLoading: false,
    }));
    
    render(<MusicalAgeCard />);
    
    // Should not show the CTA when in fallback mode
    expect(screen.queryByText('View details ▸')).not.toBeInTheDocument();
    expect(screen.getByText('Connect Spotify to unlock this insight')).toBeInTheDocument();
    
    // Restore original mock
    require('@/hooks/useSpotifyInsights').useSpotifyInsights = originalMock;
  });
}); 