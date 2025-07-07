// 클라이언트 사이드에서만 태그 필터링 처리
export const prerender = true

import { allTags, posts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
  let page = params.page ? parseInt(params.page) : 1
  let limit = 10
  // 태그 필터링과 페이지네이션 모두 클라이언트 사이드에서 처리

  // 모든 포스트의 메타데이터 제공 (본문 제외)
  const postsMetadata = extractPostMetadata(posts)

  // 페이지 유효성 검사를 위한 임시 페이지네이션
  const totalPages = Math.ceil(posts.length / limit)
  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found')
  }

  return {
    posts: postsMetadata,
    page,
    limit,
    allTags,
    totalPosts: posts.length
  }
}
