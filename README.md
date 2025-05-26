# Sagey PWA - Minimalist Wellness & Music Analytics Platform

A privacy-first Progressive Web Application that combines topic-based journaling with Spotify music analytics to deliver personalized wellness insights and cross-domain correlations.

## 🎯 **Project Overview**

Sagey is a Next.js PWA designed to help users build daily reflection habits while discovering how their music listening relates to mood and behavior patterns. The app focuses on two core features: structured journaling and comprehensive Spotify integration.

### **Core Vision**
- **Minimalist Design**: Clean, dark-themed interface with glass-morphism cards
- **Privacy-First**: Secure data handling with httpOnly cookies and minimal data collection
- **Cross-Domain Insights**: Correlate music listening patterns with journal mood entries
- **Habit Formation**: 30-second daily check-ins with streak tracking and gentle reminders

## 🏗️ **Technical Architecture**

### **Tech Stack**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **PWA**: next-pwa for offline capabilities
- **Authentication**: OAuth 2.0 (Spotify)
- **Deployment**: Vercel

### **Project Structure**
```
sagey-pwa/
├── src/
│   ├── app/
│   │   ├── api/spotify/          # Spotify API routes
│   │   │   ├── auth/             # OAuth initiation
│   │   │   ├── callback/         # OAuth callback handler
│   │   │   ├── status/           # Connection status
│   │   │   ├── recent-tracks/    # Recent listening history
│   │   │   ├── top-tracks/       # Top tracks analysis
│   │   │   ├── top-artists/      # Top artists analysis
│   │   │   └── audio-features/   # Audio characteristics
│   │   ├── spotify-data/         # Dedicated analytics page
│   │   ├── layout.tsx            # Root layout with PWA config
│   │   └── page.tsx              # Main entry point
│   ├── components/
│   │   ├── screens/              # Main app screens
│   │   │   ├── HomeLayout.tsx    # Dashboard with integrations
│   │   │   ├── JournalLayout.tsx # Topic-based journaling UI
│   │   │   └── InsightsLayout.tsx # Data visualization hub
│   │   ├── SpotifyConnection.tsx # Integration status component
│   │   ├── SpotifyDataView.tsx   # Full analytics interface
│   │   ├── ChatInterface.tsx     # AI chat component
│   │   ├── TopAppBar.tsx         # Navigation header
│   │   ├── BottomNav.tsx         # Tab navigation
│   │   ├── FrameLayout.tsx       # App shell layout
│   │   └── ClientLayout.tsx      # Route-based layout wrapper
│   └── hooks/
│       └── useSpotify.ts         # Spotify integration hook
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (72x72 to 512x512)
├── tailwind.config.js            # Design system configuration
└── next.config.js                # Next.js configuration
```

## 🎵 **Spotify Integration**

### **OAuth 2.0 Implementation**
- **Scopes**: `user-read-email`, `user-read-recently-played`, `user-top-read`, `user-library-read`, `playlist-read-private`, `user-read-currently-playing`
- **Security**: httpOnly cookies, CSRF protection, secure token storage
- **Token Management**: Automatic refresh handling, 30-day refresh token expiry

### **Data Access Capabilities**
- **User Profile**: Name, email, follower count, subscription type, profile images
- **Recent Tracks**: Last 50 played tracks with timestamps and metadata
- **Top Music**: Top 50 tracks/artists across 3 time ranges (4 weeks, 6 months, all time)
- **Audio Features**: Energy, valence, danceability, tempo, acousticness, instrumentalness
- **Analytics**: Mood scoring, genre analysis, listening pattern insights

### **API Endpoints**
```typescript
GET /api/spotify/auth          # Initiate OAuth flow
GET /api/spotify/callback      # Handle OAuth callback
GET /api/spotify/status        # Check connection status
GET /api/spotify/recent-tracks # Fetch recent listening history
GET /api/spotify/top-tracks    # Get top tracks (with time_range param)
GET /api/spotify/top-artists   # Get top artists (with time_range param)
GET /api/spotify/audio-features # Analyze track audio characteristics
```

## 🎨 **Design System**

