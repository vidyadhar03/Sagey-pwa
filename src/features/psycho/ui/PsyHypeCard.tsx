"use client";

import { motion } from 'framer-motion';

interface PsyHypeCardProps {
  headline?: string;
  context?: string;
  traits?: string[];
  tips?: string[];
  isLoading?: boolean;
  hasValidResponse?: boolean;
  variant?: "witty" | "poetic";
}

export default function PsyHypeCard({
  headline = '',
  context = '',
  traits = [],
  tips = [],
  isLoading = false,
  hasValidResponse = false,
  variant = "witty"
}: PsyHypeCardProps) {
  // Show skeleton while loading
  if (isLoading || !hasValidResponse) {
    return (
      <div className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
          <div className="border-t border-dashed border-zinc-700 my-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl md:px-6 py-5 px-4 backdrop-blur-sm hover:border-white/20 transition-all"
    >
      {/* Headline */}
      {headline && (
        <motion.h2 
          key={`${headline}-${variant}`} // Key ensures re-animation on variant change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl md:text-3xl font-semibold text-white leading-tight mb-1"
        >
          {headline}
        </motion.h2>
      )}

      {/* Context */}
      {context && (
        <motion.p 
          key={`${context}-${variant}`} // Key ensures re-animation on variant change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-sm md:text-base text-zinc-300 mb-4"
        >
          {context}
        </motion.p>
      )}

      {/* Divider */}
      <div className="border-t border-dashed border-zinc-700 my-4"></div>

      {/* Traits */}
      {traits.length > 0 && (
        <motion.div 
          key={`traits-${variant}`} // Key ensures re-animation on variant change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-4"
        >
          <ul className="space-y-1">
            {traits.map((trait, index) => (
              <motion.li 
                key={`${trait}-${index}-${variant}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + (index * 0.1) }}
                className="text-sm text-zinc-200 flex items-start"
              >
                <span className="text-zinc-500 mr-2">•</span>
                <span>{trait}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Coach Tips */}
      {tips && tips.length > 0 && (
        <motion.div
          key={`tips-${variant}`} // Key ensures re-animation on variant change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-green-400 mb-2">Coach Tips</h3>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <motion.li 
                key={`${tip}-${index}-${variant}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.5 + (index * 0.1) }}
                className="text-sm text-zinc-300 flex items-start"
              >
                <span className="text-green-400 mr-2">•</span>
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
} 