# Musical Age Estimator Feature Documentation

## Overview

The Musical Age Estimator is the first core MVP feature of the Sagey PWA. It calculates and displays a user's "Musical Age" by comparing their actual age to the average release year of their top Spotify tracks, providing AI-generated insights about their musical taste.

## Features

### Core Functionality
- **Musical Age Calculation**: Analyzes user's top 50 tracks from the last 6 months
- **Age Comparison**: Compares musical age to actual age (if available from Spotify profile)
- **AI-Powered Insights**: Uses OpenAI GPT-4 to generate personalized, engaging commentary
- **Era Classification**: Categorizes music taste by decade/era
- **Track Analysis**: Shows oldest and newest tracks in user's top list

### Visual Design
- **Retro-Style Graphics**: Animated rotating icons and gradient backgrounds
- **Responsive Layout**: Optimized for mobile and desktop viewing
- **Loading States**: Animated skeleton screens during data fetching
- **Error Handling**: User-friendly error messages with retry options
- **Framer Motion Animations**: Staggered entrance animations for smooth UX

## Technical Implementation

### Backend API (`/api/spotify/musical-age`)

**File**: `src/app/api/spotify/musical-age/route.ts`

**Key Functions**:
- Fetches user's top tracks from Spotify API
- Calculates average release year from track metadata
- Determines musical age (current year - average release year)
- Generates AI insights using OpenAI GPT-4 API
- Provides fallback insights when OpenAI is unavailable

**Data Structure**:
```typescript
interface MusicalAgeData {
  actualAge: number | null;
  averageReleaseYear: number;
  musicalAge: number;
  ageDifference: number;
  totalTracks: number;
  oldestTrack: { name: string; artist: string; year: number };
  newestTrack: { name: string; artist: string; year: number };
  aiInsight: string;
}
```

### Frontend Components

**Hook**: `src/hooks/useMusicalAge.ts`
- Custom React hook for data fetching and state management
- Handles loading states, error handling, and refetch functionality
- Automatically fetches data on component mount

**Component**: `src/components/MusicalAgeEstimator.tsx`
- Main UI component with comprehensive visual design
- Animated loading skeletons and error states
- Interactive elements with hover effects and animations
- Responsive grid layouts for different screen sizes

**Integration**: `src/components/screens/HomeLayout.tsx`
- Featured prominently in the Home tab
- Positioned after welcome section for maximum visibility
- Only shown when user is connected to Spotify

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI API Configuration (Required for AI insights)
OPENAI_API_KEY=your_openai_api_key_here

# Spotify API Configuration (Required for music data)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 2. API Keys Setup

**OpenAI API Key**:
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

**Spotify API Credentials**:
1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy Client ID and Client Secret to `.env.local`

### 3. Dependencies

The feature uses existing dependencies:
- `framer-motion` - For animations
- `react` & `next.js` - Core framework
- Built-in `fetch` - For API calls

## Usage

### For Users
1. **Connect Spotify**: Users must connect their Spotify account
2. **Automatic Calculation**: Musical age is calculated automatically on page load
3. **View Insights**: AI-generated insights explain the musical age meaning
4. **Refresh Data**: Users can recalculate with updated listening data

### For Developers
1. **Import Component**: `import MusicalAgeEstimator from '../MusicalAgeEstimator'`
2. **Use Hook**: `const { data, loading, error, refetch } = useMusicalAge()`
3. **Handle States**: Component automatically handles loading, error, and success states

## Error Handling

### API Errors
- **401 Unauthorized**: Spotify token expired or missing
- **404 Not Found**: No tracks found or invalid release dates
- **500 Internal Error**: Server-side processing errors

### Fallback Behavior
- **OpenAI Unavailable**: Uses predefined insight templates
- **Spotify Data Issues**: Shows helpful error messages with retry options
- **Network Issues**: Graceful degradation with retry functionality

## Performance Considerations

### Optimization Features
- **Efficient API Calls**: Single request fetches all required data
- **Caching**: Browser caches API responses
- **Lazy Loading**: Component only loads when visible
- **Memory Management**: Proper cleanup of event listeners and timers

### Build Optimizations
- **Code Splitting**: Component is dynamically imported
- **Tree Shaking**: Unused code is eliminated
- **Minification**: Production builds are optimized

## Testing

### Manual Testing Checklist
- [ ] Musical age calculation accuracy
- [ ] AI insight generation (with and without OpenAI)
- [ ] Error handling for various scenarios
- [ ] Loading states and animations
- [ ] Responsive design on different screen sizes
- [ ] Spotify connection flow
- [ ] Refresh functionality

### Test Scenarios
1. **New User**: First-time Spotify connection
2. **Existing User**: User with extensive listening history
3. **Limited Data**: User with few tracks
4. **API Failures**: Network issues or service downtime
5. **Edge Cases**: Very old or very new music preferences

## Future Enhancements

### Planned Features
- **Historical Tracking**: Track musical age changes over time
- **Genre Breakdown**: Detailed analysis by music genre
- **Sharing**: Social sharing of musical age results
- **Comparisons**: Compare with friends or global averages
- **Recommendations**: Music suggestions based on musical age

### Technical Improvements
- **Caching Strategy**: Redis or database caching for API responses
- **Rate Limiting**: Implement proper rate limiting for API calls
- **Analytics**: Track feature usage and user engagement
- **A/B Testing**: Test different insight generation approaches

## Troubleshooting

### Common Issues

**"Spotify access token not found"**
- Solution: Ensure user is properly connected to Spotify
- Check: Cookie storage and authentication flow

**"No tracks found"**
- Solution: User needs to listen to more music on Spotify
- Check: Spotify account activity and privacy settings

**"OpenAI API Error"**
- Solution: Verify API key and account credits
- Fallback: Feature still works with predefined insights

**Build hanging or errors**
- Solution: Use provided build scripts and configurations
- Check: Node.js version compatibility and memory allocation

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in `.env.local`

## Contributing

### Code Style
- Follow existing TypeScript patterns
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Add comprehensive JSDoc comments

### Pull Request Guidelines
1. Test all user flows thoroughly
2. Update documentation for any changes
3. Ensure responsive design works
4. Verify accessibility standards
5. Check performance impact

## License

This feature is part of the Sagey PWA project and follows the same licensing terms. 