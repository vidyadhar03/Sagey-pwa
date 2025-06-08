"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export default function RefreshButton({ onRefresh, className, disabled }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown && cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1000) {
            setCooldown(false);
            setDebugInfo('');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown, cooldownTime]);

  const handleClick = async () => {
    if (isLoading || cooldown || disabled) return;

    try {
      setIsLoading(true);
      setDebugInfo('🔄 Initiating refresh...');
      setLastRefreshTime(new Date().toLocaleTimeString());
      
      await onRefresh();
      
      setDebugInfo('✅ Refresh completed successfully');
      setCooldown(true);
      setCooldownTime(15000);
      
      // Start cooldown timer
      setTimeout(() => {
        setCooldown(false);
        setDebugInfo('');
        setCooldownTime(0);
      }, 15000);
    } catch (error) {
      console.error('Refresh error:', error);
      setDebugInfo('❌ Refresh failed');
      setCooldown(true);
      setCooldownTime(5000);
      
      // Shorter cooldown on error
      setTimeout(() => {
        setCooldown(false);
        setDebugInfo('');
        setCooldownTime(0);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Show debug info in development or when explicitly enabled
  const showDebug = process.env.NODE_ENV === 'development' || 
                   process.env.NEXT_PUBLIC_SHOW_REFRESH_DEBUG === 'true';

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        disabled={isLoading || cooldown || disabled}
        className={`
          inline-flex items-center justify-center rounded-full p-1.5 
          transition-colors duration-200 disabled:cursor-not-allowed
          ${className || ''}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Refresh AI insight"
        title={cooldown ? `Cooldown: ${Math.ceil(cooldownTime / 1000)}s` : 'Refresh AI insight'}
      >
        <RotateCcw 
          size={14} 
          className={`h-4 w-4 ${
            cooldown || isLoading 
              ? 'animate-spin text-blue-300/50' 
              : 'text-blue-400 hover:text-blue-300'
          }`} 
        />
      </motion.button>
      
      {showDebug && (debugInfo || lastRefreshTime) && (
        <div className="absolute top-8 left-0 z-50 min-w-48 p-2 bg-black/90 text-white text-xs rounded-md shadow-lg">
          {debugInfo && <div>{debugInfo}</div>}
          {lastRefreshTime && <div>Last: {lastRefreshTime}</div>}
        </div>
      )}
    </div>
  );
} 