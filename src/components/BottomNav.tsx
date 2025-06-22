"use client";

import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabClick }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-card-bg border-t border-white/10 rounded-t-xl flex justify-center">
      <nav className="w-full max-w-7xl mx-auto flex justify-around items-center px-3 py-4">
        {/* Home Tab */}
        <button 
          onClick={() => onTabClick('home')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'home' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
        
        {/* Explore Top Tab */}
        <button 
          onClick={() => onTabClick('explore')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'explore' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {/* Insights Plus Tab */}
        <button 
          onClick={() => onTabClick('insights-plus')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'insights-plus' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <path d="M9 21h6" />
            <path d="M10 3h4" />
          </svg>
        </button>
      </nav>
    </div>
  );
}