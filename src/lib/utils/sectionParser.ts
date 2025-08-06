import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

export interface SectionContent {
  id: string
  title: string
  level: number
  content: string
  htmlContent: string
  wordCount: number
  readingTime: number
}

interface ASTNode {
  type: string
  depth?: number
  children?: ASTNode[]
  value?: string
}

/**
 * Parse markdown content and extract sections based on headings
 */
export async function parseMarkdownSections(markdownContent: string): Promise<SectionContent[]> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)

  const tree = processor.parse(markdownContent)
  const sections: SectionContent[] = []
  let currentSection: Partial<SectionContent> | null = null
  let currentContent: ASTNode[] = []

  // Extract sections by walking the AST
  visit(tree, (node: ASTNode) => {
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      // Save previous section if it exists
      if (currentSection && currentContent.length > 0) {
        finalizeSectionContent(currentSection, currentContent, processor)
        sections.push(currentSection as SectionContent)
      }

      // Start new section
      const headingText = extractHeadingText(node)
      currentSection = {
        id: generateSectionId(headingText),
        title: headingText,
        level: node.depth,
        content: '',
        htmlContent: '',
        wordCount: 0,
        readingTime: 0
      }
      currentContent = [node] // Include the heading
    } else if (currentSection) {
      // Add content to current section
      currentContent.push(node)
    }
  })

  // Finalize last section
  if (currentSection && currentContent.length > 0) {
    finalizeSectionContent(currentSection, currentContent, processor)
    sections.push(currentSection as SectionContent)
  }

  return sections
}

function extractHeadingText(headingNode: ASTNode): string {
  let text = ''
  visit(headingNode, 'text', (textNode: ASTNode) => {
    text += textNode.value || ''
  })
  return text.trim()
}

function generateSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50)
}

async function finalizeSectionContent(
  section: Partial<SectionContent>, 
  contentNodes: ASTNode[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processor: any
): Promise<void> {
  // Create a temporary tree with just this section's content
  const sectionTree = {
    type: 'root',
    children: contentNodes
  }

  try {
    // Convert to HTML
    const htmlResult = await processor.run(sectionTree)
    const htmlString = processor.stringify(htmlResult)
    
    // Extract plain text for word counting
    const plainText = extractPlainText(contentNodes)
    const wordCount = countWords(plainText)
    
    section.content = plainText
    section.htmlContent = htmlString
    section.wordCount = wordCount
    section.readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to process section content:', error)
    section.content = ''
    section.htmlContent = '<p>Content unavailable</p>'
    section.wordCount = 0
    section.readingTime = 0
  }
}

function extractPlainText(nodes: ASTNode[]): string {
  let text = ''
  
  function extractFromNode(node: ASTNode) {
    if (node.type === 'text') {
      text += (node.value || '') + ' '
    } else if (node.children) {
      node.children.forEach(extractFromNode)
    }
  }
  
  nodes.forEach(extractFromNode)
  return text.trim()
}

function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

interface SectionComponent {
  render: () => string
  $$render: () => string
}

/**
 * Create a lightweight section component that can be dynamically imported
 */
export function createSectionComponent(sectionContent: SectionContent): SectionComponent {
  return {
    render: () => sectionContent.htmlContent,
    $$render: () => sectionContent.htmlContent
  }
}

interface PostWithSections {
  sections?: Array<{
    id?: string
    title?: string
    level?: number
    content?: string
    htmlContent?: string
    wordCount?: number
    readingTime?: number
  }>
}

/**
 * Extract sections from a post's processed frontmatter
 */
export function extractSectionsFromFrontmatter(post: PostWithSections): SectionContent[] {
  if (post.sections && Array.isArray(post.sections)) {
    return post.sections.map((section, index: number) => ({
      id: section.id || `section-${index}`,
      title: section.title || `Section ${index + 1}`,
      level: section.level || 2,
      content: section.content || '',
      htmlContent: section.htmlContent || `<p>${section.content || 'Content not available'}</p>`,
      wordCount: section.wordCount || 0,
      readingTime: section.readingTime || 1
    }))
  }
  
  return []
}