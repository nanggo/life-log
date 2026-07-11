import { error } from '@sveltejs/kit'

import { posts as allPosts } from '$lib/data/posts'
import { description, name } from '$lib/info'
import { extractPostMetadata } from '$lib/util'

// Statically generate all post list pages
export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10

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
  const title = `${name}'s life log | Posts${page > 1 ? ` - ${page}페이지` : ''}`

  return {
    page,
    limit,
    totalPosts,
    totalPages,
    posts,
    seo: {
      title,
      // 페이지네이션 페이지는 중복 메타를 피하기 위해 페이지 번호가 들어간 설명 사용
      description: page > 1 ? `${description} (${page}페이지)` : description
    }
  }
}
