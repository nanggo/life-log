/**
 * TTL (Time To Live) 기능이 있는 메모리 캐시 클래스
 * Vercel Data Cache의 time-based revalidation 개념을 구현
 */
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expireAt: number }>()
  private readonly defaultTTL: number

  constructor(defaultTTLSeconds: number = 3600) {
    this.defaultTTL = defaultTTLSeconds * 1000 // 밀리초로 변환
  }

  /**
   * 캐시에 값을 저장합니다
   * @param key 캐시 키
   * @param value 저장할 값
   * @param ttlSeconds TTL (초 단위, 기본값: 생성자에서 설정한 값)
   */
  set(key: K, value: V, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this.defaultTTL / 1000) * 1000
    const expireAt = Date.now() + ttl

    this.cache.set(key, { value, expireAt })
  }

  /**
   * 캐시에서 값을 가져옵니다
   * @param key 캐시 키
   * @returns 캐시된 값 또는 undefined (만료된 경우)
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // 만료 시간 확인
    if (Date.now() > item.expireAt) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  /**
   * 캐시에 키가 존재하고 만료되지 않았는지 확인합니다
   * @param key 캐시 키
   * @returns 유효한 캐시가 있으면 true
   */
  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 특정 키의 캐시를 삭제합니다
   * @param key 삭제할 캐시 키
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 모든 캐시를 삭제합니다
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 만료된 캐시 항목들을 정리합니다
   * @returns 정리된 항목 수
   */
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * 현재 캐시 상태 정보를 반환합니다
   */
  getStats(): { size: number; expired: number } {
    const now = Date.now()
    let expired = 0

    for (const item of this.cache.values()) {
      if (now > item.expireAt) {
        expired++
      }
    }

    return {
      size: this.cache.size,
      expired
    }
  }
}

// 전역 TTL 캐시 인스턴스 (1시간 기본 TTL)
export const globalTTLCache = new TTLCache<string, any>(3600)
