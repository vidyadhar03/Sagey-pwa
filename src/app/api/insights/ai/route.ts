import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getInsightCopy, isAIEnabled } from '../../../../services/generateInsightCopy';
import { InsightType } from '../../../../lib/openaiClient';

// Validation schemas
const MusicalAgePayloadSchema = z.object({
  age: z.number(),
  averageYear: z.number(),
  description: z.string(),
  actualAge: z.number().optional(),
});

const MoodRingPayloadSchema = z.object({
  emotions: z.object({
    happy: z.number(),
    energetic: z.number(),
    chill: z.number(),
    melancholy: z.number(),
  }),
  dominantMood: z.string(),
});

const GenrePassportPayloadSchema = z.object({
  totalGenres: z.number(),
  topGenres: z.array(z.string()),
  explorationScore: z.number(),
});

const NightOwlPatternPayloadSchema = z.object({
  hourlyData: z.array(z.number()),
  peakHour: z.number(),
  isNightOwl: z.boolean(),
  score: z.number(),
});

const RadarSummaryPayloadSchema = z.object({
  scores: z.record(z.string(), z.number()),
  stats: z.object({
    positivity: z.object({
      weightedMeanValence: z.number(),
      percentage: z.number(),
    }),
    energy: z.object({
      weightedMeanEnergy: z.number(),
      weightedMeanTempo: z.number(),
    }),
    exploration: z.object({
      genreCount: z.number(),
      entropy: z.number(),
      normalizedEntropy: z.number(),
    }),
    nostalgia: z.object({
      medianTrackAge: z.number(),
      userDOB: z.string().optional(),
    }),
    nightOwl: z.object({
      nightPlayCount: z.number(),
      totalPlayCount: z.number(),
      percentage: z.number(),
    }),
  }),
  suggestions: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })),
  trackCount: z.number(),
  isDefault: z.boolean().optional(),
  trends: z.array(z.object({
    axis: z.enum(['Positivity', 'Energy', 'Exploration', 'Nostalgia', 'Night-Owl']),
    value: z.number(),
  })),
  topGenre: z.string(),
  sampleTrack: z.object({
    title: z.string(),
    artist: z.string(),
  }),
  weeks: z.number(),
});



// Validation schema for radar_hype AI responses
const RadarHypeResponseSchema = z.object({
  mainInsight: z.string().min(1).max(250), // 50 words ≈ 250 characters
  tip: z.string().min(1).max(120).optional()
});



const RequestSchema = z.object({
  type: z.enum(['musical_age', 'mood_ring', 'genre_passport', 'night_owl_pattern', 'radar_summary', 'radar_hype']),
      payload: z.union([
      MusicalAgePayloadSchema,
      MoodRingPayloadSchema, 
      GenrePassportPayloadSchema,
      NightOwlPatternPayloadSchema,
      RadarSummaryPayloadSchema,
    ]),
  options: z.object({
    variant: z.enum(['witty', 'poetic']).optional(),
  }).optional(),
});

// Mock authentication - in real implementation, this would use session/JWT
function getUserFromRequest(request: NextRequest): string | null {
  // For now, use a simple cookie or header approach
  const userId = request.headers.get('x-user-id') || request.cookies.get('spotify_user_id')?.value;
  return userId || null;
}

export async function POST(request: NextRequest) {
  console.log('=== AI INSIGHTS API START ===');
  
  try {
    // Check if AI is enabled
    if (!isAIEnabled()) {
      console.log('⚠️ AI is disabled, returning mock response');
      return NextResponse.json({
        copy: '🎵 Your musical insights are being generated... AI is currently disabled ✨',
        source: 'disabled'
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const regenerate = body.regenerate === true || request.nextUrl.searchParams.get('regenerate') === 'true';
    console.log('📥 Received AI insight request:', { type: body.type, regenerate, options: body.options });

    const validatedData = RequestSchema.parse(body);
    const { type, payload, options } = validatedData;

    // Get user ID (simple implementation)
    let userId = getUserFromRequest(request);
    if (!userId) {
      // Fallback to a session identifier for demo purposes
      userId = 'anonymous-' + Date.now().toString(36);
      console.log('⚠️ No user ID found, using anonymous:', userId);
    }

    console.log(`🔍 Generating ${type} insight for user ${userId}${options?.variant ? ` (variant: ${options.variant})` : ''}`);

    // Generate AI copy
    const result = await getInsightCopy(userId, type as InsightType, payload, regenerate, options);

    console.log(`✅ Successfully generated ${type} insight`);
    console.info(`[AI] Cache`, { cached: result.fromCache, regenerate, type });
    console.log(`📝 Generated copy: "${result.copy.substring(0, 100)}${result.copy.length > 100 ? '...' : ''}"`);
    
    // Special validation for radar_hype responses
    if (type === 'radar_hype') {
      try {
        console.log('🔍 Validating radar_hype JSON response...');
        const parsedResponse = JSON.parse(result.copy);
        const validatedResponse = RadarHypeResponseSchema.parse(parsedResponse);
        
        console.log('✅ radar_hype JSON validation passed:', validatedResponse);
        
        return NextResponse.json({
          copy: result.copy,
          source: 'ai',
          type,
          cached: result.fromCache,
          debug: {
            regenerated: regenerate,
            timestamp: new Date().toISOString(),
            userId: userId.substring(0, 10) + '...',
            copyLength: result.copy.length,
            validatedShape: validatedResponse
          }
        });
        
      } catch (validationError) {
        console.error('❌ radar_hype JSON validation failed:', validationError);
        console.error('📝 Raw response that failed validation:', result.copy);
        
        // Provide more specific error details
        let errorDetails: string | z.ZodIssue[] = 'JSON parse error';
        if (validationError instanceof z.ZodError) {
          errorDetails = validationError.errors;
        } else if (validationError instanceof SyntaxError) {
          errorDetails = 'Invalid JSON syntax';
        } else if (validationError instanceof Error) {
          errorDetails = validationError.message;
        }
        
        return NextResponse.json(
          {
            error: 'BAD_AI_SHAPE',
            details: errorDetails,
            rawResponse: result.copy,
            type,
            suggestion: 'This indicates the AI returned non-JSON text. Check server logs for OpenAI API errors.',
          },
          { status: 502 }
        );
      }
    }
    

    
    console.log(`🔑 Cache key would be based on user: ${userId}, type: ${type}`);
    
    return NextResponse.json({
      copy: result.copy,
      source: 'ai',
      type,
      cached: result.fromCache,
      debug: {
        regenerated: regenerate,
        timestamp: new Date().toISOString(),
        userId: userId.substring(0, 10) + '...',
        copyLength: result.copy.length,
        firstWords: result.copy.substring(0, 50) + '...'
      }
    });

  } catch (error) {
    console.error('❌ AI Insights API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Return fallback copy for any other errors
    return NextResponse.json(
      {
        copy: '🎵 Your musical DNA is truly unique! Keep exploring those beats ✨',
        source: 'fallback',
        error: 'AI generation temporarily unavailable',
      },
      { status: 200 } // Still return 200 since we have fallback content
    );
  }
}

// Optional: GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    aiEnabled: isAIEnabled(),
    timestamp: new Date().toISOString(),
  });
} 