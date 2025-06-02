import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== SPOTIFY CALLBACK START ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

    console.log('URL Search Params:', {
      code: code ? `${code.substring(0, 10)}...` : null,
      state: state ? `${state.substring(0, 10)}...` : null,
      error: error,
      allParams: Object.fromEntries(searchParams.entries())
    });

  // Check for authorization errors
  if (error) {
      console.error('❌ Spotify authorization error:', error);
      return NextResponse.redirect(new URL('/?spotify=error&reason=auth_error', request.url));
  }

  if (!code || !state) {
      console.error('❌ Missing required parameters:', { hasCode: !!code, hasState: !!state });
      return NextResponse.redirect(new URL('/?spotify=error&reason=missing_params', request.url));
  }

    // Check environment variables
    console.log('🔍 Checking environment variables...');
    const hasClientId = !!process.env.SPOTIFY_CLIENT_ID;
    const hasClientSecret = !!process.env.SPOTIFY_CLIENT_SECRET;
    console.log('Environment check:', { hasClientId, hasClientSecret });

    if (!hasClientId || !hasClientSecret) {
      console.error('❌ Missing Spotify environment variables');
      return NextResponse.redirect(new URL('/?spotify=error&reason=config_error', request.url));
    }

    // Check cookies
    console.log('🍪 Checking cookies...');
    const allCookies = request.cookies.getAll();
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
  const storedState = request.cookies.get('spotify_auth_state')?.value;
    console.log('State verification:', { 
      receivedState: state ? `${state.substring(0, 10)}...` : null,
      storedState: storedState ? `${storedState.substring(0, 10)}...` : null,
      match: state === storedState
    });
    
  // Enhanced iOS debugging for state issues
  const userAgent = request.headers.get('user-agent') || '';
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  if (isIOS && !storedState) {
    console.error('🍎 iOS STATE COOKIE MISSING:');
    console.error('🍎 This suggests iOS privacy settings are blocking cookies');
    console.error('🍎 All cookies:', allCookies.map(c => c.name));
    console.error('🍎 User Agent:', userAgent);
  }
  
  if (state !== storedState) {
      console.error('❌ State mismatch in Spotify callback');
      return NextResponse.redirect(new URL('/?spotify=error&reason=state_mismatch', request.url));
  }

    // Environment detection
    console.log('🌍 Environment detection...');
    const nodeEnv = process.env.NODE_ENV;
    const vercelEnv = process.env.VERCEL_ENV;
    const explicitRedirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const isProduction = nodeEnv === 'production' || vercelEnv === 'production';
    
    console.log('Environment info:', {
      nodeEnv,
      vercelEnv,
      isProduction,
      hasExplicitRedirectUri: !!explicitRedirectUri
    });

    const redirectUri = explicitRedirectUri || 
      (isProduction 
        ? 'https://sagey-pwa.vercel.app/api/spotify/callback'
        : 'http://localhost:3000/api/spotify/callback');

    console.log('🔗 Using redirect URI:', redirectUri);

    // Token exchange
    console.log('🔄 Starting token exchange...');
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    });

    console.log('Token request details:', {
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      hasAuthHeader: true,
      bodyParams: Object.fromEntries(tokenRequestBody.entries())
    });

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: tokenRequestBody.toString()
    });

    console.log('Token response received:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorBody: errorData
      });
      return NextResponse.redirect(new URL('/?spotify=error&reason=token_exchange', request.url));
    }

    let tokenData;
    try {
      const tokenText = await tokenResponse.text();
      console.log('Raw token response:', tokenText.substring(0, 200) + '...');
      tokenData = JSON.parse(tokenText);
    } catch (parseError) {
      console.error('❌ Failed to parse token response:', parseError);
      return NextResponse.redirect(new URL('/?spotify=error&reason=token_parse', request.url));
    }

    console.log('✅ Token data parsed:', { 
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
      scope: tokenData.scope
    });

    // Validate token data structure
    if (!tokenData.access_token) {
      console.error('❌ Invalid token response: missing access_token');
      return NextResponse.redirect(new URL('/?spotify=error&reason=invalid_token', request.url));
    }

    // Get user profile
    console.log('👤 Fetching user profile...');
    console.log('🔑 Using access token for profile fetch:', `${tokenData.access_token.substring(0, 20)}...`);
    
    // Android-specific retry logic
    const isAndroid = /Android/.test(userAgent);
    
    let profileResponse;
    if (isAndroid) {
      console.log('🤖 Android detected: Using enhanced profile fetch');
      // Try with additional headers for Android compatibility
      profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': userAgent
        }
      });
    } else {
      profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
    }

    console.log('Profile response received:', {
      status: profileResponse.status,
      statusText: profileResponse.statusText,
      ok: profileResponse.ok,
      headers: Object.fromEntries(profileResponse.headers.entries())
    });

    if (!profileResponse.ok) {
      const profileErrorText = await profileResponse.text();
      console.error('❌ Failed to fetch Spotify profile:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        errorBody: profileErrorText,
        tokenLength: tokenData.access_token?.length,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      });
      
      // Enhanced Android debugging
      if (isAndroid) {
        console.error('🤖 ANDROID PROFILE FETCH FAILURE:');
        console.error('🤖 User Agent:', userAgent);
        console.error('🤖 Token Info:', {
          hasToken: !!tokenData.access_token,
          tokenPrefix: tokenData.access_token?.substring(0, 10),
          expiresIn: tokenData.expires_in,
          tokenType: tokenData.token_type
        });
        console.error('🤖 Profile Error Details:', profileErrorText);
      }
      
      return NextResponse.redirect(new URL('/?spotify=error&reason=profile_fetch', request.url));
    }

    let profileData;
    try {
      const profileText = await profileResponse.text();
      console.log('Raw profile response:', profileText.substring(0, 200) + '...');
      profileData = JSON.parse(profileText);
    } catch (parseError) {
      console.error('❌ Failed to parse profile response:', parseError);
      return NextResponse.redirect(new URL('/?spotify=error&reason=profile_parse', request.url));
    }

    console.log('✅ Profile data parsed:', { 
      id: profileData.id,
      displayName: profileData.display_name,
      email: profileData.email,
      hasImages: !!profileData.images?.length,
      accountType: profileData.product, // 'free' or 'premium'
      country: profileData.country,
      followers: profileData.followers?.total
    });

    // Create response
    console.log('🍪 Setting cookies...');
    const response = NextResponse.redirect(new URL('/?spotify=connected', request.url));
    
    // Simple, working cookie configuration
    console.log('🔍 Environment:', { isProduction });
    
    // Basic cookie options that work on all platforms
    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax' | 'none';
      path: string;
    } = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };
    
    // More permissive settings if we're having issues
    if (isProduction) {
      // In production, try more permissive settings
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = true;
    }

    console.log('Cookie options:', cookieOptions);

    // Set access token cookie
    try {
      const accessTokenOptions = {
        ...cookieOptions,
        maxAge: tokenData.expires_in || 3600
      };
      
      console.log('🔑 Setting access token cookie with options:', accessTokenOptions);
      console.log('🔑 Access token length:', tokenData.access_token?.length);
      console.log('🔑 Token expires in:', tokenData.expires_in, 'seconds');
      
      response.cookies.set('spotify_access_token', tokenData.access_token, accessTokenOptions);
      console.log('✅ Access token cookie set successfully');
      
      // Verify the cookie was set by reading it back
      const setCookieHeader = response.headers.get('Set-Cookie');
      console.log('🍪 Set-Cookie header:', setCookieHeader?.substring(0, 100) + '...');
      
    } catch (cookieError) {
      console.error('❌ CRITICAL: Failed to set access token cookie:', cookieError);
      console.error('❌ Error details:', {
        message: cookieError instanceof Error ? cookieError.message : 'Unknown error',
        tokenLength: tokenData.access_token?.length,
        cookieOptions
      });
    }

    // Set refresh token cookie
    if (tokenData.refresh_token) {
      try {
        const refreshTokenOptions = {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30 // 30 days
        };
        
        response.cookies.set('spotify_refresh_token', tokenData.refresh_token, refreshTokenOptions);
        console.log('✅ Refresh token cookie set');
      } catch (cookieError) {
        console.error('❌ Failed to set refresh token cookie:', cookieError);
      }
    }

    // Set user info cookie (client-accessible)
    try {
      const userInfo = JSON.stringify({
        user_id: profileData.id,
        display_name: profileData.display_name,
        email: profileData.email
      });
      
      const userInfoOptions = {
        httpOnly: false, // Allow client-side access
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax' as const,
        path: '/',
      };
      
      response.cookies.set('spotify_user_info', userInfo, userInfoOptions);
      console.log('✅ User info cookie set');
    } catch (cookieError) {
      console.error('❌ Failed to set user info cookie:', cookieError);
    }

    // Clear state cookie
    try {
      response.cookies.set('spotify_auth_state', '', {
        httpOnly: true,
        secure: isProduction,
        maxAge: 0,
        sameSite: 'lax',
        path: '/'
      });
      console.log('✅ State cookie cleared');
    } catch (cookieError) {
      console.error('❌ Failed to clear state cookie:', cookieError);
    }

    console.log('🎉 Spotify authentication successful for user:', profileData.display_name);
    console.log('📱 Mobile token fallback system active - deployment timestamp:', Date.now());
    console.log('=== SPOTIFY CALLBACK SUCCESS ===');
    return response;

  } catch (error: unknown) {
    console.error('💥 CRITICAL ERROR in Spotify callback:');
    console.error('Error type:', error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error details:', error);
    }
    
    if (error instanceof TypeError) {
      console.error('🔍 TypeError details - likely network or parsing issue');
    } else if (error instanceof SyntaxError) {
      console.error('🔍 SyntaxError details - likely JSON parsing issue');
    } else {
      console.error('🔍 Unknown error type');
    }
    
    console.log('=== SPOTIFY CALLBACK ERROR ===');
    return NextResponse.redirect(new URL('/?spotify=error&reason=server_error', request.url));
  }
} 