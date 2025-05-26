"use client";

import React, { useState } from 'react';
import TopAppBar from '../TopAppBar';

export default function InsightsLayout() {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'ai-insights'>('overview');

  // Sample data for music insights
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
      danceability: 82,
      acousticness: 23,
      instrumentalness: 15
    },
    topTracks: [
      { name: 'Midnight City', artist: 'M83', plays: 23 },
      { name: 'Feel It Still', artist: 'Portugal. The Man', plays: 19 },
      { name: 'Electric Feel', artist: 'MGMT', plays: 17 }
    ],
    topArtists: [
      { name: 'M83', plays: 45, genre: 'Electronic' },
      { name: 'Portugal. The Man', plays: 38, genre: 'Indie Rock' },
      { name: 'MGMT', plays: 32, genre: 'Psychedelic Pop' }
    ]
  };

  const aiInsights = [
    {
      id: 1,
      type: 'Musical Age',
      insight: "Your musical taste suggests you're 24 years old",
      description: "Based on your listening patterns, you gravitate toward music that peaked in popularity around 2010-2015, with a modern electronic twist.",
      confidence: 'High',
      dataPoints: 156,
      icon: '🎂',
      color: '#1DB954'
    },
    {
      id: 2,
      type: 'Mental Wellness Meter',
      insight: "Your music indicates high emotional resilience",
      description: "Your preference for uplifting, energetic tracks with positive valence suggests strong mental wellness and optimistic outlook.",
      confidence: 'High',
      dataPoints: 89,
      icon: '🧠',
      color: '#1ED760'
    },
    {
      id: 3,
      type: 'Musical DNA',
      insight: "You're a 'Nostalgic Explorer'",
      description: "You blend familiar comfort music with adventurous discovery, creating a unique listening personality that values both emotional connection and musical exploration.",
      confidence: 'Medium',
      dataPoints: 67,
      icon: '🧬',
      color: '#1AA34A'
    },
    {
      id: 4,
      type: 'Productivity Pattern',
      insight: "Lo-fi beats boost your focus by 40%",
      description: "Your listening data shows increased session lengths and fewer skips when playing ambient and lo-fi genres, indicating enhanced concentration.",
      confidence: 'High',
      dataPoints: 43,
      icon: '⚡',
      color: '#16803C'
    }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
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

            {/* Key Metrics */}
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

            {/* Audio Features */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Your Music DNA</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Energy</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-white/10 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#1DB954] rounded-full" style={{ width: `${musicInsights.moodProfile.energy}%` }} />
                      </div>
                      <span className="text-secondary text-sm w-8">{musicInsights.moodProfile.energy}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Happiness</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-white/10 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#1ED760] rounded-full" style={{ width: `${musicInsights.moodProfile.valence}%` }} />
                      </div>
                      <span className="text-secondary text-sm w-8">{musicInsights.moodProfile.valence}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Danceability</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-white/10 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#1AA34A] rounded-full" style={{ width: `${musicInsights.moodProfile.danceability}%` }} />
                      </div>
                      <span className="text-secondary text-sm w-8">{musicInsights.moodProfile.danceability}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Acoustic</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-white/10 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#16803C] rounded-full" style={{ width: `${musicInsights.moodProfile.acousticness}%` }} />
                      </div>
                      <span className="text-secondary text-sm w-8">{musicInsights.moodProfile.acousticness}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Instrumental</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-white/10 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#0F5D2E] rounded-full" style={{ width: `${musicInsights.moodProfile.instrumentalness}%` }} />
                      </div>
                      <span className="text-secondary text-sm w-8">{musicInsights.moodProfile.instrumentalness}%</span>
                    </div>
                  </div>
                </div>
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
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-6">
            {/* Top Tracks */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Most Played Tracks</h4>
              <div className="space-y-3">
                {musicInsights.topTracks.map((track, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-[#1DB954] font-bold text-sm w-6">#{index + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{track.name}</p>
                        <p className="text-secondary text-xs">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-[#1DB954] text-sm font-medium">{track.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Top Artists</h4>
              <div className="space-y-3">
                {musicInsights.topArtists.map((artist, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-[#1DB954] font-bold text-sm w-6">#{index + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{artist.name}</p>
                        <p className="text-secondary text-xs">{artist.genre}</p>
                      </div>
                    </div>
                    <span className="text-[#1DB954] text-sm font-medium">{artist.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listening Patterns */}
            <div className="p-4 rounded-2xl bg-[#2A2A2D] border border-white/10">
              <h4 className="text-white font-medium mb-4">Weekly Listening Pattern</h4>
              <div className="flex justify-between items-end h-32">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex flex-col items-center">
                    <div 
                      className="w-6 bg-[#1DB954] rounded-t mb-2"
                      style={{ height: `${(musicInsights.dailyListening.weeklyData[index] / 156) * 100}%` }}
                    />
                    <span className="text-secondary text-xs">{day}</span>
                    <span className="text-white text-xs">{Math.floor(musicInsights.dailyListening.weeklyData[index] / 60)}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* View Full Spotify Data CTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1DB954]/20 to-[#1AA34A]/20 border border-[#1DB954]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">Your Complete Music Profile</h4>
                  <p className="text-[#1DB954]/80 text-sm">View all your recent tracks, top artists, and detailed listening history</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/spotify-data'}
                  className="px-4 py-2 bg-[#1DB954] hover:bg-[#1AA34A] rounded-full text-white text-sm font-medium transition-all flex items-center"
                >
                  View All Data
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );

      case 'ai-insights':
        return (
          <div className="space-y-6">
            {/* AI Insights Header */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-[#1DB954]/10 to-[#1ED760]/10 border border-[#1DB954]/20">
              <h3 className="text-2xl font-bold text-white mb-2">AI-Generated Insights</h3>
              <p className="text-[#1DB954]/80">Discover what your music says about you</p>
            </div>

            {/* AI Insights Cards */}
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="p-6 rounded-2xl bg-[#2A2A2D] border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                        style={{ backgroundColor: `${insight.color}20` }}
                      >
                        <span className="text-2xl">{insight.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{insight.type}</h4>
                        <p className="text-secondary text-sm">{insight.confidence} confidence • {insight.dataPoints} data points</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-white font-medium text-lg mb-2">{insight.insight}</p>
                    <p className="text-secondary text-sm leading-relaxed">{insight.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: insight.color }} />
                      <span className="text-xs text-secondary">Based on your listening patterns</span>
                    </div>
                    <button 
                      className="text-sm font-medium transition-colors"
                      style={{ color: insight.color }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Generate More Insights CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1DB954]/20 to-[#1ED760]/20 border border-[#1DB954]/30 text-center">
              <h4 className="text-white font-bold text-lg mb-2">Want More Insights?</h4>
              <p className="text-[#1DB954]/80 text-sm mb-4">
                Connect more data sources to unlock deeper AI-powered insights about your music and lifestyle patterns.
              </p>
              <button className="px-6 py-3 bg-[#1DB954] hover:bg-[#1AA34A] rounded-full text-white font-medium transition-all">
                Generate New Insights
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
        title="Music Insights"
        showLeftIcon={false}
        showRightIcon={true}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 pb-[120px]">
          {/* Tab Navigation */}
          <div className="mt-4 mb-6">
            <div className="flex bg-[#2A2A2D] rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#1DB954] text-white'
                    : 'text-secondary hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'detailed'
                    ? 'bg-[#1DB954] text-white'
                    : 'text-secondary hover:text-white'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setActiveTab('ai-insights')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'ai-insights'
                    ? 'bg-[#1DB954] text-white'
                    : 'text-secondary hover:text-white'
                }`}
              >
                AI Insights
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </>
  );
} 