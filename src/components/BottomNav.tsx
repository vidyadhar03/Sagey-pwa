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
        
        {/* Insights Tab */}
        <button 
          onClick={() => onTabClick('insights')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'insights' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
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
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 4 4 6-6" />
            <path d="M17 10h4v4" />
          </svg>
        </button>
      </nav>
    </div>
  );
}