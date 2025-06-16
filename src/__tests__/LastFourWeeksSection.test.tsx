import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LastFourWeeksSection from '../components/LastFourWeeksSection';
import { useSpotify } from '../hooks/useSpotify';

// Mock the useSpotify hook
jest.mock('../hooks/useSpotify');
const mockUseSpotify = useSpotify as jest.MockedFunction<typeof useSpotify>;

// Mock the utility functions
jest.mock('../utils', () => ({
  calculateLast4WeeksStats: jest.fn((tracks) => ({
    minutesThis: 142,
    minutesPrev: 120,
    percentageChange: '+18 %',
    topGenre: 'Hip-Hop',
    topAlbum: {
      name: '1989',
      artist: 'Taylor Swift',
      image: 'https://example.com/1989.jpg'
    }
  })),
  formatMinutes: jest.fn((minutes) => {
    if (minutes === 0) return '0 minutes';
    if (minutes === 1) return '1 minute';
    return `${Math.round(minutes)} minutes`;
  })
}));

describe('LastFourWeeksSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section header correctly', async () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockResolvedValue([]),
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([])
    } as any);

    render(<LastFourWeeksSection />);
    
    expect(screen.getByText('Last 4 weeks')).toBeInTheDocument();
  });

  it('displays listening time card with calculated data', async () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockResolvedValue([
        {
          track: { id: '1', duration_ms: 240000 },
          played_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]),
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([])
    } as any);

    render(<LastFourWeeksSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Listening time')).toBeInTheDocument();
    });

    expect(screen.getByText('142 minutes')).toBeInTheDocument();
    expect(screen.getByText('+18 % vs previous 4 weeks')).toBeInTheDocument();
  });

  it('displays top genre and album correctly', async () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockResolvedValue([]),
      getTopTracks: jest.fn().mockResolvedValue([
        {
          id: '1',
          album: {
            name: '1989',
            images: [{ url: 'https://example.com/1989.jpg' }]
          },
          artists: [{ name: 'Taylor Swift' }]
        }
      ]),
      getTopArtists: jest.fn().mockResolvedValue([
        {
          id: '1',
          name: 'Artist 1',
          genres: ['hip-hop', 'rap']
        }
      ])
    } as any);

    render(<LastFourWeeksSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Top Genre')).toBeInTheDocument();
      expect(screen.getByText('Top Album')).toBeInTheDocument();
    });

    expect(screen.getByText('hip-hop')).toBeInTheDocument();
    expect(screen.getByText('1989')).toBeInTheDocument();
    expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
      getTopTracks: jest.fn().mockReturnValue(new Promise(() => {})),
      getTopArtists: jest.fn().mockReturnValue(new Promise(() => {}))
    } as any);

    render(<LastFourWeeksSection />);
    
    // Check for loading skeletons by class
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('does not render when not connected', () => {
    mockUseSpotify.mockReturnValue({
      connected: false,
      getRecentTracks: jest.fn(),
      getTopTracks: jest.fn(),
      getTopArtists: jest.fn()
    } as any);

    const { container } = render(<LastFourWeeksSection />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles errors gracefully', async () => {
    // Make all API calls fail
    const rejectedPromise = Promise.reject(new Error('API Error'));
    
    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockReturnValue(rejectedPromise),
      getTopTracks: jest.fn().mockReturnValue(rejectedPromise),
      getTopArtists: jest.fn().mockReturnValue(rejectedPromise)
    } as any);

    render(<LastFourWeeksSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load 4-week stats')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 