import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

import { format } from 'date-fns'

import { Category } from '../src/lib/types/blog.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()))
  })
}

function askMultiline(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    console.log(prompt)
    console.log('(입력 완료 후 빈 줄에서 END 입력)\n')

    const lines: string[] = []
    const onLine = (line: string) => {
      if (line.trim().toUpperCase() === 'END') {
        rl.removeListener('line', onLine)
        resolve(lines.join('\n'))
      } else {
        lines.push(line)
      }
    }
    rl.on('line', onLine)
  })
}

function createSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug || /^[가-힣-]+$/.test(slug)) {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    slug = slug ? `${slug}-${dateStr}` : `post-${dateStr}`
  }

  return slug
}

// 카테고리 선택
async function selectCategory(): Promise<string> {
  const categories = [
    { value: Category.DAILY, emoji: '📝', name: '일상' },
    { value: Category.DEVELOPMENT, emoji: '💻', name: '개발' },
    { value: Category.THOUGHTS, emoji: '🤔', name: '생각' },
    { value: Category.REVIEW, emoji: '📖', name: '리뷰' }
  ]

  console.log('\n카테고리를 선택하세요:')
  categories.forEach((c, i) => console.log(`  ${i + 1}. ${c.emoji} ${c.name}`))

  const choice = await ask(`\n번호 (1-${categories.length}, 기본값: 2. 개발): `)
  const idx = parseInt(choice) - 1

  if (idx >= 0 && idx < categories.length) {
    return categories[idx].value
  }
  return Category.DEVELOPMENT
}

async function main() {
  console.log('\n🖊️  블로그 글 자동 생성기\n')
  console.log('ChatGPT/Codex로 조사한 자료를 바탕으로')
  console.log('내 어투로 블로그 글을 생성합니다.\n')
  console.log('━'.repeat(40))

  // 1. 주제 입력
  const topic = await ask('\n📌 글 주제: ')
  if (!topic) {
    console.log('주제를 입력해주세요.')
    rl.close()
    return
  }

  // 2. 카테고리 선택
  const category = await selectCategory()

  // 3. 태그 입력
  const tagsInput = await ask('\n🏷️  태그 (쉼표 구분): ')
  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  // 4. 조사 자료 입력 (선택)
  console.log('\n━'.repeat(40))
  const hasResearch = await ask('\n조사 자료가 있나요? (Y/n): ')

  let research = ''
  if (hasResearch.toLowerCase() !== 'n') {
    const researchSource = await ask('자료 입력 방식 - 1. 직접 입력  2. 파일 경로: ')

    if (researchSource === '2') {
      const filePath = await ask('파일 경로: ')
      const resolvedPath = path.resolve(filePath)
      if (fs.existsSync(resolvedPath)) {
        research = fs.readFileSync(resolvedPath, 'utf-8')
        console.log(`✓ 파일 로드 완료 (${research.length}자)`)
      } else {
        console.log(`파일을 찾을 수 없습니다: ${resolvedPath}`)
      }
    } else {
      research = await askMultiline('\n조사 자료를 붙여넣으세요:')
    }
  }

  // 5. 추가 지시사항 (선택)
  const extraInstructions = await ask('\n추가 지시사항 (없으면 Enter): ')

  // 6. 프롬프트 조합
  const styleGuide = fs.readFileSync(
    path.join(__dirname, '../templates/blog-style-prompt.md'),
    'utf-8'
  )

  const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  const filledStyleGuide = styleGuide
    .replace('{{DATE}}', date)
    .replace('{{CATEGORY}}', category)

  let prompt = `${filledStyleGuide}\n\n---\n\n`
  prompt += `## 작성 요청\n\n`
  prompt += `**주제**: ${topic}\n`
  prompt += `**카테고리**: ${category}\n`
  prompt += `**태그**: ${tags.join(', ')}\n`
  prompt += `**날짜**: ${date}\n\n`

  if (research) {
    prompt += `## 조사 자료\n\n아래 자료를 참고하되, 위의 스타일 가이드에 맞게 재구성하세요. 자료를 그대로 옮기지 말고, 내 경험과 시각으로 소화해서 작성하세요.\n\n${research}\n\n`
  }

  if (extraInstructions) {
    prompt += `## 추가 지시사항\n\n${extraInstructions}\n\n`
  }

  prompt += `## 최종 지시\n\n`
  prompt += `위의 스타일 가이드를 철저히 따라 블로그 글을 작성하세요. frontmatter를 포함한 완전한 마크다운 파일을 출력하세요. 본문만 출력하고 다른 설명은 하지 마세요.`

  // 7. slug 생성
  const suggestedSlug = createSlug(topic)
  const slugInput = await ask(`\n📎 URL slug (제안: ${suggestedSlug}): `)
  const slug = slugInput || suggestedSlug

  // 8. Claude CLI로 생성
  console.log('\n━'.repeat(40))
  console.log('\n⏳ Claude로 글을 생성하고 있습니다...\n')

  const tempPromptPath = path.join(__dirname, '../.temp-prompt.md')
  fs.writeFileSync(tempPromptPath, prompt)

  try {
    const result = execSync(`cat "${tempPromptPath}" | claude --print --no-config`, {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10, // 10MB
      timeout: 300000 // 5분
    })

    // frontmatter에서 slug 보정
    const content = result.replace(
      /slug:\s*'[^']*'/,
      `slug: '${slug}'`
    )

    // 파일 저장
    const fileName = `${slug}.md`
    const filePath = path.join(__dirname, '../posts', fileName)

    fs.writeFileSync(filePath, content.trim() + '\n')

    console.log('━'.repeat(40))
    console.log(`\n✅ 글이 생성되었습니다!`)
    console.log(`   📄 파일: posts/${fileName}`)
    console.log(`   📂 카테고리: ${category}`)
    console.log(`   🏷️  태그: ${tags.join(', ')}`)
    console.log(`\n   ⚠️  draft: true 상태입니다. 검토 후 false로 변경하세요.\n`)
  } catch (error) {
    console.error('\n❌ 글 생성 중 오류가 발생했습니다.')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    }
    console.log('\n💡 claude CLI가 설치되어 있는지 확인하세요.')
    console.log('   터미널에서 "claude --version" 으로 확인 가능합니다.\n')
  } finally {
    // 임시 파일 정리
    if (fs.existsSync(tempPromptPath)) {
      fs.unlinkSync(tempPromptPath)
    }
  }

  rl.close()
}

main()
