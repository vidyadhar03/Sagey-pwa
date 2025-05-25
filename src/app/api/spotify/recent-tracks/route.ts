import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No Spotify access token found' },
        { status: 401 }
      );
    }

    // Fetch recently played tracks
    const response = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, should implement refresh logic here
        return NextResponse.json(
          { error: 'Token expired', shouldRefresh: true },
          { status: 401 }
        );
      }
      
      const errorData = await response.text();
      console.error('Spotify API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch recent tracks' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the data for our frontend
    const tracks = data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0]?.name,
      album: item.track.album.name,
      played_at: item.played_at,
      duration_ms: item.track.duration_ms,
      external_urls: item.track.external_urls,
      preview_url: item.track.preview_url,
      image_url: item.track.album.images[0]?.url
    }));

    return NextResponse.json({
      tracks,
      total: data.items.length
    });

  } catch (error) {
    console.error('Recent tracks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 