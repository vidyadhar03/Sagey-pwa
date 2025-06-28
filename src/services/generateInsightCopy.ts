import { getOpenAIClient, InsightType, InsightPayload } from '../lib/openaiClient';
import { buildPrompt } from './aiInsightPrompts';
import { 
  getCachedValue, 
  setCachedValue, 
  generateCacheKey, 
  hashInsightData 
} from './aiInsightCache';
import { createHash } from 'crypto';

/**
 * Main orchestrator for generating AI insight copy
 */
export async function getInsightCopy(
  userId: string, 
  type: InsightType, 
  data: InsightPayload,
  regenerate: boolean = false,
  options?: { variant?: "witty" | "poetic" }
): Promise<{ copy: string; fromCache: boolean }> {
  // Create cache key
  const dataHash = createHash('md5').update(JSON.stringify(data)).digest('hex').substring(0, 8);
  const cacheKey = `insight:${userId}:${type}:${dataHash}`;
  
  // Check cache first (skip if regenerating)
  if (!regenerate) {
    const cachedCopy = await getCachedValue(cacheKey);
    if (cachedCopy) {
      console.log(`📋 Cache hit for ${type} insight for user ${userId}`);
      return { copy: cachedCopy, fromCache: true };
    }
  }

  console.log(`🤖 Generating new ${type} insight for user ${userId}${regenerate ? ' (REGENERATE=true)' : ''}`);

  try {
    // Build prompt with options
    const prompt = buildPrompt(type, data, options);
    console.log(`📋 Prompt being sent to OpenAI (first 200 chars): "${prompt.substring(0, 200)}..."`);
    
    // Check if OpenAI API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('❌ OPENAI_API_KEY is not set in environment variables');
      throw new Error('OPENAI_API_KEY not configured');
    }
    
    console.log(`🔑 OpenAI API Key available: ${openaiKey.substring(0, 10)}...${openaiKey.substring(-5)}`);
    
    // Call OpenAI
    const openai = getOpenAIClient();
    console.log(`📡 Making OpenAI API call for ${type}...`);
    
    // Special parameters for JSON output types to ensure valid responses
    const isRadarHype = type === 'radar_hype';
    const needsJSON = isRadarHype;
    
    console.log(`🎯 Target: ${needsJSON ? `${type.toUpperCase()} (expecting JSON)` : 'Regular insight'}`);
    
    // Build the request configuration
    const requestConfig: any = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: needsJSON 
            ? 'You are a Gen-Z hype coach for music insights. Output ONLY valid JSON, no markdown, no code-block. Follow the exact format specified in the user prompt.'
            : 'You are a creative copywriter specializing in fun, engaging social media content about music and personality insights. Generate short, shareable captions that are positive, quirky, and emoji-rich.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: needsJSON ? 200 : 100,
      temperature: needsJSON ? 0.9 : 0.95,
      top_p: 0.9,
    };

    // Add response_format for JSON types if supported
    if (needsJSON) {
      try {
        requestConfig.response_format = { type: 'json_object' };
        console.log(`🎯 Using JSON response format for ${type}`);
      } catch (error) {
        console.warn('⚠️ JSON response format not supported, relying on prompt instructions');
      }
    }

    console.log('📡 OpenAI request config:', {
      model: requestConfig.model,
      maxTokens: requestConfig.max_tokens,
      temperature: requestConfig.temperature,
      hasResponseFormat: !!requestConfig.response_format,
      promptLength: prompt.length
    });

    console.log(`🚀 Sending request to OpenAI...`);
    const completion = await openai.chat.completions.create(requestConfig);
    console.log(`✅ OpenAI API call successful!`);

    const generatedCopy = completion.choices[0]?.message?.content?.trim() || '';
    console.log(`🤖 OpenAI returned (${generatedCopy.length} chars): "${generatedCopy}"`);
    
    // Special validation for JSON responses
    if (needsJSON) {
      console.log(`🔍 ${type.toUpperCase()} Response Analysis:`);
      try {
        const testParse = JSON.parse(generatedCopy);
        console.log(`✅ Valid JSON structure detected:`, testParse);
      } catch (parseErr) {
        console.log(`❌ Invalid JSON from OpenAI:`, parseErr instanceof Error ? parseErr.message : String(parseErr));
        console.log(`📝 Raw response: "${generatedCopy}"`);
      }
    }
    
    console.log(`📊 OpenAI response details:`, {
      id: completion.id,
      model: completion.model,
      usage: completion.usage,
      choices: completion.choices.length,
      finishReason: completion.choices[0]?.finish_reason,
      isJsonType: needsJSON,
      responseLength: generatedCopy.length
    });
    
    if (!generatedCopy) {
      console.error('❌ Empty response from OpenAI');
      console.error('🔍 Full OpenAI response:', JSON.stringify(completion, null, 2));
      throw new Error('Empty response from OpenAI');
    }

    // Cache the result
    const ttlMinutes = parseInt(process.env.AI_CACHE_TTL_MINUTES || '1440', 10);
    await setCachedValue(cacheKey, generatedCopy, ttlMinutes);

    console.log(`✅ Generated and cached ${type} insight: "${generatedCopy.substring(0, 50)}..."`);
    return { copy: generatedCopy, fromCache: false };

  } catch (error) {
    console.error(`❌ Failed to generate ${type} insight:`, error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    // Check if it's an OpenAI specific error
    if (error && typeof error === 'object' && 'status' in error) {
      console.error(`OpenAI API Status: ${(error as any).status}`);
      console.error(`OpenAI API Error: ${JSON.stringify(error, null, 2)}`);
    }
    
    // Special logging for radar_hype failures
    if (type === 'radar_hype') {
      console.error(`🚨 RADAR_HYPE FAILURE - This should return JSON fallback`);
      console.error(`🔍 Error details for radar_hype:`, {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length,
      });
    }
    
    // Return fallback copy based on insight type
    const fallbackCopy = getFallbackCopy(type, data);
    
    // Cache fallback for a shorter time (1 hour) to retry sooner
    await setCachedValue(cacheKey, fallbackCopy, 60);
    
    return { copy: fallbackCopy, fromCache: false };
  }
}

