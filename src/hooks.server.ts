import type { Handle } from '@sveltejs/kit'

import { globalCacheManager, CACHE_TAGS } from '$lib/utils/cache-manager'

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)

  // 캐시 무효화 트리거 확인 (POST 요청 시)
  if (event.request.method === 'POST' && event.url.pathname.includes('/posts')) {
    // 포스트 관련 캐시 무효화
    globalCacheManager.invalidateByTags([CACHE_TAGS.POSTS, CACHE_TAGS.HOME, CACHE_TAGS.PAGINATION])
  }

  // 정적 자산에 대한 긴 캐시 설정
  if (
    event.url.pathname.startsWith('/_app/') ||
    event.url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|gif|webp|woff|woff2)$/)
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // 홈페이지: 자주 변경되므로 짧은 캐시
  if (event.url.pathname === '/') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
    )
  }
  // Posts 목록 페이지에 대한 캐시 헤더 설정
  else if (event.url.pathname.startsWith('/posts')) {
    // Edge 캐시: 1시간, stale-while-revalidate: 24시간
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    )
  }
  // 개별 포스트 페이지에 대한 캐시 헤더 설정
  else if (event.url.pathname.startsWith('/post/')) {
    // Edge 캐시: 24시간, stale-while-revalidate: 24시간
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'
    )
  }
  // 태그 페이지: 중간 수준의 캐시
  else if (event.url.pathname.startsWith('/tag/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=1800, stale-while-revalidate=7200'
    )
  }
  // About 페이지 등 정적 페이지: 긴 캐시
  else if (event.url.pathname === '/about') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'
    )
  }
  // 기타 페이지: 기본 캐시 설정
  else {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=600, stale-while-revalidate=3600'
    )
  }

  return response
}
