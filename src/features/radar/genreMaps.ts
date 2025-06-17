// Static genre proxy tables for valence, energy, and tempo
export const genreValence: Record<string, number> = {
  electronic_dance: 0.7,
  hip_hop_rap: 0.5,
  rock_metal: 0.4,
  pop: 0.7,
  ambient_chill: 0.5,
  jazz_blues: 0.4,
  // ...stub more genres as needed
};

export const genreEnergy: Record<string, number> = {
  electronic_dance: 0.8,
  hip_hop_rap: 0.6,
  rock_metal: 0.8,
  pop: 0.6,
  ambient_chill: 0.2,
  jazz_blues: 0.4,
  // ...stub more genres as needed
};

export const genreTempo: Record<string, number> = {
  electronic_dance: 125,
  hip_hop_rap: 90,
  rock_metal: 130,
  pop: 120,
  ambient_chill: 80,
  jazz_blues: 110,
  // ...stub more genres as needed
};

// Fuzzy genre normalization (simple version)
export function normalizeGenre(input: string): string {
  const str = input.toLowerCase();
  if (str.includes('electronic') || str.includes('edm') || str.includes('dance')) return 'electronic_dance';
  if (str.includes('hip hop') || str.includes('rap')) return 'hip_hop_rap';
  if (str.includes('rock') || str.includes('metal')) return 'rock_metal';
  if (str.includes('pop')) return 'pop';
  if (str.includes('ambient') || str.includes('chill')) return 'ambient_chill';
  if (str.includes('jazz') || str.includes('blues')) return 'jazz_blues';
  // ...add more mappings as needed
  return 'pop'; // fallback
} 