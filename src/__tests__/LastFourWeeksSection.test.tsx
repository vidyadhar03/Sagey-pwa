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
  calculateLast4WeeksStats: jest.fn(),
  formatMinutes: jest.fn((minutes) => {
    if (minutes === 0) return '0 minutes';
    if (minutes === 1) return '1 minute';
    return `${Math.round(minutes)} minutes`;
  })
}));

// Import the actual utility functions for testing
import { calculateLast4WeeksStats } from '../utils';

describe('LastFourWeeksSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation
    (calculateLast4WeeksStats as jest.Mock).mockReturnValue({
      minutesThis: 142,
      minutesPrev: 120,
      topGenre: 'Hip-Hop',
      topAlbum: {
        name: '1989',
        artist: 'Taylor Swift',
        image: 'https://example.com/1989.jpg'
      }
    });
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

  it('calculates and displays percentage correctly when prevMinutes is 100 and minutes is 120', async () => {
    // Mock the calculateLast4WeeksStats to return specific values
    (calculateLast4WeeksStats as jest.Mock).mockReturnValue({
      minutesThis: 120,
      minutesPrev: 100,
      topGenre: 'Hip-Hop',
      topAlbum: {
        name: '1989',
        artist: 'Taylor Swift',
        image: 'https://example.com/1989.jpg'
      }
    });

    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockResolvedValue([]),
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([])
    } as any);

    render(<LastFourWeeksSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Listening time')).toBeInTheDocument();
    });

    // Should show +20% calculation: ((120 - 100) / 100) * 100 = 20
    expect(screen.getByText('+20% vs previous 4 weeks')).toBeInTheDocument();
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

    // Use the default mock value of 142 minutes
    expect(screen.getByText('142 minutes')).toBeInTheDocument();
  });

  it('displays top genre and album cards as siblings (side-by-side layout)', async () => {
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

    // Find the container that holds both cards by looking for the div with the grid classes
    const container = document.querySelector('.flex.gap-4.sm\\:grid.sm\\:grid-cols-2');
    expect(container).toBeInTheDocument();
    
    // The container should have the correct classes
    expect(container).toHaveClass('flex', 'gap-4', 'sm:grid', 'sm:grid-cols-2');

    expect(screen.getByText('hip-hop')).toBeInTheDocument();
    expect(screen.getByText('1989')).toBeInTheDocument();
    expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
  });

  it('shows em-dash when prevMinutes is 0', async () => {
    // Mock the calculateLast4WeeksStats to return zero previous minutes
    (calculateLast4WeeksStats as jest.Mock).mockReturnValue({
      minutesThis: 120,
      minutesPrev: 0,
      topGenre: 'Hip-Hop',
      topAlbum: null
    });

    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockResolvedValue([]),
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([])
    } as any);

    render(<LastFourWeeksSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Listening time')).toBeInTheDocument();
      // Wait for the component to finish loading and display actual content
      expect(screen.getByText('120 minutes')).toBeInTheDocument();
    });

    // Should show em-dash when no previous data
    expect(screen.getByText('—')).toBeInTheDocument();
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
    // Make calculateLast4WeeksStats throw an error
    (calculateLast4WeeksStats as jest.Mock).mockImplementation(() => {
      throw new Error('Calculation failed');
    });
    
    mockUseSpotify.mockReturnValue({
      connected: true,
      getRecentTracks: jest.fn().mockResolvedValue([]),
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([])
    } as any);

    render(<LastFourWeeksSection />);
    
    await waitFor(() => {
      // Look for error messages - there will be multiple, so get all of them
      const errorMessages = screen.getAllByText('Failed to load 4-week stats');
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
}); 