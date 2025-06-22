"use client";

import React, { ReactNode, useState } from 'react';
import BottomNav from './BottomNav';
import HomeLayout from './screens/HomeLayout';
import InsightsLayout from './screens/InsightsLayout';
import NewInsightsLayout from './screens/NewInsightsLayout';
import SpotifyDataView from './SpotifyDataView';
import UserProfile from './UserProfile';
import RefreshTestPanel from './debug/RefreshTestPanel';
import { useSpotify } from '../hooks/useSpotify';

// Dynamic Top Bar Component - Only show when Spotify is connected
const DynamicTopBar = ({ 
  activeTab, 
  onProfileClick, 
  exploreTopBarData 
}: { 
  activeTab: string; 
  onProfileClick: () => void;
  exploreTopBarData?: {
    title: string;
    showViewToggle: boolean;
    viewMode: 'list' | 'grid';
    onViewModeToggle: () => void;
    onShareClick: () => void;
  };
}) => {
  const getTopBarContent = () => {
    switch (activeTab) {
      case 'home':
        return {
          title: 'Vynce',
          showProfile: true,
          titleAlign: 'left' as const
        };
      case 'explore':
        return {
          title: exploreTopBarData?.title || 'Explore',
          showProfile: !exploreTopBarData, // Hide profile when explore data is active
          showExploreControls: !!exploreTopBarData,
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
          title: 'Vynce',
          showProfile: true,
          titleAlign: 'left' as const
        };
    }
  };

  const { title, showProfile, showExploreControls, titleAlign } = getTopBarContent();

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

        {/* Right side - Profile icon or Explore controls */}
        <div className="flex items-center gap-3">
          {showExploreControls && exploreTopBarData && (
            <>
                             {/* View Mode Toggle */}
               {exploreTopBarData.showViewToggle && (
                 <button
                   onClick={exploreTopBarData.onViewModeToggle}
                   className="p-2 hover:text-white transition-all"
                   title={`Switch to ${exploreTopBarData.viewMode === 'list' ? 'grid' : 'list'} view`}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-white transition-colors">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                       exploreTopBarData.viewMode === 'list' 
                         ? "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"
                         : "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                     } />
                   </svg>
                 </button>
               )}
               
               {/* Share Insights Button */}
               <button
                 onClick={exploreTopBarData.onShareClick}
                 className="p-2 hover:text-[#1ed760] transition-all"
                 title="Share insights"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#1DB954] hover:text-[#1ed760] transition-colors">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                 </svg>
               </button>
            </>
          )}
          
          {showProfile && (
            <button className="p-2" aria-label="Profile" onClick={onProfileClick}>
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
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [exploreTopBarData, setExploreTopBarData] = useState<{
    title: string;
    showViewToggle: boolean;
    viewMode: 'list' | 'grid';
    onViewModeToggle: () => void;
    onShareClick: () => void;
  }>();
  
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

  const handleProfileClick = () => {
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
  };

  // Render components without keys to prevent unnecessary remounting
  // Components will handle their own state management and optimization
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeLayout onTabClick={handleTabClick} />;
      case 'explore':
        return <SpotifyDataView initialSection={exploreOptions?.section} onUpdateTopBar={setExploreTopBarData} />;
      case 'insights-plus':
        return <NewInsightsLayout />;
      default:
        return <HomeLayout onTabClick={handleTabClick} />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#0D0D0F] text-white">
      {/* Dynamic Top Bar - Only show when Spotify is connected */}
      {connected && <DynamicTopBar activeTab={activeTab} onProfileClick={handleProfileClick} exploreTopBarData={exploreTopBarData} />}
      
      <main className={`flex-1 relative overflow-hidden ${connected ? 'pt-[60px]' : ''}`}>
        {/* Render the active tab component without forced remounting */}
        {renderActiveTab()}
      </main>
      <BottomNav activeTab={activeTab} onTabClick={handleTabClick} />
      
      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={handleCloseUserProfile} />
      )}
      
      {/* Debug Panel for Testing Refresh Functionality */}
      <RefreshTestPanel enabled={true} />
    </div>
  );
} 