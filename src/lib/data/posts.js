import { browser, dev } from '$app/environment'
import { parse } from 'node-html-parser'
import readingTime from 'reading-time/lib/reading-time.js'
import { formatDate } from '$lib/utils/date'

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
  const preview = post.metadata.preview ? parse(post.metadata.preview) : html.querySelector('p')

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

// Get all posts and add metadata
export const posts = Object.entries(import.meta.glob('/posts/**/*.md', { eager: true }))
  .map(processPostMetadata)
  .filter((post) => dev || !post.draft)
  // sort by date
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // add references to the next/previous post
  .map((post, index, allPosts) => ({
    ...post,
    next: allPosts[index - 1],
    previous: allPosts[index + 1]
  }))