/**
 * Fallback copy when AI generation fails - now with variations
 */
function getFallbackCopy(type: InsightType, data: InsightPayload): string {
  // Add timestamp and randomization to create unique fallback responses
  const timestamp = Date.now();
  const randomSeed = timestamp % 1000;
  
  console.log(`🔄 Generating fallback copy for ${type} (seed: ${randomSeed})`);
  
  switch (type) {
    case 'musical_age':
      const ageData = data as any;
      const ageVariations = [
        `🎵 Your musical age: ${ageData.age} years! Based on your taste for ${ageData.averageYear}s vibes ✨`,
        `🎂 Musical DNA reveals: ${ageData.age} years of pure taste! Those ${ageData.averageYear}s hits shaped your soul 🎶`,
        `⏰ Time machine detected! Musical age ${ageData.age} - you're living in ${ageData.averageYear} forever 🚀`,
        `🎼 Age scanner complete: ${ageData.age} musical years! ${ageData.averageYear}s energy flows through you ✨`
      ];
      return ageVariations[randomSeed % ageVariations.length];
    
    case 'mood_ring':
      const moodData = data as any;
      const moodVariations = [
        `🌈 Your musical mood ring glows ${moodData.dominantMood.toLowerCase()}! Pure vibes detected 🎶`,
        `💫 Emotional spectrum: ${moodData.dominantMood.toLowerCase()} energy radiates from your playlist! 🎵`,
        `🔮 Mood analysis complete: ${moodData.dominantMood.toLowerCase()} vibes dominate your musical soul ✨`,
        `🌟 Musical aura scan: ${moodData.dominantMood.toLowerCase()} frequencies detected! Your playlist heals 🎧`
      ];
      return moodVariations[randomSeed % moodVariations.length];
    
    case 'genre_passport':
      const genreData = data as any;
      const genreVariations = [
        `🗺️ Musical explorer! You've journeyed through ${genreData.totalGenres} different genres 🎵`,
        `🧭 Genre adventurer level: ${genreData.explorationScore}! ${genreData.totalGenres} musical worlds conquered ✈️`,
        `🌍 Passport stamped in ${genreData.totalGenres} genre countries! Your musical wanderlust is real 🎶`,
        `🎫 Genre collection: ${genreData.totalGenres} unique stamps! True musical world traveler detected ✨`
      ];
      return genreVariations[randomSeed % genreVariations.length];
    
    case 'night_owl_pattern':
      const timeData = data as any;
      const isNight = timeData.isNightOwl;
      const nightVariations = [
        `${isNight ? '🌙' : '☀️'} ${isNight ? 'Night owl' : 'Early bird'} musical energy detected! Peak listening powers activated 🎶`,
        `${isNight ? '🦉' : '🐓'} Musical rhythm: ${isNight ? 'nocturnal' : 'morning'} vibes! Peak hour: ${timeData.peakHour}:00 ✨`,
        `${isNight ? '🌟' : '🌅'} ${isNight ? 'After-hours' : 'Dawn'} playlist champion! Your music hits different at ${timeData.peakHour}:00 🎵`,
        `${isNight ? '🌆' : '🌄'} ${isNight ? 'Midnight' : 'Sunrise'} soundtrack master! Peak musical powers: ${timeData.peakHour}:00 🎧`
      ];
      return nightVariations[randomSeed % nightVariations.length];
    
    case 'radar_hype':
      // Return valid JSON structure for radar_hype fallback
      const radarData = data as any;
      const radarVariations = [
        {
          headline: '🎵 You\'re absolutely crushing those musical vibes!',
          context: `Powered by ${radarData.topGenre || 'amazing'} tracks over ${radarData.weeks || 4} weeks, our friend is on fire.`,
          tip: undefined
        },
        {
          headline: '✨ Your music radar is looking incredible!',
          context: `This listener\'s ${radarData.topGenre || 'diverse'} energy dominated the last ${radarData.weeks || 4} weeks.`,
          tip: undefined
        },
        {
          headline: '🌟 Musical genius detected in your playlist!',
          context: `Our friend\'s taste for ${radarData.topGenre || 'quality music'} is absolutely next level right now.`,
          tip: undefined
        }
      ];
      return JSON.stringify(radarVariations[randomSeed % radarVariations.length]);
    
    default:
      const defaultVariations = [
        '🎵 Your musical DNA is truly unique! Keep exploring those beats ✨',
        '🎶 Musical genius detected! Your taste is one-of-a-kind 🌟',
        '🎧 Sonic explorer! Your playlist tells an amazing story ✨',
        '🎼 Musical architect! You build soundscapes like art 🎨'
      ];
      return defaultVariations[randomSeed % defaultVariations.length];
  }
}

/**
 * Check if AI generation is available
 */
export function isAIEnabled(): boolean {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_AI === 'true';
  const result = hasKey && !isDisabled;
  
  console.log('🔍 AI Environment Check:', {
    hasOpenAIKey: hasKey,
    keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
    disableFlag: process.env.NEXT_PUBLIC_DISABLE_AI,
    isDisabled,
    finalResult: result
  });
  
  return result;
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
        const result = await getInsightCopy(userId, type, data);
        results[type] = result.copy;
      } catch (error) {
        console.error(`Failed to generate ${type} insight:`, error);
        results[type] = getFallbackCopy(type, data);
      }
    })
  );
  
  return results as Record<InsightType, string>;
} 