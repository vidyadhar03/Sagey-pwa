// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development'
// })

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion']
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/**/*'
    ],
  }
}

// module.exports = withPWA(nextConfig)
module.exports = nextConfig 