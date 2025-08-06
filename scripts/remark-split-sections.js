import { toString } from 'mdast-util-to-string'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Remark plugin to split large posts into sections for dynamic loading
 *
 * This plugin analyzes markdown content and splits it into logical sections
 * based on heading levels (H2, H3). For large posts (>10KB), it generates
 * section metadata that can be used for dynamic loading and code splitting.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.sizeThreshold - Minimum size in bytes to trigger splitting (default: 10240)
 * @param {Array<number>} options.headingLevels - Heading levels to use for splitting (default: [2, 3])
 * @param {boolean} options.generateIds - Whether to generate unique IDs for sections (default: true)
 * @returns {Function} Remark plugin function
 */
export default function remarkSplitSections(options = {}) {
  const {
    sizeThreshold = 10240, // 10KB threshold
    headingLevels = [2, 3], // Split on H2 and H3
    generateIds = true
  } = options

  return async function transformer(tree, file) {
    // Get the original content size
    const originalContent = file.value || toString(tree)
    const contentSize = Buffer.byteLength(originalContent, 'utf8')

    // Only process large posts
    if (contentSize < sizeThreshold) {
      return
    }

    const sections = []
    let currentSection = null
    let sectionIndex = 0

    // Traverse the AST and collect sections
    visit(tree, (node, index) => {
      // Check if this is a heading that should trigger a new section
      if (node.type === 'heading' && headingLevels.includes(node.depth)) {
        // Finalize the previous section if it exists
        if (currentSection) {
          currentSection.endIndex = index - 1
          currentSection.content = extractSectionContent(tree, currentSection)
          currentSection.wordCount = estimateWordCount(currentSection.content)
          currentSection.readingTime = Math.ceil(currentSection.wordCount / 200) // ~200 words per minute
          sections.push(currentSection)
        }

        // Start a new section
        const headingText = toString(node)
        const sectionId = generateIds
          ? `section-${sectionIndex++}-${slugify(headingText)}`
          : `section-${sectionIndex++}`

        currentSection = {
          id: sectionId,
          title: headingText,
          level: node.depth,
          startIndex: index,
          endIndex: null,
          content: '',
          wordCount: 0,
          readingTime: 0,
          slug: slugify(headingText)
        }
      }
    })

    // Don't forget the last section
    if (currentSection) {
      currentSection.endIndex = tree.children.length - 1
      currentSection.content = extractSectionContent(tree, currentSection)
      currentSection.wordCount = estimateWordCount(currentSection.content)
      currentSection.readingTime = Math.ceil(currentSection.wordCount / 200)
      sections.push(currentSection)
    }

    // Process sections to generate HTML content
    const processedSections = await Promise.all(
      sections.map(async (section) => {
        const htmlContent = await generateSectionHtml(tree, section)
        return {
          id: section.id,
          title: section.title,
          level: section.level,
          slug: section.slug,
          wordCount: section.wordCount,
          readingTime: section.readingTime,
          content: section.content,
          htmlContent
        }
      })
    )

    // Add section metadata to frontmatter
    file.data.fm = file.data.fm || {}
    file.data.fm.sections = processedSections

    // Add large post metadata
    file.data.fm.isLargePost = true
    file.data.fm.originalSize = contentSize
    file.data.fm.sectionCount = sections.length
    file.data.fm.splitStrategy = 'heading-based'
    file.data.fm.totalReadingTime = sections.reduce(
      (total, section) => total + section.readingTime,
      0
    )

    // Log splitting information in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📚 Split large post "${file.data.fm.title || 'Unknown'}" into ${sections.length} sections`
      )
      console.log(`   Original size: ${(contentSize / 1024).toFixed(1)}KB`)
      console.log(`   Sections: ${sections.map((s) => s.title).join(', ')}`)
    }
  }
}

/**
 * Extract content for a specific section from the AST
 * @param {Object} tree - The AST tree
 * @param {Object} section - Section metadata with start/end indices
 * @returns {string} Section content as markdown string
 */
function extractSectionContent(tree, section) {
  const sectionNodes = tree.children.slice(section.startIndex, section.endIndex + 1)

  // Create a temporary tree with just this section's nodes
  const sectionTree = {
    type: 'root',
    children: sectionNodes
  }

  return toString(sectionTree)
}

/**
 * Estimate word count from markdown content
 * @param {string} content - Markdown content
 * @returns {number} Estimated word count
 */
function estimateWordCount(content) {
  // Remove markdown syntax and count words
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  return plainText ? plainText.split(' ').filter((word) => word.length > 0).length : 0
}

/**
 * Generate HTML content for a specific section
 * @param {Object} tree - The AST tree
 * @param {Object} section - Section metadata with start/end indices
 * @returns {Promise<string>} Section content as HTML string
 */
async function generateSectionHtml(tree, section) {
  try {
    const sectionNodes = tree.children.slice(section.startIndex, section.endIndex + 1)

    // Create a temporary tree with just this section's nodes
    const sectionTree = {
      type: 'root',
      children: sectionNodes
    }

    // Convert markdown AST to HTML
    const htmlProcessor = unified().use(remarkRehype).use(rehypeStringify)

    const htmlTree = htmlProcessor.runSync(sectionTree)
    const htmlContent = htmlProcessor.stringify(htmlTree)

    return htmlContent
  } catch (error) {
    console.warn(`Failed to generate HTML for section "${section.title}":`, error.message)
    return `<div class="section-error">
      <h${section.level}>${section.title}</h${section.level}>
      <p>Content processing failed. Please reload the page to try again.</p>
    </div>`
  }
}

/**
 * Create a URL-friendly slug from text
 * @param {string} text - Text to slugify
 * @returns {string} URL-friendly slug
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and special characters with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
