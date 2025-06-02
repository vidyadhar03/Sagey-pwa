import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚪 Logout API: Starting logout process');
  
  try {
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully logged out from Spotify' 
    });

    // Clear all Spotify-related cookies
    const cookiesToClear = [
      'spotify_access_token',
      'spotify_refresh_token', 
      'spotify_user_info',
      'spotify_auth_state',
      'spotify_code_verifier'
    ];

    cookiesToClear.forEach(cookieName => {
      // Clear for current domain
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });

      // Clear for all possible domains/paths
      response.cookies.set(cookieName, '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
      
      // Also clear with different sameSite settings for mobile compatibility
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 0,
        path: '/'
      });
    });

    console.log('✅ Logout API: Successfully cleared all Spotify cookies');
    
    return response;
    
  } catch (error) {
    console.error('💥 Logout API: Error during logout:', error);
    
    // Still try to clear cookies even if there's an error
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Logout completed with warnings',
        message: 'Session cleared locally but server cleanup may have failed' 
      }, 
      { status: 200 } // Return 200 so frontend treats it as success
    );

    // Clear cookies in error case too
    const cookiesToClear = [
      'spotify_access_token',
      'spotify_refresh_token',
      'spotify_user_info', 
      'spotify_auth_state',
      'spotify_code_verifier'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
    });

    return response;
  }
} 