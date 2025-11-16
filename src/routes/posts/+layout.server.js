import { allTags, getCategoryInfos } from '$lib/data/posts'

// Statically generate shared post layout data
export const prerender = true

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
  // 카테고리 정보를 서버에서 미리 계산
  const categoryInfos = getCategoryInfos()

  return {
    allTags,
    categoryInfos
  }
}
