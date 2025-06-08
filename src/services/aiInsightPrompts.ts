import { 
  InsightType, 
  InsightPayload, 
  MoodRingPayload, 
  GenrePassportPayload, 
  NightOwlPatternPayload 
} from '../lib/openaiClient';

import { MusicalAgePayload } from '../utils/insightSelectors';

/**
 * Builds AI prompts for generating fun, quirky copy for insight cards
 */

function buildMusicalAgePrompt(data: MusicalAgePayload): string {
  const { age, era, trackCount, stdDev, averageYear, oldest, newest } = data;
  
  return `Generate a fun, quirky, social-media-ready caption for someone's "Musical Age" insight.

Context:
${JSON.stringify({
  age,
  era,
  trackCount, 
  stdDev,
  averageYear,
  oldest,
  newest
}, null, 2)}

Requirements:
- Keep it under 140 characters
- Make it shareable and engaging
- Use music-related emojis
- Be positive and fun
- Include the musical age number
- Make it sound like a fun personality trait
- You may optionally mention "±${stdDev} yr confidence" for statistical flair
- You can reference their "${era} Era" musical taste if relevant
- Feel free to mention their oldest track (${oldest.title} by ${oldest.artist}) or newest (${newest.title} by ${newest.artist}) for personality

Examples of tone:
- "🎂 Your ears are stuck in 2010! Musical age: 27 - clearly you peaked during the Digital era ✨"
- "🎵 Musical DNA says you're 24! Your ${era} era playlist spans from ${oldest.artist} to ${newest.artist} 🚀"
- "🎼 ${age} years old musically (±${stdDev}yr confidence) - certified ${era} era connoisseur! 🎯"

Generate ONE caption only, no quotes or additional text:`;
}

function buildMoodRingPrompt(data: MoodRingPayload): string {
  const { emotions, dominantMood } = data;
  const topEmotion = Object.entries(emotions).sort(([,a], [,b]) => b - a)[0];
  
  return `Generate a fun, quirky caption for someone's "Mood Ring" music analysis.

Context:
- Their dominant musical mood is: ${dominantMood}
- Top emotion breakdown: ${topEmotion[0]} (${topEmotion[1]}%)
- Full emotional profile: Happy ${emotions.happy}%, Energetic ${emotions.energetic}%, Chill ${emotions.chill}%, Melancholy ${emotions.melancholy}%

Requirements:
- Keep it under 140 characters
- Use mood/emotion emojis
- Make it sound like a musical personality reading
- Be playful and positive
- Reference the dominant mood

Examples of tone:
- "🎵 Your musical mood ring glows ${dominantMood.toLowerCase()}! ${topEmotion[1]}% pure vibes ✨"
- "🌈 Musical DNA scan complete: ${dominantMood} energy detected! Your playlist radiates good vibes 🎶"

Generate ONE caption only, no quotes or additional text:`;
}

function buildGenrePassportPrompt(data: GenrePassportPayload): string {
  const { totalGenres, topGenres, explorationScore } = data;
  const topThree = topGenres.slice(0, 3).join(', ');
  
  return `Generate a fun, quirky caption for someone's "Genre Passport" music exploration analysis.

Context:
- They've explored ${totalGenres} different music genres
- Top genres: ${topThree}
- Musical exploration score: ${explorationScore}/100
- They're a musical ${explorationScore > 80 ? 'explorer' : explorationScore > 60 ? 'adventurer' : 'wanderer'}

Requirements:
- Keep it under 140 characters
- Use travel/exploration emojis
- Make it sound like a musical journey
- Reference the genre count
- Be adventurous and exciting

Examples of tone:
- "🗺️ Genre passport stamped in ${totalGenres} musical countries! Currently exploring: ${topThree} ✈️"
- "🧭 Musical explorer level: ${explorationScore}! ${totalGenres} genres conquered and counting 🎵"

Generate ONE caption only, no quotes or additional text:`;
}

function buildNightOwlPatternPrompt(data: NightOwlPatternPayload): string {
  const { peakHour, isNightOwl, score } = data;
  const timeFormat = peakHour === 0 ? '12AM' : peakHour === 12 ? '12PM' : peakHour > 12 ? `${peakHour - 12}PM` : `${peakHour}AM`;
  const pattern = isNightOwl ? 'Night Owl' : 'Early Bird';
  
  return `Generate a fun, quirky caption for someone's listening time pattern analysis.

Context:
- They're a musical ${pattern} with a score of ${score}/100
- Their peak listening time is ${timeFormat}
- They ${isNightOwl ? 'prefer late-night music sessions' : 'are most active during daytime'}

Requirements:
- Keep it under 140 characters
- Use time/bird emojis appropriately
- Reference their peak time
- Make it sound like a fun personality trait
- Be playful about their listening schedule

Examples of tone:
- "🌙 Musical night owl detected! Peak vibes hit at ${timeFormat} - when the world sleeps, you groove 🎵"
- "☀️ Early bird musical energy! ${timeFormat} is when your playlist truly comes alive 🎶"

Generate ONE caption only, no quotes or additional text:`;
}

export function buildPrompt(type: InsightType, data: InsightPayload): string {
  switch (type) {
    case 'musical_age':
      return buildMusicalAgePrompt(data as MusicalAgePayload);
    case 'mood_ring':
      return buildMoodRingPrompt(data as MoodRingPayload);
    case 'genre_passport':
      return buildGenrePassportPrompt(data as GenrePassportPayload);
    case 'night_owl_pattern':
      return buildNightOwlPatternPrompt(data as NightOwlPatternPayload);
    default:
      throw new Error(`Unknown insight type: ${type}`);
  }
} 