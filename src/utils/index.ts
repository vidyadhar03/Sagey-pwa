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
  const WINDOW_DAYS = 30;
  const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const prevWindowStart = new Date(now.getTime() - WINDOW_MS * 2);

  // Split tracks into two periods
  const thisPeriodTracks: any[] = [];
  const prevPeriodTracks: any[] = [];

  recentTracks.forEach(item => {
    const track = item.track || item;
    const playedAt = new Date(item.played_at || track.played_at || now);
    
    if (playedAt >= windowStart) {
      thisPeriodTracks.push(track);
    } else if (playedAt >= prevWindowStart) {
      prevPeriodTracks.push(track);
    }
  });

  // Calculate minutes for each period
  let minutesThis = thisPeriodTracks.reduce((total, track) => {
    return total + (track.duration_ms || 0) / 60000;
  }, 0);

  let minutesPrev = prevPeriodTracks.reduce((total, track) => {
    return total + (track.duration_ms || 0) / 60000;
  }, 0);

  /**
   * Compensation for Spotify API limitation (recent-played ≤ 50 plays/24 h).
   * Approach: compute average listening minutes per *available* day, then
   * extrapolate to 30 days. This is more robust than using oldest timestamp
   * because it handles gaps where the user didn't listen.
   */
  if (thisPeriodTracks.length > 0) {
    const perDay = new Map<string, number>();
    recentTracks.forEach(item => {
      // Use the explicit played_at from API
      const playedAtDate = new Date(item.played_at);
      if (isNaN(playedAtDate.getTime())) return; // skip invalid
      if (playedAtDate < windowStart) return; // outside 30-day window

      const key = playedAtDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const minutes = (item.track?.duration_ms || 0) / 60000;
      perDay.set(key, (perDay.get(key) || 0) + minutes);
    });

    const daysCovered = perDay.size;
    if (daysCovered > 0 && daysCovered < WINDOW_DAYS) {
      const avgPerDay = minutesThis / daysCovered;
      const scaledMinutes = avgPerDay * WINDOW_DAYS;
      // Blend original & scaled to avoid dramatic jumps when sample small
      const scaleFactor = WINDOW_DAYS / daysCovered;
      const cappedFactor = Math.min(scaleFactor, 10);
      minutesThis = minutesThis * cappedFactor;
      // but keep it no more than scaledMinutes to avoid overshoot due to cap logic
      minutesThis = Math.min(minutesThis, scaledMinutes);
    }
  }

  // Recalculate percentage change after scaling
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