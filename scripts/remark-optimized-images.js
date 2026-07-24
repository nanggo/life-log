import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { visit } from 'unist-util-visit'

import { buildSrcset, POST_IMAGE_SIZES } from '../src/lib/utils/image-variants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manifestPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'image-manifest.json')

const loadManifest = () => {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (_error) {
    return {}
  }
}

/**
 * A remark plugin that processes local images with optimization and modal support
 * Falls back to original image if optimized versions don't exist
 */
export function createRemarkOptimizedImages(manifest) {
  return function transformer(tree, file) {
    const frontmatterImage =
      typeof file.data?.fm?.image === 'string' ? file.data.fm.image.trim() : ''
    let firstLocalImageHandled = false

    visit(tree, 'image', (node) => {
      const src = node.url

      // Process relative paths (local images only)
      if (src && !src.startsWith('http') && !src.startsWith('/') && src.startsWith('./')) {
        const filePath = file.path || file.filename

        if (filePath) {
          // Get the post slug from the file path
          const markdownDir = path.dirname(filePath)
          const postSlug = path.basename(markdownDir)

          // Extract filename
          const imageName = path.basename(src)

          // Create image path - use static folder path for SvelteKit
          const originalSrc = `/${postSlug}/${imageName}`

          const entry = manifest[originalSrc]
          const srcset = buildSrcset(originalSrc, entry)
          const dimensionAttrs = entry ? `width="${entry.width}" height="${entry.height}"` : ''
          const srcsetAttrs = srcset ? `srcset="${srcset}" sizes="${POST_IMAGE_SIZES}"` : ''

          // frontmatter 이미지가 본문 첫 이미지와 같으면 별도 히어로가 렌더되지 않는다.
          const isFirstLocalImage = !firstLocalImageHandled
          const isSameAsFrontmatterHero =
            isFirstLocalImage &&
            frontmatterImage.startsWith('./') &&
            path.basename(frontmatterImage) === imageName
          const hasStandaloneHero = Boolean(frontmatterImage) && !isSameAsFrontmatterHero
          const isLcpCandidate = isFirstLocalImage && !hasStandaloneHero
          firstLocalImageHandled = true
          const loadingAttrs = isLcpCandidate
            ? 'loading="eager" fetchpriority="high"'
            : 'loading="lazy"'

          // Create simple img element with modal support and fallback to original
          // Use data attributes instead of inline onclick to prevent XSS
          const imgHtml = `
            <img
              src="${originalSrc}"
              alt="${node.alt || ''}"
              ${srcsetAttrs}
              ${dimensionAttrs}
              ${loadingAttrs}
              decoding="async"
              data-modal-src="${originalSrc}"
              data-modal-alt="${node.alt || ''}"
              class="enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto block"
              style="width: 100%; height: auto;"
            />
          `.trim()

          // Convert to HTML node
          node.type = 'html'
          node.value = imgHtml

          console.log(`✓ Processed local image: ${src} -> ${originalSrc}`)
        } else {
          // Fallback for cases where file path is not available
          console.warn(`File path not available for image: ${src}`)
        }
      }
    })
  }
}

export default function remarkOptimizedImages() {
  return createRemarkOptimizedImages(loadManifest())
}
