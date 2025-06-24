import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import HomeLayout from '../components/screens/HomeLayout';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the hooks and components
jest.mock('../hooks/useSpotify', () => ({
  useSpotify: () => ({
    connected: true,
    user: { display_name: 'Test User', id: 'test-user' },
    loading: false,
    error: null,
    getTopTracks: jest.fn().mockResolvedValue([]),
    getTopArtists: jest.fn().mockResolvedValue([]),
    connect: jest.fn(),
  }),
}));

jest.mock('../hooks/useSpotifyDebug', () => ({
  useSpotifyDebug: () => ({
    addLog: jest.fn(),
  }),
}));

jest.mock('../hooks/useSpotifyInsights', () => ({
  useSpotifyInsights: () => ({
    insights: {
      genrePassport: { topGenres: ['rock'] },
    },
    isLoading: false,
  }),
}));

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
    return <div data-testid="last-four-weeks">Last Four Weeks</div>;
  };
});

jest.mock('../components/SpotifyDebugPanel', () => {
  return function MockSpotifyDebugPanel() {
    return <div data-testid="debug-panel">Debug Panel</div>;
  };
});

describe('HomeLayout', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  it('renders psycho-analysis teaser card and navigates on click', () => {
    render(<HomeLayout />);

    // Find the psycho-analysis teaser card
    const psychoButton = screen.getByRole('button', { name: /psycho-analyse me/i });
    expect(psychoButton).toBeInTheDocument();

    // Check the content
    expect(screen.getByText('Psycho-analyse me')).toBeInTheDocument();
    expect(screen.getByText('Deeper personality insights')).toBeInTheDocument();

    // Test click navigation
    fireEvent.click(psychoButton);
    expect(mockPush).toHaveBeenCalledWith('/psycho');
  });

  it('navigates to psycho page when Enter key is pressed on teaser card', () => {
    render(<HomeLayout />);

    const psychoButton = screen.getByRole('button', { name: /psycho-analyse me/i });
    
    // Test Enter key navigation
    fireEvent.keyDown(psychoButton, { key: 'Enter' });
    expect(mockPush).toHaveBeenCalledWith('/psycho');
  });

  it('navigates to psycho page from Quick Actions section', () => {
    render(<HomeLayout />);

    // Find the "Analyse me" button in Quick Actions (exact match to avoid the "Psycho-analyse me" button)
    const buttons = screen.getAllByRole('button');
    const quickActionButton = buttons.find(button => 
      button.textContent?.trim() === 'Analyse me'
    );
    expect(quickActionButton).toBeInTheDocument();

    // Test click navigation
    fireEvent.click(quickActionButton!);
    expect(mockPush).toHaveBeenCalledWith('/psycho');
  });
}); 