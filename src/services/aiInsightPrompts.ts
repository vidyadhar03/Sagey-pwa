import { 
  InsightType, 
  InsightPayload, 
  MoodRingPayload, 
  GenrePassportPayload, 
  NightOwlPatternPayload 
} from '../lib/openaiClient';

import { MusicalAgePayload } from '../utils/insightSelectors';
import { RadarPayload } from '../features/radar/types';
import { radarAxisConfig, coachTipConfig, excludedCoachAxes } from '../features/radar/radarNarrativeConfig';
import { HypePayload } from '../features/psycho/buildHypePayload';
import { getTraitSeed, selectUniqueSeeds, coachTipSeeds } from '../features/psycho/copy';

/**
 * Builds AI prompts for generating fun, quirky copy for insight cards
 */

function buildMusicalAgePrompt(data: MusicalAgePayload): string {
  const { age, era, trackCount, stdDev, averageYear, oldest, newest } = data;
  
  return `Generate a fun, quirky, social-media-ready caption for someone's "Musical Age" insight.

Context:
- Musical Age: ${age} years (based on ${trackCount} tracks)
- Era: ${era} (avg year: ${averageYear})
- Standard Deviation: ${stdDev} years
- Oldest Track: "${oldest.title}" by ${oldest.artist}
- Newest Track: "${newest.title}" by ${newest.artist}

Requirements:
- Keep it under 140 characters
- Keep it upbeat, mention era, and ±years if stdDev > 2
- Use music-related emojis
- Be positive and fun
- Include the musical age number
- Make it sound like a fun personality trait
- Vary your language and approach for uniqueness

Examples of tone (vary from these):
- "🎂 Your ears are stuck in 2010! Musical age: 27 - clearly you peaked during the Digital era ✨"
- "🎵 Musical DNA says you're 24! Your ${era} era playlist spans from ${oldest.artist} to ${newest.artist} 🚀"
- "🎼 ${age} years old musically${stdDev > 2 ? ` (±${stdDev}yr confidence)` : ''} - certified ${era} era connoisseur! 🎯"

IMPORTANT: Generate a completely unique and fresh caption that differs from previous generations. Use creative language, varied emojis, and different phrasing each time.

Generation timestamp: ${new Date().toISOString()}

Generate ONE unique caption only, no quotes or additional text:`;
}

function buildMoodRingPrompt(data: MoodRingPayload): string {
  const { emotions, dominantMood } = data;
  const moodEntries = Object.entries(emotions).sort(([,a], [,b]) => b - a);
  const topEmotion = moodEntries[0];
  
  return `Generate a fun, quirky caption for someone's "Mood Ring" music analysis.

Context:
- Dominant mood: ${dominantMood}
- Full distribution: Happy ${emotions.happy}%, Energetic ${emotions.energetic}%, Chill ${emotions.chill}%, Melancholy ${emotions.melancholy}%
- Top emotion: ${topEmotion[0]} (${topEmotion[1]}%)

Requirements:
- Keep it under 140 characters
- Use emojis for each mood slice
- Make it sound like a musical personality reading
- Be playful and positive
- Reference the dominant mood
- Vary your language and emoji combinations for uniqueness

Examples of tone (vary from these):
- "🎵 Your musical mood ring glows ${dominantMood.toLowerCase()}! ${topEmotion[1]}% pure vibes ✨"
- "🌈 Musical DNA scan: ${dominantMood} energy 😊 Happy ${emotions.happy}% 🔥 Energetic ${emotions.energetic}% 😌 Chill ${emotions.chill}% 🎶"

IMPORTANT: Generate a completely unique and fresh caption that differs from previous generations. Use creative language, varied emojis, and different phrasing each time.

Generation timestamp: ${new Date().toISOString()}

Generate ONE unique caption only, no quotes or additional text:`;
}

