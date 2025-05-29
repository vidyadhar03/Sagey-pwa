# Deployment Guide for Sagey PWA

## ✅ Vercel Deployment

The project is now optimized for Vercel deployment with the following configuration:

### Build Configuration
- **Build Command**: `npm run build`
- **Install Command**: `npm ci --legacy-peer-deps`
- **Node.js Memory**: 8GB allocation
- **ESLint**: Disabled during builds to prevent blocking

### Required Environment Variables
Set these in your Vercel dashboard:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/api/spotify/callback
OPENAI_API_KEY=your_openai_api_key (optional, for Musical Age feature)
```

### Deployment Steps
1. **Push to Repository**: Commit your changes to the main branch
2. **Automatic Deploy**: Vercel will automatically detect changes and deploy
3. **Monitor Build**: Check the Vercel dashboard for build status

## 🛠️ Local Development

### Setup
```bash
# Install dependencies
npm ci --legacy-peer-deps

# Run development server
npm run dev
```

### Build Testing
```bash
# Clean build (recommended)
npm run build:clean

# Regular build
npm run build

# If Windows permission issues persist
npm run cleanup
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
- **Solution**: Use `npm run build:clean` to clear cache and rebuild
- **Windows Users**: Use the cleanup script if permission errors occur

#### 2. TypeScript/ESLint Errors
- **Status**: Automatically handled (linting disabled during builds)
- **Development**: Errors will show as warnings, not block builds

#### 3. Memory Issues
- **Solution**: Build uses 8GB allocation automatically
- **Local**: Increase Node.js memory if needed: `NODE_OPTIONS="--max-old-space-size=8192"`

#### 4. Dependency Conflicts
- **Solution**: Uses `--legacy-peer-deps` for React 19 compatibility
- **Reset**: Run `npm run clean:all` for complete dependency reset

### File Structure
The build creates standard Next.js output structure:
```
.next/
├── routes-manifest.json      ← Required by Vercel
├── build-manifest.json
├── app-path-routes-manifest.json
├── server/
└── static/
```

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Build passes locally (`npm run build:clean`)
- [ ] All required API endpoints are functional
- [ ] Spotify app configuration updated with production URLs
- [ ] Domain configured correctly in Vercel

## 🚀 Performance Optimizations

The configuration includes:
- **Chunk Splitting**: Optimized vendor chunks
- **Memory Management**: 8GB allocation
- **Caching**: Disabled on Windows to prevent permission issues
- **Compression**: Enabled for smaller bundle sizes
- **Image Optimization**: WebP/AVIF support for Spotify images

## 📞 Support

If you encounter issues:
1. Check the build logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Test locally with `npm run build:clean`
4. Check that all required files exist in `.next/` directory 