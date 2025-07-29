import { createHash } from 'crypto'

/**
 * 포스트 목록을 기반으로 HTTP 캐싱을 위한 ETag와 Last-Modified 헤더를 생성합니다.
 * RSS Feed와 Sitemap XML에서 공통으로 사용되는 캐싱 로직으로, 포스트 내용이 변경될 때마다
 * 새로운 ETag를 생성하여 브라우저와 CDN의 캐시 무효화를 정확하게 처리합니다.
 *
 * @param {import('$lib/types').Post[]} posts - 캐싱 헤더 생성의 기준이 될 포스트 배열
 * @returns {{ etag: string, lastModified: string }} HTTP 캐싱 헤더 객체
 * @returns {string} returns.etag - SHA-1 해시 기반의 Entity Tag (RFC 7232 형식)
 * @returns {string} returns.lastModified - 가장 최신 포스트 날짜의 UTC 문자열 (RFC 7231 형식)
 */
export function generateCacheHeaders(posts) {
  // 모든 포스트의 slug와 날짜를 조합한 SHA-1 해시 기반 ETag 생성
  const postsHash = posts.map((post) => `${post.slug}-${post.updated || post.date}`).join('|')
  const etag = `"${createHash('sha1').update(postsHash).digest('base64')}"`

  // 모든 포스트에서 가장 최신 날짜 찾기 (updated 또는 date 중 최신)
  const latestDate = posts.reduce((latest, post) => {
    const postDate = new Date(post.updated || post.date)
    return postDate > latest ? postDate : latest
  }, new Date(0))

  return {
    etag,
    lastModified: latestDate.toUTCString()
  }
}
