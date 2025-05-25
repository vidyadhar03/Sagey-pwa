import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    const userInfo = request.cookies.get('spotify_user_info')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        connected: false,
        user: null
      });
    }

    // Verify token is still valid by making a simple API call
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      // Token is invalid or expired
      return NextResponse.json({
        connected: false,
        user: null,
        error: 'Token expired'
      });
    }

    const profileData = await response.json();
    
    return NextResponse.json({
      connected: true,
      user: {
        id: profileData.id,
        display_name: profileData.display_name,
        email: profileData.email,
        followers: profileData.followers?.total,
        images: profileData.images,
        country: profileData.country,
        product: profileData.product
      }
    });

  } catch (error) {
    console.error('Spotify status check error:', error);
    return NextResponse.json({
      connected: false,
      user: null,
      error: 'Internal server error'
    });
  }
} 