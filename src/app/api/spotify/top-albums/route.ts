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

    // Fetch top tracks to derive albums from
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
    
    // Extract unique albums from top tracks
    const albumMap = new Map();
    
    data.items.forEach((track: any) => {
      const album = track.album;
      if (album && !albumMap.has(album.id)) {
        albumMap.set(album.id, {
          id: album.id,
          name: album.name,
          artist: album.artists[0]?.name || 'Unknown Artist',
          artists: album.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist',
          release_date: album.release_date,
          total_tracks: album.total_tracks,
          external_urls: album.external_urls,
          image_url: album.images[0]?.url,
          album_type: album.album_type,
          track_count: 1 // Count of user's top tracks from this album
        });
      } else if (album && albumMap.has(album.id)) {
        // Increment track count for this album
        const existingAlbum = albumMap.get(album.id);
        existingAlbum.track_count += 1;
        albumMap.set(album.id, existingAlbum);
      }
    });

    // Convert to array and sort by track count (most tracks from album first)
    const albums = Array.from(albumMap.values())
      .sort((a, b) => b.track_count - a.track_count)
      .slice(0, 50); // Limit to top 50 albums

    return NextResponse.json({
      albums,
      total: albums.length,
      time_range: timeRange
    });

  } catch (error) {
    console.error('Top albums API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 