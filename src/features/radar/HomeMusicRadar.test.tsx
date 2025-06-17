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

  it('shows AI text and CTA after loading', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Your radar is perfectly balanced!', isLoading: false, mutate: mockMutate },
      error: null,
    });

    render(<HomeMusicRadar />);
    
    screen.debug();

    expect(screen.getByText('Your radar is perfectly balanced!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
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
    
    const ctaButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(ctaButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveStyle({ display: 'block' });
  });

  it('shows refresh button and calls mutate when clicked', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Balanced!', isLoading: false, mutate: mockMutate },
      error: null,
    });

    render(<HomeMusicRadar />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh ai insights/i });
    expect(refreshButton).toBeInTheDocument();
    
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ regenerate: true });
    });
  });

  it('enforces refresh cooldown', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Balanced!', isLoading: false, mutate: mockMutate },
      error: null,
    });

    render(<HomeMusicRadar />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh ai insights/i });
    
    // First click should work
    fireEvent.click(refreshButton);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    
    // Second immediate click should be blocked
    fireEvent.click(refreshButton);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    
    // After cooldown, should work again - advance timers and re-render
    jest.advanceTimersByTime(15001); // Advance past 15 second cooldown
    
    await waitFor(() => {
      fireEvent.click(refreshButton);
      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
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
    
    // Check that the radar polygon has Spotify green styling
    const radarFill = screen.getByTestId('radar-fill');
    expect(radarFill).toHaveAttribute('stroke', '#1DB954');
    expect(radarFill).toHaveAttribute('fill', '#1DB95455');
  });

  it('shows AI warming up message on 400 error', () => {
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
        ...{
          copy: 'Your music taste is wonderfully diverse!',
          source: 'ai',
          isLoading: false,
          error: 'HTTP 400: Bad Request',
          mutate: mockMutate,
          isFromAI: true,
          isFromMock: false,
          isFromFallback: false,
        },
        copy: '',
      },
      isLoading: false,
      error: null,
    });

    render(<HomeMusicRadar />);
    
    expect(screen.getByText('AI is warming up, please refresh in a few seconds.')).toBeInTheDocument();
  });

  it('shows AI copy when available', () => {
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
    
    expect(screen.getByText('Your music taste is wonderfully diverse!')).toBeInTheDocument();
  });
}); 