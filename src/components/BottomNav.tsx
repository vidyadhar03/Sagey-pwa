"use client";

import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabClick }: BottomNavProps) {
  // The renderIcon function was unused, so I've removed it

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-card-bg border-t border-white/10 rounded-t-xl flex justify-center">
      <nav className="w-full max-w-7xl mx-auto flex justify-around items-center px-3 py-3">
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
        
        {/* Journal Tab */}
        <button 
          onClick={() => onTabClick('journal')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'journal' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      </nav>
    </div>
  );
}