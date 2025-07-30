import { error } from '@sveltejs/kit'

import { globalCacheManager, generateCacheKey, CACHE_TAGS } from '$lib/utils/cache-manager'

// Statically generate all post list pages, with tag filtering handled on the client.
export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10

  // 레이아웃에서 전체 포스트 데이터 가져오기
  const { allPosts } = await parent()

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

  const result = {
    // 페이지네이션 정보만 제공 (클라이언트에서 필터링 및 페이지네이션 처리)
    page,
    limit
  }

  // 결과 캐싱 (개발 환경에서는 캐시 비활성화)
  if (process.env.NODE_ENV === 'production') {
    const cacheTags = [CACHE_TAGS.POSTS, CACHE_TAGS.PAGINATION]
    globalCacheManager.set(cacheKey, result, cacheTags)
  }

  return result
}
