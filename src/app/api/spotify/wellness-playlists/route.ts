import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOpenAIClient } from '../../../../lib/openaiClient';

// Request validation schema
const WellnessPlaylistRequestSchema = z.object({
  moodData: z.array(z.object({
    date: z.string(),
    moodScore: z.number()
  })),
  personalityType: z.string(),
  topGenres: z.array(z.string()).optional(),
  topArtists: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).optional(),
  recentTracks: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).optional()
});

interface PlaylistRecommendation {
  id: string;
  name: string;
  description: string;
  moodTag: string;
  subtext: string;
  tracks: Array<{
    id: string;
    name: string;
    artists: string[];
    preview_url: string | null;
    albumColor?: string;
  }>;
  spotifyUrl: string;
  coverImage?: string;
}

function determineEmotionalState(moodData: Array<{ date: string; moodScore: number }>): {
  state: 'positive' | 'neutral' | 'low';
  averageScore: number;
  emoji: string;
} {
  if (moodData.length === 0) {
    return { state: 'neutral', averageScore: 50, emoji: '😌' };
  }

  // Get last 3 days average
  const recentMoods = moodData.slice(-3);
  const averageScore = recentMoods.reduce((sum, day) => sum + day.moodScore, 0) / recentMoods.length;

  let state: 'positive' | 'neutral' | 'low';
  let emoji: string;

  if (averageScore >= 75) {
    state = 'positive';
    emoji = '😄';
  } else if (averageScore >= 60) {
    state = 'neutral'; 
    emoji = '😌';
  } else {
    state = 'low';
    emoji = '😔';
  }

  return { state, averageScore: Math.round(averageScore), emoji };
}

