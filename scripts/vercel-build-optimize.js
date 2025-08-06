#!/usr/bin/env node

/**
 * Vercel Build Optimization Script
 *
 * This script optimizes the build process for Vercel deployment:
 * 1. Sets optimal environment variables
 * 2. Enables Vercel-specific optimizations
 * 3. Monitors build performance
 */

// Future extensibility: file system operations can be added here when needed

const isVercelBuild = process.env.VERCEL === '1'

console.log('🚀 Vercel Build Optimization Script')

if (isVercelBuild) {
  console.log('✅ Running in Vercel environment')

  // Set Vercel-specific optimizations
  process.env.VITE_BUILD_MODE = 'vercel'
  process.env.NODE_ENV = 'production'

  // Enable faster builds on Vercel
  process.env.CI = 'true'

  // Optimize for Vercel's build environment
  console.log('⚡ Vercel environment variables configured:')
  console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV}`)
  console.log(`   VERCEL_URL: ${process.env.VERCEL_URL}`)
  console.log(`   VERCEL_REGION: ${process.env.VERCEL_REGION}`)
} else {
  console.log('🏠 Running in local environment')
  process.env.VITE_BUILD_MODE = 'local'
}

// Build performance monitoring
const buildStart = Date.now()

process.on('exit', () => {
  const buildTime = Date.now() - buildStart
  console.log(`🏁 Build completed in ${buildTime}ms`)

  if (isVercelBuild && buildTime > 120000) {
    // 2 minutes
    console.warn('⚠️  Build time exceeded 2 minutes - consider further optimizations')
  }
})

// Export environment info for other scripts
export const buildInfo = {
  isVercel: isVercelBuild,
  environment: process.env.VERCEL_ENV || 'development',
  region: process.env.VERCEL_REGION || 'local',
  buildMode: process.env.VITE_BUILD_MODE
}

console.log('✅ Build optimization script initialized')
