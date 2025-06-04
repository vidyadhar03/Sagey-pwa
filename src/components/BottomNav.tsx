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