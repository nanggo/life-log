import { posts } from '$lib/data/posts'
import { error } from '@sveltejs/kit'
import { normalizeSlug, compareSlug } from '$lib/utils/posts'

// 빌드 시점에 정적 HTML 생성을 위해 prerender 활성화
export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params

  try {
    if (!slug) {
      throw error(404, 'Slug parameter is missing')
    }

    const decodedSlug = decodeURIComponent(slug)
    const normalizedRequestSlug = normalizeSlug(decodedSlug)

    // 1. 정확한 매칭 시도
    let post = posts.find((post) => post.slug === decodedSlug)

    // 2. 정규화된 매칭 시도
    if (!post) {
      post = posts.find((post) => compareSlug(post.slug, decodedSlug))
    }

    // 3. 부분 매칭 시도 (더 관대한 매칭)
    if (!post) {
      post = posts.find(
        (post) =>
          normalizeSlug(post.slug).includes(normalizedRequestSlug) ||
          normalizedRequestSlug.includes(normalizeSlug(post.slug))
      )
    }

    if (!post) {
      console.error(`Post not found: ${decodedSlug}`)
      throw error(404, `Post not found: ${decodedSlug}`)
    }

    return {
      post
    }
  } catch (err) {
    console.error(`Error loading post ${slug}:`, err)
    throw error(404, `Post not found: ${slug}`)
  }
}
