import { visit } from 'unist-util-visit'
import path from 'path'

/**
 * A remark plugin that processes local images using Vite's asset system
 * Leverages vite-imagetools for automatic optimization and format conversion
 */
export default function remarkViteImages() {
  return function transformer(tree, file) {
    visit(tree, 'image', (node) => {
      const src = node.url

      // Process relative paths (local images)
      if (src && !src.startsWith('http') && !src.startsWith('/') && src.startsWith('./')) {
        const filePath = file.path || file.filename

        if (filePath) {
          // Get relative path from posts directory to the image
          const markdownDir = path.dirname(filePath)
          const absoluteImagePath = path.resolve(markdownDir, src)

          // Convert to path relative to project root that Vite can understand
          const projectRoot = process.cwd()
          const relativeToRoot = path.relative(projectRoot, absoluteImagePath).replace(/\\/g, '/')

          // Create Vite asset URLs with imagetools transformations
          const baseAssetUrl = `/${relativeToRoot}`

          // Generate optimized versions for different scenarios
          const webpSrc = `${baseAssetUrl}?format=webp&w=800&quality=85`
          const originalSrc = baseAssetUrl // For modal (highest quality)

          // Generate responsive srcsets
          const avifSrcset = [400, 800, 1200]
            .map((w) => `${baseAssetUrl}?format=avif&w=${w}&quality=80 ${w}w`)
            .join(', ')

          const webpSrcset = [400, 800, 1200]
            .map((w) => `${baseAssetUrl}?format=webp&w=${w}&quality=85 ${w}w`)
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

          console.log(`Processed Vite image: ${src} -> ${baseAssetUrl}`)
        } else {
          // Fallback for cases where file path is not available
          console.warn(`File path not available for image: ${src}`)
        }
      }
    })
  }
}
