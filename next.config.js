/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: false,
  
  // Experimental features for Next.js 14
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  // Explicitly set TypeScript config path
  typescript: {
    tsconfigPath: './tsconfig.json',
    // Allow build to continue with TypeScript errors in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ESLint configuration
  eslint: {
    // Disable ESLint during builds to prevent blocking
    ignoreDuringBuilds: true,
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
        port: '',
        pathname: '/**',
      },
    ],
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
  
  // Webpack configuration optimized for stability
  webpack: (config, { dev, isServer, webpack }) => {
    // Disable infrastructure logging to reduce noise
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // Optimize stats output
    config.stats = {
      preset: 'errors-warnings',
      logging: 'error',
      loggingTrace: false,
      warnings: false,
      errorDetails: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      publicPath: false,
    }
    
    // Aggressive Windows and permission issue fixes
    if (process.platform === 'win32' || process.env.CI) {
      // Completely disable file system caching
      config.cache = false
      
      // Optimize watch options for Windows
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/trace'],
      }
      
      // Completely disable snapshots to prevent permission issues
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
        buildDependencies: {
          hash: false,
          timestamp: false,
        },
        module: {
          timestamp: false,
          hash: false,
        },
        resolve: {
          timestamp: false,
          hash: false,
        },
        resolveBuildDependencies: {
          timestamp: false,
          hash: false,
        },
      }
      
      // Disable node profiling and tracing
      config.node = {
        ...config.node,
        global: false,
      }
    }
    
    // Memory and performance optimizations
    config.optimization = {
      ...config.optimization,
      realContentHash: false,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
        },
      },
    }
    
    // Add fallbacks for Node.js modules (only essential ones)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Only add essential polyfills for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      }
      
      // Provide necessary globals for browser environment
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      )
      
      // Define global for browser
      config.plugins.push(
        new webpack.DefinePlugin({
          global: 'globalThis',
        })
      )
    }
    
    // Ignore specific warnings that are safe to ignore
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Error: Can't resolve/,
      /ExperimentalWarning/,
      { module: /node_modules/ },
      { file: /node_modules/ },
    ]
    
    // Remove the conflicting DefinePlugin to fix NEXT_RUNTIME conflicts
    // Don't add duplicate NEXT_RUNTIME definitions
    
    return config
  },
  
  // Compress output
  compress: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Optimize for deployment
  trailingSlash: false,
  
  // Environment variables
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
    DISABLE_OPENCOLLECTIVE: '1',
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Additional optimizations for large projects
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig 