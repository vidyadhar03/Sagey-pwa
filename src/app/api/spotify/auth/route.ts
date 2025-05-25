import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
  
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
    scope: scopes,
    state: state,
    show_dialog: 'true' // Force user to see consent screen
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
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