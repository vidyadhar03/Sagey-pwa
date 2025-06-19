export interface RadarHypeCopy {
  mainInsight: string;
  tip?: string;
}

export interface RadarAxisConfig {
  emoji: string;
  label: string;
  hypeWords: string[];
}

export interface CoachTipConfig {
  tip: string;
  triggers: string[];
}

export const radarAxisConfig: Record<string, RadarAxisConfig> = {
  'Positivity': {
    emoji: '✨',
    label: 'positivity',
    hypeWords: ['radiating', 'glowing with', 'bursting with', 'overflowing with']
  },
  'Energy': {
    emoji: '⚡',
    label: 'energy',
    hypeWords: ['pumping', 'charged with', 'electric with', 'buzzing with']
  },
  'Exploration': {
    emoji: '🗺️',
    label: 'musical exploration',
    hypeWords: ['exploring', 'adventuring through', 'discovering', 'journeying through']
  },
  'Nostalgia': {
    emoji: '🕰️',
    label: 'nostalgia',
    hypeWords: ['vibing with', 'channeling', 'diving into', 'embracing']
  },
  'Night-Owl': {
    emoji: '🌙',
    label: 'night owl energy',
    hypeWords: ['owning', 'mastering', 'ruling', 'commanding']
  }
};

export const coachTipConfig: Record<string, CoachTipConfig> = {
  'Positivity': {
    tip: "Try adding some upbeat pop or dance tracks to boost those good vibes!",
    triggers: ['sad', 'melancholy', 'blues', 'doom']
  },
  'Energy': {
    tip: "Mix in some high-energy electronic or rock to pump up your playlists!",
    triggers: ['ambient', 'chill', 'lo-fi', 'drone']
  },
  'Exploration': {
    tip: "Branch out! Discover new genres and artists beyond your comfort zone.",
    triggers: ['single-genre', 'repetitive', 'narrow']
  }
};

// Excluded axes that don't need coach tips (as per requirements)
export const excludedCoachAxes = ['Night-Owl', 'Nostalgia']; 