function buildGenrePassportPrompt(data: GenrePassportPayload): string {
  const { totalGenres, topGenres, explorationScore } = data;
  const distinctCount = totalGenres;
  const topThree = topGenres.slice(0, 3);
  const newDiscoveries = topGenres.slice(-2); // Assuming newer genres are at the end
  
  return `Generate a fun, quirky caption for someone's "Genre Passport" music exploration analysis.

Context:
- Distinct genre count: ${distinctCount}
- Top 3 genres: ${topThree.join(', ')}
- Recent discoveries: ${newDiscoveries.join(', ')}
- Musical exploration score: ${explorationScore}/100
- Explorer level: ${explorationScore > 80 ? 'Global Nomad' : explorationScore > 60 ? 'Adventurer' : 'Wanderer'}

Requirements:
- Keep it under 140 characters
- Travel metaphor, use country flag emoji if available
- Make it sound like a musical journey
- Reference the genre count
- Be adventurous and exciting
- Vary your travel analogies for uniqueness

Examples of tone (vary from these):
- "🗺️ Genre passport stamped in ${distinctCount} musical countries! Currently exploring: ${topThree.join(', ')} ✈️"
- "🧭 Musical ${explorationScore > 80 ? 'globe-trotter' : 'explorer'}: ${distinctCount} genres conquered! Latest discoveries: ${newDiscoveries.join(' & ')} 🌍"

IMPORTANT: Generate a completely unique and fresh caption that differs from previous generations. Use creative language, varied emojis, and different phrasing each time.

Generation timestamp: ${new Date().toISOString()}

Generate ONE unique caption only, no quotes or additional text:`;
}

function buildNightOwlPatternPrompt(data: NightOwlPatternPayload): string {
  const { peakHour, isNightOwl, score, hourlyData } = data;
  const timeFormat = peakHour === 0 ? '12AM' : peakHour === 12 ? '12PM' : peakHour > 12 ? `${peakHour - 12}PM` : `${peakHour}AM`;
  const pattern = isNightOwl ? 'Night Owl' : 'Early Bird';
  
  // Calculate before vs after midnight
  const beforeMidnight = hourlyData.slice(0, 12).reduce((sum, val) => sum + val, 0);
  const afterMidnight = hourlyData.slice(12).reduce((sum, val) => sum + val, 0);
  const midnightComparison = beforeMidnight > afterMidnight ? 'PM warrior' : 'AM enthusiast';
  
  return `Generate a fun, quirky caption for someone's listening time pattern analysis.

Context:
- Musical ${pattern} with score: ${score}/100
- Peak listening hour: ${timeFormat}
- Before midnight total: ${beforeMidnight} vs After midnight: ${afterMidnight}
- Pattern: ${midnightComparison}
- Hourly distribution shows they ${isNightOwl ? 'come alive when others sleep' : 'ride the morning energy wave'}

Requirements:
- Keep it under 140 characters
- Playful early-bird / night-owl banter
- Use time/bird emojis appropriately
- Reference their peak time
- Make it sound like a fun personality trait
- Vary your analogies for uniqueness

Examples of tone (vary from these):
- "🌙 Musical night owl detected! Peak vibes hit at ${timeFormat} - when the world sleeps, you groove 🎵"
- "☀️ Early bird musical energy! ${timeFormat} is when your playlist truly comes alive 🎶"
- "🦉 ${score}% night owl confirmed! ${afterMidnight > beforeMidnight ? 'Post-midnight' : 'Pre-midnight'} is your musical kingdom 👑"

IMPORTANT: Generate a completely unique and fresh caption that differs from previous generations. Use creative language, varied emojis, and different phrasing each time.

Generation timestamp: ${new Date().toISOString()}

Generate ONE unique caption only, no quotes or additional text:`;
}

