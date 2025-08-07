import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Source and destination directories
const postsDir = path.join(projectRoot, 'posts')
const staticDir = path.join(projectRoot, 'static')

// Image extensions to copy
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

console.log('🖼️  Copying images from posts/ to static/...')

function copyPostImages(srcDir, baseDestDir, relativePath = '') {
  ensureDirectoryExists(baseDestDir)

  const items = fs.readdirSync(srcDir)

  for (const item of items) {
    const srcPath = path.join(srcDir, item)
    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      // For directories, create the directory structure in static/
      const newRelativePath = relativePath ? path.join(relativePath, item) : item
      const destDir = path.join(baseDestDir, newRelativePath)
      ensureDirectoryExists(destDir)
      copyPostImages(srcPath, baseDestDir, newRelativePath)
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase()
      if (imageExtensions.includes(ext)) {
        // Copy images preserving the directory structure under static/
        const destPath = relativePath
          ? path.join(baseDestDir, relativePath, item)
          : path.join(baseDestDir, item)

        ensureDirectoryExists(path.dirname(destPath))
        fs.copyFileSync(srcPath, destPath)

        const relativeDestPath = path.relative(projectRoot, destPath)
        console.log(`✓ Copied: ${path.relative(projectRoot, srcPath)} → ${relativeDestPath}`)
      }
    }
  }
}

copyPostImages(postsDir, staticDir)
console.log('✅ Image copy complete!')
