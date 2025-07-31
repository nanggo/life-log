#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

import matter from 'gray-matter'

const POSTS_DIR = 'posts'

async function migrateThumbnailToImage() {
  try {
    console.log('🖼️  포스트 thumbnail → image 필드 마이그레이션을 시작합니다...\n')

    const files = await readdir(POSTS_DIR)
    const markdownFiles = files.filter((file) => file.endsWith('.md'))

    console.log(`📋 총 ${markdownFiles.length}개의 포스트를 처리합니다.\n`)

    let processedCount = 0
    let skippedCount = 0

    for (const file of markdownFiles) {
      const filePath = join(POSTS_DIR, file)
      const content = await readFile(filePath, 'utf-8')
      const parsed = matter(content)

      // thumbnail 필드가 없으면 스킵
      if (!parsed.data.thumbnail) {
        console.log(`⏭️  ${file}: thumbnail 필드가 없습니다`)
        skippedCount++
        continue
      }

      // image 필드가 이미 있으면 스킵 (데이터 무결성 보호)
      if (parsed.data.image) {
        console.log(
          `⚠️  ${file}: image 필드가 이미 존재합니다 (thumbnail: ${parsed.data.thumbnail}, image: ${parsed.data.image})`
        )
        skippedCount++
        continue
      }

      // thumbnail → image 마이그레이션
      parsed.data.image = parsed.data.thumbnail
      delete parsed.data.thumbnail

      // 파일 다시 작성
      const updatedContent = matter.stringify(parsed.content, parsed.data)
      await writeFile(filePath, updatedContent, 'utf-8')

      console.log(`✅ ${file}: thumbnail → image 마이그레이션 완료 (${parsed.data.image})`)
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
migrateThumbnailToImage()
