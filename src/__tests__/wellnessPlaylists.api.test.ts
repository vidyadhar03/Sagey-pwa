import { NextRequest } from 'next/server';
import { POST } from '../app/api/spotify/wellness-playlists/route';

// Mock the dependencies
jest.mock('../../../../lib/openaiClient', () => ({
  getOpenAIClient: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{ message: { content: 'Your mood has been positive this week - let these uplifting tracks keep your energy flowing' } }]
        }))
      }
    }
  }))
}));

// Mock fetch for Spotify API calls
global.fetch = jest.fn();

describe('/api/spotify/wellness-playlists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  const mockValidPayload = {
    moodData: [
      { date: '2024-01-01', moodScore: 75 },
      { date: '2024-01-02', moodScore: 80 },
      { date: '2024-01-03', moodScore: 70 }
    ],
    personalityType: 'Explorer',
    topGenres: ['indie', 'rock'],
    topArtists: [{ id: 'artist1', name: 'Test Artist' }],
    recentTracks: [{ id: 'track1', name: 'Test Track' }]
  };

  const mockSpotifyResponse = {
    tracks: [
      {
        id: 'track1',
        name: 'Happy Song',
        artists: [{ name: 'Artist 1' }],
        preview_url: 'https://example.com/preview1.mp3'
      },
      {
        id: 'track2',
        name: 'Uplifting Tune',
        artists: [{ name: 'Artist 2' }],
        preview_url: null
      }
    ]
  };

  it('should generate wellness playlists for positive mood state', async () => {
    // Mock Spotify API response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSpotifyResponse)
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(mockValidPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('emotionalState');
    expect(data).toHaveProperty('playlists');
    expect(data).toHaveProperty('insight');

    expect(data.emotionalState.state).toBe('positive');
    expect(data.emotionalState.emoji).toBe('😊');
    expect(data.playlists).toHaveLength(1);
    expect(data.playlists[0].name).toBe('Keep the Vibes High');
    expect(data.playlists[0].moodTag).toBe('Uplifting Energy');
    expect(data.playlists[0].tracks).toHaveLength(2);
  });

  it('should generate wellness playlists for neutral mood state', async () => {
    const neutralMoodPayload = {
      ...mockValidPayload,
      moodData: [
        { date: '2024-01-01', moodScore: 65 },
        { date: '2024-01-02', moodScore: 62 },
        { date: '2024-01-03', moodScore: 68 }
      ]
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSpotifyResponse)
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(neutralMoodPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emotionalState.state).toBe('neutral');
    expect(data.emotionalState.emoji).toBe('😌');
    expect(data.playlists[0].name).toBe('Find Your Balance');
    expect(data.playlists[0].moodTag).toBe('Mood Balancing');
  });

  it('should generate wellness playlists for low mood state', async () => {
    const lowMoodPayload = {
      ...mockValidPayload,
      moodData: [
        { date: '2024-01-01', moodScore: 45 },
        { date: '2024-01-02', moodScore: 50 },
        { date: '2024-01-03', moodScore: 40 }
      ]
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSpotifyResponse)
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(lowMoodPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emotionalState.state).toBe('low');
    expect(data.emotionalState.emoji).toBe('😔');
    expect(data.playlists[0].name).toBe('Gentle Mood Lift');
    expect(data.playlists[0].moodTag).toBe('Mood Boosting');
  });

  it('should handle empty mood data gracefully', async () => {
    const emptyMoodPayload = {
      ...mockValidPayload,
      moodData: []
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSpotifyResponse)
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(emptyMoodPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emotionalState.state).toBe('neutral');
    expect(data.emotionalState.averageScore).toBe(50);
  });

  it('should return fallback playlists when Spotify API fails', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Spotify API error')
    );

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(mockValidPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.playlists[0].id).toBe('wellness-fallback-1');
    expect(data.playlists[0].tracks).toHaveLength(0);
    expect(data.playlists[0].spotifyUrl).toBe('https://open.spotify.com/browse/featured');
  });

  it('should return 401 when no access token is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(mockValidPayload),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Spotify access token not found');
  });

  it('should return 400 for invalid request data', async () => {
    const invalidPayload = {
      moodData: 'invalid', // Should be array
      personalityType: 123 // Should be string
    };

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(invalidPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should build correct Spotify API query parameters', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSpotifyResponse)
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/spotify/wellness-playlists', {
      method: 'POST',
      body: JSON.stringify(mockValidPayload),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'spotify_access_token=test_token'
      }
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.spotify.com/v1/recommendations'),
      expect.objectContaining({
        headers: {
          'Authorization': 'Bearer test_token'
        }
      })
    );

    const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
    const url = fetchCall[0] as string;
    
    expect(url).toContain('limit=10');
    expect(url).toContain('target_valence=0.8'); // Positive mood
    expect(url).toContain('target_energy=0.7');
    expect(url).toContain('seed_genres=indie,rock');
    expect(url).toContain('seed_artists=artist1');
    expect(url).toContain('seed_tracks=track1');
  });
}); 