import { Badge, BadgeType, Achievement } from './types';
import { PsyPayload } from '../types';

// Badge definitions with their criteria and visual properties
export const badgeDefinitions: Record<BadgeType, Badge> = {
  genre_explorer: {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Musical diversity extraordinaire! Your taste knows no boundaries.',
    emoji: '🌍',
    rarity: 'rare',
    requirement: 'Musical diversity > 80%'
  },
  
  loyal_listener: {
    id: 'loyal_listener', 
    name: 'Loyal Listener',
    description: 'You know what you love and you love what you know.',
    emoji: '💎',
    rarity: 'common',
    requirement: 'Musical diversity < 20%'
  },
  
  treasure_hunter: {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Always on the hunt for the next musical gem.',
    emoji: '🔍',
    rarity: 'rare',
    requirement: 'Exploration rate > 80%'
  },
  
  comfort_curator: {
    id: 'comfort_curator',
    name: 'Comfort Curator',
    description: 'Your favorites playlist is perfectly curated.',
    emoji: '🏠',
    rarity: 'common',
    requirement: 'Exploration rate < 20%'
  },
  
  clockwork_listener: {
    id: 'clockwork_listener',
    name: 'Clockwork Listener',
    description: 'Your music schedule runs like Swiss clockwork.',
    emoji: '⏰',
    rarity: 'epic',
    requirement: 'Temporal consistency > 80%'
  },
  
  spontaneous_soul: {
    id: 'spontaneous_soul',
    name: 'Spontaneous Soul',
    description: 'Music flows through you like a free spirit.',
    emoji: '🌪️',
    rarity: 'common',
    requirement: 'Temporal consistency < 20%'
  },
  
  mainstream_maven: {
    id: 'mainstream_maven',
    name: 'Mainstream Maven',
    description: 'You have your finger on the pulse of popular music.',
    emoji: '📈',
    rarity: 'common',
    requirement: 'Mainstream affinity > 80%'
  },
  
  underground_authority: {
    id: 'underground_authority',
    name: 'Underground Authority',
    description: 'The hidden gems of music bow to your expertise.',
    emoji: '🕳️',
    rarity: 'epic',
    requirement: 'Mainstream affinity < 20%'
  },
  
  mood_master: {
    id: 'mood_master',
    name: 'Mood Master',
    description: 'Your emotions paint symphonies across genres.',
    emoji: '🎭',
    rarity: 'rare',
    requirement: 'Emotional volatility > 80%'
  },
  
  zen_listener: {
    id: 'zen_listener',
    name: 'Zen Listener',
    description: 'Your musical temperament flows like a calm river.',
    emoji: '🧘',
    rarity: 'rare',
    requirement: 'Emotional volatility < 20%'
  },
  
  data_collector: {
    id: 'data_collector',
    name: 'Data Collector',
    description: 'Your listening habits provide rich, reliable insights.',
    emoji: '📊',
    rarity: 'epic',
    requirement: 'High confidence across all metrics'
  },
  
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Your music library tells a comprehensive story.',
    emoji: '💯',
    rarity: 'legendary',
    requirement: '100+ tracks analyzed'
  },
  
  genre_chameleon: {
    id: 'genre_chameleon',
    name: 'Genre Chameleon',
    description: 'You adapt and explore across all musical landscapes.',
    emoji: '🦎',
    rarity: 'legendary',
    requirement: 'High diversity + high exploration'
  },
  
  consistency_king: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Your steady rhythms create perfect harmony.',
    emoji: '👑',
    rarity: 'legendary',
    requirement: 'High temporal consistency + low volatility'
  },
  
  trend_rebel: {
    id: 'trend_rebel',
    name: 'Trend Rebel',
    description: 'You carve your own path through unexplored territories.',
    emoji: '⚡',
    rarity: 'legendary',
    requirement: 'Low mainstream + high exploration'
  }
};

// Check which badges should be unlocked based on current payload
export function evaluateBadges(payload: PsyPayload): BadgeType[] {
  const { scores, metadata } = payload;
  const unlockedBadges: BadgeType[] = [];
  
  // Single metric badges (with null checking)
  if (scores.musical_diversity?.score > 0.8) {
    unlockedBadges.push('genre_explorer');
  }
  if (scores.musical_diversity?.score < 0.2) {
    unlockedBadges.push('loyal_listener');
  }
  
  if (scores.exploration_rate?.score > 0.8) {
    unlockedBadges.push('treasure_hunter');
  }
  if (scores.exploration_rate?.score < 0.2) {
    unlockedBadges.push('comfort_curator');
  }
  
  if (scores.temporal_consistency?.score > 0.8) {
    unlockedBadges.push('clockwork_listener');
  }
  if (scores.temporal_consistency?.score < 0.2) {
    unlockedBadges.push('spontaneous_soul');
  }
  
  if (scores.mainstream_affinity?.score > 0.8) {
    unlockedBadges.push('mainstream_maven');
  }
  if (scores.mainstream_affinity?.score < 0.2) {
    unlockedBadges.push('underground_authority');
  }
  
  if (scores.emotional_volatility?.score > 0.8) {
    unlockedBadges.push('mood_master');
  }
  if (scores.emotional_volatility?.score < 0.2) {
    unlockedBadges.push('zen_listener');
  }
  
  // Meta badges
  const allHighConfidence = Object.values(scores).every(
    metric => metric.confidence === 'high'
  );
  if (allHighConfidence) {
    unlockedBadges.push('data_collector');
  }
  
  if (metadata.tracks_analyzed >= 100) {
    unlockedBadges.push('completionist');
  }
  
  // Combination badges (legendary) - with null checking
  if (scores.musical_diversity?.score > 0.7 && scores.exploration_rate?.score > 0.7) {
    unlockedBadges.push('genre_chameleon');
  }
  
  if (scores.temporal_consistency?.score > 0.7 && scores.emotional_volatility?.score < 0.3) {
    unlockedBadges.push('consistency_king');
  }
  
  if (scores.mainstream_affinity?.score < 0.3 && scores.exploration_rate?.score > 0.7) {
    unlockedBadges.push('trend_rebel');
  }
  
  return unlockedBadges;
}

// Get badge rarity color for styling
export function getBadgeRarityColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-zinc-400 border-zinc-600';
    case 'rare': return 'text-blue-400 border-blue-500';
    case 'epic': return 'text-purple-400 border-purple-500';
    case 'legendary': return 'text-yellow-400 border-yellow-500';
    default: return 'text-zinc-400 border-zinc-600';
  }
}

// Create achievement notification for newly unlocked badge
export function createAchievement(badgeId: BadgeType): Achievement {
  const badge = badgeDefinitions[badgeId];
  return {
    badgeId,
    title: `Badge Unlocked: ${badge.name}!`,
    message: badge.description,
    timestamp: new Date().toISOString(),
    seen: false
  };
} 