// Static genre proxy tables for valence, energy, and tempo
export const genreValence: Record<string, number> = {
  // Electronic/Dance - Generally upbeat and positive
  electronic_dance: 0.7,
  electronic: 0.65,
  edm: 0.75,
  house: 0.75,
  techno: 0.6,
  trance: 0.7,
  dubstep: 0.5,
  drum_and_bass: 0.6,
  ambient: 0.45,
  
  // Hip-Hop/Rap - Varies widely, moderate default
  hip_hop_rap: 0.5,
  hip_hop: 0.5,
  rap: 0.5,
  trap: 0.45,
  
  // Rock/Metal - Generally lower valence
  rock_metal: 0.4,
  rock: 0.45,
  metal: 0.35,
  heavy_metal: 0.3,
  punk: 0.4,
  alternative: 0.45,
  indie_rock: 0.5,
  classic_rock: 0.5,
  
  // Pop - High valence, upbeat
  pop: 0.7,
  pop_rock: 0.65,
  indie_pop: 0.65,
  electropop: 0.7,
  dance_pop: 0.75,
  
  // Chill/Ambient - Moderate to low valence
  ambient_chill: 0.5,
  chill: 0.55,
  chillout: 0.55,
  lo_fi: 0.45,
  downtempo: 0.4,
  
  // Jazz/Blues - Lower valence, emotional depth
  jazz_blues: 0.4,
  jazz: 0.45,
  blues: 0.35,
  soul: 0.5,
  r_and_b: 0.55,
  
  // Classical - Neutral to positive
  classical: 0.55,
  orchestral: 0.5,
  chamber_music: 0.5,
  
  // Country/Folk - Moderate valence
  country: 0.5,
  folk: 0.45,
  indie_folk: 0.5,
  acoustic: 0.5,
  
  // Reggae/World - Generally positive
  reggae: 0.65,
  world: 0.6,
  latin: 0.7,
  salsa: 0.75,
  bossa_nova: 0.6,
  
  // Punk/Alternative - Lower valence
  post_punk: 0.35,
  grunge: 0.3,
  emo: 0.25,
  screamo: 0.2,
  
  // Experimental/Niche
  experimental: 0.4,
  noise: 0.3,
  drone: 0.25,
  dark_ambient: 0.2,
  
  // Additional common genres
  disco: 0.8,
  funk: 0.7,
  gospel: 0.65,
  new_wave: 0.6,
  synthwave: 0.65,
  vaporwave: 0.4,
  shoegaze: 0.35,
  post_rock: 0.4,
  minimal: 0.45,
  breakbeat: 0.6,
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

// Fuzzy genre normalization (extended version for better coverage)
export function normalizeGenre(input: string): string {
  const str = input.toLowerCase();
  
  // Exact matches first for compound genres
  if (str === 'dance pop' || str === 'dance-pop') return 'dance_pop';
  if (str === 'indie pop' || str === 'indie-pop') return 'indie_pop';
  if (str === 'electropop') return 'electropop';
  if (str === 'disco') return 'disco';
  if (str === 'emo') return 'emo';
  if (str === 'screamo') return 'screamo';
  
  // Check for specific emotional/extreme genres first
  if (str.includes('emo') || str.includes('screamo')) {
    if (str.includes('screamo')) return 'screamo';
    if (str.includes('emo')) return 'emo';
  }
  
  // Electronic/Dance (but not dance-pop which was handled above)
  if ((str.includes('electronic') || str.includes('edm') || 
       str.includes('house') || str.includes('techno') || str.includes('trance') ||
       str.includes('dubstep') || str.includes('drum and bass') || str.includes('breakbeat')) ||
       (str.includes('dance') && !str.includes('pop'))) {
    return 'electronic_dance';
  }
  
  // Hip-Hop/Rap
  if (str.includes('hip hop') || str.includes('rap') || str.includes('trap')) {
    return 'hip_hop_rap';
  }
  
  // Rock/Metal (include punk, grunge, alternative, but not emo/screamo which were handled above)
  if (str.includes('rock') || str.includes('metal') || str.includes('punk') || 
      str.includes('grunge') || str.includes('alternative')) {
    return 'rock_metal';
  }
  
  // Pop variants (check for specific pop subgenres first)
  if (str.includes('pop')) {
    if (str.includes('dance')) return 'dance_pop';
    if (str.includes('indie')) return 'indie_pop';
    if (str.includes('electro')) return 'electropop';
    return 'pop';
  }
  
  // Disco (separate from electronic dance)
  if (str.includes('disco')) return 'disco';
  
  // Ambient/Chill
  if (str.includes('ambient') || str.includes('chill') || str.includes('lo-fi') ||
      str.includes('downtempo') || str.includes('drone')) {
    return 'ambient_chill';
  }
  
  // Jazz/Blues/Soul
  if (str.includes('jazz') || str.includes('blues') || str.includes('soul') ||
      str.includes('r&b')) {
    return 'jazz_blues';
  }
  
  // Classical
  if (str.includes('classical') || str.includes('orchestral') || str.includes('chamber')) {
    return 'classical';
  }
  
  // Country/Folk
  if (str.includes('country') || str.includes('folk') || str.includes('acoustic')) {
    return 'country';
  }
  
  // World/Latin
  if (str.includes('reggae') || str.includes('world') || str.includes('latin') ||
      str.includes('salsa') || str.includes('bossa')) {
    return 'reggae';
  }
  
  // Fallback to pop for unknown genres
  return 'pop';
} 