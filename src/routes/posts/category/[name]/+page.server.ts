import { error } from '@sveltejs/kit'

import { getPostsByCategory, getCategoryCounts } from '$lib/data/posts'
import { Category } from '$lib/types/blog'
import { extractPostMetadata } from '$lib/util'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { name: categoryParam } = params

  // URL 파라미터를 Category enum 값으로 검증
  const validCategory = Object.values(Category).find((cat) => cat === categoryParam)

  if (!validCategory) {
    throw error(404, `Invalid category: ${categoryParam}`)
  }

  // 해당 카테고리의 포스트들 가져오기
  const categoryPosts = getPostsByCategory(validCategory)
  const categoryCounts = getCategoryCounts()

  // 메타데이터만 추출 (content 제외)
  const postsMetadata = extractPostMetadata(categoryPosts)

  return {
    category: validCategory,
    posts: postsMetadata,
    totalPosts: categoryPosts.length,
    categoryCounts,
    seo: {
      title: `${validCategory} 포스트`,
      description: `${validCategory} 카테고리의 모든 포스트를 확인하세요. 총 ${categoryPosts.length}개의 포스트가 있습니다.`
    }
  }
}
