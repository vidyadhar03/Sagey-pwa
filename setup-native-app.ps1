# Sagey Native App Setup Script (PowerShell)
param(
    [switch]$SkipEAS = $false
)

Write-Host "🚀 Setting up Sagey Native App..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the sagey-pwa directory" -ForegroundColor Red
    exit 1
}

# Check for required tools
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Check if Expo CLI is installed
try {
    $expoVersion = expo --version
    Write-Host "✅ Expo CLI found: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Expo CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @expo/cli
}

# Check if EAS CLI is installed
if (!$SkipEAS) {
    try {
        $easVersion = eas --version
        Write-Host "✅ EAS CLI found: $easVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ EAS CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g eas-cli
    }
}

Write-Host "✅ Prerequisites check complete" -ForegroundColor Green

# Create native app directory
Write-Host "📁 Creating native app directory..." -ForegroundColor Blue
Set-Location ..

if (Test-Path "SageyNativeApp") {
    Write-Host "⚠️ SageyNativeApp directory already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "SageyNativeApp"
}

# Create new Expo app
Write-Host "🎯 Creating new Expo app..." -ForegroundColor Blue
npx create-expo-app --template blank-typescript SageyNativeApp

Set-Location SageyNativeApp

# Copy configuration files
Write-Host "📋 Copying configuration files..." -ForegroundColor Blue
Copy-Item "../sagey-pwa/native-app.config.json" "./app.json" -Force
Copy-Item "../sagey-pwa/native-package.json" "./package.json" -Force
Copy-Item "../sagey-pwa/env.native.example" "./.env.example" -Force

# Create directory structure
Write-Host "📂 Creating directory structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Path "src/hooks" -Force | Out-Null
New-Item -ItemType Directory -Path "src/components" -Force | Out-Null
New-Item -ItemType Directory -Path "src/utils" -Force | Out-Null
New-Item -ItemType Directory -Path "assets/icons" -Force | Out-Null

# Copy native authentication files
Write-Host "🔐 Copying authentication files..." -ForegroundColor Blue
Copy-Item "../sagey-pwa/src/hooks/useNativeSpotifyAuth.tsx" "./src/hooks/" -Force
Copy-Item "../sagey-pwa/src/components/NativeSpotifyAuth.tsx" "./src/components/" -Force

# Copy assets if they exist
if (Test-Path "../sagey-pwa/public/icons") {
    Write-Host "🎨 Copying app icons..." -ForegroundColor Blue
    try {
        Get-ChildItem "../sagey-pwa/public/icons/*" | Copy-Item -Destination "./assets/icons/" -Force
    } catch {
        Write-Host "⚠️ Could not copy some icon files" -ForegroundColor Yellow
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Fix dependency issues
Write-Host "🔧 Fixing dependencies..." -ForegroundColor Blue
npx expo install --fix

# Create basic App.tsx
Write-Host "📱 Creating basic App.tsx..." -ForegroundColor Blue
$appTsxContent = @"
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
"@

Set-Content -Path "App.tsx" -Value $appTsxContent -Encoding UTF8

# Create environment file
Write-Host "⚙️ Setting up environment..." -ForegroundColor Blue
if (!(Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local" -Force
    Write-Host "⚠️ Please update .env.local with your Spotify credentials" -ForegroundColor Yellow
}

# Initialize EAS (optional)
if (!$SkipEAS) {
    Write-Host "🏗️ Initializing EAS (optional)..." -ForegroundColor Blue
    $response = Read-Host "Do you want to initialize EAS for building? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        eas login
        eas build:configure
    }
}

# Success message
Write-Host ""
Write-Host "🎉 Native app setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Update .env.local with your Spotify credentials"
Write-Host "2. Add native redirect URIs to Spotify Developer Console:"
Write-Host "   - com.sagey.app://spotify-callback"
Write-Host "   - com.sagey.app://auth"
Write-Host "3. Start development server: npm start"
Write-Host "4. Test on device: expo start --android or expo start --ios"
Write-Host ""
Write-Host "🚀 Happy coding!" -ForegroundColor Green

# Show current directory
Write-Host ""
Write-Host "📍 You are now in: $(Get-Location)" -ForegroundColor Cyan 