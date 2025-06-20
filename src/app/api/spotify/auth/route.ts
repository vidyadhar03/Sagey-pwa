import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== SPOTIFY AUTH START ===');
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check if environment variables are configured
    console.log('🔍 Checking environment variables...');
    const hasClientId = !!process.env.SPOTIFY_CLIENT_ID;
    const hasClientSecret = !!process.env.SPOTIFY_CLIENT_SECRET;
    const hasRedirectUri = !!process.env.SPOTIFY_REDIRECT_URI;
    
    console.log('Environment check:', { 
      hasClientId, 
      hasClientSecret, 
      hasRedirectUri,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    if (!hasClientId) {
      console.error('❌ Missing SPOTIFY_CLIENT_ID environment variable');
      return NextResponse.redirect(new URL('/?spotify=error&reason=config_error', request.url));
    }

  const scopes = [
    'user-read-email',
    'user-library-read',
    'playlist-read-private',
    'user-read-recently-played',
    'user-top-read',
    'user-read-currently-playing'
  ].join(' ');

    console.log('📋 Spotify scopes (with necessary permissions):', scopes);

  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15);
    console.log('🔐 Generated state:', `${state.substring(0, 10)}...`);
    
    // Build redirect URI dynamically for dev so we don't end up with 0.0.0.0 which Chrome blocks
    let redirectUri: string;
    if (process.env.SPOTIFY_REDIRECT_URI) {
      redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    } else {
      const hostHeader = request.headers.get('host') || 'localhost:3000';
      const protocol = request.nextUrl.protocol; // http: or https:
      const hostSanitized = hostHeader.startsWith('0.0.0.0') ? hostHeader.replace('0.0.0.0', 'localhost') : hostHeader;
      redirectUri = `${protocol}//${hostSanitized}/api/spotify/callback`;
    }
    
    console.log('🌍 Environment detection:', {
      isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
      redirectUri,
      explicitRedirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
  
  const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
      redirect_uri: redirectUri,
    scope: scopes,
    state: state,
    show_dialog: 'true' // Force user to see consent screen
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    
    console.log('🔗 Spotify authorization URL generated');
    console.log('Auth URL length:', authUrl.length);
    console.log('Auth URL params:', Object.fromEntries(params.entries()));
  
  // Store state in cookie for verification
    console.log('🍪 Setting state cookie...');
  const response = NextResponse.redirect(authUrl);
  
  // Mobile compatibility detection (iOS & Android)
  const userAgent = request.headers.get('user-agent') || '';
  const isIOSSafari = /iPhone|iPad|iPod/.test(userAgent) && /Safari/.test(userAgent);
  const isIOSChrome = /iPhone|iPad|iPod/.test(userAgent) && /CriOS/.test(userAgent);
  const isIOS = isIOSSafari || isIOSChrome;
  const isAndroid = /Android/i.test(userAgent);
  
  console.log('🍎 iOS detection:', {
    userAgent: userAgent.substring(0, 100),
    isIOSSafari,
    isIOSChrome,
    isIOS,
    isAndroid
  });
  
  // Simple, reliable cookie options that work everywhere
  let cookieOptions;
  if (isIOS || isAndroid) {
    // iOS/Android-specific: Most permissive settings to bypass privacy restrictions
    cookieOptions = {
      httpOnly: false, // Allow client-side access for mobile compatibility
      secure: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
      maxAge: 600, // 10 minutes
      sameSite: 'none' as const, // Required for cross-site requests on mobile browsers
      path: '/',
    };
    console.log('📱 Using mobile-compatible cookie settings (SameSite=None)');
  } else {
    cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
      maxAge: 600, // 10 minutes
      sameSite: 'lax' as const,
      path: '/',
    };
    console.log('🖥️ Using standard cookie settings');
  }
  
  try {
    response.cookies.set('spotify_auth_state', state, cookieOptions);
    console.log('✅ State cookie set successfully');
    console.log('�� State value stored:', `${state.substring(0, 10)}...`);
  } catch (cookieError) {
    console.error('❌ CRITICAL: Failed to set state cookie:', cookieError);
    console.error('❌ This will cause state_mismatch errors!');
  }

    console.log('🚀 Redirecting to Spotify authorization...');
    console.log('=== SPOTIFY AUTH SUCCESS ===');
  return response;
    
  } catch (error: unknown) {
    console.error('💥 CRITICAL ERROR in Spotify auth:');
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error details:', error);
    }
    
    console.log('=== SPOTIFY AUTH ERROR ===');
    return NextResponse.redirect(new URL('/?spotify=error&reason=auth_init_error', request.url));
  }
} 