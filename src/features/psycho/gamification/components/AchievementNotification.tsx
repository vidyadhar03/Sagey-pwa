"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../types';
import { badgeDefinitions, getBadgeRarityColor } from '../badges';

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: (achievementId: string) => void;
}

export default function AchievementNotification({ 
  achievements, 
  onDismiss 
}: AchievementNotificationProps) {
  const visibleAchievements = achievements.filter(a => !a.seen);

  return (
    <AnimatePresence>
      {visibleAchievements.map((achievement, index) => {
        const badge = badgeDefinitions[achievement.badgeId];
        
        return (
          <motion.div
            key={`${achievement.badgeId}-${achievement.timestamp}`}
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              y: index * 120 // Stack multiple notifications
            }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 25,
              delay: index * 0.2
            }}
          >
            <motion.div
              className={`
                bg-gradient-to-r from-green-600 to-emerald-600 
                border-2 ${getBadgeRarityColor(badge.rarity)}
                rounded-2xl p-4 shadow-2xl backdrop-blur-sm 
                max-w-sm cursor-pointer hover:scale-105 transition-transform
              `}
              initial={{ boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)" }}
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 10px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: 2,
                ease: "easeOut"
              }}
              onClick={() => onDismiss(`${achievement.badgeId}-${achievement.timestamp}`)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="text-2xl"
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.6,
                      repeat: 2,
                      ease: "easeInOut"
                    }}
                  >
                    {badge.emoji}
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      🎉 Badge Unlocked!
                    </h3>
                    <div className={`text-xs capitalize font-medium ${getBadgeRarityColor(badge.rarity).split(' ')[0]}`}>
                      {badge.rarity} badge
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(`${achievement.badgeId}-${achievement.timestamp}`);
                  }}
                  className="text-white/60 hover:text-white text-lg"
                >
                  ×
                </button>
              </div>

              {/* Badge Info */}
              <div className="mb-3">
                <h4 className="text-white font-semibold text-base mb-1">
                  {badge.name}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Sparkle Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: Math.random() * 300,
                      y: Math.random() * 150
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 300,
                      y: Math.random() * 150
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: 1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-white/60">
                <span>Tap to dismiss</span>
                <span>{new Date(achievement.timestamp).toLocaleTimeString()}</span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
} 