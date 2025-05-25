import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    const { searchParams } = new URL(request.url);
    const trackIds = searchParams.get('ids'); // Comma-separated track IDs
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No Spotify access token found' },
        { status: 401 }
      );
    }

    if (!trackIds) {
      return NextResponse.json(
        { error: 'Track IDs required' },
        { status: 400 }
      );
    }

    // Fetch audio features for tracks
    const response = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token expired', shouldRefresh: true },
          { status: 401 }
        );
      }
      
      const errorData = await response.text();
      console.error('Spotify API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch audio features' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Calculate aggregate mood metrics
    const validFeatures = data.audio_features.filter((f: any) => f !== null);
    
    if (validFeatures.length === 0) {
      return NextResponse.json({
        audio_features: [],
        aggregate: null
      });
    }

    const aggregate = {
      energy: validFeatures.reduce((sum: number, f: any) => sum + f.energy, 0) / validFeatures.length,
      valence: validFeatures.reduce((sum: number, f: any) => sum + f.valence, 0) / validFeatures.length,
      danceability: validFeatures.reduce((sum: number, f: any) => sum + f.danceability, 0) / validFeatures.length,
      acousticness: validFeatures.reduce((sum: number, f: any) => sum + f.acousticness, 0) / validFeatures.length,
      instrumentalness: validFeatures.reduce((sum: number, f: any) => sum + f.instrumentalness, 0) / validFeatures.length,
      tempo: validFeatures.reduce((sum: number, f: any) => sum + f.tempo, 0) / validFeatures.length,
      mood_score: 0 // Will be calculated below
    };

    // Calculate overall mood score (0-100)
    // Combine valence (happiness) and energy for mood
    aggregate.mood_score = Math.round((aggregate.valence * 0.6 + aggregate.energy * 0.4) * 100);

    return NextResponse.json({
      audio_features: data.audio_features,
      aggregate,
      count: validFeatures.length
    });

  } catch (error) {
    console.error('Audio features API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 