// Curated Spotify Playlists Database - Expanded for Rich User Experience
const WELLNESS_PLAYLIST_DATABASE = {
  // Low mood - Healing, Comfort & Gentle Lifting
  low_mood: [
    // Original playlists
    {
      id: 'calm-comfort-1',
      title: 'Gentle Healing',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0', // Chill Hits
      spotifyPlaylistId: '37i9dQZF1DX3rxVfibe1L0',
      tags: ['low', 'calm', 'healing', 'acoustic'],
      mood: 'comfort',
      genres: ['acoustic', 'indie', 'folk', 'ambient'],
      personalities: ['Open-minded', 'Emotionally Stable'],
      moodTag: 'Gentle Comfort',
      fallbackDescription: 'Soft, comforting tracks to help you through tough moments'
    },
    {
      id: 'mental-health-toolkit',
      title: 'Mental Health Toolkit',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX7wNqeSjxygm', // Your Mental Health Toolkit
      spotifyPlaylistId: '37i9dQZF1DX7wNqeSjxygm',
      tags: ['low', 'therapy', 'mindfulness', 'wellness'],
      mood: 'healing',
      genres: ['guided meditation', 'ambient', 'mindfulness', 'therapeutic'],
      personalities: ['Emotionally Stable', 'Consistent Listener'],
      moodTag: 'Self Care',
      fallbackDescription: 'Therapeutic sounds and guidance for mental wellness'
    },
    {
      id: 'soul-healing-1',
      title: 'Soul Recovery',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2UgsUIqnzEE', // Peaceful Piano
      spotifyPlaylistId: '37i9dQZF1DX2UgsUIqnzEE',
      tags: ['low', 'peaceful', 'piano', 'ambient'],
      mood: 'calm',
      genres: ['classical', 'ambient', 'piano', 'instrumental'],
      personalities: ['Emotionally Stable', 'Consistent Listener'],
      moodTag: 'Inner Peace',
      fallbackDescription: 'Peaceful melodies to restore your inner balance'
    },
    {
      id: 'anxiety-relief-songs',
      title: 'Songs About Life',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1lVhptIYRda', // All Out 00s
      spotifyPlaylistId: '37i9dQZF1DX1lVhptIYRda',
      tags: ['low', 'relatable', 'honest', 'emotional'],
      mood: 'understanding',
      genres: ['indie', 'alternative', 'folk', 'singer-songwriter'],
      personalities: ['Open-minded', 'Emotionally Volatile'],
      moodTag: 'You Are Not Alone',
      fallbackDescription: 'Honest songs that understand what you are going through'
    },
    {
      id: 'late-night-chill',
      title: 'Late Night Chill',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO', // Peaceful Piano
      spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO',
      tags: ['low', 'nighttime', 'chill', 'electronic'],
      mood: 'introspective',
      genres: ['electronic', 'ambient', 'chill', 'downtempo'],
      personalities: ['Explorer', 'Emotionally Stable'],
      moodTag: 'Night Reflection',
      fallbackDescription: 'Soothing electronic sounds for quiet reflection'
    },
    {
      id: 'lofi-chill-beats',
      title: 'Lofi Chill Beats',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn', // Lo-Fi Beats
      spotifyPlaylistId: '37i9dQZF1DWWQRwui0ExPn',
      tags: ['low', 'lofi', 'study', 'relax'],
      mood: 'gentle',
      genres: ['lo-fi', 'hip-hop', 'jazz', 'ambient'],
      personalities: ['Consistent Listener', 'Open-minded'],
      moodTag: 'Soft Focus',
      fallbackDescription: 'Gentle lo-fi beats to help you relax and breathe'
    }
  ],

  // Neutral mood - Balance, Focus & Exploration
  neutral_mood: [
    // Original playlists
    {
      id: 'focus-flow-1',
      title: 'Focus Flow',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ', // Deep Focus
      spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ',
      tags: ['neutral', 'focus', 'ambient', 'productive'],
      mood: 'centered',
      genres: ['ambient', 'electronic', 'lo-fi', 'instrumental'],
      personalities: ['Consistent Listener', 'Emotionally Stable'],
      moodTag: 'Focus & Flow',
      fallbackDescription: 'Balanced sounds to help you find your center'
    },
    {
      id: 'chill-lofi-playlist',
      title: 'Chill Lofi Vibes',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn', // Lo-Fi Beats
      spotifyPlaylistId: '37i9dQZF1DWWQRwui0ExPn',
      tags: ['neutral', 'lofi', 'chill', 'study'],
      mood: 'focused',
      genres: ['lo-fi', 'hip-hop', 'chill', 'beats'],
      personalities: ['Consistent Listener', 'Explorer'],
      moodTag: 'Study Vibes',
      fallbackDescription: 'Perfect lo-fi beats for concentration and calm productivity'
    },
    {
      id: 'acoustic-reset-1',
      title: 'Acoustic Reset',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa', // Acoustic Hits
      spotifyPlaylistId: '37i9dQZF1DX1s9knjP51Oa',
      tags: ['neutral', 'acoustic', 'reset', 'organic'],
      mood: 'reset',
      genres: ['acoustic', 'folk', 'indie', 'singer-songwriter'],
      personalities: ['Open-minded', 'Emotionally Stable'],
      moodTag: 'Mindful Reset',
      fallbackDescription: 'Acoustic melodies to reset and recharge'
    },
    {
      id: 'summer-guitar-relax',
      title: 'Guitar Dreams',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa', // Acoustic Hits
      spotifyPlaylistId: '37i9dQZF1DX1s9knjP51Oa',
      tags: ['neutral', 'guitar', 'instrumental', 'chill'],
      mood: 'peaceful',
      genres: ['acoustic', 'instrumental', 'guitar', 'ambient'],
      personalities: ['Emotionally Stable', 'Open-minded'],
      moodTag: 'Guitar Dreams',
      fallbackDescription: 'Beautiful guitar melodies to help you unwind and reflect'
    },
    {
      id: 'chill-indie-1',
      title: 'Chill Exploration',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo', // Chill Indie
      spotifyPlaylistId: '37i9dQZF1DX4wta20PHgwo',
      tags: ['neutral', 'indie', 'chill', 'discover'],
      mood: 'explore',
      genres: ['indie', 'alternative', 'chill', 'pop'],
      personalities: ['Explorer', 'Open-minded'],
      moodTag: 'Balanced Discovery',
      fallbackDescription: 'Fresh indie sounds for a balanced mindset'
    },
    {
      id: 'ambient-chillhop',
      title: 'Ambient Chillhop',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQwP', // Ambient Chill
      spotifyPlaylistId: '37i9dQZF1DX9RwfGbeGQwP',
      tags: ['neutral', 'ambient', 'chillhop', 'instrumental'],
      mood: 'meditative',
      genres: ['ambient', 'chillhop', 'electronic', 'lo-fi'],
      personalities: ['Consistent Listener', 'Emotionally Stable'],
      moodTag: 'Ambient Flow',
      fallbackDescription: 'Atmospheric chillhop for mindful moments and gentle focus'
    }
  ],

  // Positive mood - Energy, Joy & Celebration
  positive_mood: [
    // Original playlists
    {
      id: 'energy-boost-1',
      title: 'High Energy Flow',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP', // Beast Mode
      spotifyPlaylistId: '37i9dQZF1DX76Wlfdnj7AP',
      tags: ['positive', 'energy', 'pump', 'active'],
      mood: 'energetic',
      genres: ['hip-hop', 'electronic', 'rock', 'pop'],
      personalities: ['Explorer', 'Emotionally Volatile'],
      moodTag: 'High Energy',
      fallbackDescription: 'Powerful tracks to amplify your positive momentum'
    },
    {
      id: 'happy-hits-2025',
      title: 'Happy Hits',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd', // Feel Good Indie Rock
      spotifyPlaylistId: '37i9dQZF1DX0XUsuxWHRQd',
      tags: ['positive', 'happy', 'mainstream', 'current'],
      mood: 'joyful',
      genres: ['pop', 'dance', 'electronic', 'contemporary'],
      personalities: ['Mainstream Listener', 'Emotionally Stable'],
      moodTag: 'Pure Happiness',
      fallbackDescription: 'The latest hits to boost your mood and keep you smiling'
    },
    {
      id: 'workout-2024',
      title: 'Workout Motivation',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP', // Beast Mode
      spotifyPlaylistId: '37i9dQZF1DX76Wlfdnj7AP',
      tags: ['positive', 'workout', 'motivation', 'energy'],
      mood: 'empowered',
      genres: ['dance', 'edm', 'pop', 'electronic'],
      personalities: ['Explorer', 'Emotionally Volatile'],
      moodTag: 'Workout Power',
      fallbackDescription: 'High-energy tracks to fuel your most ambitious goals'
    },
    {
      id: 'indie-exploration-1',
      title: 'Indie Adventures',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2Nc3B70tvx0', // Indie Pop
      spotifyPlaylistId: '37i9dQZF1DX2Nc3B70tvx0',
      tags: ['positive', 'indie', 'discovery', 'upbeat'],
      mood: 'explore',
      genres: ['indie', 'pop', 'alternative', 'indie-pop'],
      personalities: ['Explorer', 'Open-minded'],
      moodTag: 'Creative Energy',
      fallbackDescription: 'Upbeat indie tracks for your creative exploration'
    },
    {
      id: 'pregame-motivation',
      title: 'Rap Motivation',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmNBRM', // Rap Caviar
      spotifyPlaylistId: '37i9dQZF1DX0XUfTFmNBRM',
      tags: ['positive', 'rap', 'motivation', 'hype'],
      mood: 'confident',
      genres: ['hip-hop', 'rap', 'trap', 'urban'],
      personalities: ['Explorer', 'Mainstream Listener'],
      moodTag: 'Confidence Boost',
      fallbackDescription: 'Powerful rap beats to unleash your inner champion'
    },
    {
      id: 'inspirational-songs',
      title: 'Inspirational Vibes',
      spotifyUrl: 'https://open.spotify.com/playlist/0XaAm2ShmEoJrqfMPo45Kf', // Inspirational Songs 2024
      spotifyPlaylistId: '0XaAm2ShmEoJrqfMPo45Kf',
      tags: ['positive', 'inspirational', 'uplifting', 'motivational'],
      mood: 'inspired',
      genres: ['pop', 'indie', 'alternative', 'soul'],
      personalities: ['Open-minded', 'Emotionally Stable'],
      moodTag: 'Good Vibes',
      fallbackDescription: 'Inspirational songs to lift your spirits and fuel your dreams'
    },
    {
      id: 'pop-rock-workout',
      title: 'Pop Rock Energy',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcF6B6QPhFDv', // Rock Classics
      spotifyPlaylistId: '37i9dQZF1DXcF6B6QPhFDv',
      tags: ['positive', 'rock', 'pop', 'classic'],
      mood: 'empowered',
      genres: ['pop-rock', 'classic rock', 'alternative', 'indie rock'],
      personalities: ['Mainstream Listener', 'Explorer'],
      moodTag: 'Rock Energy',
      fallbackDescription: 'Classic and modern rock hits to power through anything'
    },
    {
      id: 'workout-playlist-2025',
      title: 'Ultimate Workout Mix',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX86sOEnopoqa', // Workout Playlist
      spotifyPlaylistId: '37i9dQZF1DX86sOEnopoqa',
      tags: ['positive', 'workout', 'mixed', 'versatile'],
      mood: 'powerful',
      genres: ['hip-hop', 'electronic', 'pop', 'dance'],
      personalities: ['Explorer', 'Emotionally Volatile'],
      moodTag: 'Beast Mode',
      fallbackDescription: 'The ultimate mix of genres to keep you moving and motivated'
    }
  ]
};

