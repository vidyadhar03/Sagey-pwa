import { getOpenAIClient, InsightType, InsightPayload } from '../lib/openaiClient';
import { buildPrompt } from './aiInsightPrompts';
import { 
  getCachedValue, 
  setCachedValue, 
  generateCacheKey, 
  hashInsightData 
} from './aiInsightCache';

/**
 * Main orchestrator for generating AI insight copy
 */
export async function getInsightCopy(
  userId: string, 
  type: InsightType, 
  data: InsightPayload
): Promise<string> {
  // Generate cache key
  const dataHash = hashInsightData(data);
  const cacheKey = generateCacheKey(userId, type, dataHash);
  
  // Check cache first
  const cachedCopy = await getCachedValue(cacheKey);
  if (cachedCopy) {
    console.log(`📋 Cache hit for ${type} insight for user ${userId}`);
    return cachedCopy;
  }

  console.log(`🤖 Generating new ${type} insight for user ${userId}`);

  try {
    // Build prompt
    const prompt = buildPrompt(type, data);
    
    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative copywriter specializing in fun, engaging social media content about music and personality insights. Generate short, shareable captions that are positive, quirky, and emoji-rich.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8, // Higher creativity
      top_p: 0.9,
    });

    const generatedCopy = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!generatedCopy) {
      throw new Error('Empty response from OpenAI');
    }

    // Cache the result
    const ttlMinutes = parseInt(process.env.AI_CACHE_TTL_MINUTES || '1440', 10);
    await setCachedValue(cacheKey, generatedCopy, ttlMinutes);

    console.log(`✅ Generated and cached ${type} insight: "${generatedCopy.substring(0, 50)}..."`);
    return generatedCopy;

  } catch (error) {
    console.error(`❌ Failed to generate ${type} insight:`, error);
    
    // Return fallback copy based on insight type
    const fallbackCopy = getFallbackCopy(type, data);
    
    // Cache fallback for a shorter time (1 hour) to retry sooner
    await setCachedValue(cacheKey, fallbackCopy, 60);
    
    return fallbackCopy;
  }
}

/**
 * Fallback copy when AI generation fails
 */
function getFallbackCopy(type: InsightType, data: InsightPayload): string {
  switch (type) {
    case 'musical_age':
      const ageData = data as any;
      return `🎵 Your musical age: ${ageData.age} years! Based on your taste for ${ageData.averageYear}s vibes ✨`;
    
    case 'mood_ring':
      const moodData = data as any;
      return `🌈 Your musical mood ring glows ${moodData.dominantMood.toLowerCase()}! Pure vibes detected 🎶`;
    
    case 'genre_passport':
      const genreData = data as any;
      return `🗺️ Musical explorer! You've journeyed through ${genreData.totalGenres} different genres 🎵`;
    
    case 'night_owl_pattern':
      const timeData = data as any;
      const isNight = timeData.isNightOwl;
      return `${isNight ? '🌙' : '☀️'} ${isNight ? 'Night owl' : 'Early bird'} musical energy detected! Peak listening powers activated 🎶`;
    
    default:
      return '🎵 Your musical DNA is truly unique! Keep exploring those beats ✨';
  }
}

/**
 * Check if AI generation is available
 */
export function isAIEnabled(): boolean {
  return !!(process.env.OPENAI_API_KEY && process.env.NEXT_PUBLIC_DISABLE_AI !== 'true');
}

/**
 * Batch generate insights for multiple types (for future use)
 */
export async function batchGenerateInsights(
  userId: string,
  insights: Array<{ type: InsightType; data: InsightPayload }>
): Promise<Record<InsightType, string>> {
  const results: Partial<Record<InsightType, string>> = {};
  
  // Generate all insights in parallel
  await Promise.all(
    insights.map(async ({ type, data }) => {
      try {
        results[type] = await getInsightCopy(userId, type, data);
      } catch (error) {
        console.error(`Failed to generate ${type} insight:`, error);
        results[type] = getFallbackCopy(type, data);
      }
    })
  );
  
  return results as Record<InsightType, string>;
} 