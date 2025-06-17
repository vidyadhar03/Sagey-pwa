"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface RefreshTestPanelProps {
  enabled?: boolean;
}

export default function RefreshTestPanel({ enabled = false }: RefreshTestPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in production when explicitly enabled or in development
  const shouldShow = enabled || process.env.NODE_ENV === 'development' || 
                    process.env.NEXT_PUBLIC_SHOW_REFRESH_DEBUG === 'true';

  if (!shouldShow) return null;

  const testRefresh = async (type: string) => {
    setIsLoading(true);
    try {
      const mockPayload = {
        musical_age: {
          age: 25,
          averageYear: 2015,
          description: "Your music taste spans decades of musical evolution and creativity",
          actualAge: 30
        },
        mood_ring: {
          emotions: { happy: 40, energetic: 30, chill: 20, melancholy: 10 },
          dominantMood: "Happy"
        },
        genre_passport: {
          totalGenres: 15,
          topGenres: ["pop", "rock", "indie"],
          explorationScore: 75
        },
        night_owl_pattern: {
          peakHour: 22,
          isNightOwl: true,
          score: 80,
          hourlyData: new Array(24).fill(0).map((_, i) => i > 20 ? 10 : 2)
        }
      };

      const response = await fetch('/api/insights/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          payload: mockPayload[type as keyof typeof mockPayload],
          regenerate: true
        }),
      });

      const result = await response.json();
      setResponses(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        type,
        response: result,
        success: response.ok
      }, ...prev.slice(0, 9)]); // Keep last 10 responses

    } catch (error) {
      setResponses(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Refresh Test Panel"
      >
        {isVisible ? <EyeOff size={20} /> : <Bug size={20} />}
      </motion.button>

      {/* Test Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-4 right-4 z-40 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-500 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug size={16} />
                <span className="font-medium">Refresh Test Panel</span>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="hover:bg-blue-600 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            {/* Test Buttons */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {['musical_age', 'mood_ring', 'genre_passport', 'night_owl_pattern'].map((type) => (
                  <button
                    key={type}
                    onClick={() => testRefresh(type)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-sm disabled:opacity-50"
                  >
                    <RotateCcw size={12} className={isLoading ? 'animate-spin' : ''} />
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Log */}
            <div className="max-h-64 overflow-y-auto">
              {responses.length === 0 ? (
                <div className="p-4 text-gray-500 text-center text-sm">
                  Click a button above to test refresh functionality
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {responses.map((resp, idx) => (
                    <div key={idx} className="p-3 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {resp.type}
                        </span>
                        <span className="text-gray-500">{resp.timestamp}</span>
                      </div>
                      
                      {resp.success ? (
                        <div className="space-y-1">
                          <div className="text-green-600 dark:text-green-400">
                            ✅ Cached: {resp.response.cached ? 'Yes' : 'No'}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            &quot;{resp.response.copy?.substring(0, 80)}...&quot;
                          </div>
                          {resp.response.debug && (
                            <div className="text-blue-600 dark:text-blue-400 text-xs">
                              🔧 Regenerated: {resp.response.debug.regenerated ? 'Yes' : 'No'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-500">
                          ❌ {resp.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 