### **Color Palette**
```css
--background: #0D0D0F          /* Very dark background */
--card-background: #2A2A2D     /* Dark gray cards */
--text-primary: #ffffff        /* White text */
--text-secondary: #a0a0a0      /* Gray secondary text */
--accent: #4ECDC4              /* Turquoise primary accent */
--accent-secondary: #2ECC71    /* Green secondary accent */
--spotify-green: #1DB954       /* Spotify brand color */
```

### **Typography**
- **Font Family**: Geist (primary), Geist Mono (monospace)
- **Font Smoothing**: Antialiased for crisp text rendering

### **Components**
- **Glass-morphism Cards**: `border-white/10` with backdrop blur
- **Rounded Corners**: Consistent `rounded-xl` (12px) and `rounded-2xl` (16px)
- **Icons**: Heroicons SVG library throughout
- **Animations**: Framer Motion for smooth transitions

## 📱 **App Structure**

### **Navigation**
- **Tab-Based**: Home, Journal, Insights
- **Fixed Layout**: TopAppBar + Content + BottomNav
- **Route Exclusions**: `/spotify-data` bypasses main navigation for full-screen experience

### **Home Screen**
1. **Hello, Alex Section**: User greeting and avatar
2. **Integration Insights**: Spotify connection status and journal patterns
3. **Daily Aha Quote**: Inspirational daily message
4. **Action Buttons**: Daily Check-in and Mini-journal (UI only)
5. **Today's Goals**: Progress tracking with visual indicators

### **Journal Screen**
- **Topic Categories**: Health, Relationships, Finance, Custom
- **Entry Management**: Recent entries with mood indicators
- **Analytics**: Writing streak, mood trends, category insights

### **Insights Screen**
- **Multi-Tab View**: Music, Journal, Combined insights
- **Spotify Analytics**: Genre breakdowns, listening statistics, mood profiles
- **Cross-Domain**: Correlation insights between music and journal data

## 🔧 **Development Setup**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Spotify Developer Account

### **Environment Variables**
Create a `.env.local` file:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/your-username/sagey-pwa.git
cd sagey-pwa

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Spotify App Configuration**
1. Create a Spotify app at [developer.spotify.com](https://developer.spotify.com)
2. Add redirect URIs:
   - Development: `http://localhost:3000/api/spotify/callback`
   - Production: `https://your-domain.com/api/spotify/callback`
3. Copy Client ID and Client Secret to environment variables

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Update Spotify redirect URI to production URL
```

### **PWA Features**
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Standalone display mode
- **Icons**: Complete icon set (72x72 to 512x512)
- **Manifest**: Comprehensive PWA manifest configuration

## 📊 **Current Features**

### ✅ **Implemented**
- **Complete Spotify Integration**: OAuth, data fetching, analytics
- **Responsive UI**: Mobile-first design with desktop support
- **PWA Configuration**: Offline support, app installation
- **Navigation System**: Tab-based navigation with route management
- **Design System**: Consistent styling with Tailwind CSS
- **Component Architecture**: Modular, reusable components

### 🔶 **Partial Implementation**
- **Journal UI**: Complete interface, missing data persistence
- **Insights Visualization**: UI framework ready, needs real data correlation
- **Chat Interface**: Component exists, needs LLM integration

### ❌ **Planned Features**
- **Data Persistence**: Database integration for journal entries
- **User Authentication**: User accounts and data storage
- **AI Integration**: LLM-powered chat and insights
- **Push Notifications**: Daily check-in reminders
- **Cross-Domain Analytics**: Real correlation engine

## 🔒 **Security & Privacy**

### **Data Protection**
- **httpOnly Cookies**: Secure token storage
- **CSRF Protection**: State verification in OAuth flow
- **Minimal Data Collection**: Only essential Spotify data
- **No Data Persistence**: Currently no user data stored server-side

### **Privacy Features**
- **Local Storage**: User preferences stored locally
- **Secure Transmission**: HTTPS-only in production
- **Token Expiration**: Automatic cleanup of expired tokens

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting (recommended)
- **Component Structure**: Functional components with hooks

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Spotify Web API**: Music data and analytics
- **Next.js Team**: Framework and development tools
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Heroicons**: SVG icon library

---

**Built with ❤️ for mindful music listening and personal growth**
