"use client";

import React, { useState, useEffect } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, loading: authLoading } = useSpotify();
  const router = useRouter();

  // Check for auth errors when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyStatus = urlParams.get('spotify');
    const errorReason = urlParams.get('reason');

    if (spotifyStatus === 'error') {
      let errorMessage = 'Failed to connect to Spotify. Please try again.';
      
      switch (errorReason) {
        case 'auth_error':
          errorMessage = 'Spotify authorization was cancelled or denied. Please try connecting again.';
          break;
        case 'config_error':
          errorMessage = 'Spotify configuration error. Please contact support.';
          break;
        case 'state_mismatch':
          errorMessage = 'Security validation failed. Please try connecting again.';
          break;
        case 'token_exchange':
          errorMessage = 'Failed to exchange authorization code. Please try again.';
          break;
        case 'profile_fetch':
          errorMessage = 'Failed to fetch your Spotify profile. Please try again.';
          break;
        case 'server_error':
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        case 'missing_params':
          errorMessage = 'Invalid authorization response. Please try again.';
          break;
      }
      
      setAuthError(errorMessage);
      
      // Clear the error parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleConnect = async () => {
    try {
      // Clear any previous auth errors
      setAuthError(null);
      // Set connecting state to show loading on button
      setIsConnecting(true);
      await connect();
      // connect() triggers full-page redirect; code below unlikely executed
    } catch (err) {
      console.error('Onboarding connect error', err);
      setIsConnecting(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#E91E63]/10 to-[#9C27B0]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-[#2196F3]/10 to-[#00BCD4]/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-[#673AB7]/10 to-[#3F51B5]/10 rounded-full blur-lg"></div>
      </div>

      {step === 0 && (
        <div className="text-center max-w-md w-full relative z-10 animate-fadeInUp">
          {/* Vynce Logo */}
          <div className="mb-6 relative">
            <div className="w-32 h-32 mx-auto mb-2 relative flex items-center justify-center">
              <img 
                src="/icons/Vynce_logo.png" 
                alt="Vynce Logo" 
                width={128} 
                height={128}
                className="drop-shadow-2xl object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Vynce
            </h1>
          </div>
          
          {/* Simplified Content - Only 2-3 lines */}
          <div className="mb-6">
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              Your music, analyzed
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect your Spotify to discover insights about your musical taste
            </p>
          </div>

          {/* Error Display */}
          {authError && (
            <div className="mb-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 text-red-500 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-red-400 font-medium text-sm">Authentication Error</p>
                  <p className="text-xs text-red-300">{authError}</p>
                </div>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="mt-3 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Connect Button */}
          <button
            disabled={authLoading || isConnecting}
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] disabled:from-[#1DB954]/80 disabled:to-[#1ed760]/80 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
          >
            {(authLoading || isConnecting) ? (
              <Loader size={20} />
            ) : (
              <>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="mr-3 group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.08-.7-.15-.78-.5-.08-.35.15-.7.5-.78 3.8-.85 7.1-.5 9.73 1.1.35.17.4.57.2.93z"/>
                </svg>
                <span>Connect with Spotify</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 