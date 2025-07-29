import { createHash } from 'crypto'

/**
 * 포스트 목록 기반으로 ETag와 Last-Modified 헤더를 생성합니다.
 * RSS와 Sitemap에서 공통으로 사용되는 캐싱 로직입니다.
 *
 * @param {Array} posts - 포스트 배열
 * @returns {Object} - { etag: string, lastModified: string }
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
    lastModified: new Date(latestDate).toUTCString()
  }
}
