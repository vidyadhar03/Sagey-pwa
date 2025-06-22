"use client";

import { useState } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

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
        <Loader size={48} />
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
            {authLoading ? <Loader size={16} /> : 'Connect Spotify'}
          </button>
        </div>
      )}
    </div>
  );
} 