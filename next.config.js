/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 15
  
  // Performance optimizations
  experimental: {
    // Enable faster startup
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Faster builds in development
    swcMinify: true,
  }),
}

module.exports = nextConfig
