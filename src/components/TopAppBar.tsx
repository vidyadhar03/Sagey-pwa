"use client";

import React from 'react';

// Helper component for SVG icons
const Icon = ({ path, className = "w-6 h-6" }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

interface TopAppBarProps {
  title: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  leftIconPath?: string;
  rightIconPath?: string;
  leftIconLabel?: string;
  rightIconLabel?: string;
}

export default function TopAppBar({
  title,
  showLeftIcon = false,
  showRightIcon = false,
  leftIconPath = "M10.325 4.316a8.426 8.426 0 013.35 0M12 6.75V3.75m0 3a8.203 8.203 0 00-6.908 3.928M12 6.75c2.545 0 4.88.858 6.682 2.318m-6.682-2.318a8.203 8.203 0 016.908 3.928M3.75 12H.75m3 0a8.203 8.203 0 002.318 6.682M3.75 12A8.203 8.203 0 016.068 5.318m0 0A8.235 8.235 0 0112 3.75m6.682 9.032a8.203 8.203 0 01-2.318 6.682M17.25 12a8.203 8.203 0 00-2.318-6.682m0 0A8.235 8.235 0 0012 3.75M12 17.25v3M12 17.25a8.203 8.203 0 006.908-3.928M12 17.25a8.203 8.203 0 01-6.908-3.928m0 0A8.235 8.235 0 0112 20.25m-6.682-9.032a8.203 8.203 0 012.318-6.682M7.932 18.682a8.203 8.203 0 01-2.318-6.682m0 0A8.235 8.235 0 0012 20.25",
  rightIconPath = "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.05h5.404a2.25 2.25 0 010 2.186h-5.404a2.25 2.25 0 00-.588.05m0 0a2.25 2.25 0 100 2.186m0-2.186v2.186m0 0h5.404a2.25 2.25 0 100-2.186h-5.404m0 0L2.186 12m5.031 2.186L2.186 12",
  leftIconLabel = "Settings",
  rightIconLabel = "Share"
}: TopAppBarProps) {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-[60px]"
      style={{
        background: 'rgba(18, 18, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', // For Safari
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left Icon (Optional) */}
        <div className="w-10 flex justify-start">
          {showLeftIcon ? (
            <button className="p-2" aria-label={leftIconLabel}>
              <Icon path={leftIconPath} />
            </button>
          ) : <div />}
        </div>

        {/* Title - Centered */}
        <h1 className="text-xl font-medium text-white">{title}</h1>

        {/* Right Icon (Optional) */}
        <div className="w-10 flex justify-end">
          {showRightIcon ? (
            <button className="p-2" aria-label={rightIconLabel}>
              <Icon path={rightIconPath} />
            </button>
          ) : <div />}
        </div>
      </div>
    </header>
  );
} 