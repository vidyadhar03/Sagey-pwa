/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: false,
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Disable infrastructure logging
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // Optimize stats output
    config.stats = {
      ...config.stats,
      logging: 'error',
      loggingTrace: false,
      warnings: false,
    }
    
    // Windows-specific optimizations
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
    }
    
    // Memory and performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    }
    
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    
    return config
  },
  
  // Output configuration - use standalone for better Vercel compatibility
  output: 'standalone',
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    domains: ['i.scdn.co', 'mosaic.scdn.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compress output
  compress: true,
  
  // File tracing configuration for monorepo setups
  outputFileTracingRoot: path.join(__dirname, '../../'),
  
  // Exclude unnecessary files from tracing to reduce bundle size
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      '.git/**/*',
    ],
  },
}

module.exports = nextConfig 