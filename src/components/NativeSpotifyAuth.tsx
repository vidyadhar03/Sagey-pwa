'use client';

import React, { useEffect, useState } from 'react';
import { useNativeSpotifyAuth } from '../hooks/useNativeSpotifyAuth';
import Loader from './Loader';

interface NativeSpotifyAuthProps {
  onAuthChange?: (connected: boolean, userInfo: any) => void;
  onError?: (error: string) => void;
}

export const NativeSpotifyAuth: React.FC<NativeSpotifyAuthProps> = ({
  onAuthChange,
  onError
}) => {
  const {
    connected,
    loading,
    userInfo,
    authMethod,
    error,
    authenticate,
    logout,
    isNativeApp
  } = useNativeSpotifyAuth();

  const [spotifyAppInstalled, setSpotifyAppInstalled] = useState<boolean | null>(null);

  // Check if Spotify app is installed
  useEffect(() => {
    const checkSpotifyApp = async () => {
      if (!isNativeApp) {
        setSpotifyAppInstalled(false);
        return;
      }

      try {
        // Simple detection method
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS) {
          // Try to open spotify scheme
          const link = document.createElement('a');
          link.href = 'spotify://';
          
          const timeout = setTimeout(() => setSpotifyAppInstalled(false), 1000);
          
          const handleVisibilityChange = () => {
            if (document.hidden) {
              clearTimeout(timeout);
              setSpotifyAppInstalled(true);
            }
          };
          
          document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
          link.click();
          
          setTimeout(() => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (spotifyAppInstalled === null) {
              setSpotifyAppInstalled(false);
            }
          }, 1000);
        } else if (isAndroid) {
          // Android detection
          try {
            const intent = 'intent://open.spotify.com/#Intent;scheme=https;package=com.spotify.music;end';
            window.location.href = intent;
            setTimeout(() => setSpotifyAppInstalled(true), 500);
          } catch {
            setSpotifyAppInstalled(false);
          }
        } else {
          setSpotifyAppInstalled(false);
        }
      } catch (error) {
        console.warn('Could not detect Spotify app:', error);
        setSpotifyAppInstalled(false);
      }
    };

    checkSpotifyApp();
  }, [isNativeApp, spotifyAppInstalled]);

  // Notify parent of auth changes
  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(connected, userInfo);
    }
  }, [connected, userInfo, onAuthChange]);

  // Notify parent of errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader size={32} />
      </div>
    );
  }

  if (connected && userInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-green-900/20 rounded-lg border border-green-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Connected to Spotify</h3>
            <p className="text-sm text-white/60">
              {authMethod === 'app' ? 'Via Spotify App' : 'Via Browser'}
            </p>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-white font-medium">{userInfo.display_name}</p>
          <p className="text-sm text-white/60">{userInfo.email}</p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      {/* Spotify App Detection Status */}
      {isNativeApp && (
        <div className="w-full p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              spotifyAppInstalled === true ? 'bg-green-500' : 
              spotifyAppInstalled === false ? 'bg-red-500' : 
              'bg-yellow-500 animate-pulse'
            }`}></div>
            <p className="text-sm text-white/80">
              {spotifyAppInstalled === true ? 'Spotify app detected' :
               spotifyAppInstalled === false ? 'Spotify app not found' :
               'Detecting Spotify app...'}
            </p>
          </div>
          {spotifyAppInstalled === true && (
            <p className="text-xs text-green-400 mt-2">
              🎵 You&apos;ll get the best experience with app-to-app authentication!
            </p>
          )}
        </div>
      )}

      {/* Authentication Options */}
      <div className="w-full space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Connect to Spotify</h2>
          <p className="text-white/60">
            {isNativeApp ? 
              (spotifyAppInstalled ? 
                'Authenticate with your Spotify app or browser' : 
                'Connect with Spotify to continue'
              ) : 
              'Connect with Spotify to access your musical profile'
            }
          </p>
        </div>

        {/* Primary Auth Button */}
        <button
          onClick={authenticate}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5c-.203 0-.406-.078-.563-.234-.312-.312-.312-.813 0-1.125 1.875-1.875 1.875-4.906 0-6.781-.312-.312-.312-.813 0-1.125s.813-.312 1.125 0c2.5 2.5 2.5 6.531 0 9.031-.156.156-.359.234-.562.234zM12 16c-2.219 0-4-1.781-4-4s1.781-4 4-4 4 1.781 4 4-1.781 4-4 4zm2.5-2.5c-.203 0-.406-.078-.563-.234-.312-.312-.312-.813 0-1.125.625-.625.625-1.656 0-2.281-.312-.312-.312-.813 0-1.125s.813-.312 1.125 0c1.25 1.25 1.25 3.281 0 4.531-.156.156-.359.234-.562.234z"/>
          </svg>
          <span>
            {loading ? <Loader size={16} /> : 
             isNativeApp && spotifyAppInstalled ? 'Connect with Spotify' :
             'Connect with Spotify'}
          </span>
        </button>

        {/* Method Indicator */}
        <div className="text-center">
          <p className="text-xs text-white/40">
            {isNativeApp ? 
              (spotifyAppInstalled ? 
                'Will try Spotify app first, then browser if needed' : 
                'Will use in-app browser authentication'
              ) : 
              'Will redirect to Spotify for authentication'
            }
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full p-4 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-red-500">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div>
              <p className="text-red-400 font-medium">Authentication Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
          <button
            onClick={authenticate}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-full p-3 bg-gray-900/50 rounded border border-gray-700 text-xs">
          <p className="text-gray-400 mb-2">Debug Info:</p>
          <ul className="text-gray-500 space-y-1">
            <li>Environment: {isNativeApp ? 'Native App' : 'Web Browser'}</li>
            <li>Spotify App: {spotifyAppInstalled?.toString() || 'unknown'}</li>
            <li>Auth Method: {authMethod}</li>
            <li>User Agent: {navigator.userAgent.substring(0, 50)}...</li>
          </ul>
        </div>
      )}
    </div>
  );
}; 