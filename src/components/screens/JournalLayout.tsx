"use client";

import React from 'react';
import TopAppBar from '../TopAppBar';

export default function JournalLayout() {
  // Journal category data - keeping only one custom tile
  const journalCategories = [
    {
      id: 1,
      name: "Health",
      entries: 2,
      icon: "heart",
      hasEntries: true
    },
    {
      id: 2,
      name: "Relationships", 
      entries: 1,
      icon: "users",
      hasEntries: true
    },
    {
      id: 3,
      name: "Finance",
      entries: 3,
      icon: "dollar",
      hasEntries: true
    },
    {
      id: 4,
      name: "Custom",
      entries: 0,
      icon: "plus",
      hasEntries: false
    }
  ];

  // Recent journal entries data
  const recentEntries = [
    {
      id: 1,
      title: "Morning Meditation",
      category: "Health",
      excerpt: "Started my day with 10 minutes of mindfulness...",
      date: "Today",
      mood: "😌"
    },
    {
      id: 2,
      title: "Investment Planning",
      category: "Finance", 
      excerpt: "Reviewed my portfolio and set new goals...",
      date: "Yesterday",
      mood: "📈"
    },
    {
      id: 3,
      title: "Family Time",
      category: "Relationships",
      excerpt: "Had a wonderful dinner with the family...",
      date: "2 days ago",
      mood: "❤️"
    }
  ];

  // Icon component renderer
  const renderIcon = (iconType: string) => {
    switch(iconType) {
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        );
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0011.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        );
      case 'dollar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'plus':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <TopAppBar
        title="Journal"
        showLeftIcon={false}
        showRightIcon={false}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto px-4 pb-[120px]">
          
          {/* Journal Categories Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {journalCategories.map((category, index) => (
              <button
                key={category.id}
                className="relative p-4 rounded-xl bg-[#2A2A2D] border border-white/10 text-left transition-all hover:bg-[#2A2A2D]/80"
              >
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className="mb-4">
                    {renderIcon(category.icon)}
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-white font-medium text-base mb-1">
                    {category.name}
                  </h3>
                  
                  {/* Entry Count */}
                  <div className="flex items-center justify-between">
                    <p className="text-secondary text-sm">
                      {category.entries} {category.entries === 1 ? 'entry' : 'entries'}
                    </p>
                    
                    {/* Yellow emoji indicator for cards with entries */}
                    {category.hasEntries && (
                      <span className="text-lg">😊</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Recent Journal Entries Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-lg">Recent Entries</h3>
              <button className="text-accent-secondary text-sm font-medium">View All</button>
            </div>
            
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <button
                  key={entry.id}
                  className="w-full p-4 rounded-xl bg-[#2A2A2D] border border-white/10 text-left transition-all hover:bg-[#2A2A2D]/80"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1">{entry.title}</h4>
                      <p className="text-accent-secondary text-xs mb-2">{entry.category}</p>
                      <p className="text-secondary text-sm line-clamp-2">{entry.excerpt}</p>
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      <span className="text-xl mb-1">{entry.mood}</span>
                      <span className="text-secondary text-xs">{entry.date}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Analytics Section */}
          <div className="mt-8">
            <h3 className="text-white font-medium text-lg mb-4">Writing Insights</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Writing Streak */}
              <div className="p-4 rounded-xl bg-[#2A2A2D] border border-white/10">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent-secondary mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                  <h4 className="text-white font-medium text-sm">Writing Streak</h4>
                </div>
                <p className="text-accent-secondary text-2xl font-bold">7</p>
                <p className="text-secondary text-xs">days in a row</p>
              </div>

              {/* Mood Trend */}
              <div className="p-4 rounded-xl bg-[#2A2A2D] border border-white/10">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  <h4 className="text-white font-medium text-sm">Mood Trend</h4>
                </div>
                <p className="text-accent text-2xl font-bold">↗️</p>
                <p className="text-secondary text-xs">improving</p>
              </div>
            </div>
          </div>

          {/* Quick Journal Floating Button - Bottom Right */}
          <div className="fixed bottom-20 right-4 z-20">
            <button className="flex items-center px-4 py-3 bg-accent-secondary hover:bg-accent-secondary/90 rounded-full transition-all shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75v-9.5A2.25 2.25 0 016.25 7H11" />
              </svg>
              <span className="text-white font-medium">Write</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
} 