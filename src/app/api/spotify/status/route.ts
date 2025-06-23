import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== SPOTIFY STATUS CHECK START ===');
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Enhanced mobile detection and debugging
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    console.log('🔍 User agent analysis:', {
      userAgent: userAgent.substring(0, 100),
      isMobile,
      isIOS,
      isAndroid
    });
    
    // Check all cookies with enhanced logging
    console.log('🍪 Checking cookies...');
    const allCookies = request.cookies.getAll();
    console.log('All cookies found:', allCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value, 
      valueLength: c.value?.length,
      valuePreview: c.value?.substring(0, 20) + '...'
    })));
    
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    const userInfo = request.cookies.get('spotify_user_info')?.value;
    const authState = request.cookies.get('spotify_auth_state')?.value;
    
    // Check for mobile fallback token in user info cookie
    let mobileToken = null;
    let userInfoData = null;
    if (userInfo) {
      try {
        userInfoData = JSON.parse(decodeURIComponent(userInfo));
        if (userInfoData.mobile_fallback && userInfoData.access_token) {
          // Check if mobile token is still valid
          const expiresAt = userInfoData.expires_at;
          if (expiresAt && Date.now() < expiresAt) {
            mobileToken = userInfoData.access_token;
            console.log('📱 Found valid mobile fallback token');
          } else {
            console.log('⏰ Mobile fallback token expired');
          }
        }
      } catch (parseError) {
        console.log('❌ Failed to parse user info cookie:', parseError);
      }
    }
    
    // Use primary token or mobile fallback
    const effectiveToken = accessToken || mobileToken;
    
    console.log('🔑 Token analysis:', {
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length,
      hasMobileToken: !!mobileToken,
      mobileTokenLength: mobileToken?.length,
      hasUserInfo: !!userInfo,
      hasAuthState: !!authState,
      cookieCount: allCookies.length,
      userInfoData: userInfoData ? {
        userId: userInfoData.user_id,
        displayName: userInfoData.display_name,
        hasMobileFallback: !!userInfoData.mobile_fallback,
        tokenExpiry: userInfoData.expires_at ? new Date(userInfoData.expires_at).toISOString() : null
      } : null
    });
    
    if (!effectiveToken) {
      console.log('❌ No access token found (neither primary nor mobile fallback)');
      return NextResponse.json({
        connected: false,
        user: null,
        debug: {
          reason: 'no_access_token',
          cookieCount: allCookies.length,
          hasUserInfo: !!userInfo,
          isMobile,
          checkedMobileFallback: !!userInfo,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify token is still valid by making a simple API call
    console.log('🔄 Verifying token with Spotify API...');
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${effectiveToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Spotify API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      // Token is invalid or expired
      console.log('❌ Token validation failed');
      const errorText = await response.text();
      console.log('Error response body:', errorText.substring(0, 500));
      
      return NextResponse.json({
        connected: false,
        user: null,
        error: 'Token expired',
        debug: {
          reason: 'token_invalid',
          apiStatus: response.status,
          apiError: errorText.substring(0, 200),
          timestamp: new Date().toISOString()
        }
      });
    }

    const profileData = await response.json();
    
    console.log('✅ Profile data received:', {
      id: profileData.id,
      displayName: profileData.display_name,
      hasImages: !!profileData.images?.length,
      product: profileData.product,
      productType: typeof profileData.product,
      country: profileData.country,
      followers: profileData.followers?.total,
      email: profileData.email,
      fullProfileKeys: Object.keys(profileData)
    });

    // Log the complete profile data for debugging
    console.log('🔍 Complete Spotify profile data:', JSON.stringify(profileData, null, 2));
    
    console.log('=== SPOTIFY STATUS CHECK SUCCESS ===');
    
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
      },
      debug: {
        reason: 'success',
        tokenValid: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 CRITICAL ERROR in Spotify status check:');
    console.error('Error type:', error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error details:', error);
    }
    
    console.log('=== SPOTIFY STATUS CHECK ERROR ===');
    
    return NextResponse.json({
      connected: false,
      user: null,
      error: 'Internal server error',
      debug: {
        reason: 'server_error',
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
} 