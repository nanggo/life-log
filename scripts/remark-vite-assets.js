import { visit } from 'unist-util-visit'
import path from 'path'

/**
 * A remark plugin that converts local image paths to Vite asset imports
 * This leverages Vite's built-in asset processing and optimization
 */
export default function remarkViteAssets() {
  return function transformer(tree, file) {
    visit(tree, 'image', (node) => {
      const src = node.url

      // Process relative paths
      if (src && !src.startsWith('http') && !src.startsWith('/') && src.startsWith('./')) {
        const filePath = file.path || file.filename

        if (filePath) {
          // Convert relative path to absolute path from project root
          const markdownDir = path.dirname(filePath)
          const absoluteImagePath = path.resolve(markdownDir, src)
          const relativeToPosts = path.relative(
            path.join(process.cwd(), 'posts'),
            absoluteImagePath
          )

          // Create import path that Vite can process
          const viteAssetPath = `/posts/${relativeToPosts.replace(/\\/g, '/')}`

          // For production, we can use imagetools query parameters for optimization
          const optimizedSrc = `${viteAssetPath}?format=webp&w=800`

          // Generate responsive image HTML using Vite's imagetools
          const responsiveHtml = `
            <picture class="enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto">
              <source srcset="${viteAssetPath}?format=avif&w=400 400w, ${viteAssetPath}?format=avif&w=800 800w, ${viteAssetPath}?format=avif&w=1200 1200w" type="image/avif" sizes="(max-width: 800px) 100vw, 800px">
              <source srcset="${viteAssetPath}?format=webp&w=400 400w, ${viteAssetPath}?format=webp&w=800 800w, ${viteAssetPath}?format=webp&w=1200 1200w" type="image/webp" sizes="(max-width: 800px) 100vw, 800px">
              <img 
                src="${optimizedSrc}" 
                alt="${node.alt || ''}"
                loading="lazy"
                decoding="async"
                onclick="openImageModal('${optimizedSrc}', '${(node.alt || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"
              />
            </picture>
          `.trim()

          node.type = 'html'
          node.value = responsiveHtml

          console.log(`Processed Vite asset: ${src} -> ${viteAssetPath}`)
        }
      }
    })
  }
}
