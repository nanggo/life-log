import { visit } from 'unist-util-visit'
import path from 'path'

/**
 * A remark plugin to process local images in Markdown files.
 * Converts relative image paths to absolute static paths.
 */
export default function remarkLocalImages() {
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
          const imageName = path.basename(src)
          const publicPath = `/assets/posts/${slug}/${imageName}`

          // Update the image URL
          node.url = publicPath

          console.log(`Processed local image: ${src} -> ${publicPath} (slug: ${slug})`)
        } else {
          // Fallback: try to guess from current working context
          const imageName = path.basename(src)

          // This is a temporary hardcoded solution - ideally we'd parse the context better
          if (src.includes('radish')) {
            const publicPath = `/assets/posts/goodbye-radish-fiction/${imageName}`
            node.url = publicPath
            console.log(`Processed local image (fallback): ${src} -> ${publicPath}`)
          }
        }
      }
    })
  }
}
