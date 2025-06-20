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

    // --- Build exhaustive Set-Cookie headers manually (bypass Next.js cookie Map) ---
    const buildHeader = (name: string, path: string, secure: boolean, sameSite: 'Lax' | 'None', httpOnly: boolean) => {
      return `${name}=; Path=${path}; Max-Age=0; ${httpOnly ? 'HttpOnly; ' : ''}${secure ? 'Secure; ' : ''}SameSite=${sameSite}`;
    };

    cookiesToClear.forEach(name => {
      ['/', '/api/spotify', '/api/spotify/'].forEach(path => {
        [true, false].forEach(secure => {
          // SameSite=Lax
          response.headers.append('Set-Cookie', buildHeader(name, path, secure, 'Lax', true));
          response.headers.append('Set-Cookie', buildHeader(name, path, secure, 'Lax', false));
          // SameSite=None only when secure true (spec requirement)
          if (secure) {
            response.headers.append('Set-Cookie', buildHeader(name, path, secure, 'None', true));
            response.headers.append('Set-Cookie', buildHeader(name, path, secure, 'None', false));
          }
        });
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