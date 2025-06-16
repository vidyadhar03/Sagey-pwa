import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeThisMonth from '../components/HomeThisMonth';
import { useSpotify } from '../hooks/useSpotify';

// Mock the useSpotify hook
jest.mock('../hooks/useSpotify');
const mockUseSpotify = useSpotify as jest.MockedFunction<typeof useSpotify>;

// Mock the utility function
jest.mock('../utils', () => ({
  getTrackImage: jest.fn((track) => track?.image_url || null)
}));

describe('HomeThisMonth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      getTopTracks: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
      getTopArtists: jest.fn().mockReturnValue(new Promise(() => {})),
    } as any);

    render(<HomeThisMonth />);
    
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Top Genre')).toBeInTheDocument();
    expect(screen.getByText('Top Album')).toBeInTheDocument();
  });

  it('displays genre and album names from mock data', async () => {
    const mockTracks = [
      {
        id: '1',
        album: { name: 'Test Album' },
        artist: 'Test Artist',
        image_url: 'test-image.jpg'
      }
    ];
    
    const mockArtists = [
      {
        id: '1',
        name: 'Test Artist',
        genres: ['electronic', 'pop']
      }
    ];

    mockUseSpotify.mockReturnValue({
      connected: true,
      getTopTracks: jest.fn().mockResolvedValue(mockTracks),
      getTopArtists: jest.fn().mockResolvedValue(mockArtists),
    } as any);

    render(<HomeThisMonth />);
    
    // Wait for the async data to load
    await screen.findByText('electronic');
    await screen.findByText('Test Album');
  });

  it('does not render when not connected', () => {
    mockUseSpotify.mockReturnValue({
      connected: false,
      getTopTracks: jest.fn(),
      getTopArtists: jest.fn(),
    } as any);

    const { container } = render(<HomeThisMonth />);
    expect(container.firstChild).toBeNull();
  });

  it('handles empty data gracefully', async () => {
    mockUseSpotify.mockReturnValue({
      connected: true,
      getTopTracks: jest.fn().mockResolvedValue([]),
      getTopArtists: jest.fn().mockResolvedValue([]),
    } as any);

    render(<HomeThisMonth />);
    
    await screen.findByText('Mixed');
    await screen.findByText('No album data');
  });
}); 