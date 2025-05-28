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
  
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    domains: ['i.scdn.co', 'mosaic.scdn.co'],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Disable infrastructure logging to reduce noise
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // Optimize stats output
    config.stats = {
      ...config.stats,
      logging: 'error',
      loggingTrace: false,
      warnings: false,
      errorDetails: false,
    }
    
    // Windows-specific optimizations to prevent permission issues
    if (process.platform === 'win32') {
      // Disable file system caching on Windows
      config.cache = false
      
      // Optimize watch options
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
      // Disable snapshot to prevent permission issues
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
        buildDependencies: {
          hash: false,
          timestamp: false,
        },
      }
    }
    
    // Memory and performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
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
      path: false,
      os: false,
      stream: false,
      util: false,
    }
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Error: Can't resolve/,
    ]
    
    return config
  },
  
  // Compress output
  compress: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Optimize for Vercel deployment
  trailingSlash: false,
  
  // Environment variables
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    DISABLE_OPENCOLLECTIVE: '1',
  },
}

module.exports = nextConfig 