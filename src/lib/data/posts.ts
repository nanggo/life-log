import { parse, type HTMLElement } from 'node-html-parser'
import readingTime from 'reading-time'

import { browser, dev } from '$app/environment'
import type { PostMetadata } from '$lib/types'
import { Category } from '$lib/types/blog'
import type { Post } from '$lib/types/blog'
import { formatDate } from '$lib/utils/date'

// import.meta.glob의 타입 정의
type PostModule = {
  default: {
    render: () => { html: string }
  }
  metadata: Omit<PostMetadata, 'tags' | 'preview' | 'slug' | 'readingTime' | 'category'> & {
    tags?: string[] | string
    category?: string // frontmatter에서는 문자열로 입력됨
    preview?: string
    image?: string
  }
}

/**
 * GitHub 이미지 URL을 썸네일 크기로 변환합니다.
 * @param {string} url - 원본 GitHub 이미지 URL
 * @param {number} size - 썸네일 크기 (기본값: 300px, preview용으로 축소)
 * @returns {string} 썸네일 URL
 */
const convertToGitHubThumbnail = (url: string, size: number = 300): string => {
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

      // preview용 스타일 최적화 (더 작은 크기)
      const existingStyle = img.getAttribute('style') || ''
      img.setAttribute(
        'style',
        `${existingStyle}; max-height: 200px; width: auto; min-width: 200px; max-width: 100%; object-fit: cover;`
      )
    }
  })

  return previewElement
}

/**
 * HTML에서 깨끗한 평문 텍스트를 추출합니다.
 * node-html-parser의 .text 속성을 활용하여 효율적으로 처리합니다.
 */
