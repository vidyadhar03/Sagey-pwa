import { getTrackImage, formatMinutes, calculateLast4WeeksStats } from '../utils';

describe('getTrackImage', () => {
  it('returns image_url when available', () => {
    const track = {
      image_url: 'direct-image.jpg',
      album: {
        images: [{ url: 'album-image.jpg' }]
      }
    };
    
    expect(getTrackImage(track)).toBe('direct-image.jpg');
  });

  it('returns album image when image_url is not available', () => {
    const track = {
      album: {
        images: [{ url: 'album-image.jpg' }]
      }
    };
    
    expect(getTrackImage(track)).toBe('album-image.jpg');
  });

  it('returns null when no image is available', () => {
    const track = {
      album: {
        images: []
      }
    };
    
    expect(getTrackImage(track)).toBeNull();
  });

  it('handles null/undefined track', () => {
    expect(getTrackImage(null)).toBeNull();
    expect(getTrackImage(undefined)).toBeNull();
  });

  it('handles track without album', () => {
    const track = {
      name: 'Test Track'
    };
    
    expect(getTrackImage(track)).toBeNull();
  });
});

describe('formatMinutes', () => {
  it('formats zero minutes correctly', () => {
    expect(formatMinutes(0)).toBe('0 minutes');
  });

  it('formats single minute correctly', () => {
    expect(formatMinutes(1)).toBe('1 minute');
  });

  it('formats multiple minutes correctly', () => {
    expect(formatMinutes(45)).toBe('45 minutes');
    expect(formatMinutes(142)).toBe('142 minutes');
  });

  it('rounds decimal minutes', () => {
    expect(formatMinutes(45.7)).toBe('46 minutes');
    expect(formatMinutes(45.3)).toBe('45 minutes');
  });
});

describe('calculateLast4WeeksStats', () => {
  const mockTrack1 = {
    track: {
      id: '1',
      duration_ms: 240000, // 4 minutes
      album: { name: 'Album 1' },
      artist: 'Artist 1',
      genres: ['pop']
    },
    played_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
  };

  const mockTrack2 = {
    track: {
      id: '2',
      duration_ms: 180000, // 3 minutes
      album: { name: 'Album 2' },
      artist: 'Artist 2'
    },
    played_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // 5 weeks ago
  };

  it('calculates minutes correctly for recent tracks', () => {
    const result = calculateLast4WeeksStats([mockTrack1]);
    
    expect(result.minutesThis).toBe(4); // 240000ms = 4 minutes
    expect(result.minutesPrev).toBe(0);
    expect(result.percentageChange).toBe('–');
  });

  it('calculates percentage change correctly', () => {
    const recentTrack = {
      track: {
        id: '1',
        duration_ms: 300000, // 5 minutes
        album: { name: 'Album 1' },
        artist: 'Artist 1'
      },
      played_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
    };

    const oldTrack = {
      track: {
        id: '2',
        duration_ms: 240000, // 4 minutes
        album: { name: 'Album 2' },
        artist: 'Artist 2'
      },
      played_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString() // 6 weeks ago
    };

    const result = calculateLast4WeeksStats([recentTrack, oldTrack]);
    
    expect(result.minutesThis).toBe(5);
    expect(result.minutesPrev).toBe(4);
    expect(result.percentageChange).toBe('+25 %'); // (5-4)/4 * 100 = 25%
  });

  it('calculates specific test case with 226 vs 180 minutes', () => {
    // Create tracks that will result in 226 minutes this period, 180 minutes prev period
    const thisWeekTracks = Array.from({ length: 4 }, (_, i) => ({
      track: {
        id: `this-${i}`,
        duration_ms: 226 * 60000 / 4, // Split 226 minutes across 4 tracks
        album: { name: 'Current Album' },
        artist: 'Current Artist'
      },
      played_at: new Date(Date.now() - (7 + i) * 24 * 60 * 60 * 1000).toISOString() // Last 4 weeks
    }));

    const prevWeekTracks = Array.from({ length: 3 }, (_, i) => ({
      track: {
        id: `prev-${i}`,
        duration_ms: 180 * 60000 / 3, // Split 180 minutes across 3 tracks
        album: { name: 'Old Album' },
        artist: 'Old Artist'
      },
      played_at: new Date(Date.now() - (35 + i) * 24 * 60 * 60 * 1000).toISOString() // Previous 4 weeks
    }));

    const allTracks = [...thisWeekTracks, ...prevWeekTracks];
    const result = calculateLast4WeeksStats(allTracks);
    
    expect(Math.round(result.minutesThis)).toBe(226);
    expect(Math.round(result.minutesPrev)).toBe(180);
    expect(result.percentageChange).toBe('+26 %'); // ((226-180)/180)*100 = 25.56 -> rounds to 26
  });

  it('handles empty tracks array', () => {
    const result = calculateLast4WeeksStats([]);
    
    expect(result.minutesThis).toBe(0);
    expect(result.minutesPrev).toBe(0);
    expect(result.percentageChange).toBe('–');
    expect(result.topGenre).toBeNull();
    expect(result.topAlbum).toBeNull();
  });

  it('handles null/undefined tracks', () => {
    const result = calculateLast4WeeksStats(null as any);
    
    expect(result.minutesThis).toBe(0);
    expect(result.minutesPrev).toBe(0);
    expect(result.percentageChange).toBe('–');
    expect(result.topGenre).toBeNull();
    expect(result.topAlbum).toBeNull();
  });
}); 