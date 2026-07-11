import { error } from '@sveltejs/kit'

import { getPostsByCategory, getCategoryCounts } from '$lib/data/posts'
import { Category } from '$lib/types/blog'
import { extractPostMetadata } from '$lib/util'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { name: categoryParam } = params
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10 // 전체 포스트 목록과 동일한 페이지당 개수

  // URL 파라미터 디코딩 (한국어 카테고리명 지원)
  const decodedParam = decodeURIComponent(categoryParam)

  // URL 파라미터를 Category enum 값으로 검증
  const validCategory = Object.values(Category).find((cat) => cat === decodedParam)

  if (!validCategory) {
    throw error(404, `Invalid category: ${decodedParam}`)
  }

  // 해당 카테고리의 포스트들 가져오기
  const categoryPosts = getPostsByCategory(validCategory)
  const categoryCounts = getCategoryCounts()

  // 페이지네이션 계산
  const totalPosts = categoryPosts.length
  const totalPages = Math.ceil(totalPosts / limit)

  // 페이지 유효성 검사
  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found')
  }

  // 현재 페이지의 포스트들만 추출
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedPosts = categoryPosts.slice(startIndex, endIndex)

  // 메타데이터만 추출 (content 제외)
  const postsMetadata = extractPostMetadata(paginatedPosts)

  return {
    category: validCategory,
    posts: postsMetadata,
    totalPosts,
    categoryCounts,
    page,
    limit,
    totalPages,
    seo: {
      title: `${validCategory} 포스트${page > 1 ? ` - ${page}페이지` : ''}`,
      description:
        page > 1
          ? `NANGGO's LIFELOG의 ${validCategory} 카테고리 ${page}페이지입니다. 전체 ${totalPosts}개의 글에서 관련 경험과 생각, 실무 기록을 이어서 살펴보세요.`
          : `NANGGO's LIFELOG의 ${validCategory} 카테고리입니다. ${totalPosts}개의 글에서 관련 경험과 생각, 실무 기록을 한곳에서 살펴보세요.`
    }
  }
}
