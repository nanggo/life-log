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

  // 모든 태그 수집 (let으로 변경하여 재할당 가능하게 함)
  let allTags = [...new Set(posts.flatMap((post) => post.tags || []).filter(Boolean))]

  // 선택된 태그가 있으면 맨 앞으로 이동
  if (tagFilter && allTags.includes(tagFilter)) {
    // 선택된 태그를 배열에서 제거
    const filteredTags = allTags.filter((tag) => tag !== tagFilter)
    // 선택된 태그를 맨 앞에 추가
    allTags = [tagFilter, ...filteredTags]
  }

  return {
    posts: postsForPage,
    page,
    limit,
    tagFilter,
    allTags,
    hasNextPage
  }
}
