"use client";

import React from 'react';
import TopAppBar from '../TopAppBar';

export default function InsightsLayout() {
  return (
    <>
      <TopAppBar
        title="Insights"
        showLeftIcon={false}
        showRightIcon={false}
      />
      <div className="pt-[60px] p-6 pb-24">
        <h2 className="text-xl font-medium text-white mb-4">Your Insights</h2>
        <p className="text-secondary">Track your mood patterns and emotional insights over time.</p>
        
        <div className="mt-6 p-4 rounded-xl bg-card-bg border border-white/10">
          <div className="flex justify-center items-center h-40">
            <p className="text-secondary italic">Insights will appear here once you&apos;ve logged more entries.</p>
          </div>
        </div>
      </div>
    </>
  );
} 