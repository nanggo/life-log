/**
 * URL 관련 유틸리티 함수들
 */

/**
 * 태그를 포함한 URL을 생성합니다
 * @param tag - 태그 이름
 * @returns 생성된 URL 문자열
 */
export function createTagUrl(tag: string): string {
  const params = new URLSearchParams()
  params.set('tag', tag)
  return `/posts?${params.toString()}`
}

/**
 * 페이지와 태그를 포함한 URL을 생성합니다
 * @param page - 페이지 번호
 * @param tag - 태그 이름 (선택사항)
 * @returns 생성된 URL 문자열
 */
export function createPageUrl(page: number, tag?: string | null): string {
  const base = page > 1 ? `/posts/${page}` : '/posts'

  if (tag) {
    const params = new URLSearchParams()
    params.set('tag', tag)
    return `${base}?${params.toString()}`
  }

  return base
}
