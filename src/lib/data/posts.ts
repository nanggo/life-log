import { parse, type HTMLElement } from 'node-html-parser'
import readingTime from 'reading-time'

import { browser, dev } from '$app/environment'
import type { Post, PostMetadata } from '$lib/types'
import { formatDate } from '$lib/utils/date'

// import.meta.glob의 타입 정의
type PostModule = {
  default: {
    render: () => { html: string }
  }
  metadata: Omit<PostMetadata, 'tags' | 'preview' | 'slug' | 'readingTime'> & {
    tags?: string[] | string
    preview?: string
    thumbnail?: string
  }
}

/**
 * GitHub 이미지 URL을 썸네일 크기로 변환합니다.
 * @param {string} url - 원본 GitHub 이미지 URL
 * @param {number} size - 썸네일 크기 (기본값: 400px)
 * @returns {string} 썸네일 URL
 */
const convertToGitHubThumbnail = (url: string, size: number = 400): string => {
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
 */
const optimizePreviewImages = (previewElement: HTMLElement | null) => {
  if (!previewElement) return previewElement

  // 모든 img 태그 찾기
  const images = previewElement.querySelectorAll('img')

  images.forEach((img: HTMLElement) => {
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
 * HTML에서 깨끗한 평문 텍스트를 추출합니다.
 * node-html-parser의 .text 속성을 활용하여 효율적으로 처리합니다.
 */
const extractPlainText = (element: HTMLElement | null): string => {
  if (!element) return ''

  // structuredText가 있으면 우선 사용
  if (element.structuredText) {
    return element.structuredText.trim()
  }

  // node-html-parser의 .text 속성 사용하여 평문 추출
  return element.text.replace(/\s+/g, ' ').trim()
}

/**
 * 개선된 프리뷰 생성: 이미지 + 텍스트를 하나의 p 태그 안에 결합
 */
const createEnhancedPreview = (html: HTMLElement) => {
  const allParagraphs = html.querySelectorAll('p')
  if (!allParagraphs.length) return null

  let imageHtml = ''
  let textHtml = ''
  let hasImage = false
  let textParagraphsAdded = 0
  const maxTextParagraphs = 1 // 최대 1개의 텍스트 문단

  for (const p of allParagraphs) {
    const hasImageInParagraph = p.querySelector('img')

    if (hasImageInParagraph && !hasImage) {
      // 첫 번째 이미지가 있는 문단에서 이미지만 추출
      const img = p.querySelector('img')
      imageHtml = img ? img.toString() : ''
      hasImage = true
    } else if (
      !hasImageInParagraph &&
      p.text.trim().length > 0 &&
      textParagraphsAdded < maxTextParagraphs
    ) {
      // 텍스트가 있는 문단을 추가 (최대 1개)
      textHtml += p.innerHTML
      textParagraphsAdded++
    }

    // 이미지 + 1개 텍스트 문단이 모두 채워지면 중단
    if (hasImage && textParagraphsAdded >= maxTextParagraphs) {
      break
    }
  }

  // 이미지가 없고 텍스트만 있는 경우, 첫 번째 문단만 반환
  if (!hasImage && textParagraphsAdded === 0 && allParagraphs[0]) {
    return allParagraphs[0]
  }

  // 이미지와 텍스트를 하나의 p 태그 안에 결합
  const combinedContent = imageHtml + textHtml
  return combinedContent ? parse(`<p>${combinedContent}</p>`).querySelector('p') : allParagraphs[0]
}

// we require some server-side APIs to parse all metadata
if (browser) {
  throw new Error(`posts can only be imported server-side`)
}

/**
 * 포스트 메타데이터를 파싱하고 가공합니다.
 */
const processPostMetadata = ([filepath, post]: [string, PostModule]): Post => {
  const slug =
    filepath
      .replace(/(\/index)?\.md/, '')
      .split('/')
      .pop() || ''

  const html = parse(post.default.render().html)
  const rawPreview = post.metadata.preview
    ? parse(post.metadata.preview)
    : createEnhancedPreview(html)
  const preview = optimizePreviewImages(rawPreview)

  // 태그 처리 로직 수정 - 배열과 문자열 모두 지원
  let tags: string[] = []
  if (post.metadata.tags) {
    // 이미 배열인 경우
    if (Array.isArray(post.metadata.tags)) {
      tags = post.metadata.tags
    }
    // 문자열인 경우 (하위 호환성)
    else if (typeof post.metadata.tags === 'string') {
      tags = post.metadata.tags
        .split('#')
        .filter((tag: string) => tag.trim().length > 0)
        .map((tag: string) => tag.trim())
    }
  }

  // Extract headings from HTML
  const headings = html.querySelectorAll('h1, h2, h3, h4, h5, h6').map((heading) => ({
    depth: parseInt(heading.tagName.substring(1)),
    value: heading.text.trim()
  }))

  return {
    ...post.metadata,
    slug,
    isIndexFile: filepath.endsWith('/index.md'),
    date: formatDate(post.metadata.date) ?? new Date().toISOString().slice(0, 10),
    preview: {
      html: preview?.toString() || '',
      text: extractPlainText(preview)
    },
    readingTime: readingTime(html.structuredText).text,
    tags,
    headings
  }
}

// 모든 태그 수집 및 빈도 계산을 위한 변수 초기화
const tagCounts: Record<string, number> = {}
const tagSet = new Set<string>()

// Get all posts and add metadata
export const posts = Object.entries(
  import.meta.glob('/posts/**/*.md', { eager: true }) as Record<string, PostModule>
)
  .map(processPostMetadata)
  .filter((post) => dev || !post.draft)
  // sort by date
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // next/previous 참조 추가 및 태그 계산을 한 번의 순회로 처리
  .map((post, index, allPosts) => {
    // processPostMetadata에서 post.tags를 항상 배열로 보장하므로 추가 확인 불필요
    post.tags.forEach((tag: string) => {
      if (tag) {
        // 유니크한 태그와 태그별 개수 집계
        tagSet.add(tag)
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    })

    return {
      ...post,
      next: allPosts[index - 1]
        ? {
            slug: allPosts[index - 1].slug,
            title: allPosts[index - 1].title
          }
        : undefined,
      previous: allPosts[index + 1]
        ? {
            slug: allPosts[index + 1].slug,
            title: allPosts[index + 1].title
          }
        : undefined
    }
  })

// 태그를 빈도순으로 정렬하고, 빈도가 같으면 알파벳순으로 정렬
export const allTags = Array.from(tagSet).sort((a: string, b: string) => {
  const countDiff = tagCounts[b] - tagCounts[a]
  return countDiff !== 0 ? countDiff : a.localeCompare(b)
})
