"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from "next/navigation";
import FrameLayout from "./FrameLayout";
import { useSpotify } from '@/hooks/useSpotify';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { connected, loading } = useSpotify();

  // Routes where we never redirect (public routes)
  const noRedirectRoutes = ['/onboarding'];

  useEffect(() => {
    if (!loading && !connected && !noRedirectRoutes.some(route => pathname?.startsWith(route))) {
      router.replace('/onboarding');
    }
  }, [connected, loading, pathname, router]);

  const noNavRoutes = ['/onboarding', '/account', '/settings', '/spotify-data'];
  const showNav = !noNavRoutes.some(route => pathname?.startsWith(route));

  return showNav ? <FrameLayout>{children}</FrameLayout> : <>{children}</>;
} 