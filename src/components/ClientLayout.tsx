"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from "next/navigation";
import FrameLayout from "./FrameLayout";
import { useSpotify } from '@/hooks/useSpotify';
import Loader from '@/components/Loader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { connected, loading } = useSpotify();

  // Routes where we never redirect (public routes)
  const noRedirectRoutes = ['/onboarding'];
  const isOnPublicRoute = noRedirectRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Check for Spotify authentication errors in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyStatus = urlParams.get('spotify');
    const errorReason = urlParams.get('reason');

    // If there's a Spotify auth error, redirect to onboarding regardless of connection status
    if (spotifyStatus === 'error') {
      console.log('🔍 Spotify auth error detected, redirecting to onboarding:', {
        spotifyStatus,
        errorReason,
        pathname,
        connected
      });
      
      // Clear the error parameters and redirect to onboarding
      router.replace('/onboarding');
      return;
    }
    
    // Immediate redirect for root path if not authenticated and not loading
    if (!loading && !connected && pathname === '/') {
      router.replace('/onboarding');
      return;
    }
    
    // General redirect logic for protected routes
    if (!loading && !connected && !isOnPublicRoute) {
      router.replace('/onboarding');
    }
  }, [connected, loading, pathname, router, isOnPublicRoute]);

  // Show loading screen while checking authentication status
  // This prevents flash of authenticated app before redirect
  if (loading) {
    // Only show loading for non-public routes to avoid delay on onboarding page
    if (!isOnPublicRoute) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
          <Loader size={48} />
        </div>
      );
    }
  }

  // If not connected and not on public route, show loading while redirect happens
  if (!connected && !isOnPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <Loader size={48} />
      </div>
    );
  }

  const noNavRoutes = ['/onboarding', '/account', '/settings', '/spotify-data'];
  const showNav = !noNavRoutes.some(route => pathname?.startsWith(route));

  return showNav ? <FrameLayout>{children}</FrameLayout> : <>{children}</>;
} 