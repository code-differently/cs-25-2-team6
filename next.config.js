// Load .env.local file for development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 15
  
  // Performance optimizations for deployment
  experimental: {
    // Enable faster builds and optimization
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.logs in production for better performance
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // SWC minification is enabled by default in Next.js 15
  // No need to explicitly set swcMinify
  
  // Environment variables for server-side
  serverRuntimeConfig: {
    // Will only be available on the server side
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  
  // Environment variables for both client & server
  publicRuntimeConfig: {
    // Will be available on both server and client
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Faster builds in development
    swcMinify: true,
  }),
}

module.exports = nextConfig
