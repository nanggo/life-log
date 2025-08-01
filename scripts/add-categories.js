#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

import matter from 'gray-matter'

const POSTS_DIR = 'posts'

// 카테고리 매핑 규칙
const categoryMappings = {
  // 개발 관련 태그들
  개발: ['frontend', 'react', 'git', 'debugging', 'devops', 'testing'],
  // 리뷰 관련 태그들
  리뷰: ['경험', '리뷰', 'tip', 'mac'],
  // 생각 관련 태그들
  생각: ['생각'],
  // 일상 관련 태그들
  일상: ['일상', '회고']
}

// 태그를 기반으로 카테고리 결정
function determineCategoryFromTags(tags) {
  if (!tags || !tags.length) return '일상' // 기본값

  const lowercasedTags = tags.map((tag) => tag.toLowerCase())

  // 카테고리 우선순위에 따라 확인
  const categoryPriority = ['일상', '생각', '리뷰', '개발']

  for (const category of categoryPriority) {
    const keywords = categoryMappings[category]
    if (keywords && lowercasedTags.some((tag) => keywords.includes(tag))) {
      return category
    }
  }

  // 기본값은 일상
  return '일상'
}

// 제목이나 내용을 기반으로 카테고리 보정
function adjustCategoryFromContent(title, content, initialCategory) {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()

  // 리뷰 키워드들
  const reviewKeywords = ['리뷰', '사용', '경험', '후기', '평가', 'review', '에디터', '도구']
  if (
    reviewKeywords.some((keyword) => titleLower.includes(keyword) || contentLower.includes(keyword))
  ) {
    return '리뷰'
  }

  // 생각/철학 키워드들
  const thoughtKeywords = ['자존감', '생각', '철학', '마음', '성장', '인생', '고민']
  if (thoughtKeywords.some((keyword) => titleLower.includes(keyword))) {
    return '생각'
  }

  // 일상 키워드들
  const dailyKeywords = ['일상', '회고', '근황', '요즘', '최근']
  if (dailyKeywords.some((keyword) => titleLower.includes(keyword))) {
    return '일상'
  }

  return initialCategory
}

async function addCategoriesToPosts() {
  try {
    console.log('📝 포스트 카테고리 추가 작업을 시작합니다...\n')

    const files = await readdir(POSTS_DIR)
    const markdownFiles = files.filter((file) => file.endsWith('.md'))

    console.log(`📋 총 ${markdownFiles.length}개의 포스트를 처리합니다.\n`)

    let processedCount = 0
    let skippedCount = 0

    for (const file of markdownFiles) {
      const filePath = join(POSTS_DIR, file)
      const content = await readFile(filePath, 'utf-8')
      const parsed = matter(content)

      // 이미 카테고리가 있으면 스킵
      if (parsed.data.category) {
        console.log(`⏭️  ${file}: 이미 카테고리가 있습니다 (${parsed.data.category})`)
        skippedCount++
        continue
      }

      // 태그 기반으로 카테고리 결정
      const tags = parsed.data.tags || []
      const initialCategory = determineCategoryFromTags(tags)

      // 제목과 내용으로 카테고리 보정
      const finalCategory = adjustCategoryFromContent(
        parsed.data.title || '',
        parsed.content,
        initialCategory
      )

      // frontmatter에 카테고리 추가
      parsed.data.category = finalCategory

      // 파일 다시 작성
      const updatedContent = matter.stringify(parsed.content, parsed.data)
      await writeFile(filePath, updatedContent, 'utf-8')

      console.log(`✅ ${file}: ${finalCategory} 카테고리 추가 (태그: ${tags.join(', ') || '없음'})`)
      processedCount++
    }

    console.log(`\n🎉 작업 완료!`)
    console.log(`📊 처리된 포스트: ${processedCount}개`)
    console.log(`⏭️  스킵된 포스트: ${skippedCount}개`)
    console.log(`📁 총 포스트: ${markdownFiles.length}개`)
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    process.exit(1)
  }
}

// 스크립트 실행
addCategoriesToPosts()
