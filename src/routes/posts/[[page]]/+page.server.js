import { posts } from '$lib/data/posts'
import { paginate } from '$lib/util'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
  let page = params.page ? parseInt(params.page) : 1
  let limit = 10
  const tagFilter = url.searchParams.get('tag')

  // 태그 필터링 로직
  let filteredPosts = posts
  if (tagFilter) {
    filteredPosts = posts.filter((post) => post.tags && post.tags.includes(tagFilter))
  }

  const postsForPage = paginate(filteredPosts, { limit, page })

  // if page doesn't exist, 404
  if (postsForPage.length === 0 && page > 1) {
    throw error(404, 'Page not found')
  }

  // 다음 페이지 존재 여부 계산 (필터링된 포스트 기준)
  const hasNextPage = page * limit < filteredPosts.length

  // 모든 태그 수집
  const allTags = [...new Set(posts.flatMap((post) => post.tags || []).filter(Boolean))]

  return {
    posts: postsForPage,
    page,
    limit,
    tagFilter,
    allTags,
    hasNextPage
  }
}
