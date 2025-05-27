/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: false,
  
  // Experimental features - keep minimal
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration for Windows optimization
  webpack: (config, { dev, isServer, webpack }) => {
    // Completely disable tracing and logging to prevent Windows permission issues
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // Disable webpack's built-in tracing
    config.stats = {
      ...config.stats,
      logging: 'error',
      loggingTrace: false,
    }
    
    // Disable Next.js trace collection
    config.plugins = config.plugins.filter(plugin => {
      return !plugin.constructor.name.includes('Trace')
    })
    
    // Windows-specific optimizations
    if (process.platform === 'win32') {
      // Disable file watching to prevent permission issues
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
      // Disable any file system operations that might cause permission issues
      config.cache = false
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
  
  // Output configuration
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
}

module.exports = nextConfig 