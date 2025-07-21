import { browser, dev } from '$app/environment'
import { parse } from 'node-html-parser'
import readingTime from 'reading-time/lib/reading-time.js'
import { formatDate } from '$lib/utils/date'

/**
 * GitHub 이미지 URL을 썸네일 크기로 변환합니다.
 * @param {string} url - 원본 GitHub 이미지 URL
 * @param {number} size - 썸네일 크기 (기본값: 400px)
 * @returns {string} 썸네일 URL
 */
const convertToGitHubThumbnail = (url, size = 400) => {
  const GITHUB_THUMBNAIL_SUPPORTED_HOSTS = [
    'github.com/user-attachments/assets/',
    'avatars.githubusercontent.com/',
    'user-images.githubusercontent.com/',
    'private-user-images.githubusercontent.com/'
  ]

  // GitHub 이미지 URL 패턴 확인
  if (GITHUB_THUMBNAIL_SUPPORTED_HOSTS.some((host) => url.includes(host))) {
    // 이미 크기 파라미터가 있는 경우 제거 후 새로 추가
    const baseUrl = url.split('?')[0]
    return `${baseUrl}?s=${size}`
  }
  return url
}

/**
 * preview HTML에서 이미지 태그들을 썸네일 버전으로 최적화합니다.
 * @param {Object} previewElement - node-html-parser 엘리먼트
 * @returns {Object} 최적화된 preview 엘리먼트
 */
const optimizePreviewImages = (previewElement) => {
  if (!previewElement) return previewElement

  // 모든 img 태그 찾기
  const images = previewElement.querySelectorAll('img')

  images.forEach((img) => {
    const src = img.getAttribute('src')
    if (src) {
      // GitHub 이미지인 경우 썸네일로 변환
      const optimizedSrc = convertToGitHubThumbnail(src)
      img.setAttribute('src', optimizedSrc)

      // preview용 스타일 추가 (적절한 크기로 조정)
      const existingStyle = img.getAttribute('style') || ''
      img.setAttribute(
        'style',
        `${existingStyle}; max-height: 300px; width: auto; min-width: 250px; max-width: 100%; object-fit: cover;`
      )
    }
  })

  return previewElement
}

/**
 * 개선된 프리뷰 생성: 이미지 + 텍스트 결합
 * @param {Object} html - 파싱된 HTML 전체
 * @returns {Object} 프리뷰 엘리먼트
 */
const createEnhancedPreview = (html) => {
  const allParagraphs = html.querySelectorAll('p')
  if (!allParagraphs.length) return null

  let previewHtml = ''
  let hasImage = false
  let textParagraphsAdded = 0
  const maxTextParagraphs = 1 // 최대 1개의 텍스트 문단

  for (const p of allParagraphs) {
    const hasImageInParagraph = p.querySelector('img')
    
    if (hasImageInParagraph && !hasImage) {
      // 첫 번째 이미지가 있는 문단을 추가
      previewHtml += p.toString()
      hasImage = true
    } else if (!hasImageInParagraph && p.text.trim().length > 0 && textParagraphsAdded < maxTextParagraphs) {
      // 텍스트가 있는 문단을 추가 (최대 2개)
      previewHtml += p.toString()
      textParagraphsAdded++
    }
    
    // 이미지 + 1개 텍스트 문단이 모두 채워지면 중단
    if (hasImage && textParagraphsAdded >= maxTextParagraphs) {
      break
    }
  }

  // 이미지가 없고 텍스트만 있는 경우, 첫 번째 문단만 반환
  if (!hasImage && textParagraphsAdded === 0 && allParagraphs[0]) {
    previewHtml = allParagraphs[0].toString()
  }

  return previewHtml ? parse(`<div>${previewHtml}</div>`).querySelector('div') : allParagraphs[0]
}

// we require some server-side APIs to parse all metadata
if (browser) {
  throw new Error(`posts can only be imported server-side`)
}

/**
 * 포스트 메타데이터를 파싱하고 가공합니다.
 * @param {string} filepath - 파일 경로
 * @param {Object} post - 포스트 데이터
 * @returns {Object} 가공된 포스트 메타데이터
 */
const processPostMetadata = ([filepath, post]) => {
  const html = parse(post.default.render().html)
  const rawPreview = post.metadata.preview 
    ? parse(post.metadata.preview) 
    : createEnhancedPreview(html)
  const preview = optimizePreviewImages(rawPreview)

  // 태그 처리 로직 수정 - 배열과 문자열 모두 지원
  let tags = []
  if (post.metadata.tags) {
    // 이미 배열인 경우
    if (Array.isArray(post.metadata.tags)) {
      tags = post.metadata.tags
    }
    // 문자열인 경우 (하위 호환성)
    else if (typeof post.metadata.tags === 'string') {
      tags = post.metadata.tags
        .split('#')
        .filter((tag) => tag.trim().length > 0)
        .map((tag) => tag.trim())
    }
  }

  return {
    ...post.metadata,
    slug: filepath
      .replace(/(\/index)?\.md/, '')
      .split('/')
      .pop(),
    isIndexFile: filepath.endsWith('/index.md'),
    date: formatDate(post.metadata.date),
    preview: {
      html: preview?.toString(),
      text: preview?.structuredText ?? preview?.toString()
    },
    readingTime: readingTime(html.structuredText).text,
    tags
  }
}

// 모든 태그 수집 및 빈도 계산을 위한 변수 초기화
const tagCounts = {}
const tagSet = new Set()

// Get all posts and add metadata
export const posts = Object.entries(import.meta.glob('/posts/**/*.md', { eager: true }))
  .map(processPostMetadata)
  .filter((post) => dev || !post.draft)
  // sort by date
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // next/previous 참조 추가 및 태그 계산을 한 번의 순회로 처리
  .map((post, index, allPosts) => {
    // processPostMetadata에서 post.tags를 항상 배열로 보장하므로 추가 확인 불필요
    post.tags.forEach((tag) => {
      if (tag) {
        // 유니크한 태그와 태그별 개수 집계
        tagSet.add(tag)
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    })

    return {
      ...post,
      next: allPosts[index - 1],
      previous: allPosts[index + 1]
    }
  })

// 태그를 빈도순으로 정렬하고, 빈도가 같으면 알파벳순으로 정렬
export const allTags = Array.from(tagSet).sort((a, b) => {
  const countDiff = tagCounts[b] - tagCounts[a]
  return countDiff !== 0 ? countDiff : a.localeCompare(b)
})
