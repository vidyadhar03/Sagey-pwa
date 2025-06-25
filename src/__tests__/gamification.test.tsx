import { 
  evaluateBadges, 
  getBadgeRarityColor, 
  createAchievement,
  badgeDefinitions 
} from '../features/psycho/gamification/badges';
import { PsyPayload } from '../features/psycho/types';

describe('Gamification System', () => {
  describe('Badge Evaluation', () => {
    const mockPayload: PsyPayload = {
      scores: {
        musical_diversity: { score: 0.85, confidence: 'high', formula: 'test' },
        exploration_rate: { score: 0.15, confidence: 'medium', formula: 'test' },
        temporal_consistency: { score: 0.90, confidence: 'high', formula: 'test' },
        mainstream_affinity: { score: 0.10, confidence: 'high', formula: 'test' },
        emotional_volatility: { score: 0.05, confidence: 'high', formula: 'test' }
      },
      metadata: {
        tracks_analyzed: 150,
        artists_analyzed: 75,
        genres_found: 25,
        generated_at: '2024-01-01T00:00:00Z'
      }
    };

    it('should unlock genre_explorer for high musical diversity', () => {
      const badges = evaluateBadges(mockPayload);
      expect(badges).toContain('genre_explorer');
    });

    it('should unlock comfort_curator for low exploration rate', () => {
      const badges = evaluateBadges(mockPayload);
      expect(badges).toContain('comfort_curator');
    });

    it('should unlock clockwork_listener for high temporal consistency', () => {
      const badges = evaluateBadges(mockPayload);
      expect(badges).toContain('clockwork_listener');
    });

    it('should unlock underground_authority for low mainstream affinity', () => {
      const badges = evaluateBadges(mockPayload);
      expect(badges).toContain('underground_authority');
    });

    it('should unlock zen_listener for low emotional volatility', () => {
      const badges = evaluateBadges(mockPayload);
      expect(badges).toContain('zen_listener');
    });

    it('should unlock data_collector for all high confidence metrics', () => {
      const allHighPayload = {
        ...mockPayload,
        scores: {
          musical_diversity: { score: 0.5, confidence: 'high' as const, formula: 'test' },
          exploration_rate: { score: 0.5, confidence: 'high' as const, formula: 'test' },
          temporal_consistency: { score: 0.5, confidence: 'high' as const, formula: 'test' },
          mainstream_affinity: { score: 0.5, confidence: 'high' as const, formula: 'test' },
          emotional_volatility: { score: 0.5, confidence: 'high' as const, formula: 'test' }
        }
      };
      
      const badges = evaluateBadges(allHighPayload);
      expect(badges).toContain('data_collector');
    });

    it('should unlock completionist for 100+ tracks', () => {
      const badges = evaluateBadges(mockPayload);
      expect(badges).toContain('completionist');
    });

    it('should unlock legendary badges for combinations', () => {
      const comboPayload = {
        ...mockPayload,
        scores: {
          ...mockPayload.scores,
          musical_diversity: { score: 0.8, confidence: 'high' as const, formula: 'test' },
          exploration_rate: { score: 0.8, confidence: 'high' as const, formula: 'test' },
          temporal_consistency: { score: 0.8, confidence: 'high' as const, formula: 'test' },
          emotional_volatility: { score: 0.1, confidence: 'high' as const, formula: 'test' },
          mainstream_affinity: { score: 0.1, confidence: 'high' as const, formula: 'test' }
        }
      };
      
      const badges = evaluateBadges(comboPayload);
      expect(badges).toContain('genre_chameleon'); // High diversity + exploration
      expect(badges).toContain('consistency_king'); // High temporal + low volatility 
      expect(badges).toContain('trend_rebel'); // Low mainstream + high exploration
    });

    it('should not unlock badges for mid-range scores', () => {
      const midPayload: PsyPayload = {
        scores: {
          musical_diversity: { score: 0.5, confidence: 'medium', formula: 'test' },
          exploration_rate: { score: 0.5, confidence: 'medium', formula: 'test' },
          temporal_consistency: { score: 0.5, confidence: 'medium', formula: 'test' },
          mainstream_affinity: { score: 0.5, confidence: 'medium', formula: 'test' },
          emotional_volatility: { score: 0.5, confidence: 'medium', formula: 'test' }
        },
        metadata: {
          tracks_analyzed: 50,
          artists_analyzed: 25,
          genres_found: 10,
          generated_at: '2024-01-01T00:00:00Z'
        }
      };
      
      const badges = evaluateBadges(midPayload);
      
      // Should not unlock extreme badges
      expect(badges).not.toContain('genre_explorer');
      expect(badges).not.toContain('loyal_listener');
      expect(badges).not.toContain('treasure_hunter');
      expect(badges).not.toContain('comfort_curator');
      expect(badges).not.toContain('clockwork_listener');
      expect(badges).not.toContain('spontaneous_soul');
      expect(badges).not.toContain('completionist');
    });
  });

  describe('Badge Rarity Colors', () => {
    it('should return correct colors for each rarity', () => {
      expect(getBadgeRarityColor('common')).toBe('text-zinc-400 border-zinc-600');
      expect(getBadgeRarityColor('rare')).toBe('text-blue-400 border-blue-500');
      expect(getBadgeRarityColor('epic')).toBe('text-purple-400 border-purple-500');
      expect(getBadgeRarityColor('legendary')).toBe('text-yellow-400 border-yellow-500');
    });

    it('should fallback to common colors for unknown rarity', () => {
      expect(getBadgeRarityColor('unknown' as any)).toBe('text-zinc-400 border-zinc-600');
    });
  });

  describe('Achievement Creation', () => {
    it('should create achievement with correct structure', () => {
      const achievement = createAchievement('genre_explorer');
      
      expect(achievement).toMatchObject({
        badgeId: 'genre_explorer',
        title: 'Badge Unlocked: Genre Explorer!',
        message: 'Musical diversity extraordinaire! Your taste knows no boundaries.',
        seen: false
      });
      
      expect(achievement.timestamp).toBeDefined();
      expect(new Date(achievement.timestamp)).toBeInstanceOf(Date);
    });

    it('should create different achievements for different badges', () => {
      const achievement1 = createAchievement('zen_listener');
      const achievement2 = createAchievement('mood_master');
      
      expect(achievement1.badgeId).toBe('zen_listener');
      expect(achievement2.badgeId).toBe('mood_master');
      expect(achievement1.title).not.toBe(achievement2.title);
      expect(achievement1.message).not.toBe(achievement2.message);
    });
  });

  describe('Badge Definitions', () => {
    it('should have all required badges defined', () => {
      const expectedBadges = [
        'genre_explorer', 'loyal_listener', 'treasure_hunter', 'comfort_curator',
        'clockwork_listener', 'spontaneous_soul', 'mainstream_maven', 'underground_authority',
        'mood_master', 'zen_listener', 'data_collector', 'completionist',
        'genre_chameleon', 'consistency_king', 'trend_rebel'
      ];
      
      expectedBadges.forEach(badgeId => {
        expect(badgeDefinitions[badgeId as keyof typeof badgeDefinitions]).toBeDefined();
      });
    });

    it('should have proper badge structure', () => {
      Object.values(badgeDefinitions).forEach(badge => {
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('emoji');
        expect(badge).toHaveProperty('rarity');
        expect(badge).toHaveProperty('requirement');
        
        expect(typeof badge.name).toBe('string');
        expect(typeof badge.description).toBe('string');
        expect(typeof badge.emoji).toBe('string');
        expect(['common', 'rare', 'epic', 'legendary']).toContain(badge.rarity);
      });
    });

    it('should have appropriate rarity distribution', () => {
      const rarities = Object.values(badgeDefinitions).map(b => b.rarity);
      const counts = rarities.reduce((acc, rarity) => {
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Should have some of each rarity
      expect(counts.common).toBeGreaterThan(0);
      expect(counts.rare).toBeGreaterThan(0);
      expect(counts.epic).toBeGreaterThan(0);
      expect(counts.legendary).toBeGreaterThan(0);
      
      // Legendary should be rarest or equal (since we have exactly 4 of each currently)
      expect(counts.legendary).toBeLessThanOrEqual(counts.common);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing scores gracefully', () => {
      const incompletePayload = {
        scores: {
          musical_diversity: { score: 0.9, confidence: 'high' as const, formula: 'test' }
        },
        metadata: {
          tracks_analyzed: 10,
          artists_analyzed: 5,
          genres_found: 3,
          generated_at: '2024-01-01T00:00:00Z'
        }
      } as any;
      
      expect(() => evaluateBadges(incompletePayload)).not.toThrow();
    });

    it('should handle extreme score values', () => {
      const extremePayload: PsyPayload = {
        scores: {
          musical_diversity: { score: 1.0, confidence: 'high', formula: 'test' },
          exploration_rate: { score: 0.0, confidence: 'high', formula: 'test' },
          temporal_consistency: { score: 1.0, confidence: 'high', formula: 'test' },
          mainstream_affinity: { score: 0.0, confidence: 'high', formula: 'test' },
          emotional_volatility: { score: 0.0, confidence: 'high', formula: 'test' }
        },
        metadata: {
          tracks_analyzed: 1000,
          artists_analyzed: 500,
          genres_found: 100,
          generated_at: '2024-01-01T00:00:00Z'
        }
      };
      
      expect(() => evaluateBadges(extremePayload)).not.toThrow();
      const badges = evaluateBadges(extremePayload);
      expect(badges.length).toBeGreaterThan(0);
    });
  });
}); 