const extractPlainText = (element: HTMLElement | null, maxLength: number = 150): string => {
  if (!element) return ''

  let text = ''

  // structuredText가 있으면 우선 사용
  if (element.structuredText) {
    text = element.structuredText.trim()
  } else {
    // node-html-parser의 .text 속성 사용하여 평문 추출
    text = element.text.replace(/\s+/g, ' ').trim()
  }

  // 성능 최적화: preview 텍스트 길이 제한
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * 개선된 프리뷰 생성: 이미지 + 텍스트를 하나의 p 태그 안에 결합
 * 성능 최적화: 더 간결한 preview 생성
 */
const createEnhancedPreview = (html: HTMLElement) => {
  const allParagraphs = html.querySelectorAll('p')
  if (!allParagraphs.length) return null

  // 성능 최적화: 첫 번째 의미있는 문단만 사용
  for (const p of allParagraphs) {
    const textContent = p.text.trim()
    if (textContent.length > 10) {
      // 최소 10자 이상인 문단만 사용
      return p
    }
  }

  return allParagraphs[0] || null
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
  if (!html) {
    throw new Error(`[오류] 파일 '${filepath}'의 HTML 파싱에 실패했습니다.`)
  }

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

  // 카테고리 처리 로직 - frontmatter의 문자열을 Category enum으로 변환
  let category: Category = Category.DEVELOPMENT // 기본값
  if (post.metadata.category) {
    const categoryValue = post.metadata.category.trim()
    // Category enum 값들과 매칭
    const categoryMatch = Object.values(Category).find((cat) => cat === categoryValue)
    if (categoryMatch) {
      category = categoryMatch as Category
    } else {
      // 유효하지 않은 카테고리에 대한 경고
      console.warn(
        `[경고] 파일 '${filepath}'에 유효하지 않은 카테고리 '${categoryValue}'가 있습니다. 기본값 '${Category.DEVELOPMENT}'을 사용합니다.`
      )
    }
  }

  // Extract headings from HTML (performance: only h2, h3 for ToC)
  const headings = html.querySelectorAll('h2, h3').map((heading) => ({
    depth: parseInt(heading.tagName.substring(1)),
    value: heading.text.trim()
  }))

  const result: Post = {
    ...post.metadata,
    slug,
    description: post.metadata.description || '',
    date: formatDate(post.metadata.date) ?? new Date().toISOString().slice(0, 10),
    category,
    tags,
    preview: {
      html: preview?.toString() || '',
      text: extractPlainText(preview)
    },
    readingTime: (() => {
      try {
        // HTML 텍스트 추출 개선
        const textContent = html.structuredText || html.text || ''
        if (!textContent.trim()) {
          console.warn(
            `[경고] 파일 '${filepath}'에서 텍스트 내용을 찾을 수 없습니다. 기본값 1분을 사용합니다.`
          )
          return 1
        }
        const readingResult = readingTime(textContent)
        return Math.max(1, Math.ceil(readingResult.minutes)) // 최소 1분 보장
      } catch (error) {
        console.warn(`[경고] 파일 '${filepath}'의 읽기 시간 계산 중 오류가 발생했습니다:`, error)
        return 1 // 기본값으로 1분 설정
      }
    })(),
    isIndexFile: filepath.endsWith('/index.md'),
    headings
  }

  return result
}

// 모든 태그 수집 및 빈도 계산을 위한 변수 초기화
const tagCounts: Record<string, number> = {}
const tagSet = new Set<string>()

// 카테고리별 포스트 개수를 저장하는 변수
const categoryCounts: Record<Category, number> = {
  [Category.DAILY]: 0,
  [Category.DEVELOPMENT]: 0,
  [Category.THOUGHTS]: 0,
  [Category.REVIEW]: 0
}

// Get all posts and add metadata
export const posts = Object.entries(
  import.meta.glob('/posts/**/*.md', { eager: true }) as Record<string, PostModule>
)
  .map(processPostMetadata)
  .filter((post) => dev || !post.draft)
  // sort by date
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // next/previous 참조 추가 및 태그/카테고리 계산을 한 번의 순회로 처리
  .map((post, index, allPosts) => {
    // processPostMetadata에서 post.tags를 항상 배열로 보장하므로 추가 확인 불필요
    post.tags.forEach((tag: string) => {
      if (tag) {
        // 유니크한 태그와 태그별 개수 집계
        tagSet.add(tag)
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    })

    // 카테고리별 개수 집계
    if (post.category) {
      categoryCounts[post.category]++
    }

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

/**
 * 특정 카테고리의 포스트들을 반환합니다.
 * @param category - 필터링할 카테고리
 * @returns 해당 카테고리의 포스트 배열 (날짜순 정렬)
 */
export function getPostsByCategory(category: Category): Post[] {
  return posts.filter((post) => post.category === category)
}

/**
 * 카테고리 정렬 순서 정의
 */
const CATEGORY_ORDER = [Category.DAILY, Category.THOUGHTS, Category.DEVELOPMENT, Category.REVIEW]

/**
 * 모든 카테고리별 포스트 개수를 반환합니다.
 * @returns 카테고리별 포스트 개수 객체 (정렬된 순서)
 */
export function getCategoryCounts(): Record<Category, number> {
  return { ...categoryCounts }
}

/**
 * 정렬된 순서로 카테고리 목록을 반환합니다.
 * @returns 정렬된 카테고리 배열 (일상 -> 생각 -> 개발 -> 리뷰)
 */
export function getSortedCategories(): Category[] {
  return [...CATEGORY_ORDER]
}

/**
 * 카테고리별 정보를 정렬된 순서로 반환합니다.
 * @returns 카테고리 정보 배열 (포스트 개수 포함)
 */
export function getCategoryInfos(): Array<{ category: Category; count: number }> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    count: categoryCounts[category]
  }))
}

/**
 * 특정 태그를 포함한 포스트들을 반환합니다.
 * @param tag - 필터링할 태그
 * @returns 해당 태그를 포함한 포스트 배열 (날짜순 정렬)
 */
export function getPostsByTag(tag: string): Post[] {
  return posts.filter((post) => post.tags.includes(tag))
}

/**
 * 태그별 포스트 개수를 반환합니다.
 * @returns 태그별 포스트 개수 객체
 */
export function getTagCounts(): Record<string, number> {
  return { ...tagCounts }
}

/**
 * 모든 태그와 각 태그별 포스트 개수를 정렬된 순서로 반환합니다.
 * @returns 태그 정보 배열 (포스트 개수 순으로 정렬, 동일하면 알파벳순)
 */
export function getAllTagsWithCounts(): Array<{ tag: string; count: number }> {
  return allTags.map((tag) => ({
    tag,
    count: tagCounts[tag]
  }))
}
