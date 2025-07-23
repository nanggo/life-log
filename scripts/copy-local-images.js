import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CWD = path.resolve(__dirname, '..')
const POSTS_PATH = path.join(CWD, 'posts')
const ASSETS_PATH = path.join(CWD, 'static/assets/posts')

/**
 * Copy local images from posts directories to static assets
 */
function copyLocalImages() {
  console.log('Starting local image copy process...')

  // Ensure assets directory exists
  fs.ensureDirSync(ASSETS_PATH)

  // Get all subdirectories in posts
  const postDirs = fs
    .readdirSync(POSTS_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  let copiedCount = 0

  for (const slug of postDirs) {
    const postDir = path.join(POSTS_PATH, slug)
    const destDir = path.join(ASSETS_PATH, slug)

    // Check if post directory has any image files
    const files = fs.readdirSync(postDir)
    const imageFiles = files.filter((file) => /\.(png|jpe?g|gif|webp|svg)$/i.test(file))

    if (imageFiles.length > 0) {
      fs.ensureDirSync(destDir)

      for (const imageFile of imageFiles) {
        const sourcePath = path.join(postDir, imageFile)
        const destPath = path.join(destDir, imageFile)

        try {
          fs.copyFileSync(sourcePath, destPath)
          console.log(`Copied: ${slug}/${imageFile}`)
          copiedCount++
        } catch (error) {
          console.error(`Failed to copy ${sourcePath}:`, error.message)
        }
      }
    }
  }

  console.log(`Local image copy completed. ${copiedCount} images copied.`)
}

// Run the script
copyLocalImages()
