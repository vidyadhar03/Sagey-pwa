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
  onLeftClick?: () => void;
  onRightClick?: () => void;
}

export default function TopAppBar({
  title,
  showLeftIcon = false,
  showRightIcon = false,
  leftIconPath = "M15.75 19.5L8.25 12l7.5-7.5",
  rightIconPath = "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  leftIconLabel = "Back",
  rightIconLabel = "Profile",
  onLeftClick,
  onRightClick
}: TopAppBarProps) {

  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick();
    } else {
      window.history.back();
    }
  };

  const handleRightClick = () => {
    if (onRightClick) {
      onRightClick();
    }
  };

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
            <button className="p-2" aria-label={leftIconLabel} onClick={handleLeftClick}>
              <Icon path={leftIconPath} />
            </button>
          ) : <div />}
        </div>

        {/* Title - Centered */}
        <h1 className="text-xl font-medium text-white">{title}</h1>

        {/* Right Icon (Optional) */}
        <div className="w-10 flex justify-end">
          {showRightIcon ? (
            <button className="p-2" aria-label={rightIconLabel} onClick={handleRightClick}>
              <Icon path={rightIconPath} className="w-7 h-7" />
            </button>
          ) : <div />}
        </div>
      </div>
    </header>
  );
} 