"use client";

import React, { ReactNode, useState } from 'react';
import BottomNav from './BottomNav';
import HomeLayout from './screens/HomeLayout';
import InsightsLayout from './screens/InsightsLayout';
import ExploreLayout from './screens/ExploreLayout';

interface FrameLayoutProps {
  // Removed unused children prop
}

export default function FrameLayout({}: FrameLayoutProps) {
  // Implement active tab state
  const [activeTab, setActiveTab] = useState('home');
  
  const handleTabClick = (tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
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
        return <ExploreLayout />;
      default:
        return <HomeLayout onTabClick={handleTabClick} />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#0D0D0F] text-white overflow-hidden">
      <main className="flex-1 relative">
        {/* Render the active tab component without forced remounting */}
        {renderActiveTab()}
      </main>
      <BottomNav activeTab={activeTab} onTabClick={handleTabClick} />
    </div>
  );
} 