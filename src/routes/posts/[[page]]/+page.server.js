import { error } from '@sveltejs/kit'

import { allTags, posts as allPosts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'
import { globalCacheManager, CACHE_TAGS } from '$lib/utils/cache-manager'

// 태그 없는 페이지만 prerender (태그가 있으면 SSR)
export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10

  // 클라이언트 사이드 필터링을 위해 전체 포스트 메타데이터 제공
  const cacheKey = `all-posts:${page}:${limit}`

  // 캐시에서 확인
  if (globalCacheManager.has(cacheKey)) {
    return globalCacheManager.get(cacheKey)
  }

  // 전체 포스트 메타데이터 (클라이언트에서 필터링용)
  const allPostsMetadata = extractPostMetadata(allPosts)

  // 서버 사이드 페이지네이션 (기본 페이지 로딩용)
  const totalPosts = allPostsMetadata.length
  const totalPages = Math.ceil(totalPosts / limit)

  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found')
  }

  // 현재 페이지의 포스트들 (초기 로딩용)
  const paginatedPosts = allPostsMetadata.slice((page - 1) * limit, page * limit)

  const result = {
    // 현재 페이지 포스트들 (서버 사이드 페이지네이션)
    posts: paginatedPosts,
    // 클라이언트 사이드 필터링을 위한 전체 데이터
    allPosts: allPostsMetadata,
    allTags,
    // 페이지네이션 정보
    page,
    limit,
    totalPosts,
    totalPages
  }

  // 결과 캐싱 (개발 환경에서는 캐시 비활성화)
  if (process.env.NODE_ENV === 'production') {
    const cacheTags = [CACHE_TAGS.POSTS, CACHE_TAGS.PAGINATION]
    globalCacheManager.set(cacheKey, result, cacheTags)
  }

  return result
}
