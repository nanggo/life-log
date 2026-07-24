import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import prettier from 'prettier'
import sharp from 'sharp'

import {
  getVariantWidths,
  sortImageManifest,
  variantPath
} from '../src/lib/utils/image-variants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Source and destination directories
const postsDir = path.join(projectRoot, 'posts')
const staticDir = path.join(projectRoot, 'static')
const manifestPath = path.join(projectRoot, 'src', 'lib', 'data', 'image-manifest.json')

// Image extensions to copy
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']
const metadataExtensions = imageExtensions
const variantExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.avif']
const variantQuality = 82

export const isGeneratedVariant = (fileName) => /-\d+w\.webp$/i.test(fileName)

export const getManifestDimensions = (metadata) => {
  const width = metadata.autoOrient?.width ?? metadata.width
  const height =
    metadata.pages > 1 && metadata.pageHeight
      ? metadata.pageHeight
      : (metadata.autoOrient?.height ?? metadata.height)

  return { width, height }
}

export const shouldGenerateVariants = (ext, metadata) =>
  variantExtensions.includes(ext) && !(metadata.pages > 1)

export const shouldOptimizeDirectory = (parentOptimized, directoryName) =>
  parentOptimized && !directoryName.startsWith('_')

export const assertSourceImageNameAllowed = (srcPath) => {
  if (isGeneratedVariant(path.basename(srcPath))) {
    throw new Error(
      `Source image uses the reserved generated-variant filename pattern: ${path.relative(
        projectRoot,
        srcPath
      )}`
    )
  }
}

export const claimOutputPath = (outputOwners, outputPath, srcPath) => {
  const collisionKey = path.resolve(outputPath).normalize('NFC').toLowerCase()
  const existingOwner = outputOwners.get(collisionKey)
  if (existingOwner && existingOwner !== srcPath) {
    throw new Error(
      `Image output collision: ${path.relative(projectRoot, existingOwner)} and ${path.relative(
        projectRoot,
        srcPath
      )} both generate ${path.relative(projectRoot, outputPath)}`
    )
  }

  outputOwners.set(collisionKey, srcPath)
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

async function generateVariants(
  srcPath,
  destPath,
  publicPath,
  manifest,
  outputOwners,
  optimizeImages
) {
  const ext = path.extname(srcPath).toLowerCase()
  if (!metadataExtensions.includes(ext)) return

  const metadata = await sharp(srcPath).metadata()
  const { width: sourceWidth, height: sourceHeight } = getManifestDimensions(metadata)
  if (!sourceWidth || !sourceHeight) return

  const widths =
    optimizeImages && shouldGenerateVariants(ext, metadata) ? getVariantWidths(sourceWidth) : []

  for (const width of widths) {
    const variantDest = path.join(
      path.dirname(destPath),
      path.basename(variantPath(publicPath, width))
    )
    claimOutputPath(outputOwners, variantDest, srcPath)

    await sharp(srcPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: variantQuality, effort: 5 })
      .toFile(variantDest)

    console.log(`✓ Variant: ${path.relative(projectRoot, variantDest)} (${width}w)`)
  }

  manifest[publicPath] = {
    width: sourceWidth,
    height: sourceHeight,
    variants: widths
  }
}

async function copyPostImages(
  srcDir,
  baseDestDir,
  manifest,
  outputOwners,
  relativePath = '',
  optimizeImages = true
) {
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
      await copyPostImages(
        srcPath,
        baseDestDir,
        manifest,
        outputOwners,
        newRelativePath,
        shouldOptimizeDirectory(optimizeImages, item)
      )
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase()
      if (imageExtensions.includes(ext)) {
        assertSourceImageNameAllowed(srcPath)

        // Copy images preserving the directory structure under static/
        const destPath = relativePath
          ? path.join(baseDestDir, relativePath, item)
          : path.join(baseDestDir, item)

        claimOutputPath(outputOwners, destPath, srcPath)
        ensureDirectoryExists(path.dirname(destPath))
        fs.copyFileSync(srcPath, destPath)

        const relativeDestPath = path.relative(projectRoot, destPath)
        console.log(`✓ Copied: ${path.relative(projectRoot, srcPath)} → ${relativeDestPath}`)

        const publicPath = `/${path.relative(staticDir, destPath).split(path.sep).join('/')}`
        await generateVariants(
          srcPath,
          destPath,
          publicPath,
          manifest,
          outputOwners,
          optimizeImages
        )
      }
    }
  }
}

export const run = async () => {
  console.log('🖼️  Copying and optimizing images from posts/ to static/...')

  const manifest = {}
  const outputOwners = new Map()
  if (fs.existsSync(postsDir)) {
    await copyPostImages(postsDir, staticDir, manifest, outputOwners)
  }

  const sortedManifest = sortImageManifest(manifest)
  const prettierConfig = await prettier.resolveConfig(manifestPath)
  const formattedManifest = await prettier.format(JSON.stringify(sortedManifest, null, 2), {
    ...prettierConfig,
    parser: 'json'
  })
  ensureDirectoryExists(path.dirname(manifestPath))
  fs.writeFileSync(manifestPath, formattedManifest)

  console.log(`✓ Image manifest: ${path.relative(projectRoot, manifestPath)}`)
  console.log('✅ Image copy and optimization complete!')
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  run().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
