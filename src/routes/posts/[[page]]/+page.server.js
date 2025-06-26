// 특정 태그 조합으로는 정적 생성 가능하도록 함
export const prerender = false

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

  // 날짜순으로 정렬 (최신순)
  filteredPosts = filteredPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const postsForPage = paginate(filteredPosts, { limit, page })

  // if page doesn't exist, 404
  if (postsForPage.length === 0 && page > 1) {
    throw error(404, 'Page not found')
  }

  // 다음 페이지 존재 여부 계산 (필터링된 포스트 기준)
  const hasNextPage = page * limit < filteredPosts.length

  // 모든 태그 수집 및 빈도 계산 - 한 번의 순회로 처리
  const tagCounts = {}
  const tagSet = new Set()

  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tag) {
          tagSet.add(tag)
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        }
      })
    }
  })

  // 태그를 빈도순으로 정렬하고, 빈도가 같으면 알파벳순으로 정렬
  let allTags = Array.from(tagSet).sort((a, b) => {
    // 빈도 내림차순 정렬
    const countDiff = tagCounts[b] - tagCounts[a]
    // 빈도가 같으면 알파벳 오름차순 정렬
    return countDiff !== 0 ? countDiff : a.localeCompare(b)
  })

  return {
    posts: postsForPage,
    page,
    limit,
    tagFilter,
    allTags,
    hasNextPage
  }
}
