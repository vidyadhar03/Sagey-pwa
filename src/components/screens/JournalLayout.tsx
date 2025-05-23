"use client";

import React from 'react';
import TopAppBar from '../TopAppBar';

export default function JournalLayout() {
  return (
    <>
      <TopAppBar
        title="Journal"
        showLeftIcon={false}
        showRightIcon={false}
      />
      <div className="pt-[60px] p-6 pb-24">
        <h2 className="text-xl font-medium text-white mb-4">Your Journal</h2>
        <p className="text-secondary">This is the journal screen where you can track your thoughts and feelings.</p>
        
        <div className="mt-6 p-4 rounded-xl bg-card-bg border border-white/10">
          <p className="text-white">Start writing your first entry...</p>
        </div>
      </div>
    </>
  );
} 