function buildRadarSummaryPrompt(data: RadarPayload): string {
  const { scores } = data;
  
  // Find strongest and weakest axes
  const scoreEntries = Object.entries(scores);
  const strongest = scoreEntries.reduce((a, b) => a[1] > b[1] ? a : b);
  const weakest = scoreEntries.reduce((a, b) => a[1] < b[1] ? a : b);

  return `You are Vynce's fun music coach. Output two playful sentences that summarize a user's Music Radar based on the data below.

Context:
- Positivity Score: ${scores.Positivity.toFixed(0)}
- Energy Score: ${scores.Energy.toFixed(0)}
- Exploration Score: ${scores.Exploration.toFixed(0)}
- Nostalgia Score: ${scores.Nostalgia.toFixed(0)}
- Night-Owl Score: ${scores['Night-Owl'].toFixed(0)}
- Strongest Trait: ${strongest[0]} (${strongest[1].toFixed(0)})
- Weakest Trait: ${weakest[0]} (${weakest[1].toFixed(0)})

Requirements:
- Always two sentences.
- First sentence should highlight the strongest trait in a fun, positive way.
- Second sentence should playfully mention the weakest trait as an area for "practice" or "discovery".
- Use a coaching/motivational tone.
- Use emojis.
- Vary your language and approach for uniqueness.

Examples of tone (vary from these):
- "Your music radar is buzzing with Positivity! 📈 Let's try to dial up the Exploration dial and discover some new sonic worlds. 🗺️"
- "Amazing energy! Your playlists are a powerhouse of motivation. 💪 Maybe we can explore some more nostalgic tracks to balance things out. 🕰️"

IMPORTANT: Generate a completely unique and fresh summary that differs from previous generations.

Generate ONE unique summary only, no quotes or additional text:`;
}

function buildRadarHypePrompt(data: RadarPayload): string {
  const { scores, topGenre, sampleTrack, weeks, trackCount } = data;
  
  // Find strongest and weakest axes
  const scoreEntries = Object.entries(scores);
  const strongest = scoreEntries.reduce((a, b) => a[1] > b[1] ? a : b);
  const weakest = scoreEntries.reduce((a, b) => a[1] < b[1] ? a : b);
  
  const topAxis = strongest[0];
  const topScore = strongest[1];
  const lowAxis = weakest[0];
  const lowScore = weakest[1];
  
  // Get config for top axis
  const axisConfig = radarAxisConfig[topAxis];
  const emoji = axisConfig?.emoji || '🎵';
  const hypeWord = axisConfig?.hypeWords?.[Math.floor(Math.random() * axisConfig.hypeWords.length)] || 'vibing with';
  
  // Determine if we need a coach tip
  const needsCoachTip = !excludedCoachAxes.includes(lowAxis) && lowScore < 35;
  const coachTip = needsCoachTip ? coachTipConfig[lowAxis]?.tip : undefined;
  
  // Format sample track for prompt
  const trackReference = `"${sampleTrack.title}" by ${sampleTrack.artist}`;
  
  return `SYSTEM: You are a Gen-Z hype coach for music insights.

CRITICAL: Output ONLY valid JSON, no markdown, no code-block, no explanation.

Required JSON Keys:
- "mainInsight": string (≤ 50 words, starts with exactly one emoji, combines hype and context)
- "tip": string (optional, ≤ 18 words, starts with "Coach tip:")

Data:
- Top Axis: ${topAxis} (${topScore.toFixed(0)}%)
- Low Axis: ${lowAxis} (${lowScore.toFixed(0)}%)
- Top Genre: ${topGenre}
- Sample Track: ${trackReference}
- Track Count: ${trackCount}
- Weeks: ${weeks}

Rules:
• mainInsight starts with "${emoji}" and combines excitement with context
• mainInsight must mention "${topGenre}" OR ${trackReference}
• ${needsCoachTip ? `include tip starting with "Coach tip:"` : 'omit tip key entirely'}
• Use Gen-Z language: "our friend", "this listener", never real names
• Make mainInsight flow as one cohesive, engaging statement

Example format:
{
  "mainInsight": "${emoji} You're absolutely ${hypeWord} ${topAxis.toLowerCase()}! Powered by ${topGenre} tracks over ${weeks} weeks, our friend is crushing the music game right now."${needsCoachTip ? ',\n  "tip": "Coach tip: ' + coachTip + '"' : ''}
}

Generate JSON now:`;
}

