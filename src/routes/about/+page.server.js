import { readFileSync } from 'fs'
import { join } from 'path'

import { error } from '@sveltejs/kit'

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
        '유지성은 TypeScript, React, Next.js, Svelte를 다루는 프론트엔드 엔지니어다. 자율과 책임, 효율적인 협업, 명확한 커뮤니케이션을 바탕으로 제품과 팀에 필요한 웹 경험을 만들며, 여러 도메인의 프로젝트를 프리랜서로 수행한 경험도 함께 소개한다.'
    }

    return {
      aboutData
    }
  } catch (_e) {
    throw error(404, 'About page not found')
  }
}
