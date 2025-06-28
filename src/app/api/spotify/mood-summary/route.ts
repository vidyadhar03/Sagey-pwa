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
  })),
  averageMood: z.number(),
  highestMoodDay: z.object({
    dayName: z.string(),
    moodScore: z.number(),
    topGenres: z.array(z.string()).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MoodSummaryRequestSchema.parse(body);
    
    const { moodData, averageMood, highestMoodDay } = validatedData;
    
    if (!moodData.length) {
      return NextResponse.json({ 
        summary: "No listening data available for mood analysis this week." 
      });
    }

    // Prepare context for GPT
    const weekDays = moodData.map(day => 
      `${day.dayName}: ${day.moodScore} mood score (${day.trackCount} tracks${day.topGenres?.length ? `, top genres: ${day.topGenres.slice(0, 2).join(', ')}` : ''})`
    ).join('\n');

    const prompt = `Analyze this user's weekly music listening mood data and create a personalized, insightful summary:

MOOD DATA:
${weekDays}

WEEKLY STATS:
- Average mood: ${averageMood}/100
- Best day: ${highestMoodDay.dayName} (${highestMoodDay.moodScore}/100${highestMoodDay.topGenres?.length ? `, ${highestMoodDay.topGenres[0]} music` : ''})

Create exactly 2 bullet points that:
1. Highlight their mood journey or standout moments
2. Mention specific genres ONLY (no artists)  
3. Use an encouraging, friendly tone
4. Include relevant mood emojis (🌕 for high moods 75+, 🌤 for good 60-74, ☁️ for mixed 40-59, 🌧 for low 30-39)
5. Each point should be a complete, short sentence (10-15 words max)

Format as:
• [First insight about their week]
• [Second insight about peak/patterns]

Examples:
• You had a great week with consistent positive vibes! 🌕
• Tuesday's Hip-Hop tracks brought your highest energy levels 🌤

Keep each point concise, personal, and uplifting.`;

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