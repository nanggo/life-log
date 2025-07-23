import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CWD = path.resolve(__dirname, '..')
const POSTS_PATH = path.join(CWD, 'posts')
const ASSETS_PATH = path.join(CWD, 'static/assets/posts')

/**
 * Copy and optimize local images from posts directories to static assets
 */
async function copyAndOptimizeImages() {
  console.log('Starting local image copy and optimization process...')

  // Ensure assets directory exists
  fs.ensureDirSync(ASSETS_PATH)

  // Get all subdirectories in posts
  const postDirs = fs
    .readdirSync(POSTS_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  let processedCount = 0

  for (const slug of postDirs) {
    const postDir = path.join(POSTS_PATH, slug)
    const destDir = path.join(ASSETS_PATH, slug)

    // Check if post directory has any image files
    const files = fs.readdirSync(postDir)
    const imageFiles = files.filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file))

    if (imageFiles.length > 0) {
      fs.ensureDirSync(destDir)

      for (const imageFile of imageFiles) {
        const sourcePath = path.join(postDir, imageFile)
        const { name } = path.parse(imageFile)

        try {
          // Original 복사
          const originalDestPath = path.join(destDir, imageFile)
          fs.copyFileSync(sourcePath, originalDestPath)
          console.log(`Copied: ${slug}/${imageFile}`)

          // WebP 최적화 버전 생성
          const webpPath = path.join(destDir, `${name}.webp`)
          await sharp(sourcePath).webp({ quality: 85 }).toFile(webpPath)
          console.log(`Optimized WebP: ${slug}/${name}.webp`)

          // AVIF 최적화 버전 생성 (더 나은 압축률)
          const avifPath = path.join(destDir, `${name}.avif`)
          await sharp(sourcePath).avif({ quality: 80 }).toFile(avifPath)
          console.log(`Optimized AVIF: ${slug}/${name}.avif`)

          // 리사이즈된 버전들 생성
          const sizes = [400, 800, 1200]
          for (const size of sizes) {
            // WebP 리사이즈
            const webpResizedPath = path.join(destDir, `${name}-${size}w.webp`)
            await sharp(sourcePath)
              .resize(size, null, { withoutEnlargement: true })
              .webp({ quality: 85 })
              .toFile(webpResizedPath)

            // AVIF 리사이즈
            const avifResizedPath = path.join(destDir, `${name}-${size}w.avif`)
            await sharp(sourcePath)
              .resize(size, null, { withoutEnlargement: true })
              .avif({ quality: 80 })
              .toFile(avifResizedPath)
          }
          console.log(`Generated responsive versions for: ${slug}/${name}`)

          processedCount++
        } catch (error) {
          console.error(`Failed to process ${sourcePath}:`, error.message)
        }
      }
    }
  }

  console.log(`Image processing completed. ${processedCount} images processed with optimizations.`)
}

// Run the script
copyAndOptimizeImages().catch(console.error)
