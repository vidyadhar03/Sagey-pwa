import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the best available image URL for a track
 */
export function getTrackImage(track: any): string | null {
  // Handle null/undefined track
  if (!track) {
    return null;
  }
  
  // Try direct image_url first (from API responses)
  if (track.image_url) {
    return track.image_url;
  }
  
  // Try album images array
  if (track.album?.images?.[0]?.url) {
    return track.album.images[0].url;
  }
  
  // No image available
  return null;
}

/**
 * Format minutes with proper pluralization
 */
export function formatMinutes(minutes: number): string {
  if (minutes === 0) {
    return '0 minutes';
  } else if (minutes === 1) {
    return '1 minute';
  } else {
    return `${Math.round(minutes)} minutes`;
  }
}

/**
 * Calculate listening stats for last 4 weeks vs previous 4 weeks
 */
export function calculateLast4WeeksStats(recentTracks: any[]): {
  minutesThis: number;
  minutesPrev: number;
  percentageChange: string;
  topGenre: string | null;
  topAlbum: { name: string; artist: string; image: string | null } | null;
} {
  if (!recentTracks || recentTracks.length === 0) {
    return {
      minutesThis: 0,
      minutesPrev: 0,
      percentageChange: '–',
      topGenre: null,
      topAlbum: null
    };
  }

  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
  const eightWeeksAgo = new Date(now.getTime() - (56 * 24 * 60 * 60 * 1000));

  // Split tracks into two periods
  const thisPeriodTracks: any[] = [];
  const prevPeriodTracks: any[] = [];

  recentTracks.forEach(item => {
    const track = item.track || item;
    const playedAt = new Date(item.played_at || track.played_at || now);
    
    if (playedAt >= fourWeeksAgo) {
      thisPeriodTracks.push(track);
    } else if (playedAt >= eightWeeksAgo) {
      prevPeriodTracks.push(track);
    }
  });

  // Calculate minutes for each period
  const minutesThis = thisPeriodTracks.reduce((total, track) => {
    return total + (track.duration_ms || 0) / 60000;
  }, 0);

  const minutesPrev = prevPeriodTracks.reduce((total, track) => {
    return total + (track.duration_ms || 0) / 60000;
  }, 0);

  // Calculate percentage change
  let percentageChange = '–';
  if (minutesPrev > 0) {
    const delta = ((minutesThis - minutesPrev) / minutesPrev) * 100;
    const sign = delta >= 0 ? '+' : '';
    percentageChange = `${sign}${Math.round(delta)} %`;
  }

  // Calculate top genre (using all tracks from this period)
  const genreMap = new Map<string, number>();
  thisPeriodTracks.forEach(track => {
    if (track.genres && Array.isArray(track.genres)) {
      track.genres.forEach((genre: string) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    }
  });

  let topGenre = null;
  if (genreMap.size > 0) {
    const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1]);
    topGenre = sortedGenres[0][0];
  }

  // Calculate top album
  const albumMap = new Map<string, { name: string; artist: string; image: string | null; count: number }>();
  thisPeriodTracks.forEach(track => {
    if (track.album) {
      const albumKey = `${track.album.name || track.album}-${track.artist || track.artists?.[0]?.name || 'Unknown'}`;
      const existing = albumMap.get(albumKey);
      if (existing) {
        existing.count += 1;
      } else {
        albumMap.set(albumKey, {
          name: track.album.name || track.album || 'Unknown Album',
          artist: track.artist || track.artists?.[0]?.name || 'Unknown Artist',
          image: getTrackImage(track),
          count: 1
        });
      }
    }
  });

  let topAlbum = null;
  if (albumMap.size > 0) {
    const sortedAlbums = Array.from(albumMap.values()).sort((a, b) => b.count - a.count);
    topAlbum = sortedAlbums[0];
  }

  return {
    minutesThis,
    minutesPrev,
    percentageChange,
    topGenre,
    topAlbum
  };
} 