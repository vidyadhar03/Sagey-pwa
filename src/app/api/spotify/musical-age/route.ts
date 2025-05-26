import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
    images: Array<{ url: string }>;
  };
  popularity: number;
  duration_ms: number;
}

interface MusicalAgeData {
  actualAge: number | null;
  averageReleaseYear: number;
  musicalAge: number;
  ageDifference: number;
  totalTracks: number;
  oldestTrack: {
    name: string;
    artist: string;
    year: number;
  };
  newestTrack: {
    name: string;
    artist: string;
    year: number;
  };
  aiInsight: string;
}

/**
 * Calculate the user's musical age based on their top Spotify tracks
 * Musical Age = Current Year - Average Release Year of Top Tracks
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Spotify access token not found. Please connect your Spotify account.' },
        { status: 401 }
      );
    }

    // Fetch user's profile to get actual age (if available)
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile from Spotify' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();

    // Fetch user's top tracks (medium term - last 6 months)
    const tracksResponse = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!tracksResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch top tracks from Spotify' },
        { status: tracksResponse.status }
      );
    }

    const tracksData = await tracksResponse.json();
    const tracks: SpotifyTrack[] = tracksData.items;

    if (!tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: 'No tracks found. Please listen to more music on Spotify.' },
        { status: 404 }
      );
    }

    // Calculate musical age metrics
    const currentYear = new Date().getFullYear();
    const releaseYears: number[] = [];
    let oldestTrack = { name: '', artist: '', year: currentYear };
    let newestTrack = { name: '', artist: '', year: 1900 };

    tracks.forEach((track) => {
      if (track.album?.release_date) {
        const releaseYear = parseInt(track.album.release_date.substring(0, 4));
        if (!isNaN(releaseYear) && releaseYear > 1900 && releaseYear <= currentYear) {
          releaseYears.push(releaseYear);
          
          // Track oldest and newest songs
          if (releaseYear < oldestTrack.year) {
            oldestTrack = {
              name: track.name,
              artist: track.artists[0]?.name || 'Unknown Artist',
              year: releaseYear
            };
          }
          if (releaseYear > newestTrack.year) {
            newestTrack = {
              name: track.name,
              artist: track.artists[0]?.name || 'Unknown Artist',
              year: releaseYear
            };
          }
        }
      }
    });

    if (releaseYears.length === 0) {
      return NextResponse.json(
        { error: 'No valid release dates found in your top tracks.' },
        { status: 404 }
      );
    }

    // Calculate average release year
    const averageReleaseYear = Math.round(
      releaseYears.reduce((sum, year) => sum + year, 0) / releaseYears.length
    );

    // Calculate musical age (how old the music feels)
    const musicalAge = currentYear - averageReleaseYear;
    
    // Try to estimate actual age from birthdate (if available)
    let actualAge: number | null = null;
    if (userData.birthdate) {
      const birthYear = parseInt(userData.birthdate.substring(0, 4));
      if (!isNaN(birthYear)) {
        actualAge = currentYear - birthYear;
      }
    }

    const ageDifference = actualAge ? musicalAge - actualAge : 0;

    // Generate AI insight using OpenAI
    const aiInsight = await generateMusicalAgeInsight({
      actualAge,
      averageReleaseYear,
      musicalAge,
      ageDifference,
      totalTracks: releaseYears.length,
      oldestTrack,
      newestTrack,
      userName: userData.display_name || 'Music Lover'
    });

    const result: MusicalAgeData = {
      actualAge,
      averageReleaseYear,
      musicalAge,
      ageDifference,
      totalTracks: releaseYears.length,
      oldestTrack,
      newestTrack,
      aiInsight
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Musical Age API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while calculating musical age' },
      { status: 500 }
    );
  }
}

/**
 * Generate AI-powered insight about the user's musical age using OpenAI GPT-4
 */
async function generateMusicalAgeInsight(data: {
  actualAge: number | null;
  averageReleaseYear: number;
  musicalAge: number;
  ageDifference: number;
  totalTracks: number;
  oldestTrack: { name: string; artist: string; year: number };
  newestTrack: { name: string; artist: string; year: number };
  userName: string;
}): Promise<string> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Fallback insight if OpenAI is not configured
      return generateFallbackInsight(data);
    }

    const prompt = `Analyze this user's musical taste and generate a fun, engaging insight about their "Musical Age":

User: ${data.userName}
${data.actualAge ? `Actual Age: ${data.actualAge} years old` : 'Actual Age: Unknown'}
Musical Age: ${data.musicalAge} years (based on average release year ${data.averageReleaseYear})
${data.actualAge ? `Age Difference: ${data.ageDifference > 0 ? '+' : ''}${data.ageDifference} years` : ''}
Total Tracks Analyzed: ${data.totalTracks}
Oldest Track: "${data.oldestTrack.name}" by ${data.oldestTrack.artist} (${data.oldestTrack.year})
Newest Track: "${data.newestTrack.name}" by ${data.newestTrack.artist} (${data.newestTrack.year})

Generate a personalized, witty, and engaging 2-3 sentence insight that:
1. Explains what their musical age means
2. Makes a fun observation about their taste (nostalgic, modern, timeless, etc.)
3. Includes a playful comment about the age difference or musical era preference
4. Keep it positive and entertaining

Style: Friendly, slightly humorous, insightful. Avoid being too technical.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a music analyst AI that creates fun, engaging insights about people\'s musical taste. Be witty, positive, and insightful.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API Error:', response.status, response.statusText);
      return generateFallbackInsight(data);
    }

    const aiResponse = await response.json();
    const insight = aiResponse.choices?.[0]?.message?.content?.trim();

    return insight || generateFallbackInsight(data);

  } catch (error) {
    console.error('Error generating AI insight:', error);
    return generateFallbackInsight(data);
  }
}

/**
 * Generate a fallback insight when OpenAI is not available
 */
function generateFallbackInsight(data: {
  actualAge: number | null;
  averageReleaseYear: number;
  musicalAge: number;
  ageDifference: number;
  userName: string;
}): string {
  const { actualAge, averageReleaseYear, musicalAge, ageDifference, userName } = data;
  
  if (!actualAge) {
    if (musicalAge < 5) {
      return `${userName}, your musical taste is absolutely cutting-edge! You're vibing with the freshest sounds, staying right on the pulse of what's happening now. You're a true trendsetter! 🎵`;
    } else if (musicalAge < 15) {
      return `${userName}, you have a perfect balance of modern hits and recent classics! Your musical age of ${musicalAge} years shows you appreciate both current trends and timeless recent favorites. 🎶`;
    } else if (musicalAge < 25) {
      return `${userName}, you're a nostalgic soul with great taste! Your musical age of ${musicalAge} years reveals a love for the golden era of music that still resonates today. Classic vibes! ✨`;
    } else {
      return `${userName}, you're a true vintage music connoisseur! With a musical age of ${musicalAge} years, you appreciate the timeless classics that never go out of style. Legendary taste! 🎼`;
    }
  }

  if (Math.abs(ageDifference) <= 3) {
    return `${userName}, your musical taste perfectly matches your age! You're ${actualAge} and your musical age is ${musicalAge} - you're living authentically through your music choices. Perfect harmony! 🎵`;
  } else if (ageDifference > 3) {
    return `${userName}, you're an old soul! At ${actualAge}, your musical age of ${musicalAge} years shows you appreciate the classics and timeless hits. You have wisdom beyond your years! ✨`;
  } else {
    return `${userName}, you're young at heart! Your musical age of ${musicalAge} years is refreshingly modern compared to your ${actualAge} years. You keep up with the times and stay current! 🚀`;
  }
} 