import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'medium_term'; // short_term, medium_term, long_term
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No Spotify access token found' },
        { status: 401 }
      );
    }

    // Fetch top tracks
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`,
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
        { error: 'Failed to fetch top tracks' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform and enrich the data
    const tracks = data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name,
      album: track.album.name,
      popularity: track.popularity,
      duration_ms: track.duration_ms,
      external_urls: track.external_urls,
      preview_url: track.preview_url,
      image_url: track.album.images[0]?.url
    }));

    return NextResponse.json({
      tracks,
      total: data.items.length,
      time_range: timeRange
    });

  } catch (error) {
    console.error('Top tracks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 