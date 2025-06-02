'use client';

import { useState, useEffect, useCallback } from 'react';

// Types for native authentication
interface SpotifyAuthState {
  connected: boolean;
  loading: boolean;
  userInfo: {
    user_id: string;
    display_name: string;
    email: string;
  } | null;
  authMethod: 'app' | 'browser' | 'none';
  error: string | null;
}

interface AuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

// Native environment detection
const isNativeApp = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for native app markers
  return !!(
    (window as any).ReactNativeWebView || 
    (window as any).webkit?.messageHandlers ||
    (window as any).Android ||
    navigator.userAgent.includes('wv') || // WebView
    navigator.userAgent.includes('Version/') // Native browser wrapper
  );
};

// Spotify app detection
const canOpenSpotifyApp = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isNativeApp()) {
      resolve(false);
      return;
    }

    // iOS: Check if Spotify app is installed
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // Try to open spotify:// scheme (will fail silently if not installed)
      const link = document.createElement('a');
      link.href = 'spotify://';
      
      const timeout = setTimeout(() => resolve(false), 1000);
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(timeout);
          resolve(true);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
      link.click();
      
      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearTimeout(timeout);
        resolve(false);
      }, 1000);
    } 
    // Android: Check if Spotify app is installed
    else if (/Android/.test(navigator.userAgent)) {
      // Use intent to check if Spotify is installed
      const intent = 'intent://open.spotify.com/#Intent;scheme=https;package=com.spotify.music;end';
      
      try {
        window.location.href = intent;
        setTimeout(() => resolve(true), 500);
      } catch {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
};

// Generate PKCE challenge
const generatePKCE = async () => {
  const codeVerifier = generateRandomString(128);
  
  // Convert to bytes and hash
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url
  const base64url = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return { codeVerifier, codeChallenge: base64url };
};

const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

// Native secure storage (fallback to localStorage for web)
const NativeStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // Try native storage first
        if ((window as any).ReactNativeWebView) {
          (window as any).ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SET_SECURE_ITEM',
            key,
            value
          }));
        } else {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn('Storage failed, using localStorage:', error);
        localStorage.setItem(key, value);
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      try {
        // Try native storage first
        if ((window as any).ReactNativeWebView) {
          return new Promise((resolve) => {
            const requestId = Math.random().toString(36);
            
            const handler = (event: MessageEvent) => {
              if (event.data.type === 'GET_SECURE_ITEM_RESPONSE' && event.data.requestId === requestId) {
                window.removeEventListener('message', handler);
                resolve(event.data.value);
              }
            };
            
            window.addEventListener('message', handler);
            
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
              type: 'GET_SECURE_ITEM',
              key,
              requestId
            }));
            
            // Fallback timeout
            setTimeout(() => {
              window.removeEventListener('message', handler);
              resolve(localStorage.getItem(key));
            }, 1000);
          });
        } else {
          return localStorage.getItem(key);
        }
      } catch (error) {
        console.warn('Storage failed, using localStorage:', error);
        return localStorage.getItem(key);
      }
    }
    return null;
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        if ((window as any).ReactNativeWebView) {
          (window as any).ReactNativeWebView.postMessage(JSON.stringify({
            type: 'REMOVE_SECURE_ITEM',
            key
          }));
        } else {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn('Storage failed, using localStorage:', error);
        localStorage.removeItem(key);
      }
    }
  }
};

