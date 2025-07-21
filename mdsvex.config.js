import { visit } from 'unist-util-visit'
import autolinkHeadings from 'rehype-autolink-headings'
import slugPlugin from 'rehype-slug'
import relativeImages from 'mdsvex-relative-images'
import remarkHeadings from '@vcarl/remark-headings'

const config = {
  extensions: ['.svx', '.md'],
  smartypants: {
    dashes: 'oldschool'
  },
  remarkPlugins: [videos, relativeImages, headings],
  rehypePlugins: [
    slugPlugin,
    [
      autolinkHeadings,
      {
        behavior: 'wrap'
      }
    ],
    optimizeImages
  ]
}

export default config

/**
 * Custom rehype plugin to optimize external images
 */
function optimizeImages() {
  return function transformer(tree) {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const src = node.properties.src
        if (src && src.startsWith('http')) {
          const encodedUrl = encodeURIComponent(src)
          node.properties.src = `/api/images?url=${encodedUrl}&w=800`
          const widths = [480, 800, 1280]
          node.properties.srcset = widths
            .map((w) => `/api/images?url=${encodedUrl}&w=${w} ${w}w`)
            .join(', ')
          node.properties.loading = 'lazy'
          node.properties.decoding = 'async'
          node.properties.sizes = '(max-width: 800px) 100vw, 800px'
        }
      }
    })
  }
}

/**
 * Adds support to video files in markdown image links
 */
function videos() {
  const extensions = ['mp4', 'webm']
  return function transformer(tree) {
    visit(tree, 'image', (node) => {
      if (extensions.some((ext) => node.url.endsWith(ext))) {
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
      } else {
        // Ensure all images have proper alt tags for SEO
        if (!node.alt || node.alt.trim() === '') {
          console.warn(`Image without alt text found: ${node.url}`)
          node.alt = '' // Empty alt for decorative images
        }
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
