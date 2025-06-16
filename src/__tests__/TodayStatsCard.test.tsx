import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeLayout from '../components/screens/HomeLayout';
import { useSpotify } from '../hooks/useSpotify';
import { useSpotifyInsights } from '../hooks/useSpotifyInsights';
import { useSpotifyDebug } from '../hooks/useSpotifyDebug';

// Mock the hooks
jest.mock('../hooks/useSpotify');
jest.mock('../hooks/useSpotifyInsights');
jest.mock('../hooks/useSpotifyDebug');

const mockUseSpotify = useSpotify as jest.MockedFunction<typeof useSpotify>;
const mockUseSpotifyInsights = useSpotifyInsights as jest.MockedFunction<typeof useSpotifyInsights>;
const mockUseSpotifyDebug = useSpotifyDebug as jest.MockedFunction<typeof useSpotifyDebug>;

// Mock other components
jest.mock('../features/radar/HomeMusicRadar', () => {
  return function MockHomeMusicRadar() {
    return <div data-testid="music-radar">Music Radar</div>;
  };
});

jest.mock('../components/RecentPlays', () => {
  return function MockRecentPlays() {
    return <div data-testid="recent-plays">Recent Plays</div>;
  };
});

jest.mock('../components/LastFourWeeksSection', () => {
  return function MockLastFourWeeksSection() {
    return <div data-testid="last-four-weeks">Last 4 weeks</div>;
  };
});

describe('LastFourWeeksSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseSpotifyDebug.mockReturnValue({
      addLog: jest.fn()
    } as any);
  });

  it('renders Last 4 weeks section in HomeLayout', () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      user: { display_name: 'Test User' },
      loading: false,
      error: null,
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([]),
      connect: jest.fn(),
    } as any);

    mockUseSpotifyInsights.mockReturnValue({
      insights: {
        genrePassport: { topGenres: ['pop'] }
      },
      isLoading: false,
    } as any);

    render(<HomeLayout />);
    
    expect(screen.getByTestId('last-four-weeks')).toBeInTheDocument();
  });

  it('renders recently played section with only one track', () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      user: { display_name: 'Test User' },
      loading: false,
      error: null,
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([]),
      connect: jest.fn(),
    } as any);

    mockUseSpotifyInsights.mockReturnValue({
      insights: {
        genrePassport: { topGenres: ['pop'] }
      },
      isLoading: false,
    } as any);

    render(<HomeLayout />);
    
    expect(screen.getByTestId('recent-plays')).toBeInTheDocument();
    expect(screen.getByText('Recently Played')).toBeInTheDocument();
  });

  it('renders component sections when connected', () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      user: { display_name: 'Test User' },
      loading: false,
      error: null,
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([]),
      connect: jest.fn(),
    } as any);

    mockUseSpotifyInsights.mockReturnValue({
      insights: {
        genrePassport: { topGenres: ['pop'] }
      },
      isLoading: false,
    } as any);

    render(<HomeLayout />);
    
    // Check for the main component sections
    expect(screen.getByTestId('music-radar')).toBeInTheDocument();
    expect(screen.getByTestId('last-four-weeks')).toBeInTheDocument();
    expect(screen.getByTestId('recent-plays')).toBeInTheDocument();
  });
}); 