import { render, screen, fireEvent } from '@testing-library/react';
import HomeMusicRadar from './HomeMusicRadar';
import { useMusicRadar } from '../../hooks/useMusicRadar';
import type { RadarPayload } from './types';
import type { useAIInsights } from '../../hooks/useAIInsights';

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
      Radar: () => <div />,
      RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
      PolarGrid: () => <div />,
      PolarAngleAxis: () => <div />,
      PolarRadiusAxis: () => <div />,
      ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div className="recharts-responsive-container">{children}</div>,
    };
});

describe('HomeMusicRadar', () => {
  const mockedUseMusicRadar = useMusicRadar as jest.Mock;

  it('renders skeleton when loading', () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: {},
      isLoading: true,
      ai: { isLoading: true },
      error: null,
    });

    render(<HomeMusicRadar />);
    expect(screen.getByRole('alert', { name: /loading/i })).toBeInTheDocument();
  });

  it('shows AI text and CTA after loading', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Your radar is perfectly balanced!', isLoading: false },
      error: null,
    });

    render(<HomeMusicRadar />);
    
    expect(screen.getByText('Your radar is perfectly balanced!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('opens the detail sheet dialog when CTA is clicked', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: { scores: { 'Positivity': 50, 'Energy': 50, 'Exploration': 50, 'Nostalgia': 50, 'Night-Owl': 50 }, suggestions: [] },
      isLoading: false,
      ai: { copy: 'Balanced!', isLoading: false },
      error: null,
    });

    render(<HomeMusicRadar />);
    
    const ctaButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(ctaButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveStyle({ display: 'block' });
  });
}); 