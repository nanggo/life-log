/**
 * slug를 정규화하는 함수입니다.
 * 대소문자 구분 없이 비교하고, 특수문자와 공백을 일관되게 처리합니다.
 *
 * @param {string} slug - 정규화할 slug 문자열
 * @returns {string} 정규화된 slug 문자열
 */
export function normalizeSlug(slug: string): string {
  if (!slug) return ''

  return slug
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // 발음 구별 기호 제거
}

/**
 * 안전한 URL slug를 생성합니다.
 *
 * @param {string} slug - 원본 slug 문자열
 * @returns {string} URL에 안전한 slug 문자열
 */
export function createSafeSlug(slug: string): string {
  if (!slug) return ''

  return encodeURIComponent(slug.trim().toLowerCase().replace(/\s+/g, '-'))
}

/**
 * slug 비교 함수입니다.
 * 정규화된 slug를 사용하여 두 slug가 동일한지 확인합니다.
 *
 * @param {string} slug1 - 첫 번째 slug
 * @param {string} slug2 - 두 번째 slug
 * @returns {boolean} 두 slug가 일치하는지 여부
 */
export function compareSlug(slug1: string, slug2: string): boolean {
  return normalizeSlug(slug1) === normalizeSlug(slug2)
}
