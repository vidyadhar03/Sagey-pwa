"use client";

import React from 'react';
import TopAppBar from '../TopAppBar';
import ChatInterface from '../ChatInterface';
import SpotifyConnection from '../SpotifyConnection'; // Updated with navigation CTA

export default function HomeLayout() {
  return (
    <>
      <TopAppBar
        title="Sagey"
        showLeftIcon={false}
        showRightIcon={true}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 pb-[280px]">
          {/* STEP 1: Profile section with avatar and greeting (kept at top) */}
          <section className="mt-4 mb-8">
            {/* User Avatar and Greeting */}
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-accent-secondary flex items-center justify-center overflow-hidden mr-4 border-2 border-white/20">
                {/* Placeholder avatar - replace with actual user image */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-medium text-white">Hello, Alex</h2>
                <p className="text-secondary text-sm">How are you feeling today?</p>
              </div>
            </div>
          </section>

          {/* STEP 2: Integration Insights Section */}
          <section className="mt-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Integration Insights</h3>
              <button 
                onClick={() => window.location.href = '/spotify-data'}
                className="text-accent text-sm font-medium hover:text-accent/80 transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Spotify Integration - Dynamic Component */}
              <SpotifyConnection />

              {/* Journal Integration */}
              <div className="bg-card-bg border border-white/10 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">Journal</h4>
                    <p className="text-secondary text-xs">Emotional patterns</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">Positive</p>
                    <p className="text-secondary text-xs">3-day streak</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-xs text-secondary mb-1">Most frequent theme</div>
                    <div className="text-sm text-white">Gratitude & Growth</div>
                  </div>
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-accent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* CTA to Insights Tab */}
              <button className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-xl p-4 transition-all">
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <span className="text-accent font-medium">Explore All Insights</span>
                </div>
              </button>
            </div>
          </section>

          {/* STEP 3: Daily Aha Quote */}
          <section className="mt-6 mb-8">
            <div className="p-4 rounded-xl bg-card-bg border border-white/10">
              <div className="flex items-start mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent mr-2 mt-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <h3 className="text-white font-medium">Daily Aha!</h3>
              </div>
              <p className="text-secondary text-sm ml-7">
                &ldquo;The way you start your day determines how well you live your day.&rdquo;
              </p>
            </div>
          </section>

          {/* STEP 3: Action buttons */}
          <section className="mt-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              {/* Daily Check-in Button */}
              <button className="flex items-center justify-center bg-card-bg hover:bg-card-bg/80 border border-white/10 rounded-xl p-4 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Daily Check-in</span>
                  <span className="text-secondary text-xs mt-1">How's your day?</span>
                </div>
              </button>

              {/* Mini-journal Button */}
              <button className="flex items-center justify-center bg-card-bg hover:bg-card-bg/80 border border-white/10 rounded-xl p-4 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent-secondary/20 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75v-9.5A2.25 2.25 0 016.25 7H11" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Mini-journal</span>
                  <span className="text-secondary text-xs mt-1">Quick thoughts</span>
                </div>
              </button>
            </div>
          </section>

          {/* STEP 4: Daily Goals Section (moved up to third position) */}
          <section className="mt-6 mb-8">
            <h3 className="text-white font-medium mb-4">Today's Goals</h3>
            <div className="space-y-3">
              {/* Goal Item 1 */}
              <div className="bg-card-bg border border-white/10 rounded-xl p-4 flex items-center">
                <div className="w-5 h-5 rounded border-2 border-accent mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Drink 8 glasses of water</p>
                  <p className="text-secondary text-xs">6/8 completed</p>
                </div>
                <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-accent rounded-full"></div>
                </div>
              </div>

              {/* Goal Item 2 */}
              <div className="bg-card-bg border border-white/10 rounded-xl p-4 flex items-center">
                <div className="w-5 h-5 rounded border-2 border-white/30 mr-3"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Take a 20-minute walk</p>
                  <p className="text-secondary text-xs">Not started</p>
                </div>
                <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-accent rounded-full"></div>
                </div>
              </div>

              {/* Goal Item 3 */}
              <div className="bg-card-bg border border-white/10 rounded-xl p-4 flex items-center">
                <div className="w-5 h-5 rounded border-2 border-accent-secondary mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-accent-secondary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Read for 30 minutes</p>
                  <p className="text-secondary text-xs">Completed</p>
                </div>
                <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-accent-secondary rounded-full"></div>
                </div>
              </div>
            </div>
          </section>


        </div>
      </div>
      
      <ChatInterface />
    </>
  );
} 