// Genre matching logic
function matchUserGenresToPlaylist(userGenres: string[], playlistGenres: string[]): number {
  if (!userGenres.length) return 0;
  
  const normalizedUserGenres = userGenres.map(g => g.toLowerCase());
  const normalizedPlaylistGenres = playlistGenres.map(g => g.toLowerCase());
  
  let score = 0;
  for (const userGenre of normalizedUserGenres) {
    for (const playlistGenre of normalizedPlaylistGenres) {
      if (userGenre.includes(playlistGenre) || playlistGenre.includes(userGenre)) {
        score += 1;
      }
    }
  }
  
  return score / userGenres.length; // Normalize by user genres count
}

// Personality matching logic
function matchPersonalityToPlaylist(userPersonality: string, playlistPersonalities: string[]): number {
  return playlistPersonalities.includes(userPersonality) ? 1 : 0;
}

// Smart playlist selection
function selectWellnessPlaylists(
  emotionalState: { state: 'positive' | 'neutral' | 'low'; averageScore: number },
  personalityType: string,
  topGenres: string[] = []
): any[] {
  const moodKey = `${emotionalState.state}_mood` as keyof typeof WELLNESS_PLAYLIST_DATABASE;
  const availablePlaylists = WELLNESS_PLAYLIST_DATABASE[moodKey];
  
  // Score each playlist based on genre and personality match
  const scoredPlaylists = availablePlaylists.map(playlist => {
    const genreScore = matchUserGenresToPlaylist(topGenres, playlist.genres);
    const personalityScore = matchPersonalityToPlaylist(personalityType, playlist.personalities);
    
    // Weighted scoring: 60% genre, 40% personality
    const totalScore = (genreScore * 0.6) + (personalityScore * 0.4);
    
    return {
      ...playlist,
      matchScore: totalScore
    };
  });
  
  // Sort by match score and return top 3-4 playlists for more variety
  return scoredPlaylists
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, Math.min(4, scoredPlaylists.length));
}

