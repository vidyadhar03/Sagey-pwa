import { render, screen } from '@testing-library/react';
import { renderHook, waitFor } from '@testing-library/react';
import HomeMusicRadar from '../features/radar/HomeMusicRadar';
import { useMusicRadar } from '../hooks/useMusicRadar';
import { useRadarHype } from '../hooks/useRadarHype';
import { RadarPayload } from '../features/radar/types';
import '@testing-library/jest-dom';

// Mock the radar hook
jest.mock('../hooks/useMusicRadar');

// Mock fetch globally
global.fetch = jest.fn();

const mockRadarPayload: RadarPayload = {
  scores: {
    'Positivity': 85,
    'Energy': 72,
    'Exploration': 43,
    'Nostalgia': 28,
    'Night-Owl': 67
  },
  stats: {
    positivity: { weightedMeanValence: 0.85, percentage: 85 },
    energy: { weightedMeanEnergy: 0.72, weightedMeanTempo: 0.68 },
    exploration: { genreCount: 8, entropy: 2.1, normalizedEntropy: 43 },
    nostalgia: { medianTrackAge: 7 },
    nightOwl: { nightPlayCount: 15, totalPlayCount: 50, percentage: 30 }
  },
  suggestions: [],
  trackCount: 25,
  isDefault: false,
  trends: [],
  topGenre: 'Tamil Pop',
  sampleTrack: { title: 'Solo Dolo, Pt III', artist: 'Kid Cudi' },
  weeks: 4
};

describe('RadarNarrative', () => {
  const mockedUseMusicRadar = useMusicRadar as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main insight and tip from structured AI hype copy', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: mockRadarPayload,
      isLoading: false,
      error: null,
      ai: {
        mainInsight: '✨ You\'re absolutely radiating positivity! Powered by Tamil Pop bops like "Solo Dolo, Pt III", your vibe dominated the last 4-weeks radar.',
        tip: 'Coach tip: Try adding some upbeat pop or dance tracks to boost those good vibes!',
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        hasData: true,
        hasTip: true,
      }
    });

    render(<HomeMusicRadar />);
    
    // Check main insight (will be partially rendered due to typing animation)
    await waitFor(() => {
      expect(screen.getByText(/✨/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check tip
    expect(screen.getByText('Coach tip: Try adding some upbeat pop or dance tracks to boost those good vibes!')).toBeInTheDocument();
  });

  it('renders main insight without tip when tip is not provided', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: mockRadarPayload,
      isLoading: false,
      error: null,
      ai: {
        mainInsight: '🗺️ You\'re adventuring through musical exploration! Our friend\'s genre-hopping through Electronic and Hip-Hop is next level right now.',
        tip: undefined,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        hasData: true,
        hasTip: false,
      }
    });

    render(<HomeMusicRadar />);
    
    // Check main insight (will be partially rendered due to typing animation)
    await waitFor(() => {
      expect(screen.getByText(/🗺️/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Ensure tip is not rendered
    expect(screen.queryByText(/Coach tip:/)).not.toBeInTheDocument();
  });

  it('shows loading skeleton when AI is loading', () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: mockRadarPayload,
      isLoading: false,
      error: null,
      ai: {
        mainInsight: '',
        tip: undefined,
        isLoading: true,
        error: null,
        mutate: jest.fn(),
        hasData: false,
        hasTip: false,
      }
    });

    render(<HomeMusicRadar />);
    
    // Check for loading skeleton
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('shows fallback content when AI data is empty', async () => {
    mockedUseMusicRadar.mockReturnValue({
      payload: mockRadarPayload,
      isLoading: false,
      error: null,
      ai: {
        mainInsight: '',
        tip: undefined,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        hasData: false,
        hasTip: false,
      }
    });

    render(<HomeMusicRadar />);
    
    // Check fallback content (will be partially rendered due to typing animation)
    await waitFor(() => {
      expect(screen.getByText(/🎵/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('useRadarHype hook parses valid JSON response from API', async () => {
    const mockApiResponse = {
      copy: JSON.stringify({
        mainInsight: '🎵 You\'re absolutely crushing those Electronic vibes! Powered by tracks like "Strobe" by Deadmau5 over 4 weeks, this listener is on fire.',
        tip: 'Coach tip: Try exploring some ambient electronic to balance those high-energy tracks!'
      }),
      source: 'ai',
      type: 'radar_hype',
      cached: false
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const { result } = renderHook(() => useRadarHype(mockRadarPayload, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mainInsight).toBe('🎵 You\'re absolutely crushing those Electronic vibes! Powered by tracks like "Strobe" by Deadmau5 over 4 weeks, this listener is on fire.');
    expect(result.current.tip).toBe('Coach tip: Try exploring some ambient electronic to balance those high-energy tracks!');
    expect(result.current.hasData).toBe(true);
    expect(result.current.hasTip).toBe(true);
  });
}); 