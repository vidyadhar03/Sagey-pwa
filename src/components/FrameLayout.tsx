"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import HomeLayout from './screens/HomeLayout';
import JournalLayout from './screens/JournalLayout';
import InsightsLayout from './screens/InsightsLayout';

interface FrameLayoutProps {
  children: ReactNode;
}

export default function FrameLayout({ children }: FrameLayoutProps) {
  // Implement active tab state
  const [activeTab, setActiveTab] = useState('home');
  // Add a key state to force remount of tab components
  const [tabKey, setTabKey] = useState(0);
  
  const handleTabClick = (tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      // Increment key to force component remount when tab changes
      setTabKey(prev => prev + 1);
    }
  };

  // Determine which tab component to render
  let activeTabComponent;
  if (activeTab === 'home') activeTabComponent = <HomeLayout key={`home-${tabKey}`} />;
  else if (activeTab === 'journal') activeTabComponent = <JournalLayout key={`journal-${tabKey}`} />;
  else if (activeTab === 'insights') activeTabComponent = <InsightsLayout key={`insights-${tabKey}`} />;

  return (
    <div className="w-full h-screen flex flex-col bg-[#0D0D0F] text-white">
      <main className="flex-1 overflow-auto">
        {/* Render the active tab component */}
        {activeTabComponent}
      </main>
      <BottomNav activeTab={activeTab} onTabClick={handleTabClick} />
    </div>
  );
} 