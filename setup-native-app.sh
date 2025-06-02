#!/bin/bash

echo "🚀 Setting up Sagey Native App..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the sagey-pwa directory${NC}"
    exit 1
fi

# Check for required tools
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}⚠️ Expo CLI not found. Installing...${NC}"
    npm install -g @expo/cli
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️ EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
fi

echo -e "${GREEN}✅ Prerequisites check complete${NC}"

# Create native app directory
echo -e "${BLUE}📁 Creating native app directory...${NC}"
cd ..
if [ -d "SageyNativeApp" ]; then
    echo -e "${YELLOW}⚠️ SageyNativeApp directory already exists. Removing...${NC}"
    rm -rf SageyNativeApp
fi

# Create new Expo app
echo -e "${BLUE}🎯 Creating new Expo app...${NC}"
npx create-expo-app --template blank-typescript SageyNativeApp

cd SageyNativeApp

# Copy configuration files
echo -e "${BLUE}📋 Copying configuration files...${NC}"
cp ../sagey-pwa/native-app.config.json ./app.json
cp ../sagey-pwa/native-package.json ./package.json
cp ../sagey-pwa/env.native.example ./.env.example

# Create directory structure
echo -e "${BLUE}📂 Creating directory structure...${NC}"
mkdir -p src/hooks
mkdir -p src/components
mkdir -p src/utils
mkdir -p assets/icons

# Copy native authentication files
echo -e "${BLUE}🔐 Copying authentication files...${NC}"
cp ../sagey-pwa/src/hooks/useNativeSpotifyAuth.tsx ./src/hooks/
cp ../sagey-pwa/src/components/NativeSpotifyAuth.tsx ./src/components/

# Copy assets if they exist
if [ -d "../sagey-pwa/public/icons" ]; then
    echo -e "${BLUE}🎨 Copying app icons...${NC}"
    cp ../sagey-pwa/public/icons/* ./assets/icons/ 2>/dev/null || true
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Fix dependency issues
echo -e "${BLUE}🔧 Fixing dependencies...${NC}"
npx expo install --fix

# Create basic App.tsx
echo -e "${BLUE}📱 Creating basic App.tsx...${NC}"
cat > App.tsx << 'EOF'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NativeSpotifyAuth } from './src/components/NativeSpotifyAuth';

export default function App() {
  const handleAuthChange = (connected: boolean, userInfo: any) => {
    console.log('Auth changed:', { connected, userInfo });
  };

  const handleError = (error: string) => {
    console.error('Auth error:', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sagey</Text>
        <Text style={styles.subtitle}>Musical Age Estimator</Text>
      </View>
      
      <View style={styles.content}>
        <NativeSpotifyAuth 
          onAuthChange={handleAuthChange}
          onError={handleError}
        />
      </View>
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
EOF

# Create environment file
echo -e "${BLUE}⚙️ Setting up environment...${NC}"
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️ Please update .env.local with your Spotify credentials${NC}"
fi

# Initialize EAS (optional)
echo -e "${BLUE}🏗️ Initializing EAS (optional)...${NC}"
read -p "Do you want to initialize EAS for building? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    eas login
    eas build:configure
fi

# Success message
echo -e "${GREEN}🎉 Native app setup complete!${NC}"
echo
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Update .env.local with your Spotify credentials"
echo "2. Add native redirect URIs to Spotify Developer Console:"
echo "   - com.sagey.app://spotify-callback"
echo "   - com.sagey.app://auth"
echo "3. Start development server: npm start"
echo "4. Test on device: expo start --android or expo start --ios"
echo
echo -e "${GREEN}🚀 Happy coding!${NC}" 