export const useNativeSpotifyAuth = () => {
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    connected: false,
    loading: true,
    userInfo: null,
    authMethod: 'none',
    error: null
  });

  // Configuration
  const authConfig: AuthConfig = {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
    redirectUri: isNativeApp() 
      ? 'com.sagey.app://spotify-callback' 
      : window?.location?.origin + '/api/spotify/callback' || '',
    scopes: [
      'user-read-email',
      'user-library-read', 
      'playlist-read-private'
    ]
  };

  // Check existing authentication
  const checkExistingAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const accessToken = await NativeStorage.getItem('spotify_access_token');
      const userInfoStr = await NativeStorage.getItem('spotify_user_info');

      if (accessToken && userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        
        // Verify token is still valid
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
          setAuthState(prev => ({
            ...prev,
            connected: true,
            loading: false,
            userInfo,
            authMethod: 'browser', // We'll detect this better later
            error: null
          }));
          return;
        } else {
          // Token expired, clean up
          await Promise.all([
            NativeStorage.removeItem('spotify_access_token'),
            NativeStorage.removeItem('spotify_refresh_token'),
            NativeStorage.removeItem('spotify_user_info')
          ]);
        }
      }

      setAuthState(prev => ({ ...prev, connected: false, loading: false }));
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        connected: false, 
        loading: false, 
        error: 'Failed to check authentication status' 
      }));
    }
  }, []);

  // Spotify app authentication
  const authenticateWithSpotifyApp = useCallback(async (): Promise<boolean> => {
    try {
      const hasSpotifyApp = await canOpenSpotifyApp();
      
      if (!hasSpotifyApp) {
        return false;
      }

      const state = generateRandomString(16);
      await NativeStorage.setItem('spotify_auth_state', state);

      // Create Spotify app deep link
      const authParams = new URLSearchParams({
        client_id: authConfig.clientId,
        response_type: 'code',
        redirect_uri: authConfig.redirectUri,
        scope: authConfig.scopes.join(' '),
        state: state,
        show_dialog: 'true'
      });

      const spotifyAuthUrl = `spotify://auth?${authParams.toString()}`;
      
      // Open Spotify app
      window.location.href = spotifyAuthUrl;
      
      return true;
    } catch (error) {
      console.error('Spotify app auth failed:', error);
      return false;
    }
  }, [authConfig]);

  // Browser authentication with PKCE
  const authenticateWithBrowser = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Generate PKCE challenge
      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = generateRandomString(16);

      // Store PKCE verifier and state
      await Promise.all([
        NativeStorage.setItem('spotify_code_verifier', codeVerifier),
        NativeStorage.setItem('spotify_auth_state', state)
      ]);

      // Build authorization URL
      const authParams = new URLSearchParams({
        client_id: authConfig.clientId,
        response_type: 'code',
        redirect_uri: authConfig.redirectUri,
        scope: authConfig.scopes.join(' '),
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        show_dialog: 'true'
      });

      const authUrl = `https://accounts.spotify.com/authorize?${authParams.toString()}`;

      if (isNativeApp()) {
        // Open in-app browser
        if ((window as any).ReactNativeWebView) {
          (window as any).ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPEN_AUTH_BROWSER',
            url: authUrl,
            redirectUrl: authConfig.redirectUri
          }));
        } else {
          window.location.href = authUrl;
        }
      } else {
        // Regular web redirect
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Browser auth failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to start authentication' 
      }));
    }
  }, [authConfig]);

  // Main authenticate function
  const authenticate = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Try Spotify app first if native
      if (isNativeApp()) {
        const appAuthSuccess = await authenticateWithSpotifyApp();
        if (appAuthSuccess) {
          setAuthState(prev => ({ ...prev, authMethod: 'app' }));
          return;
        }
      }

      // Fallback to browser auth
      await authenticateWithBrowser();
      setAuthState(prev => ({ ...prev, authMethod: 'browser' }));
    } catch (error) {
      console.error('Authentication failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Authentication failed' 
      }));
    }
  }, [authenticateWithSpotifyApp, authenticateWithBrowser]);

  // Handle auth callback
  const handleAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Verify state
      const storedState = await NativeStorage.getItem('spotify_auth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for tokens
      const codeVerifier = await NativeStorage.getItem('spotify_code_verifier');
      
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: authConfig.redirectUri,
          client_id: authConfig.clientId,
          code_verifier: codeVerifier || ''
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Token exchange failed');
      }

      const tokenData = await tokenResponse.json();

      // Get user profile
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await profileResponse.json();

      // Store tokens and user info securely
      const userInfo = {
        user_id: profileData.id,
        display_name: profileData.display_name,
        email: profileData.email
      };

      await Promise.all([
        NativeStorage.setItem('spotify_access_token', tokenData.access_token),
        NativeStorage.setItem('spotify_refresh_token', tokenData.refresh_token || ''),
        NativeStorage.setItem('spotify_user_info', JSON.stringify(userInfo)),
        // Clean up auth artifacts
        NativeStorage.removeItem('spotify_auth_state'),
        NativeStorage.removeItem('spotify_code_verifier')
      ]);

      setAuthState(prev => ({
        ...prev,
        connected: true,
        loading: false,
        userInfo,
        error: null
      }));
    } catch (error) {
      console.error('Auth callback failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Authentication callback failed' 
      }));
    }
  }, [authConfig]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await Promise.all([
        NativeStorage.removeItem('spotify_access_token'),
        NativeStorage.removeItem('spotify_refresh_token'),
        NativeStorage.removeItem('spotify_user_info')
      ]);

      setAuthState({
        connected: false,
        loading: false,
        userInfo: null,
        authMethod: 'none',
        error: null
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    checkExistingAuth();
  }, [checkExistingAuth]);

  return {
    ...authState,
    authenticate,
    logout,
    handleAuthCallback,
    isNativeApp: isNativeApp()
  };
}; 