import { InsightType } from '../lib/openaiClient';

/**
 * Mock AI copy responses for development/testing
 */

export const mockAICopy: Record<InsightType, string[]> = {
  radar_summary: [
    "Your music taste is an enigma, wrapped in a riddle, shrouded in sick beats.",
    "Based on your listening, you're a true night owl with a love for high-energy bangers. Time to sleep?",
  ],
  musical_age: [
    "🎂 Your ears are stuck in 2010! Musical age: 27 - clearly you peaked during the indie rock renaissance ✨",
    "🎵 Musical DNA says you're 24! Your playlist is basically a time machine to the golden era 🚀",
    "🎶 Time traveler alert! Your musical age is 29 - you've got that vintage soul with modern beats 🎧",
    "✨ Your music taste is 26 years old and thriving! Peak nostalgia meets current vibes 🎵",
  ],
  
  mood_ring: [
    "🌈 Your musical mood ring glows happy & uplifting! 34% pure joy vibes detected 🎶",
    "🎵 Musical DNA scan complete: energetic energy dominates! Your playlist radiates pure fire 🔥",
    "💫 Mood ring analysis: chill vibes activated! Your music heals souls at 22% serenity ✨",
    "🎶 Emotional spectrum unlocked: happy beats flow through 34% of your musical soul 🌟",
  ],
  
  genre_passport: [
    "🗺️ Genre passport stamped in 18 musical countries! Currently exploring: Indie Rock, Electronic Pop ✈️",
    "🧭 Musical explorer level: 85! 18 genres conquered and your adventure continues 🎵",
    "🌍 World music tour complete! 18 genre destinations visited - true musical wanderlust 🎧",
    "🎶 Genre collection: 18 stamps and counting! Your musical passport is getting heavy ✨",
  ],
  
  night_owl_pattern: [
    "🌙 Musical night owl detected! Peak vibes hit at 5PM - when the world sleeps, you groove 🎵",
    "☀️ Early bird musical energy! 5PM is when your playlist truly comes alive 🎶",
    "🦉 Night owl score: 72/100! Your after-hours playlist hits different 🌟",
    "🌙 Peak listening powers activate at 5PM! Classic night owl musical behavior detected ✨",
  ],
};

/**
 * Get random mock copy for an insight type
 * Enhanced with timestamp for better refresh demonstration
 */
export function getMockCopy(type: InsightType): string {
  const options = mockAICopy[type];
  const randomIndex = Math.floor(Math.random() * options.length);
  const baseCopy = options[randomIndex];
  
  // Add subtle variation for refresh demonstration
  const variations = ['🎵', '🎶', '✨', '🌟', '🎧', '🎼'];
  const randomEmoji = variations[Math.floor(Math.random() * variations.length)];
  
  // Replace first emoji with a random one to show refresh is working
  return baseCopy.replace(/^[^\w\s]+/, randomEmoji);
}

/**
 * Get all mock copies for testing
 */
export function getAllMockCopies(): Record<InsightType, string> {
  return {
    radar_summary: getMockCopy('radar_summary'),
    musical_age: getMockCopy('musical_age'),
    mood_ring: getMockCopy('mood_ring'),
    genre_passport: getMockCopy('genre_passport'),
    night_owl_pattern: getMockCopy('night_owl_pattern'),
  };
} 