// Get playlist cover image using Spotify oEmbed (no authentication required)
async function getPlaylistCover(playlistId: string): Promise<string | null> {
  try {
    // Spotify oEmbed returns a small thumbnail_url (usually 300x300) without requiring OAuth
    const oEmbedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`;
    const res = await fetch(oEmbedUrl);
    if (!res.ok) {
      console.warn(`oEmbed cover fetch failed for ${playlistId}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return (data as any)?.thumbnail_url || null;
  } catch (error) {
    console.error(`Error fetching oEmbed cover for ${playlistId}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = WellnessPlaylistRequestSchema.parse(body);
    
    const { moodData, personalityType, topGenres = [], topArtists = [], recentTracks = [] } = validatedData;
    
    // Get access token from cookies
    const accessToken = request.cookies.get('spotify_access_token')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Spotify access token not found' },
        { status: 401 }
      );
    }

    // Determine emotional state
    const emotionalState = determineEmotionalState(moodData);
    
    // Select appropriate playlists
    const selectedPlaylists = selectWellnessPlaylists(emotionalState, personalityType, topGenres);
    
    console.log('🎯 Wellness Playlist Selection:', {
      emotionalState,
      personalityType,
      topGenres,
      selectedCount: selectedPlaylists.length,
      playlistTitles: selectedPlaylists.map(p => p.title)
    });

    // Generate playlist recommendations without AI insights for faster loading
    const playlists: PlaylistRecommendation[] = await Promise.all(
      selectedPlaylists.map(async (playlist, index) => {
        // Get playlist cover image with better error handling
        let coverImage: string | null = null;
        try {
          coverImage = await getPlaylistCover(playlist.spotifyPlaylistId);
        } catch (error) {
          console.error(`Failed to fetch cover for playlist ${playlist.spotifyPlaylistId}:`, error);
        }

        return {
          id: `wellness-${index + 1}`,
          name: playlist.title,
          description: playlist.fallbackDescription,
          moodTag: playlist.moodTag,
          subtext: `Curated for ${emotionalState.state} mood`,
          tracks: [], // We don't need individual tracks since we're linking to full playlists
          spotifyUrl: playlist.spotifyUrl,
          coverImage: coverImage || undefined
        };
      })
    );

    // Generate overall mood insight
    const playlistNames = selectedPlaylists.map(p=>`"${p.title}"`).join(', ');
    const overallInsightPrompt = `Compose a single friendly sentence (max 25 words) telling the user *how* the recommended playlists will support their current ${emotionalState.state} mood.

DETAILS TO USE:
• Playlists: ${playlistNames}
• Personality type: ${personalityType}
• Key benefit examples: boost energy, maintain positivity, gentle uplift, calm focus.

Requirements:
1. Reference the playlists collectively (no more than two names) or generically ("these mixes").
2. Explain the emotional/mental benefit.
3. Encourage listening.
4. No emojis.`;

    let insight = "Music can be a powerful companion for emotional wellness - these playlists are chosen just for you.";
    try {
      const openai = getOpenAIClient();
      const insightCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive music wellness expert who creates personalized, encouraging insights.'
          },
          {
            role: 'user',
            content: overallInsightPrompt
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      insight = insightCompletion.choices[0]?.message?.content?.trim() || insight;
    } catch (error) {
      console.error('Failed to generate overall insight:', error);
    }

    console.log('🧠 Generated wellness insight:', insight);

    return NextResponse.json({
      emotionalState,
      playlists,
      insight,
    });

  } catch (error) {
    console.error('Wellness playlist generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate wellness playlists' },
      { status: 500 }
    );
  }
} 