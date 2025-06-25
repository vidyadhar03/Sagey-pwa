"use client";

import { motion } from 'framer-motion';
import { Badge } from '../types';
import { getBadgeRarityColor } from '../badges';

interface BadgeCollectionProps {
  badges: Badge[];
  showAll?: boolean;
}

export default function BadgeCollection({ badges, showAll = false }: BadgeCollectionProps) {
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);
  
  const displayBadges = showAll ? badges : unlockedBadges;
  
  if (displayBadges.length === 0 && !showAll) {
    return (
      <motion.div
        className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl mb-2">🏆</div>
        <h3 className="text-lg font-bold text-white mb-2">Badge Collection</h3>
        <p className="text-sm text-zinc-400 mb-4">
          No badges unlocked yet. Keep exploring your musical psyche!
        </p>
        <div className="text-xs text-zinc-500">
          Listen to more music and refresh to unlock achievements
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🏆 Badge Collection
          </h3>
          <p className="text-sm text-zinc-400">
            {unlockedBadges.length} of {badges.length} badges unlocked
          </p>
        </div>
        {!showAll && unlockedBadges.length > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {unlockedBadges.length}
            </div>
            <div className="text-xs text-zinc-500">Earned</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-300">Collection Progress</span>
          <span className="text-xs text-zinc-500">
            {Math.round((unlockedBadges.length / badges.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className={`
              relative p-3 rounded-xl border-2 transition-all duration-300 group cursor-pointer
              ${badge.unlocked 
                ? `${getBadgeRarityColor(badge.rarity)} bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 hover:scale-105` 
                : 'border-zinc-700 bg-zinc-800/30 opacity-50'
              }
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
          >
            {/* Badge Emoji */}
            <div className="text-center mb-2">
              <div className={`text-2xl ${badge.unlocked ? '' : 'grayscale'}`}>
                {badge.emoji}
              </div>
            </div>
            
            {/* Badge Name */}
            <div className="text-center">
              <h4 className={`text-xs font-semibold mb-1 ${badge.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                {badge.name}
              </h4>
              
              {/* Rarity Indicator */}
              <div className={`text-xs capitalize ${badge.unlocked ? getBadgeRarityColor(badge.rarity).split(' ')[0] : 'text-zinc-600'}`}>
                {badge.rarity}
              </div>
            </div>

            {/* Unlock indicator */}
            {badge.unlocked && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-xs text-white">✓</div>
              </motion.div>
            )}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <div className="bg-black text-white text-xs rounded-lg p-2 max-w-xs text-center shadow-lg">
                <div className="font-semibold">{badge.name}</div>
                <div className="text-xs text-zinc-300 mt-1">{badge.description}</div>
                <div className="text-xs text-zinc-400 mt-1">Req: {badge.requirement}</div>
                {badge.unlocked && badge.unlockedAt && (
                  <div className="text-xs text-green-400 mt-1">
                    Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show all toggle hint */}
      {!showAll && lockedBadges.length > 0 && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs text-zinc-500">
            {lockedBadges.length} more badges to discover...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 