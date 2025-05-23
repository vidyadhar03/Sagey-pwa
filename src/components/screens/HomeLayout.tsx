"use client";

import React from 'react';
import TopAppBar from '../TopAppBar';
import ChatInterface from '../ChatInterface';

export default function HomeLayout() {
  return (
    <>
      <TopAppBar
        title="Sagey"
        showLeftIcon={true}
        showRightIcon={true}
      />
      <div className="pt-[60px] w-full h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 pb-[280px]">
          {/* STEP 2: Profile section with avatar, greeting and quote */}
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

            {/* Daily Quote */}
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
              {/* Journal Button */}
              <button className="flex items-center justify-center bg-card-bg hover:bg-card-bg/80 border border-white/10 rounded-xl p-4 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75v-9.5A2.25 2.25 0 016.25 7H11" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Journal</span>
                  <span className="text-secondary text-xs mt-1">Express yourself</span>
                </div>
              </button>

              {/* Reflect Button */}
              <button className="flex items-center justify-center bg-card-bg hover:bg-card-bg/80 border border-white/10 rounded-xl p-4 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent-secondary/20 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Reflect</span>
                  <span className="text-secondary text-xs mt-1">Find clarity</span>
                </div>
              </button>
            </div>
          </section>

          {/* STEP 4: Focus & Meditation Section */}
          <section className="mt-6 mb-8">
            <h3 className="text-white font-medium mb-4">Mental Wellness</h3>
            <div className="bg-card-bg border border-white/10 rounded-xl p-5">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-[#1DB954]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-lg">Guided Meditation</h4>
                  <p className="text-secondary text-sm">5-minute session to calm your mind</p>
                </div>
                <button className="bg-accent-secondary/20 hover:bg-accent-secondary/30 text-accent-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Start
                </button>
              </div>
              
              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-white font-medium">Focus Mode</h5>
                      <p className="text-secondary text-xs">Boost productivity</p>
                    </div>
                  </div>
                  <button className="bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 5: Daily Goals Section */}
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