import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOpenAIClient } from '../../../../lib/openaiClient';

// Validation schema for mood summary request
const MoodSummaryRequestSchema = z.object({
  moodData: z.array(z.object({
    date: z.string(),
    dayName: z.string(),
    moodScore: z.number(),
    trackCount: z.number(),
    topGenres: z.array(z.string()).optional(),
    insight: z.string(),
    musicalDiversity: z.number(),
    explorationRate: z.number(),
    temporalConsistency: z.number(),
    mainstreamAffinity: z.number(),
    emotionalVolatility: z.number(),
  })),
  averageMood: z.number(),
  highestMoodDay: z.object({
    dayName: z.string(),
    moodScore: z.number(),
    topGenres: z.array(z.string()).optional(),
  }),
  personalityType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MoodSummaryRequestSchema.parse(body);
    
    const { moodData, averageMood, highestMoodDay, personalityType } = validatedData;
    
    if (!moodData.length) {
      return NextResponse.json({ 
        summary: "No listening data available for mood analysis this week." 
      });
    }

    // Prepare context for GPT
    const weekDays = moodData.map(day => 
      `${day.dayName}: ${day.moodScore} mood score (${day.trackCount} tracks${day.topGenres?.length ? `, top genres: ${day.topGenres.slice(0, 2).join(', ')}` : ''})`
    ).join('\n');

    // Compute average mental metrics
    const avgDiversity = Math.round(moodData.reduce((s,d)=>s+d.musicalDiversity,0)/moodData.length);
    const avgExploration = Math.round(moodData.reduce((s,d)=>s+d.explorationRate,0)/moodData.length);
    const avgConsistency = Math.round(moodData.reduce((s,d)=>s+d.temporalConsistency,0)/moodData.length);
    const avgMainstream = Math.round(moodData.reduce((s,d)=>s+d.mainstreamAffinity,0)/moodData.length);
    const avgVolatility = Math.round(moodData.reduce((s,d)=>s+d.emotionalVolatility,0)/moodData.length);

    const prompt = `You are provided with a user's weekly listening-mood analytics. Write a concise, supportive mental-health recap.

PERSONALITY: ${personalityType || 'Balanced Listener'}
MENTAL ATTRIBUTES (0-100):
• Musical diversity ${avgDiversity}
• Exploration ${avgExploration}
• Temporal consistency ${avgConsistency}
• Mainstream affinity ${avgMainstream}
• Emotional volatility ${avgVolatility}

MOOD DATA:
${weekDays}

STATS:
- Average mood ${averageMood}
- Peak day ${highestMoodDay.dayName} (${highestMoodDay.moodScore})

Create exactly 3 bullet points (complete sentences, 12-18 words):
1. Overall mental/emotional stability observation
2. Strength or improvement area related to personality/attributes
3. Motivational suggestion for the coming week

Avoid emojis and special characters.`;

    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a music psychology expert who creates personalized, encouraging summaries about users\' weekly mood patterns based on their listening data. Be warm, insightful, and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    
    if (!summary) {
      throw new Error('Failed to generate mood summary');
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Mood summary generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate mood summary' },
      { status: 500 }
    );
  }
} 