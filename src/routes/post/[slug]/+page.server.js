import { posts } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params

  // 정규화된 slug 비교를 위한 함수
  const normalizeSlug = (s) => s.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_')

  // 정규화된 slug로 포스트 찾기
  const normalizedRequestSlug = normalizeSlug(slug)
  const post = posts.find((post) => normalizeSlug(post.slug) === normalizedRequestSlug)

  if (!post) {
    throw error(404, 'Post not found')
  }

  return {
    post
  }
}
