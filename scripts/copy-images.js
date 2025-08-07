import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Source and destination directories
const postsDir = path.join(projectRoot, 'posts')
const staticPostsDir = path.join(projectRoot, 'static', 'posts')

// Image extensions to copy
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function copyImagesFromPosts(srcDir, destDir) {
  // Ensure destination directory exists
  ensureDirectoryExists(destDir)

  const items = fs.readdirSync(srcDir)

  for (const item of items) {
    const srcPath = path.join(srcDir, item)
    const destPath = path.join(destDir, item)
    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      // Recursively copy images from subdirectories
      copyImagesFromPosts(srcPath, destPath)
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase()
      if (imageExtensions.includes(ext)) {
        // Ensure parent directory exists
        ensureDirectoryExists(path.dirname(destPath))

        // Copy the image file
        fs.copyFileSync(srcPath, destPath)
        console.log(
          `✓ Copied: ${path.relative(projectRoot, srcPath)} → ${path.relative(projectRoot, destPath)}`
        )
      }
    }
  }
}

console.log('🖼️  Copying images from posts/ to static/posts/...')
copyImagesFromPosts(postsDir, staticPostsDir)
console.log('✅ Image copy complete!')
