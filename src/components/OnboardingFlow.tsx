"use client";

import { useState } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { useRouter } from 'next/navigation';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const { connect, loading: authLoading } = useSpotify();
  const router = useRouter();

  const handleConnect = async () => {
    try {
      setRedirecting(true);
      await connect();
      // connect() triggers full-page redirect; code below unlikely executed
    } catch (err) {
      console.error('Onboarding connect error', err);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DB954] mx-auto mb-4"></div>
          <p className="text-white">Redirecting to Spotify…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] px-6">
      {step === 0 && (
        <div className="text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Sagey</h1>
          <p className="text-gray-400 mb-8">
            Personalised music insights powered by your Spotify listening habits. Connect your account to get started!
          </p>
          <button
            disabled={authLoading}
            onClick={handleConnect}
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#1DB954]/60 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
          >
            {authLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {authLoading ? 'Connecting…' : 'Connect Spotify'}
          </button>
        </div>
      )}
    </div>
  );
} 