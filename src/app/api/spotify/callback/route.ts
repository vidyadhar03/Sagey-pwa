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
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    console.log('Profile response received:', {
      status: profileResponse.status,
      statusText: profileResponse.statusText,
      ok: profileResponse.ok
    });

    if (!profileResponse.ok) {
      const profileErrorText = await profileResponse.text();
      console.error('❌ Failed to fetch Spotify profile:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        errorBody: profileErrorText
      });
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
      hasImages: !!profileData.images?.length
    });

    // Create response
    console.log('🍪 Setting cookies...');
    const response = NextResponse.redirect(new URL('/?spotify=connected', request.url));
    
    // Enhanced cookie options for mobile compatibility
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    console.log('🔍 User agent info:', {
      userAgent: userAgent.substring(0, 100),
      isMobile,
      isIOS,
      isAndroid,
      isProduction
    });
    
    // Platform-specific cookie strategies
    let cookieOptions;
    if (isIOS) {
      // iOS Safari strategy: conservative settings that work reliably
      cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const, // iOS Safari works better with 'lax'
        path: '/',
        // No domain setting for iOS - use default domain
      };
      console.log('🍎 Using iOS-optimized cookie strategy');
    } else if (isAndroid) {
      // Android Chrome strategy: more permissive settings for cross-site
      cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' as const : 'lax' as const,
        path: '/',
        domain: isProduction ? '.vercel.app' : undefined,
      };
      console.log('🤖 Using Android-optimized cookie strategy');
    } else {
      // Desktop strategy: standard secure settings
      cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
      };
      console.log('🖥️ Using desktop cookie strategy');
    }

    console.log('Cookie options:', cookieOptions);

    // Set access token cookie with mobile optimization
    try {
      const accessTokenOptions = {
        ...cookieOptions,
        maxAge: tokenData.expires_in || 3600
      };
      
      response.cookies.set('spotify_access_token', tokenData.access_token, accessTokenOptions);
      console.log('✅ Access token cookie set with options:', accessTokenOptions);
      
      // Android-specific fallback: store token in user info cookie (since Android blocks httpOnly cookies)
      if (isAndroid) {
        console.log('🤖 Android detected: Adding access token to user info for fallback');
        const androidUserInfo = JSON.stringify({
          user_id: profileData.id,
          display_name: profileData.display_name,
          email: profileData.email,
          access_token: tokenData.access_token, // Add token for Android
          expires_at: Date.now() + (tokenData.expires_in * 1000), // Add expiry
          mobile_fallback: true
        });
        
        // Set enhanced user info cookie for Android
        const androidUserInfoOptions = {
          httpOnly: false, // Allow client-side access
          secure: isProduction,
          maxAge: tokenData.expires_in || 3600, // Match token expiry
          sameSite: isProduction ? 'none' as const : 'lax' as const,
          path: '/',
          domain: isProduction ? '.vercel.app' : undefined,
        };
        
        response.cookies.set('spotify_user_info', androidUserInfo, androidUserInfoOptions);
        console.log('✅ Android user info with token set');
      }
    } catch (cookieError) {
      console.error('❌ Failed to set access token cookie:', cookieError);
    }

    // Set refresh token cookie with mobile optimization  
    if (tokenData.refresh_token) {
      try {
        const refreshTokenOptions = {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30 // 30 days
        };
        
        response.cookies.set('spotify_refresh_token', tokenData.refresh_token, refreshTokenOptions);
        console.log('✅ Refresh token cookie set with options:', refreshTokenOptions);
      } catch (cookieError) {
        console.error('❌ Failed to set refresh token cookie:', cookieError);
      }
    }

    // Set user info cookie (needs to be accessible to client-side)
    try {
      const userInfo = JSON.stringify({
        user_id: profileData.id,
        display_name: profileData.display_name,
        email: profileData.email
      });
      
      // Platform-specific user info cookie options
      let userInfoOptions;
      if (isIOS) {
        userInfoOptions = {
          httpOnly: false, // Allow client-side access
          secure: isProduction,
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax' as const, // iOS-safe setting
          path: '/',
        };
      } else if (isAndroid) {
        // Skip for Android - already set enhanced version above
        console.log('🤖 Skipping basic user info cookie for Android (enhanced version already set)');
        userInfoOptions = null;
      } else {
        // Desktop
        userInfoOptions = {
          httpOnly: false, // Allow client-side access
          secure: isProduction,
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax' as const,
          path: '/',
        };
      }
      
      if (userInfoOptions) {
        response.cookies.set('spotify_user_info', userInfo, userInfoOptions);
        console.log('✅ User info cookie set with options:', userInfoOptions);
      }
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