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

    // Forward optional 'before' or 'after' query params for pagination
    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const after = searchParams.get('after');

    // Build Spotify API URL with pagination parameters
    const spotifyUrl = new URL('https://api.spotify.com/v1/me/player/recently-played');
    spotifyUrl.searchParams.set('limit', '50');
    if (before) spotifyUrl.searchParams.set('before', before);
    if (after) spotifyUrl.searchParams.set('after', after);

    // Fetch recently played tracks from Spotify
    const response = await fetch(spotifyUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, should implement refresh logic here
        return NextResponse.json(
          { error: 'Token expired', shouldRefresh: true },
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        // Insufficient permissions - user needs to reconnect with updated scopes
        return NextResponse.json(
          { 
            error: 'Insufficient permissions. Please disconnect and reconnect your Spotify account to grant the required permissions.',
            shouldReconnect: true 
          },
          { status: 403 }
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
    
    // Return the data in the format that HomeLayout expects (preserving item.track structure)
    return NextResponse.json({
      tracks: data.items, // Keep original structure with item.track
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