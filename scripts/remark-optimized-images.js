import path from 'path'

import sharp from 'sharp'
import { visit } from 'unist-util-visit'

/**
 * A remark plugin that processes local images with optimization and modal support
 * Falls back to original image if optimized versions don't exist
 */
export default function remarkOptimizedImages() {
  return async function transformer(tree, file) {
    // Collect first: sharp metadata reads are async, visit callbacks are sync
    const imageNodes = []
    visit(tree, 'image', (node) => {
      imageNodes.push(node)
    })

    for (const node of imageNodes) {
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

          // Intrinsic dimensions let the browser reserve space before the image
          // loads (prevents CLS); `height: auto` below keeps them ratio-only
          let dimensionAttrs = ''
          try {
            const { width, height } = await sharp(path.join(markdownDir, src)).metadata()
            if (width && height) {
              dimensionAttrs = `width="${width}" height="${height}"`
            }
          } catch (error) {
            console.warn(`Could not read dimensions for image: ${src}`, error.message)
          }

          // Create simple img element with modal support and fallback to original
          // Use data attributes instead of inline onclick to prevent XSS
          const imgHtml = `
            <img
              src="${originalSrc}"
              alt="${node.alt || ''}"
              ${dimensionAttrs}
              loading="lazy"
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
    }
  }
}
