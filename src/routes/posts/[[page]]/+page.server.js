// 클라이언트 사이드에서만 태그 필터링 처리
export const prerender = true

import { allTags, posts } from '$lib/data/posts'
import { paginate } from '$lib/util'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  let page = params.page ? parseInt(params.page) : 1
  let limit = 10
  // 태그 필터링은 클라이언트 사이드에서만 처리

  const postsForPage = paginate(posts, { limit, page })

  // if page doesn't exist, 404
  if (postsForPage.length === 0 && page > 1) {
    throw error(404, 'Page not found')
  }

  const hasNextPage = page * limit < posts.length

  return {
    posts: postsForPage,
    page,
    limit,
    allTags,
    hasNextPage
  }
}
