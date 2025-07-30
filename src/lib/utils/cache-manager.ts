import { TTLCache } from './ttl-cache'

/**
 * 태그 기반 캐시 무효화를 지원하는 캐시 매니저
 */
export class CacheManager {
  private cache = new TTLCache<string, any>(3600)
  private tagToKeys = new Map<string, Set<string>>()

  /**
   * 캐시에 값을 저장하고 태그를 연결합니다
   * @param key 캐시 키
   * @param value 저장할 값
   * @param tags 연결할 태그들
   * @param ttlSeconds TTL (초 단위)
   */
  set(key: string, value: any, tags: string[] = [], ttlSeconds?: number): void {
    this.cache.set(key, value, ttlSeconds)

    // 태그와 키 매핑 저장
    for (const tag of tags) {
      if (!this.tagToKeys.has(tag)) {
        this.tagToKeys.set(tag, new Set())
      }
      this.tagToKeys.get(tag)!.add(key)
    }
  }

  /**
   * 캐시에서 값을 가져옵니다
   * @param key 캐시 키
   * @returns 캐시된 값 또는 undefined
   */
  get(key: string): any | undefined {
    return this.cache.get(key)
  }

  /**
   * 캐시에 키가 존재하는지 확인합니다
   * @param key 캐시 키
   * @returns 유효한 캐시가 있으면 true
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * 특정 태그와 연결된 모든 캐시를 무효화합니다
   * @param tag 무효화할 태그
   * @returns 무효화된 키의 수
   */
  invalidateByTag(tag: string): number {
    const keys = this.tagToKeys.get(tag)
    if (!keys) return 0

    let invalidatedCount = 0
    for (const key of keys) {
      if (this.cache.delete(key)) {
        invalidatedCount++
      }
    }

    // 태그 매핑도 정리
    this.tagToKeys.delete(tag)

    return invalidatedCount
  }

  /**
   * 여러 태그와 연결된 모든 캐시를 무효화합니다
   * @param tags 무효화할 태그들
   * @returns 무효화된 키의 총 수
   */
  invalidateByTags(tags: string[]): number {
    let totalInvalidated = 0
    for (const tag of tags) {
      totalInvalidated += this.invalidateByTag(tag)
    }
    return totalInvalidated
  }

  /**
   * 특정 키의 캐시를 삭제합니다
   * @param key 삭제할 캐시 키
   */
  delete(key: string): boolean {
    // 태그 매핑에서도 키 제거
    for (const [tag, keys] of this.tagToKeys.entries()) {
      keys.delete(key)
      if (keys.size === 0) {
        this.tagToKeys.delete(tag)
      }
    }

    return this.cache.delete(key)
  }

  /**
   * 모든 캐시를 삭제합니다
   */
  clear(): void {
    this.cache.clear()
    this.tagToKeys.clear()
  }

  /**
   * 만료된 캐시 항목들을 정리합니다
   */
  cleanup(): number {
    const cleanedCount = this.cache.cleanup()

    // 태그 매핑에서도 삭제된 키들 정리
    for (const [tag, keys] of this.tagToKeys.entries()) {
      for (const key of keys) {
        if (!this.cache.has(key)) {
          keys.delete(key)
        }
      }
      if (keys.size === 0) {
        this.tagToKeys.delete(tag)
      }
    }

    return cleanedCount
  }

  /**
   * 캐시 상태 정보를 반환합니다
   */
  getStats(): {
    cacheSize: number
    tagCount: number
    expiredCount: number
  } {
    const cacheStats = this.cache.getStats()

    return {
      cacheSize: cacheStats.size,
      tagCount: this.tagToKeys.size,
      expiredCount: cacheStats.expired
    }
  }
}

// 전역 캐시 매니저 인스턴스
export const globalCacheManager = new CacheManager()

// 캐시 태그 상수
export const CACHE_TAGS = {
  POSTS: 'posts',
  TAGS: 'tags',
  HOME: 'home',
  PAGINATION: 'pagination'
} as const

// 캐시 키 생성 헬퍼
export const generateCacheKey = {
  posts: (tag?: string, page: number = 1, limit: number = 10) =>
    `posts:${tag || 'all'}:${page}:${limit}`,

  allPosts: (page: number = 1, limit: number = 10) => `all-posts:${page}:${limit}`,

  postDetail: (slug: string) => `post:${slug}`,

  tagList: () => 'tags:all',

  homeData: () => 'home:data'
}
