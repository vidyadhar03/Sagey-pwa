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
            <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </button>
        
        {/* Explore Tab */}
        <button 
          onClick={() => onTabClick('explore')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'explore' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
        </button>
        
        {/* Stats Tab */}
        <button 
          onClick={() => onTabClick('stats')} 
          className={`flex items-center justify-center w-10 h-10 ${
            activeTab === 'stats' 
              ? 'text-white' 
              : 'text-[#808084]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M16 4v10l-4-4-4 4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
            <path d="M6 18h.01M10 18h.01M14 18h.01M18 18h.01M6 14h12v6H6z" />
          </svg>
        </button>
      </nav>
    </div>
  );
}