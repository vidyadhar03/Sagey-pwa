"use client";

import React, { ReactNode, useState } from 'react';
import BottomNav from './BottomNav';
import HomeLayout from './screens/HomeLayout';
import InsightsLayout from './screens/InsightsLayout';
import NewInsightsLayout from './screens/NewInsightsLayout';
import SpotifyDataView from './SpotifyDataView';
import { useSpotify } from '../hooks/useSpotify';

// Dynamic Top Bar Component - Only show when Spotify is connected
const DynamicTopBar = ({ activeTab }: { activeTab: string }) => {
  const getTopBarContent = () => {
    switch (activeTab) {
      case 'home':
        return {
          title: 'Sagey',
          showProfile: true,
          titleAlign: 'left' as const
        };
      case 'insights':
        return {
          title: 'Music Insights',
          showProfile: true,
          titleAlign: 'left' as const
        };
      case 'explore':
        return {
          title: 'Explore',
          showProfile: true,
          titleAlign: 'left' as const
        };
      case 'insights-plus':
        return {
          title: 'Insights',
          showProfile: false,
          titleAlign: 'left' as const
        };
      default:
        return {
          title: 'Sagey',
          showProfile: true,
          titleAlign: 'left' as const
        };
    }
  };

  const { title, showProfile, titleAlign } = getTopBarContent();

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
        {/* Left side - Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-medium text-white">{title}</h1>
        </div>

        {/* Right side - Profile icon (conditional) */}
        <div className="flex items-center">
          {showProfile && (
            <button className="p-2" aria-label="Profile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

interface FrameLayoutProps {
  // Removed unused children prop
}

export default function FrameLayout({}: FrameLayoutProps) {
  // Implement active tab state
  const [activeTab, setActiveTab] = useState('home');
  const [exploreOptions, setExploreOptions] = useState<{ section?: string } | undefined>();
  
  // Get Spotify connection status
  const { connected } = useSpotify();
  
  const handleTabClick = (tab: string, options?: { section?: string }) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      
      // Handle explore tab with specific section
      if (tab === 'explore' && options?.section) {
        setExploreOptions(options);
      } else {
        setExploreOptions(undefined);
      }
    }
  };

  // Render components without keys to prevent unnecessary remounting
  // Components will handle their own state management and optimization
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeLayout onTabClick={handleTabClick} />;
      case 'insights':
        return <InsightsLayout />;
      case 'explore':
        return <SpotifyDataView initialSection={exploreOptions?.section} />;
      case 'insights-plus':
        return <NewInsightsLayout />;
      default:
        return <HomeLayout onTabClick={handleTabClick} />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#0D0D0F] text-white overflow-hidden">
      {/* Dynamic Top Bar - Only show when Spotify is connected */}
      {connected && <DynamicTopBar activeTab={activeTab} />}
      
      <main className={`flex-1 relative ${connected ? 'pt-[60px]' : ''}`}>
        {/* Render the active tab component without forced remounting */}
        {renderActiveTab()}
      </main>
      <BottomNav activeTab={activeTab} onTabClick={handleTabClick} />
    </div>
  );
} 