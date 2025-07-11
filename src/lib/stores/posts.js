/**
 * 포스트 데이터 관리 스토어
 * 클라이언트 사이드에서 포스트 메타데이터를 관리
 */
import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'

// 포스트 메타데이터 스토어
export const postsMetadata = writable([])
export const allTags = writable([])
export const isLoading = writable(false)
export const error = writable(null)

// 필터링된 포스트 스토어
export const selectedTag = writable(null)
export const currentPage = writable(1)
export const postsPerPage = writable(10)

// 필터링된 포스트 계산
export const filteredPosts = derived(
  [postsMetadata, selectedTag],
  ([$postsMetadata, $selectedTag]) => {
    if (!$selectedTag) {
      return $postsMetadata
    }
    return $postsMetadata.filter((post) => post.tags && post.tags.includes($selectedTag))
  }
)

// 페이지네이션된 포스트
export const paginatedPosts = derived(
  [filteredPosts, currentPage, postsPerPage],
  ([$filteredPosts, $currentPage, $postsPerPage]) => {
    const start = ($currentPage - 1) * $postsPerPage
    const end = start + $postsPerPage
    return $filteredPosts.slice(start, end)
  }
)

// 총 페이지 수
export const totalPages = derived(
  [filteredPosts, postsPerPage],
  ([$filteredPosts, $postsPerPage]) => {
    return Math.ceil($filteredPosts.length / $postsPerPage)
  }
)

// 다음 페이지 존재 여부
export const hasNextPage = derived(
  [currentPage, totalPages],
  ([$currentPage, $totalPages]) => $currentPage < $totalPages
)

// 로딩 상태 추적 (중복 요청 방지)
let isLoadingRequest = false

/**
 * 포스트 메타데이터를 서버에서 로드
 */
export async function loadPostsMetadata() {
  if (!browser || isLoadingRequest) return

  isLoadingRequest = true
  isLoading.set(true)
  error.set(null)

  try {
    // 서버에서 메타데이터만 가져오기
    const response = await fetch('/api/posts-metadata')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    postsMetadata.set(data.posts)
    allTags.set(data.tags)
  } catch (err) {
    console.error('Failed to load posts metadata:', err)
    error.set(err.message)
  } finally {
    isLoading.set(false)
    isLoadingRequest = false
  }
}

/**
 * 태그 필터 설정
 */
export function setTagFilter(tag) {
  selectedTag.set(tag)
  currentPage.set(1) // 필터 변경 시 첫 페이지로 이동
}

/**
 * 태그 필터 초기화
 */
export function clearTagFilter() {
  selectedTag.set(null)
  currentPage.set(1)
}

/**
 * 페이지 설정
 */
export function setPage(page) {
  currentPage.set(page)
}

/**
 * 다음 페이지로 이동
 */
export function nextPage() {
  currentPage.update((page) => page + 1)
}

/**
 * 이전 페이지로 이동
 */
export function previousPage() {
  currentPage.update((page) => Math.max(1, page - 1))
}
