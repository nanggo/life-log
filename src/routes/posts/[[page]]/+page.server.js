import { error } from '@sveltejs/kit'

import { posts as allPosts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'
import { globalCacheManager, generateCacheKey, CACHE_TAGS } from '$lib/utils/cache-manager'

// Statically generate all post list pages
export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10

  // 캐시 키 생성 (페이지별 캐싱)
  const cacheKey = generateCacheKey.posts(undefined, page, limit)

  // 캐시에서 확인
  if (globalCacheManager.has(cacheKey)) {
    return globalCacheManager.get(cacheKey)
  }

  // 페이지 파라미터 유효성 검사 (기본적인 범위 체크)
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / limit)

  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found')
  }

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedPosts = allPosts.slice(startIndex, endIndex)

  // 목록 페이지에 필요한 메타데이터만 포함
  const posts = extractPostMetadata(paginatedPosts)

  const result = {
    page,
    limit,
    totalPosts,
    totalPages,
    posts
  }

  // 결과 캐싱 (개발 환경에서는 캐시 비활성화)
  if (process.env.NODE_ENV === 'production') {
    const cacheTags = [CACHE_TAGS.POSTS, CACHE_TAGS.PAGINATION]
    globalCacheManager.set(cacheKey, result, cacheTags)
  }

  return result
}