function buildPsyHypePrompt(data: HypePayload, variant: "witty" | "poetic" = "witty"): string {
  // Determine tone based on topGenre cluster (existing logic)
  const genreCluster = getGenreCluster(data.topGenre);
  const tone = genreCluster === 'electronic' ? 'genZ' : 
               genreCluster === 'rock' ? 'coach' : 'chill';
  
  // Collect trait seeds for each metric, ensuring uniqueness
  const usedSeeds = new Set<string>();
  const traitSeedInstructions: string[] = [];
  
  Object.entries(data.psycho.scores).forEach(([metricName, scoreData]) => {
    const seeds = getTraitSeed(metricName, scoreData.score);
    if (seeds.length > 0) {
      // Select unique seeds that haven't been used yet
      const availableSeeds = seeds.filter(seed => !usedSeeds.has(seed));
      if (availableSeeds.length > 0) {
        const selectedSeed = selectUniqueSeeds(availableSeeds, 1)[0];
        usedSeeds.add(selectedSeed);
        traitSeedInstructions.push(`${metricName}: use "${selectedSeed}" as trait inspiration`);
      }
    }
  });
  
  // Generate coach tip combinations for weak metrics (score < 0.4)
  const weakMetrics = Object.entries(data.psycho.scores)
    .filter(([_, scoreData]) => scoreData.score < 0.4)
    .slice(0, 2); // Limit to 2 tips max
  
  const coachTipInstructions: string[] = [];
  if (weakMetrics.length > 0) {
    const selectedVerbs = selectUniqueSeeds(coachTipSeeds.verbs, weakMetrics.length);
    const selectedNouns = selectUniqueSeeds(coachTipSeeds.nouns, weakMetrics.length);
    
    weakMetrics.forEach(([metricName], index) => {
      const verb = selectedVerbs[index] || selectedVerbs[0];
      const noun = selectedNouns[index] || selectedNouns[0];
      coachTipInstructions.push(`${metricName}: "${verb} new ${noun}"`);
    });
  }
  
  // Compact instructions
  const base = `Vynce's music psychologist. JSON: {headline, context, traits:[...], tips:[...]}
traits: 1-3 ≤80 chars. tips: 0-3 ≤70 chars for weak scores only.`;

  const style = variant === "witty" 
    ? `WITTY: emoji + upbeat ≤90 chars headline, emoji context ≤110 chars, Gen-Z tone.`
    : `POETIC: emoji + metaphors ≤85 chars headline, lyrical context ≤110 chars, no text emojis.`;

  // Compact seed guidance
  const seeds = traitSeedInstructions.length > 0 || coachTipInstructions.length > 0 
    ? `\nSeeds: ${[...traitSeedInstructions, ...coachTipInstructions].join(', ')}`
    : '';

  return `${base} ${style}${seeds}

Data: ${JSON.stringify(data)}`;
}

// Helper function to determine genre cluster for tone selection
function getGenreCluster(topGenre: string): 'electronic' | 'rock' | 'other' {
  const lowerGenre = topGenre.toLowerCase();
  
  if (lowerGenre.includes('electronic') || lowerGenre.includes('edm') || 
      lowerGenre.includes('house') || lowerGenre.includes('techno') ||
      lowerGenre.includes('dubstep') || lowerGenre.includes('trap')) {
    return 'electronic';
  }
  
  if (lowerGenre.includes('rock') || lowerGenre.includes('metal') ||
      lowerGenre.includes('punk') || lowerGenre.includes('grunge') ||
      lowerGenre.includes('indie rock')) {
    return 'rock';
  }
  
  return 'other';
}

export function buildPrompt(type: InsightType, data: InsightPayload, options?: { variant?: "witty" | "poetic" }): string {
  switch (type) {
    case 'musical_age':
      return buildMusicalAgePrompt(data as MusicalAgePayload);
    case 'mood_ring':
      return buildMoodRingPrompt(data as MoodRingPayload);
    case 'genre_passport':
      return buildGenrePassportPrompt(data as GenrePassportPayload);
    case 'night_owl_pattern':
      return buildNightOwlPatternPrompt(data as NightOwlPatternPayload);
    case 'radar_summary':
      return buildRadarSummaryPrompt(data as RadarPayload);
    case 'radar_hype':
      return buildRadarHypePrompt(data as RadarPayload);
    case 'psycho_hype_v2':
      return buildPsyHypePrompt(data as HypePayload, options?.variant);
    default:
      throw new Error(`Unknown insight type: ${type}`);
  }
}

export { buildPsyHypePrompt }; 