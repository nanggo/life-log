import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

import { format } from 'date-fns'

import { Category } from '../src/lib/types/blog.js'

import { createPostFile } from './create-post-file.js'

// __dirname and __filename are not available in ES modules, so we need to define them
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

// 카테고리별 이모지 매핑 함수
function getEmojiForCategory(categoryValue: Category): string {
  switch (categoryValue) {
    case Category.DAILY:
      return '📝'
    case Category.DEVELOPMENT:
      return '💻'
    case Category.THOUGHTS:
      return '🤔'
    case Category.REVIEW:
      return '📖'
    default:
      return '📄'
  }
}

// Category enum에서 동적으로 카테고리 옵션 생성
const categories = Object.values(Category).map((value) => ({
  value,
  name: value,
  emoji: getEmojiForCategory(value)
}))

const questions = [
  { name: 'title', question: '포스트 제목을 입력하세요 (한글 가능): ' },
  { name: 'slug', question: '포스트 URL slug를 입력하세요 (영문, 숫자, 하이픈만 사용): ' },
  { name: 'category', question: '카테고리를 선택하세요', type: 'select', options: categories },
  { name: 'tags', question: '태그를 입력하세요 (쉼표로 구분): ' }
]

const askQuestion = (index, answers) => {
  if (index >= questions.length) {
    try {
      createPost(answers)
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    } finally {
      rl.close()
    }
    return
  }

  const { name, question, type, options } = questions[index]

  // slug를 자동으로 제안
  if (name === 'slug' && answers.title) {
    const suggestedSlug = createSlug(answers.title)
    rl.question(`${question} (제안: ${suggestedSlug}): `, (answer) => {
      // 빈 값이면 제안된 slug 사용
      answers[name] = answer.trim() || suggestedSlug
      askQuestion(index + 1, answers)
    })
  } else if (type === 'select' && options) {
    // 카테고리 선택
    console.log(`\n${question}:`)
    options.forEach((option, i) => {
      console.log(`  ${i + 1}. ${option.emoji} ${option.name}`)
    })
    rl.question(
      `\n번호를 선택하세요 (1-${options.length}, 기본값: 1. ${options[0].name}): `,
      (answer) => {
        const choice = parseInt(answer.trim())
        if (choice >= 1 && choice <= options.length) {
          answers[name] = options[choice - 1].value
          askQuestion(index + 1, answers)
        } else if (answer.trim() === '') {
          // 빈 값이면 기본값으로 첫 번째 옵션 설정
          answers[name] = options[0].value
          console.log(`기본 카테고리 "${options[0].name}"이(가) 선택되었습니다.`)
          askQuestion(index + 1, answers)
        } else {
          console.log('올바른 번호를 선택해주세요.')
          askQuestion(index, answers)
        }
      }
    )
  } else {
    rl.question(question, (answer) => {
      answers[name] = answer
      askQuestion(index + 1, answers)
    })
  }
}

function createSlug(title: string): string {
  // 기본 slug 생성 시도
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-') // 영문, 숫자, 한글 허용, 나머지는 하이픈으로
    .replace(/^-+|-+$/g, '') // 시작과 끝의 하이픈 제거

  // 한글만 있는 경우 또는 빈 slug인 경우 날짜 기반 fallback 사용
  if (!slug || slug === '' || /^[가-힣-]+$/.test(slug)) {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10) // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '') // HHMMSS

    // 한글이 포함된 경우 한글을 유지하되 날짜 추가
    if (/[가-힣]/.test(slug)) {
      slug = `${slug}-${dateStr}-${timeStr}`
    } else {
      // 완전히 빈 경우 날짜만 사용
      slug = `post-${dateStr}-${timeStr}`
    }
  }

  return slug
}

const createPost = (answers) => {
  const { title, slug, category, tags } = answers
  const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  const safeSlug = createSlug(slug) // slug도 안전하게 처리

  const templatePath = path.join(__dirname, '../templates/post.md')
  let content = fs.readFileSync(templatePath, 'utf-8')

  // 태그 처리
  const tagArray = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  content = content
    .replace('New Post Title', title)
    .replace('YYYY-MM-DD', date)
    .replace('new-post-slug', safeSlug)
    .replace('new-post-category', category)

  // 템플릿에서 기본 태그 항목을 사용자 입력 태그로 대체
  if (tagArray.length > 0) {
    const tagIndent = '  - '
    const tagLines = tagArray.map((tag) => `${tagIndent}${tag}`).join('\n')
    content = content.replace(/tags:[\s\S]*?(draft|---)/, `tags:\n${tagLines}\n$1`)
  }

  const filePath = createPostFile(path.join(__dirname, '../posts'), safeSlug, content)
  console.log(`포스트가 생성되었습니다: ${filePath}`)
  console.log(`카테고리: ${category}`)
  console.log(`태그: ${tagArray.join(', ')}`)
}

// 시작
askQuestion(0, {})
