"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  GamificationState, 
  Badge, 
  Achievement, 
  AnalysisProgress,
  BadgeType 
} from '../features/psycho/gamification/types';
import { 
  badgeDefinitions, 
  evaluateBadges, 
  createAchievement 
} from '../features/psycho/gamification/badges';
import { PsyPayload } from '../features/psycho/types';

const STORAGE_KEY = 'vynce_gamification';

// Calculate progress metrics based on payload data
function calculateProgress(payload: PsyPayload | null): AnalysisProgress {
  if (!payload) {
    return {
      tracks: { current: 0, target: 100, label: 'Tracks', percentage: 0 },
      artists: { current: 0, target: 50, label: 'Artists', percentage: 0 },
      genres: { current: 0, target: 20, label: 'Genres', percentage: 0 },
      confidence: { current: 0, target: 5, label: 'High Confidence', percentage: 0 },
      overall: 0
    };
  }

  const { metadata, scores } = payload;
  
  // Count high confidence metrics
  const highConfidenceCount = Object.values(scores).filter(
    metric => metric.confidence === 'high'
  ).length;
  
  const tracks = {
    current: metadata.tracks_analyzed,
    target: 100,
    label: 'Tracks',
    percentage: Math.min((metadata.tracks_analyzed / 100) * 100, 100)
  };
  
  const artists = {
    current: metadata.artists_analyzed,
    target: 50,
    label: 'Artists', 
    percentage: Math.min((metadata.artists_analyzed / 50) * 100, 100)
  };
  
  const genres = {
    current: metadata.genres_found,
    target: 20,
    label: 'Genres',
    percentage: Math.min((metadata.genres_found / 20) * 100, 100)
  };
  
  const confidence = {
    current: highConfidenceCount,
    target: 5,
    label: 'High Confidence',
    percentage: (highConfidenceCount / 5) * 100
  };
  
  // Calculate overall progress (weighted average)
  const overall = (
    tracks.percentage * 0.4 + 
    artists.percentage * 0.2 + 
    genres.percentage * 0.2 + 
    confidence.percentage * 0.2
  );
  
  return { tracks, artists, genres, confidence, overall };
}

// Load gamification state from localStorage
function loadGamificationState(): Partial<GamificationState> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load gamification state:', error);
  }
  
  return {};
}

// Save gamification state to localStorage
function saveGamificationState(state: Partial<GamificationState>) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save gamification state:', error);
  }
}

export function useGamification(payload: PsyPayload | null) {
  const [gamificationState, setGamificationState] = useState<GamificationState>(() => {
    const stored = loadGamificationState();
    
    // Initialize all badges as locked
    const allBadges: Badge[] = Object.values(badgeDefinitions).map(badge => ({
      ...badge,
      unlocked: false
    }));
    
    return {
      badges: allBadges,
      recentAchievements: [],
      progress: calculateProgress(payload),
      totalScore: 0,
      level: 1,
      ...stored
    };
  });

  // Calculate current progress
  const currentProgress = useMemo(() => calculateProgress(payload), [payload]);

  // Evaluate badges when payload changes
  useEffect(() => {
    if (!payload) return;

    const currentlyUnlockedIds = evaluateBadges(payload);
    const previouslyUnlockedIds = gamificationState.badges
      .filter(b => b.unlocked)
      .map(b => b.id);
    
    // Find newly unlocked badges
    const newlyUnlockedIds = currentlyUnlockedIds.filter(
      id => !previouslyUnlockedIds.includes(id)
    );
    
    if (newlyUnlockedIds.length > 0) {
      const now = new Date().toISOString();
      
      // Create new achievements
      const newAchievements = newlyUnlockedIds.map(badgeId => 
        createAchievement(badgeId)
      );
      
      // Update badge states
      const updatedBadges = gamificationState.badges.map(badge => {
        if (currentlyUnlockedIds.includes(badge.id)) {
          return {
            ...badge,
            unlocked: true,
            unlockedAt: badge.unlockedAt || now
          };
        }
        return badge;
      });
      
      const newState: GamificationState = {
        ...gamificationState,
        badges: updatedBadges,
        recentAchievements: [...gamificationState.recentAchievements, ...newAchievements],
        progress: currentProgress,
        totalScore: updatedBadges.filter(b => b.unlocked).length * 100,
        level: Math.floor(updatedBadges.filter(b => b.unlocked).length / 3) + 1
      };
      
      setGamificationState(newState);
      saveGamificationState(newState);
    } else {
      // Just update progress if no new badges
      setGamificationState(prev => ({
        ...prev,
        progress: currentProgress
      }));
    }
  }, [payload, currentProgress]);

  // Mark achievement as seen
  const dismissAchievement = (achievementKey: string) => {
    setGamificationState(prev => {
      const updatedAchievements = prev.recentAchievements.map(achievement => {
        const key = `${achievement.badgeId}-${achievement.timestamp}`;
        if (key === achievementKey) {
          return { ...achievement, seen: true };
        }
        return achievement;
      });
      
      const newState = {
        ...prev,
        recentAchievements: updatedAchievements
      };
      
      saveGamificationState(newState);
      return newState;
    });
  };

  // Clear old achievements (older than 24 hours)
  useEffect(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    setGamificationState(prev => {
      const filteredAchievements = prev.recentAchievements.filter(
        achievement => new Date(achievement.timestamp) > cutoff
      );
      
      if (filteredAchievements.length !== prev.recentAchievements.length) {
        const newState = {
          ...prev,
          recentAchievements: filteredAchievements
        };
        saveGamificationState(newState);
        return newState;
      }
      
      return prev;
    });
  }, []);

  return {
    ...gamificationState,
    dismissAchievement,
    unlockedBadgeCount: gamificationState.badges.filter(b => b.unlocked).length,
    hasUnseenAchievements: gamificationState.recentAchievements.some(a => !a.seen)
  };
} 