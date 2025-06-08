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

const RequestSchema = z.object({
  type: z.enum(['musical_age', 'mood_ring', 'genre_passport', 'night_owl_pattern']),
  payload: z.union([
    MusicalAgePayloadSchema,
    MoodRingPayloadSchema,
    GenrePassportPayloadSchema,
    NightOwlPatternPayloadSchema,
  ]),
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
    console.log('📥 Received AI insight request:', { type: body.type, regenerate });

    const validatedData = RequestSchema.parse(body);
    const { type, payload } = validatedData;

    // Get user ID (simple implementation)
    let userId = getUserFromRequest(request);
    if (!userId) {
      // Fallback to a session identifier for demo purposes
      userId = 'anonymous-' + Date.now().toString(36);
      console.log('⚠️ No user ID found, using anonymous:', userId);
    }

    console.log(`🔍 Generating ${type} insight for user ${userId}`);

    // Generate AI copy
    const result = await getInsightCopy(userId, type as InsightType, payload, regenerate);

    console.log(`✅ Successfully generated ${type} insight`);
    console.info(`[AI] Cache`, { cached: result.fromCache, regenerate, type });
    
    return NextResponse.json({
      copy: result.copy,
      source: 'ai',
      type,
      cached: result.fromCache,
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