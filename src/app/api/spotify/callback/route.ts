import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for authorization errors
  if (error) {
    console.error('Spotify authorization error:', error);
    return NextResponse.redirect(new URL('/?spotify=error', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?spotify=error', request.url));
  }

  // Verify state parameter
  const storedState = request.cookies.get('spotify_auth_state')?.value;
  if (state !== storedState) {
    console.error('State mismatch in Spotify callback');
    return NextResponse.redirect(new URL('/?spotify=error', request.url));
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/?spotify=error', request.url));
    }

    const tokenData = await tokenResponse.json();

    // Get user profile for user ID
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!profileResponse.ok) {
      console.error('Failed to fetch Spotify profile');
      return NextResponse.redirect(new URL('/?spotify=error', request.url));
    }

    const profileData = await profileResponse.json();

    // Store tokens in localStorage via client-side redirect
    // For MVP, we'll use localStorage. In production, use a secure database
    const tokenInfo = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
      user_id: profileData.id,
      display_name: profileData.display_name,
      email: profileData.email
    };

    // Create a response that will store tokens in localStorage
    const response = NextResponse.redirect(new URL('/?spotify=connected', request.url));
    
    // Set tokens in secure httpOnly cookies for server-side access
    response.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      sameSite: 'lax'
    });

    response.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax'
    });

    response.cookies.set('spotify_user_info', JSON.stringify({
      user_id: profileData.id,
      display_name: profileData.display_name,
      email: profileData.email
    }), {
      httpOnly: false, // Allow client-side access for UI
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax'
    });

    // Clear the state cookie
    response.cookies.delete('spotify_auth_state');

    return response;

  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect(new URL('/?spotify=error', request.url));
  }
} 