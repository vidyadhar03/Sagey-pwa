"use client";

import React, { useState } from 'react';
import TopAppBar from '../TopAppBar';

export default function InsightsLayout() {
  const [activeTab, setActiveTab] = useState<'music' | 'journal' | 'combined'>('combined');

  // Sample data for insights
  const musicInsights = {
    topGenres: [
      { name: 'Electronic Pop', percentage: 35, color: '#1DB954' },
      { name: 'Indie Rock', percentage: 28, color: '#1ED760' },
      { name: 'Lo-fi Hip Hop', percentage: 22, color: '#1AA34A' },
      { name: 'Ambient', percentage: 15, color: '#16803C' }
    ],
    dailyListening: {
      average: '2h 34m',
      trend: '+12%',
      weeklyData: [45, 67, 89, 123, 95, 156, 134] // minutes per day
    },
    moodProfile: {
      energy: 75,
      valence: 68,
      danceability: 82
    },
    topTracks: [
      { name: 'Midnight City', artist: 'M83', plays: 23 },
      { name: 'Feel It Still', artist: 'Portugal. The Man', plays: 19 },
      { name: 'Electric Feel', artist: 'MGMT', plays: 17 }
    ]
  };

  const journalInsights = {
    moodTrend: 'improving',
    streakDays: 7,
    topCategories: [
      { name: 'Health', entries: 12, trend: '+2' },
      { name: 'Work', entries: 8, trend: '+1' },
      { name: 'Relationships', entries: 5, trend: '0' }
    ],
    weeklyMoods: ['😊', '😌', '😐', '😊', '😄', '😌', '😊']
  };

  const combinedInsights = [
    {
      id: 1,
      type: 'correlation',
      insight: "You tend to feel 25% happier on days you listen to energetic playlists",
      confidence: 'High',
      dataPoints: 14,
      icon: '🎵',
      action: 'View playlist recommendations'
    },
    {
      id: 2,
      type: 'pattern',
      insight: "Your most productive journaling happens after listening to Lo-fi Hip Hop",
      confidence: 'Medium',
      dataPoints: 8,
      icon: '✍️',
      action: 'Explore writing sessions'
    },
    {
      id: 3,
      type: 'discovery',
      insight: "Electronic Pop peaks coincide with your best mood days this week",
      confidence: 'High',
      dataPoints: 7,
      icon: '⚡',
      action: 'See detailed breakdown'
    }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'music':
        return (
          <div className="space-y-6">
            {/* Spotify Connection Status */}
            <div className="p-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-[#1DB954]">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Spotify Connected</h3>
                    <p className="text-secondary text-sm">Last synced: 2 hours ago</p>
                  </div>
                </div>
                <button className="text-[#1DB954] text-sm font-medium">Refresh Data</button>
              </div>
            </div>

            {/* Listening Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
                <h4 className="text-white font-medium mb-2">Daily Average</h4>
                <p className="text-[#1DB954] text-2xl font-bold">{musicInsights.dailyListening.average}</p>
                <p className="text-secondary text-sm">
                  <span className="text-[#1DB954]">{musicInsights.dailyListening.trend}</span> vs last week
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
                <h4 className="text-white font-medium mb-2">Energy Level</h4>
                <p className="text-accent-secondary text-2xl font-bold">{musicInsights.moodProfile.energy}%</p>
                <p className="text-secondary text-sm">High energy music</p>
              </div>
            </div>

            {/* Top Genres */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Top Genres This Week</h4>
              <div className="space-y-3">
                {musicInsights.topGenres.map((genre, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white text-sm">{genre.name}</span>
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-white/10 rounded-full mr-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${genre.percentage}%`, 
                            backgroundColor: genre.color 
                          }}
                        />
                      </div>
                      <span className="text-secondary text-sm w-8">{genre.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tracks */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Most Played Tracks</h4>
              <div className="space-y-3">
                {musicInsights.topTracks.map((track, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{track.name}</p>
                      <p className="text-secondary text-xs">{track.artist}</p>
                    </div>
                    <span className="text-[#1DB954] text-sm font-medium">{track.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'journal':
        return (
          <div className="space-y-6">
            {/* Mood Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
                <h4 className="text-white font-medium mb-2">Mood Trend</h4>
                <p className="text-accent text-2xl font-bold">↗️</p>
                <p className="text-secondary text-sm">{journalInsights.moodTrend}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
                <h4 className="text-white font-medium mb-2">Writing Streak</h4>
                <p className="text-accent-secondary text-2xl font-bold">{journalInsights.streakDays}</p>
                <p className="text-secondary text-sm">days in a row</p>
              </div>
            </div>

            {/* Weekly Mood Pattern */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">This Week's Moods</h4>
              <div className="flex justify-between items-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <p className="text-secondary text-xs mb-2">{day}</p>
                    <div className="text-2xl mb-1">{journalInsights.weeklyMoods[index]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Journal Categories</h4>
              <div className="space-y-3">
                {journalInsights.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white text-sm">{category.name}</span>
                    <div className="flex items-center">
                      <span className="text-secondary text-sm mr-2">{category.entries} entries</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.trend.startsWith('+') 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {category.trend === '0' ? '→' : category.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'combined':
        return (
          <div className="space-y-6">
            {/* Hero Insight */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-secondary/20 border border-accent/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">💡</span>
                <h3 className="text-white font-semibold">Weekly Aha! Moment</h3>
              </div>
              <p className="text-white text-lg leading-relaxed mb-4">
                "Your most creative journal entries happen after listening to Lo-fi Hip Hop for 30+ minutes"
              </p>
              <button className="px-4 py-2 bg-accent hover:bg-accent/90 rounded-full text-white text-sm font-medium transition-all">
                Explore This Pattern
              </button>
            </div>

            {/* Cross-Domain Insights */}
            <div className="space-y-4">
              <h3 className="text-white font-medium text-lg">Music × Journal Insights</h3>
              {combinedInsights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{insight.icon}</span>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                          insight.confidence === 'High' 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-accent-secondary/20 text-accent-secondary'
                        }`}>
                          {insight.confidence} Confidence
                        </span>
                        <span className="text-secondary text-xs">{insight.dataPoints} data points</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white text-sm leading-relaxed mb-3">{insight.insight}</p>
                  <button className="text-accent text-sm font-medium hover:text-accent/80 transition-colors">
                    {insight.action} →
                  </button>
                </div>
              ))}
            </div>

            {/* Integration Status */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-3">Active Integrations</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#1DB954] rounded-full mr-2"></div>
                    <span className="text-white text-sm">Spotify</span>
                  </div>
                  <span className="text-secondary text-xs">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    <span className="text-white text-sm">Journal</span>
                  </div>
                  <span className="text-secondary text-xs">Active</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-white/20 rounded-lg text-white text-sm hover:bg-white/5 transition-all">
                + Add More Integrations
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <TopAppBar
        title="Insights"
        showLeftIcon={false}
        showRightIcon={false}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto px-4 pb-[120px]">
          
          {/* Tab Switcher */}
          <div className="mt-6 mb-6">
            <div className="flex bg-[#2A2A2D] p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('combined')}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'combined'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-secondary hover:text-white'
                }`}
              >
                Combined
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'music'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-secondary hover:text-white'
                }`}
              >
                Music
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'journal'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-secondary hover:text-white'
                }`}
              >
                Journal
              </button>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderTabContent()}

        </div>
      </div>
    </>
  );
} 