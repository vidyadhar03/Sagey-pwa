"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export default function RefreshButton({ onRefresh, isLoading = false, className = "" }: RefreshButtonProps) {
  const [cooldown, setCooldown] = useState(false);

  const handleRefresh = async () => {
    if (cooldown || isLoading) return;
    
    setCooldown(true);
    
    try {
      await onRefresh();
    } finally {
      // 15 second cooldown
      setTimeout(() => setCooldown(false), 15000);
    }
  };

  return (
    <motion.button
      onClick={handleRefresh}
      disabled={cooldown || isLoading}
      aria-label="Refresh AI insight"
      className={`flex items-center justify-center p-1 rounded-full transition-all duration-200 ${
        cooldown || isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-white/10 hover:scale-110'
      } ${className}`}
      whileHover={!cooldown && !isLoading ? { scale: 1.1 } : {}}
      whileTap={!cooldown && !isLoading ? { scale: 0.95 } : {}}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={isLoading ? { 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        } : {}}
      >
        <RotateCcw 
          size={14} 
          className={`h-4 w-4 ${
            cooldown || isLoading 
              ? 'animate-spin text-blue-300/50' 
              : 'text-blue-400 hover:text-blue-300'
          }`} 
        />
      </motion.div>
    </motion.button>
  );
} 