import { visit } from 'unist-util-visit'
import path from 'path'

/**
 * A remark plugin that processes local images with optimization and modal support
 * Converts relative paths to responsive picture elements with multiple formats
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

          // Extract filename without extension for optimized versions
          const imageName = path.basename(src)
          const { name: baseName } = path.parse(imageName)

          // Create optimized image paths
          const originalSrc = `/posts/${postSlug}/${imageName}` // For modal
          const webpSrc = `/posts/${postSlug}/${baseName}-800w.webp` // Default fallback

          // Generate responsive srcsets
          const avifSrcset = [400, 800, 1200]
            .map((w) => `/posts/${postSlug}/${baseName}-${w}w.avif ${w}w`)
            .join(', ')

          const webpSrcset = [400, 800, 1200]
            .map((w) => `/posts/${postSlug}/${baseName}-${w}w.webp ${w}w`)
            .join(', ')

          // Create responsive picture element with modal support
          const pictureHtml = `
            <picture class="enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto block">
              <source 
                srcset="${avifSrcset}" 
                type="image/avif" 
                sizes="(max-width: 800px) 100vw, 800px"
              />
              <source 
                srcset="${webpSrcset}" 
                type="image/webp" 
                sizes="(max-width: 800px) 100vw, 800px"
              />
              <img 
                src="${webpSrc}" 
                alt="${node.alt || ''}"
                loading="lazy"
                decoding="async"
                onclick="openImageModal('${originalSrc}', '${(node.alt || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"
                style="width: 100%; height: auto;"
              />
            </picture>
          `.trim()

          // Convert to HTML node
          node.type = 'html'
          node.value = pictureHtml

          console.log(`Processed optimized image: ${src} -> ${originalSrc}`)
        } else {
          // Fallback for cases where file path is not available
          console.warn(`File path not available for image: ${src}`)
        }
      }
    })
  }
}
