import { error } from '@sveltejs/kit'
import { readFileSync } from 'fs'
import { join } from 'path'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    // about.md 파일을 읽어서 frontmatter 파싱
    const aboutPath = join(process.cwd(), 'about', 'index.md')
    const content = readFileSync(aboutPath, 'utf8')

    // Extract frontmatter and last updated date
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    let title = "About NANGGO | NANGGO's LIFELOG"
    let lastUpdated = '2025.05.28' // fallback date

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1]
      const titleMatch = frontmatter.match(/title:\s*(.+)/)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
    }

    // Extract last updated date from content
    const lastUpdatedMatch = content.match(/Last updated:\s*([\d.]+)/)
    if (lastUpdatedMatch) {
      lastUpdated = lastUpdatedMatch[1]
    }

    const aboutData = {
      title,
      lastUpdated,
      description:
        '도전을 좋아하고, 효율적으로 일하며, 커뮤니케이션을 좋아하는 Frontend Engineer입니다.'
    }

    return {
      aboutData
    }
  } catch (e) {
    throw error(404, 'About page not found')
  }
}
