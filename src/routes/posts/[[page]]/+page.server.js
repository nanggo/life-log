import { allTags, posts as allPosts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'
import { error } from '@sveltejs/kit'

export const prerender = false

/** @type {import('./$types').PageServerLoad} */
export function load({ params, url }) {
  const page = params.page ? parseInt(params.page) : 1
  const limit = 10
  const tag = url.searchParams.get('tag')

  // 태그가 있으면 포스트 필터링
  const filteredPosts = tag ? allPosts.filter((post) => post.tags.includes(tag)) : allPosts

  const postsMetadata = extractPostMetadata(filteredPosts)

  const totalPosts = postsMetadata.length
  const totalPages = Math.ceil(totalPosts / limit)

  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found')
  }

  // 페이지네이션 적용
  const paginatedPosts = postsMetadata.slice((page - 1) * limit, page * limit)

  return {
    posts: paginatedPosts,
    page,
    limit,
    allTags,
    totalPosts,
    totalPages,
    tag
  }
}
