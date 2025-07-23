import { visit } from 'unist-util-visit'
import path from 'path'

/**
 * A remark plugin to process local images with responsive/optimized versions
 */
export default function remarkResponsiveImages() {
  return function transformer(tree, file) {
    visit(tree, 'image', (node) => {
      const src = node.url

      // Process relative paths
      if (src && !src.startsWith('http') && !src.startsWith('/') && src.startsWith('./')) {
        // Get the file path if available
        const filePath = file.path || file.filename

        if (filePath) {
          // Extract slug from file path
          const slug = path.basename(path.dirname(filePath))
          const { name } = path.parse(src)

          // 최적화된 이미지 경로들 생성
          const basePath = `/assets/posts/${slug}/${name}`

          // HTML img 요소로 변환하여 picture 요소 사용
          const pictureHtml = `
            <picture class="enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto">
              <source srcset="${basePath}-400w.avif 400w, ${basePath}-800w.avif 800w, ${basePath}-1200w.avif 1200w" type="image/avif" sizes="(max-width: 800px) 100vw, 800px">
              <source srcset="${basePath}-400w.webp 400w, ${basePath}-800w.webp 800w, ${basePath}-1200w.webp 1200w" type="image/webp" sizes="(max-width: 800px) 100vw, 800px">
              <img 
                src="${basePath}.webp" 
                alt="${node.alt || ''}"
                loading="lazy"
                decoding="async"
                onclick="openImageModal('${basePath}.webp', '${(node.alt || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"
              />
            </picture>
          `.trim()

          // remark에서 HTML 노드로 변환
          node.type = 'html'
          node.value = pictureHtml

          console.log(`Processed responsive image: ${src} -> ${basePath}`)
        } else {
          // Fallback for goodbye-radish-fiction
          if (src.includes('radish')) {
            const basePath = '/assets/posts/goodbye-radish-fiction/radish'
            const pictureHtml = `
              <picture class="enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto">
                <source srcset="${basePath}-400w.avif 400w, ${basePath}-800w.avif 800w, ${basePath}-1200w.avif 1200w" type="image/avif" sizes="(max-width: 800px) 100vw, 800px">
                <source srcset="${basePath}-400w.webp 400w, ${basePath}-800w.webp 800w, ${basePath}-1200w.webp 1200w" type="image/webp" sizes="(max-width: 800px) 100vw, 800px">
                <img 
                  src="${basePath}.webp" 
                  alt="${node.alt || ''}"
                  loading="lazy"
                  decoding="async"
                  onclick="openImageModal('${basePath}.webp', '${(node.alt || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"
                />
              </picture>
            `.trim()

            node.type = 'html'
            node.value = pictureHtml
            console.log(`Processed responsive image (fallback): ${src} -> ${basePath}`)
          }
        }
      }
    })
  }
}
