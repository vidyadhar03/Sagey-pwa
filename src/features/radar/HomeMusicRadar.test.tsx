import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomeMusicRadar from './HomeMusicRadar';
import { useMusicRadar } from '../../hooks/useMusicRadar';
import type { RadarPayload } from './types';
import type { useAIInsights } from '../../hooks/useAIInsights';
import React from 'react';
import '@testing-library/jest-dom';

// Mock child components and hooks
jest.mock('../../hooks/useMusicRadar');
jest.mock('./MusicRadarDetailSheet', () => ({
  MusicRadarDetailSheet: ({ open }: { open: boolean }) => (
    <div role="dialog" style={{ display: open ? 'block' : 'none' }}>
      Mock Detail Sheet
    </div>
  ),
}));
jest.mock('./RadarSkeleton', () => () => <div role="alert" aria-label="loading">Skeleton</div>);
jest.mock('framer-motion', () => ({
    motion: {
      div: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => <div {...props}>{children}</div>
    }
}));

jest.mock('recharts', () => {
    return {
      Radar: (props: any) => <div data-testid="radar-fill" {...props} />,
      RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
      PolarGrid: (props: any) => <div data-testid="polar-grid" {...props} />,
      PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
      PolarRadiusAxis: () => <div />,
      ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div className="recharts-responsive-container">{children}</div>,
    };
});

describe('HomeMusicRadar', () => {
  const mockedUseMusicRadar = useMusicRadar as jest.Mock;
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders skeleton when loading', () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: {},
      isLoading: true,
      ai: { isLoading: true, mutate: mockMutate },
      error: null,
    });

    render(<HomeMusicRadar />);
    expect(screen.getByRole('alert', { name: /loading/i })).toBeInTheDocument();
  });

  it('shows info icon and chart after loading', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Your radar is perfectly balanced!', isLoading: false, mutate: mockMutate },
      error: null,
    });

    render(<HomeMusicRadar />);

    expect(screen.getByRole('button', { name: /view radar details/i })).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('opens the detail sheet dialog when CTA is clicked', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Balanced!', isLoading: false, mutate: mockMutate },
      error: null,
    });

    render(<HomeMusicRadar />);
    
    const infoButton = screen.getByRole('button', { name: /view radar details/i });
    fireEvent.click(infoButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveStyle({ display: 'block' });
  });



  it('renders radar chart with polygon and grid lines', () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: {
        scores: {
          'Positivity': 70,
          'Energy': 60,
          'Exploration': 40,
          'Nostalgia': 30,
          'Night-Owl': 50
        },
        stats: {
          positivity: { weightedMeanValence: 0.7, percentage: 70 },
          energy: { weightedMeanEnergy: 0.6, weightedMeanTempo: 0.5 },
          exploration: { genreCount: 5, entropy: 1.2, normalizedEntropy: 0.6 },
          nostalgia: { medianTrackAge: 5 },
          nightOwl: { nightPlayCount: 10, totalPlayCount: 50, percentage: 20 }
        },
        suggestions: [],
        trackCount: 25,
        isDefault: false,
        trends: []
      },
      ai: {
        copy: 'Your music taste is wonderfully diverse!',
        source: 'ai',
        isLoading: false,
        error: null,
        mutate: mockMutate,
        isFromAI: true,
        isFromMock: false,
        isFromFallback: false,
      },
      isLoading: false,
      error: null,
    });

    render(<HomeMusicRadar />);
    
    // Check that radar components are present
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('radar-fill')).toBeInTheDocument();
    expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
    
    // Check that the grid has proper styling
    const polarGrid = screen.getByTestId('polar-grid');
    expect(polarGrid).toHaveAttribute('stroke', '#ffffff14');
    expect(polarGrid).toHaveAttribute('gridtype', 'polygon');
    
    // Check that the radar polygon has green styling  
    const radarFill = screen.getByTestId('radar-fill');
    expect(radarFill).toHaveAttribute('stroke', '#22c55e');
    expect(radarFill).toHaveAttribute('fill', '#22c55e');
  });


}); 