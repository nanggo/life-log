#!/usr/bin/env node

/**
 * Vercel Build Optimization Script
 *
 * This script optimizes the build process for Vercel deployment:
 * 1. Sets optimal environment variables
 * 2. Enables Vercel-specific optimizations
 * 3. Monitors build performance
 * 4. Runs subsequent build scripts with proper environment inheritance
 */

import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isVercelBuild = process.env.VERCEL === '1'

console.log('🚀 Vercel Build Optimization Script')

// Configure environment variables for the entire build process
const buildEnv = {
  ...process.env,
  NODE_ENV: 'production'
}

if (isVercelBuild) {
  console.log('✅ Running in Vercel environment')

  // Set Vercel-specific optimizations
  buildEnv.VITE_BUILD_MODE = 'vercel'
  buildEnv.CI = 'true'

  console.log('⚡ Vercel build environment configured')
} else {
  console.log('🏠 Running in local environment')
  buildEnv.VITE_BUILD_MODE = 'local'
}

// Build performance monitoring
const buildStart = Date.now()

// Function to run build steps with proper environment inheritance
async function runBuildStep(scriptPath, description) {
  console.log(`🔧 Running ${description}...`)

  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptPath], {
      env: buildEnv,
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    })

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`)
        resolve()
      } else {
        console.error(`❌ ${description} failed with code ${code}`)
        reject(new Error(`${description} failed`))
      }
    })

    process.on('error', (error) => {
      console.error(`❌ Error running ${description}:`, error)
      reject(error)
    })
  })
}

// Function to run Vite build with environment variables
async function runViteBuild() {
  console.log('🏗️  Running Vite build...')

  return new Promise((resolve, reject) => {
    const process = spawn('npx', ['vite', 'build'], {
      env: buildEnv,
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    })

    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Vite build completed successfully')
        resolve()
      } else {
        console.error(`❌ Vite build failed with code ${code}`)
        reject(new Error('Vite build failed'))
      }
    })

    process.on('error', (error) => {
      console.error('❌ Error running Vite build:', error)
      reject(error)
    })
  })
}

// Main build execution
async function runFullBuild() {
  try {
    // Run build steps in sequence with proper environment inheritance
    await runBuildStep('scripts/optimize-local-images.js', 'Image optimization')
    await runBuildStep('scripts/generate-post-metadata.js', 'Post metadata generation')
    await runViteBuild()

    const buildTime = Date.now() - buildStart
    console.log(`🏁 Full build completed in ${buildTime}ms`)

    if (isVercelBuild && buildTime > 120000) {
      console.warn('⚠️  Build time exceeded 2 minutes - consider further optimizations')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

// Export environment info for other scripts
export const buildInfo = {
  isVercel: isVercelBuild,
  environment: buildEnv.VERCEL_ENV || 'development',
  region: buildEnv.VERCEL_REGION || 'local',
  buildMode: buildEnv.VITE_BUILD_MODE
}

console.log('✅ Build optimization script initialized')

// Only run the build if this script is executed directly (not imported)
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  runFullBuild()
}
