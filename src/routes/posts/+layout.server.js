import { allTags, posts as allPosts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'

// Statically generate all post layout data for client-side filtering
export const prerender = true

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
  // 전체 포스트 메타데이터 (클라이언트에서 필터링용)
  const allPostsMetadata = extractPostMetadata(allPosts)

  return {
    allPosts: allPostsMetadata,
    allTags
  }
}
