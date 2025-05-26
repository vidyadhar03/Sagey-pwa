/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    forceSwcTransforms: true,
  },
  // Windows-specific optimizations
  webpack: (config, { dev, isServer }) => {
    // Disable file watching on Windows to prevent permission issues
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // Optimize for Windows builds
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
        },
      },
    }
    
    return config
  },
  // Optimize output
  output: 'standalone',
  // Disable source maps in production to speed up build
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 