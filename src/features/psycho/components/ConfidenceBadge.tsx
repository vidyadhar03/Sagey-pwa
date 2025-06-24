"use client";

import { useState, useEffect } from 'react';
import { ConfidenceLevel } from '../types';
import { confidenceDescriptions } from '../copy';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

function getConfidenceBadgeColor(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'insufficient': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const [showToast, setShowToast] = useState(false);
  const badgeColor = getConfidenceBadgeColor(confidence);
  const confidenceInfo = confidenceDescriptions[confidence];

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleClick = () => {
    setShowToast(true);
  };

  return (
    <>
      <div 
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badgeColor} hover:opacity-80 transition-opacity cursor-pointer select-none`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <span>{confidence}</span>
        <span className="text-xs opacity-70">(i)</span>
      </div>
      
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-sm mx-auto">
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">
                    {confidenceInfo.title}
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {confidenceInfo.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="ml-3 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 