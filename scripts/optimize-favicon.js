import path from 'path'
import { fileURLToPath } from 'url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const staticPath = path.join(__dirname, '..', 'static')

async function optimizeFavicon() {
  const originalPath = path.join(staticPath, 'favicon.png')

  // Generate different sizes for various use cases
  const sizes = [
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
  ]

  try {
    for (const { size, name } of sizes) {
      const outputPath = path.join(staticPath, name)

      await sharp(originalPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ compressionLevel: 9 })
        .toFile(outputPath)

      console.log(`Generated: ${name} (${size}x${size})`)
    }

    // Also optimize the original favicon to a reasonable size (64x64)
    const optimizedFaviconPath = path.join(staticPath, 'favicon-optimized.png')
    await sharp(originalPath)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toFile(optimizedFaviconPath)

    console.log('Generated: favicon-optimized.png (64x64)')
    console.log('Favicon optimization completed!')
  } catch (error) {
    console.error('Error optimizing favicon:', error)
  }
}

optimizeFavicon()
