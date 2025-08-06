import path from 'path'
import { fileURLToPath } from 'url'

import fs from 'fs-extra'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CWD = path.resolve(__dirname, '..')
const POSTS_PATH = path.join(CWD, 'posts')
const STATIC_PATH = path.join(CWD, 'static/posts')

/**
 * Optimize and copy local images from posts directories to static folder
 * Generates multiple formats (AVIF, WebP) and sizes for responsive images
 */
async function optimizeLocalImages() {
  console.log('Starting local image optimization process...')

  // Ensure static/posts directory exists
  fs.ensureDirSync(STATIC_PATH)

  // 이미지 메타데이터를 저장할 객체
  const imageMetadata = {}

  // Get all subdirectories in posts
  const postDirs = fs
    .readdirSync(POSTS_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  let processedCount = 0

  for (const slug of postDirs) {
    const postDir = path.join(POSTS_PATH, slug)
    const destDir = path.join(STATIC_PATH, slug)

    // Check if post directory has any image files
    const files = fs.readdirSync(postDir)
    const imageFiles = files.filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file))

    if (imageFiles.length > 0) {
      fs.ensureDirSync(destDir)

      for (const imageFile of imageFiles) {
        const sourcePath = path.join(postDir, imageFile)
        const { name } = path.parse(imageFile)

        try {
          // Copy original image for modal use
          const originalDestPath = path.join(destDir, imageFile)
          fs.copyFileSync(sourcePath, originalDestPath)
          console.log(`Copied original: ${slug}/${imageFile}`)

          // 원본 이미지의 메타데이터 수집
          const image = sharp(sourcePath)
          const metadata = await image.metadata()

          // 메타데이터 저장 (static 경로 기준)
          const imagePath = `/posts/${slug}/${imageFile}`
          imageMetadata[imagePath] = {
            width: metadata.width,
            height: metadata.height,
            aspectRatio: (metadata.width / metadata.height).toFixed(2)
          }

          // Generate optimized versions
          await generateOptimizedVersions(sourcePath, destDir, name)

          processedCount++
        } catch (error) {
          console.error(`Failed to process ${sourcePath}:`, error.message)
        }
      }
    }
  }

  console.log(`Image optimization completed. ${processedCount} images processed.`)

  // 메타데이터를 JSON 파일로 저장
  if (Object.keys(imageMetadata).length > 0) {
    const metadataPath = path.join(CWD, 'src/lib/data/image-metadata.json')
    fs.ensureDirSync(path.dirname(metadataPath))
    fs.writeJsonSync(metadataPath, imageMetadata, { spaces: 2 })
    console.log(`Image metadata saved to: ${metadataPath}`)
  }
}

/**
 * Generate optimized versions of an image
 */
async function generateOptimizedVersions(sourcePath, destDir, baseName) {
  const sizes = [400, 800, 1200]
  const formats = [
    { ext: 'avif', options: { quality: 80 } },
    { ext: 'webp', options: { quality: 85 } }
  ]

  for (const { ext, options } of formats) {
    for (const size of sizes) {
      const outputPath = path.join(destDir, `${baseName}-${size}w.${ext}`)

      const sharpInstance = sharp(sourcePath).resize(size, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })

      await sharpInstance[ext](options).toFile(outputPath)

      console.log(`Generated: ${baseName}-${size}w.${ext}`)
    }
  }
}

// Run the script
optimizeLocalImages().catch(console.error)
