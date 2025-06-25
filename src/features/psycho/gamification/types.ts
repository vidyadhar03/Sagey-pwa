export type BadgeType = 
  | 'genre_explorer'          // High musical diversity (>0.8)
  | 'loyal_listener'         // Low musical diversity (<0.2)
  | 'treasure_hunter'        // High exploration rate (>0.8)
  | 'comfort_curator'        // Low exploration rate (<0.2)
  | 'clockwork_listener'     // High temporal consistency (>0.8)
  | 'spontaneous_soul'       // Low temporal consistency (<0.2)
  | 'mainstream_maven'       // High mainstream affinity (>0.8)
  | 'underground_authority'  // Low mainstream affinity (<0.2)
  | 'mood_master'           // High emotional volatility (>0.8)
  | 'zen_listener'          // Low emotional volatility (<0.2)
  | 'data_collector'        // High confidence across all metrics
  | 'completionist'         // 100+ tracks analyzed
  | 'genre_chameleon'       // High diversity + high exploration
  | 'consistency_king'      // High temporal + low volatility
  | 'trend_rebel';          // Low mainstream + high exploration

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface ProgressMetric {
  current: number;
  target: number;
  label: string;
  percentage: number;
}

export interface AnalysisProgress {
  tracks: ProgressMetric;
  artists: ProgressMetric;
  genres: ProgressMetric;
  confidence: ProgressMetric;
  overall: number; // 0-100
}

export interface Achievement {
  badgeId: BadgeType;
  title: string;
  message: string;
  timestamp: string;
  seen: boolean;
}

export interface GamificationState {
  badges: Badge[];
  recentAchievements: Achievement[];
  progress: AnalysisProgress;
  totalScore: number;
  level: number;
} 