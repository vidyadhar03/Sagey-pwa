"use client";

import React from 'react';
import { usePathname } from "next/navigation";
import FrameLayout from "./FrameLayout";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNavRoutes = ['/onboarding', '/account', '/settings', '/spotify-data'];
  const showNav = !noNavRoutes.some(route => pathname?.startsWith(route));

  return showNav ? <FrameLayout>{children}</FrameLayout> : <>{children}</>;
} 