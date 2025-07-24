import path from 'path'

import { visit } from 'unist-util-visit'

/**
 * A remark plugin that processes local images with optimization and modal support
 * Falls back to original image if optimized versions don't exist
 */
export default function remarkOptimizedImages() {
  return function transformer(tree, file) {
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

          // Create image path - use original image as fallback
          const originalSrc = `/posts/${postSlug}/${imageName}`

          // Create simple img element with modal support and fallback to original
          const imgHtml = `
            <img 
              src="${originalSrc}" 
              alt="${node.alt || ''}"
              loading="lazy"
              decoding="async"
              onclick="openImageModal('${originalSrc}', '${(node.alt || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"
              class="enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto block"
              style="width: 100%; height: auto;"
            />
          `.trim()

          // Convert to HTML node
          node.type = 'html'
          node.value = imgHtml

          console.log(`Processed image: ${src} -> ${originalSrc}`)
        } else {
          // Fallback for cases where file path is not available
          console.warn(`File path not available for image: ${src}`)
        }
      }
    })
  }
}
