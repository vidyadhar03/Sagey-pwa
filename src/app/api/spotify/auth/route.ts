import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if environment variables are configured
  if (!process.env.SPOTIFY_CLIENT_ID) {
    console.error('Missing SPOTIFY_CLIENT_ID environment variable');
    return NextResponse.redirect(new URL('/?spotify=error&reason=config_error', request.url));
  }

  const scopes = [
    'user-read-email',
    'user-read-recently-played',
    'user-top-read',
    'user-library-read',
    'playlist-read-private',
    'user-read-currently-playing'
  ].join(' ');

  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15);
  
  // Determine redirect URI based on environment
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://sagey-pwa.vercel.app/api/spotify/callback'
      : 'http://localhost:3000/api/spotify/callback');
  
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    state: state,
    show_dialog: 'true' // Force user to see consent screen
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  console.log('Spotify auth redirect:', { redirectUri, authUrl });
  
  // Store state in cookie for verification
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    sameSite: 'lax'
  });

  return response;
} 