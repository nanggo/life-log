import { allTags, posts as allPosts, postsByTag } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'
import { error } from '@sveltejs/kit'

export const prerender = false

// 페이지 결과 캐싱 (메모리 캐시)
const pageCache = new Map()

/** @type {import('./$types').PageServerLoad} */
export function load({ params, url }) {
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10
  const tag = url.searchParams.get('tag')

  // 캐시 키 생성
  const cacheKey = `${tag || 'all'}-${page}-${limit}`

  // 캐시에서 확인
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)
  }

  // 사전 계산된 태그별 포스트 사용 (성능 최적화)
  const filteredPosts = tag ? postsByTag[tag] || [] : allPosts

  const postsMetadata = extractPostMetadata(filteredPosts)

  const totalPosts = postsMetadata.length
  const totalPages = Math.ceil(totalPosts / limit)

  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found')
  }

  // 페이지네이션 적용
  const paginatedPosts = postsMetadata.slice((page - 1) * limit, page * limit)

  const result = {
    posts: paginatedPosts,
    page,
    limit,
    allTags,
    totalPosts,
    totalPages,
    tag
  }

  // 결과 캐싱 (개발 환경에서는 캐시 비활성화)
  if (process.env.NODE_ENV === 'production') {
    pageCache.set(cacheKey, result)
  }

  return result
}
