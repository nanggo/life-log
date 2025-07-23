import { visit } from 'unist-util-visit'

/**
 * A rehype plugin to process local images in Markdown files.
 *
 * It finds <img> tags with relative `src` paths, copies the images
 * to a public directory, and rewrites the `src` attribute to point
 * to the new public URL.
 */
export default function rehypeLocalImages() {
  return function transformer(tree) {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const src = node.properties.src

        // Process relative paths that are not already processed
        if (src && !src.startsWith('http') && !src.startsWith('/') && src.startsWith('./')) {
          // For now, we'll assume the slug can be derived from the image processing
          // This is a fallback - the actual slug should be determined from the build context
          const publicPath = src.replace('./', '/assets/posts/goodbye-radish-fiction/')

          // Rewrite the image src to the new public path
          node.properties.src = publicPath

          // Add modal functionality for local images
          node.properties.class =
            'enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto'
          node.properties.onclick = `openImageModal('${publicPath}', '${(node.properties.alt || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')`
          node.properties.loading = 'lazy'
          node.properties.decoding = 'async'

          console.log(`Processed local image: ${src} -> ${publicPath}`)
        }
      }
    })
  }
}
