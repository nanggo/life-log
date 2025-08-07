import remarkHeadings from '@vcarl/remark-headings'
import autolinkHeadings from 'rehype-autolink-headings'
import slugPlugin from 'rehype-slug'
import { visit } from 'unist-util-visit'

import remarkOptimizedImages from './scripts/remark-optimized-images.js'

const config = {
  extensions: ['.svx', '.md'],
  smartypants: {
    dashes: 'oldschool'
  },
  remarkPlugins: [videos, remarkOptimizedImages, headings],
  rehypePlugins: [
    slugPlugin,
    [
      autolinkHeadings,
      {
        behavior: 'wrap'
      }
    ],
    optimizeExternalImages
  ]
}

export default config

/**
 * Rehype plugin to optimize external images
 */
function optimizeExternalImages() {
  return function transformer(tree) {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const src = node.properties.src
        if (src && src.startsWith('http')) {
          const encodedUrl = encodeURIComponent(src)
          // Update image properties for optimization
          node.properties.src = `/api/images?url=${encodedUrl}&w=800`
          const widths = [480, 800, 1280]
          node.properties.srcset = widths
            .map((w) => `/api/images?url=${encodedUrl}&w=${w} ${w}w`)
            .join(', ')
          node.properties.loading = 'lazy'
          node.properties.decoding = 'async'
          node.properties.sizes = '(max-width: 800px) 100vw, 800px'

          // Add modal functionality - use optimized image API for modal too
          node.properties.class =
            'enhanced-image w-full md:w-4/5 rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 mb-8 md:mx-auto'
          node.properties['data-modal-src'] = `/api/images?url=${encodedUrl}&w=1200`
          node.properties['data-modal-alt'] = node.properties.alt || ''
        }
      }
    })
  }
}

/**
 * Enhanced media processing for videos and images with lazy loading and modal support
 */
function videos() {
  const videoExtensions = ['mp4', 'webm']
  return function transformer(tree) {
    visit(tree, 'image', (node) => {
      if (videoExtensions.some((ext) => node.url.endsWith(ext))) {
        node.type = 'html'
        node.value = `
            <video 
              src="${node.url}"
              autoplay
              muted
              playsinline
              loop
              title="${node.alt || 'Video content'}"
              aria-label="${node.alt || 'Video content'}"
            />
          `
      }
    })
  }
}

/**
 * Parses headings and includes the result in metadata
 */
function headings() {
  return function transformer(tree, vfile) {
    // run remark-headings plugin
    remarkHeadings()(tree, vfile)

    // include the headings data in mdsvex frontmatter
    vfile.data.fm ??= {}
    vfile.data.fm.headings = vfile.data.headings.map((heading) => ({
      ...heading,
      // slugify heading.value
      id: heading.value
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    }))
  }
}
