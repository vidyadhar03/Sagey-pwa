import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  played_at: string;
  popularity: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
}

interface DailyMoodData {
  date: string;
  dayName: string;
  moodScore: number;
  trackCount: number;
  musicalDiversity: number;
  explorationRate: number;
  temporalConsistency: number;
  mainstreamAffinity: number;
  emotionalVolatility: number;
  insight: string;
  topGenres?: string[];
}

// Get day name from date
function getDayName(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

// Get date string in YYYY-MM-DD format
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Genre to valence mapping (simplified version of existing logic)
const genreValenceMap: Record<string, number> = {
  'pop': 0.7,
  'rock': 0.6,
  'hip-hop': 0.65,
  'electronic': 0.75,
  'indie': 0.55,
  'folk': 0.45,
  'classical': 0.5,
  'jazz': 0.6,
  'country': 0.65,
  'blues': 0.4,
  'metal': 0.3,
  'punk': 0.35,
  'reggae': 0.7,
  'soul': 0.6,
  'funk': 0.8,
  'ambient': 0.4,
  'default': 0.5
};

// Calculate daily psycho-analysis metrics
function calculateDailyMetrics(dayTracks: any[], allArtists: Map<string, SpotifyArtist>) {
  if (dayTracks.length === 0) {
    return {
      musicalDiversity: 0,
      explorationRate: 0,
      temporalConsistency: 0,
      mainstreamAffinity: 0,
      emotionalVolatility: 0
    };
  }

  // 1. Musical Diversity (Shannon entropy of genres)
  const genreCounts = new Map<string, number>();
  dayTracks.forEach(track => {
    track.track.artists.forEach((artist: any) => {
      const artistData = allArtists.get(artist.id);
      if (artistData && artistData.genres.length > 0) {
        artistData.genres.forEach(genre => {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        });
      } else {
        genreCounts.set('unknown', (genreCounts.get('unknown') || 0) + 1);
      }
    });
  });

  const totalGenres = Array.from(genreCounts.values()).reduce((a, b) => a + b, 0);
  let entropy = 0;
  if (totalGenres > 0) {
    genreCounts.forEach(count => {
      const p = count / totalGenres;
      entropy -= p * Math.log2(p);
    });
  }
  const musicalDiversity = Math.min(100, (entropy / 4) * 100); // Normalize to 0-100

  // 2. Exploration Rate (unique tracks / total tracks)
  const uniqueTracks = new Set(dayTracks.map(t => t.track.id)).size;
  const explorationRate = (uniqueTracks / dayTracks.length) * 100;

  // 3. Temporal Consistency (variance in listening hours)
  const hours = dayTracks.map(track => new Date(track.played_at).getHours());
  const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
  const hourVariance = hours.reduce((sum, hour) => sum + Math.pow(hour - avgHour, 2), 0) / hours.length;
  const temporalConsistency = Math.max(0, Math.min(100, 100 - (hourVariance / 100) * 100));

  // 4. Mainstream Affinity (average track popularity)
  const avgPopularity = dayTracks.reduce((sum, track) => sum + (track.track.popularity || 50), 0) / dayTracks.length;
  const mainstreamAffinity = avgPopularity;

  // 5. Emotional Volatility (variance in genre valence)
  const genreValences: number[] = [];
  dayTracks.forEach(track => {
    track.track.artists.forEach((artist: any) => {
      const artistData = allArtists.get(artist.id);
      if (artistData && artistData.genres.length > 0) {
        artistData.genres.forEach(genre => {
          const genreKey = Object.keys(genreValenceMap).find(key => 
            genre.toLowerCase().includes(key)
          ) || 'default';
          genreValences.push(genreValenceMap[genreKey]);
        });
      } else {
        genreValences.push(genreValenceMap.default);
      }
    });
  });

  let emotionalVolatility = 0;
  if (genreValences.length > 1) {
    const avgValence = genreValences.reduce((a, b) => a + b, 0) / genreValences.length;
    const variance = genreValences.reduce((sum, val) => sum + Math.pow(val - avgValence, 2), 0) / genreValences.length;
    emotionalVolatility = Math.min(100, Math.sqrt(variance) * 100);
  }

  return {
    musicalDiversity,
    explorationRate,
    temporalConsistency,
    mainstreamAffinity,
    emotionalVolatility
  };
}

// Extract top genres from day's tracks
function extractTopGenres(dayTracks: any[], allArtists: Map<string, SpotifyArtist>) {
  const genreCounts = new Map<string, number>();

  dayTracks.forEach(track => {
    track.track.artists.forEach((artist: any) => {
      // Count genres from artist data
      const artistData = allArtists.get(artist.id);
      if (artistData && artistData.genres.length > 0) {
        artistData.genres.forEach(genre => {
          // Clean up genre names for better readability
          const cleanGenre = genre.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          genreCounts.set(cleanGenre, (genreCounts.get(cleanGenre) || 0) + 1);
        });
      }
    });
  });

  // Get top 3 genres
  const topGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  return { topGenres };
}

// Generate insight based on metrics
function generateInsight(metrics: any, dayName: string): string {
  const { musicalDiversity, explorationRate, temporalConsistency, emotionalVolatility } = metrics;
  
  if (musicalDiversity > 70 && explorationRate > 60) {
    return `${dayName}: High diversity and exploration suggest an adventurous, positive mood.`;
  } else if (temporalConsistency > 70 && emotionalVolatility < 40) {
    return `${dayName}: Stable patterns and low volatility indicate a calm, consistent mood.`;
  } else if (emotionalVolatility > 60) {
    return `${dayName}: High emotional volatility suggests varied mood throughout the day.`;
  } else if (explorationRate < 30 && temporalConsistency > 60) {
    return `${dayName}: Repetitive listening with consistent timing suggests comfort-seeking behavior.`;
  } else {
    return `${dayName}: Balanced listening patterns indicate a stable mood.`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No Spotify access token found' },
        { status: 401 }
      );
    }

    // We may need more than 50 tracks to cover 5-7 days, so paginate backwards using the "before" parameter
    let tracks: any[] = [];
    let continueFetching = true;
    let before = Date.now();

    while (continueFetching && tracks.length < 500) {
      const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50&before=${before}`;
      const resp = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!resp.ok) {
        if (resp.status === 401) {
          return NextResponse.json(
            { error: 'Token expired', shouldRefresh: true },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: 'Failed to fetch recent tracks' },
          { status: resp.status }
        );
      }

      const data = await resp.json();
      if (Array.isArray(data.items)) {
        tracks.push(...data.items);
        if (data.items.length > 0) {
          const oldest = data.items[data.items.length - 1];
          before = new Date(oldest.played_at).getTime() - 1000; // move one second before oldest
          const daysDiff = Math.floor((Date.now() - new Date(oldest.played_at).getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff > 7) {
            continueFetching = false;
          }
        } else {
          continueFetching = false;
        }
      } else {
        continueFetching = false;
      }
    }

    // Trim to tracks within last 7 days just in case
    tracks = tracks.filter(item => {
      const playedAt = new Date(item.played_at).getTime();
      return (Date.now() - playedAt) <= 7 * 24 * 60 * 60 * 1000;
    });

    if (!tracks || tracks.length === 0) {
      return NextResponse.json({
        moodData: [],
        insights: null,
        message: 'No recent tracks found'
      });
    }

    console.log(`Processing ${tracks.length} recent tracks for mood analysis`);

    // Get unique artist IDs
    const artistIds = [...new Set(tracks.flatMap((item: any) => 
      item.track.artists.map((artist: any) => artist.id)
    ))];

    // Fetch artist data for genres
    const artistsMap = new Map<string, SpotifyArtist>();
    
    for (let i = 0; i < artistIds.length; i += 50) {
      const batch = artistIds.slice(i, i + 50);
      try {
        const artistsResponse = await fetch(
          `https://api.spotify.com/v1/artists?ids=${batch.join(',')}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (artistsResponse.ok) {
          const artistsData = await artistsResponse.json();
          artistsData.artists.forEach((artist: SpotifyArtist) => {
            if (artist) {
              artistsMap.set(artist.id, artist);
            }
          });
        }
      } catch (error) {
        console.warn('Error fetching artist data:', error);
      }
    }

    // Group tracks by day
    const dailyTrackMap = new Map<string, any[]>();
    const now = new Date();
    
    console.log(`📅 Grouping ${tracks.length} tracks by day...`);
    
    tracks.forEach((item: any) => {
      const playedAt = new Date(item.played_at);
      const daysDiff = Math.floor((now.getTime() - playedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Only include tracks from last 7 days
      if (daysDiff <= 7) {
        const dateString = getDateString(playedAt);
        if (!dailyTrackMap.has(dateString)) {
          dailyTrackMap.set(dateString, []);
        }
        dailyTrackMap.get(dateString)?.push(item);
      }
    });

    console.log(`📊 Daily track distribution:`, Array.from(dailyTrackMap.entries()).map(([date, tracks]) => ({
      date,
      dayName: getDayName(new Date(date)),
      trackCount: tracks.length
    })));

    // Calculate daily mood scores
    const moodData: DailyMoodData[] = [];
    
    // Ensure we have entries for the last 7 days, even if no tracks
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(getDateString(date));
    }
    
    console.log(`📅 Ensuring data for last 7 days:`, last7Days);
    
    // Process each of the last 7 days
    for (const dateString of last7Days) {
      const dayTracks = dailyTrackMap.get(dateString) || [];
      
      if (dayTracks.length === 0) {
        console.log(`⚠️ No tracks for ${dateString}, creating minimal entry`);
        // Create minimal entry for days with no listening activity
        const date = new Date(dateString);
        const dayName = getDayName(date);
        
        moodData.push({
          date: dateString,
          dayName,
          moodScore: 0, // This will trigger the no-data styling
          trackCount: 0,
          musicalDiversity: 0,
          explorationRate: 0,
          temporalConsistency: 0,
          mainstreamAffinity: 0,
          emotionalVolatility: 0,
          insight: `${dayName}: No listening activity recorded`,
          topGenres: []
        });
        continue;
      }
      
      console.log(`🎵 Processing ${dateString} with ${dayTracks.length} tracks`);

      const metrics = calculateDailyMetrics(dayTracks, artistsMap);
      const { topGenres } = extractTopGenres(dayTracks, artistsMap);
      
      // Apply mood score formula
      const moodScore = Math.max(30, Math.min(95, 
        0.2 * metrics.musicalDiversity +
        0.15 * metrics.explorationRate +
        0.2 * metrics.temporalConsistency +
        0.15 * (100 - metrics.emotionalVolatility) +
        0.1 * metrics.mainstreamAffinity +
        20 // base score
      ));

      const date = new Date(dateString);
      const dayName = getDayName(date);
      const insight = generateInsight(metrics, dayName);

      moodData.push({
        date: dateString,
        dayName,
        moodScore: Math.round(moodScore),
        trackCount: dayTracks.length,
        musicalDiversity: Math.round(metrics.musicalDiversity),
        explorationRate: Math.round(metrics.explorationRate),
        temporalConsistency: Math.round(metrics.temporalConsistency),
        mainstreamAffinity: Math.round(metrics.mainstreamAffinity),
        emotionalVolatility: Math.round(metrics.emotionalVolatility),
        insight,
        topGenres
      });
    }

    // Generate insights
    let insights = null;
    if (moodData.length > 0) {
      // Only consider days with actual mood scores (moodScore > 0) to match what's shown in the chart
      const visibleMoodData = moodData.filter(day => day.moodScore > 0);
      
      if (visibleMoodData.length > 0) {
        const averageMood = visibleMoodData.reduce((sum, day) => sum + day.moodScore, 0) / visibleMoodData.length;
        const highestMoodDay = visibleMoodData.reduce((max, day) => day.moodScore > max.moodScore ? day : max);
        const lowestMoodDay = visibleMoodData.reduce((min, day) => day.moodScore < min.moodScore ? day : min);
        
        insights = {
          averageMood: Math.round(averageMood),
          highestMoodDay,
          lowestMoodDay,
          totalDays: visibleMoodData.length
        };
      }
    }

    return NextResponse.json({
      moodData,
      insights,
      message: moodData.length === 0 ? 'No mood data available' : undefined
    });

  } catch (error) {
    console.error('Mood data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 