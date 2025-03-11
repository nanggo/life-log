/**
 * 기존 블로그 게시글의 태그 형식을 문자열 형식에서 배열 형식으로 변환하는 스크립트
 *
 * 사용법: node scripts/convert-tags.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

// ESM에서 __dirname 가져오기
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const postsDir = path.join(__dirname, '..', 'posts')

// 포스트 파일 목록 가져오기
const getPostFiles = (dir) => {
  const files = fs.readdirSync(dir)
  const postFiles = []

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // 하위 디렉토리 탐색
      postFiles.push(...getPostFiles(filePath))
    } else if (file.endsWith('.md')) {
      // markdown 파일만 처리
      postFiles.push(filePath)
    }
  })

  return postFiles
}

// 태그 변환 함수
const convertTags = (content) => {
  // 프론트매터 추출
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) return content

  try {
    // YAML 파싱
    const frontmatter = yaml.load(match[1])

    // 태그가 문자열 형태인 경우만 변환
    if (frontmatter.tags && typeof frontmatter.tags === 'string') {
      const tagString = frontmatter.tags
      const tags = tagString
        .split('#')
        .filter((tag) => tag.trim().length > 0)
        .map((tag) => tag.trim())

      // 태그 배열로 변환
      frontmatter.tags = tags

      // 새 프론트매터 생성
      const newFrontmatter = yaml.dump(frontmatter)

      // 기존 프론트매터 교체
      return content.replace(frontmatterRegex, `---\n${newFrontmatter}---`)
    }
  } catch (error) {
    console.error('프론트매터 파싱 오류:', error)
  }

  return content
}

// 메인 함수
const main = async () => {
  console.log('태그 형식 변환 시작...')

  const postFiles = getPostFiles(postsDir)
  let convertedCount = 0

  for (const file of postFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8')
      const newContent = convertTags(content)

      // 변환된 내용이 있을 경우만 파일 업데이트
      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8')
        console.log(`변환 완료: ${path.relative(postsDir, file)}`)
        convertedCount++
      }
    } catch (error) {
      console.error(`파일 처리 오류 (${file}):`, error)
    }
  }

  console.log(`총 ${convertedCount}개 파일의 태그 형식이 변환되었습니다.`)
}

main().catch(console.error)
