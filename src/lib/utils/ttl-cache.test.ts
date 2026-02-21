import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { TTLCache } from './ttl-cache'

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and retrieves values', () => {
    const cache = new TTLCache<string, number>(60)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for missing keys', () => {
    const cache = new TTLCache<string, number>()
    expect(cache.get('missing')).toBeUndefined()
  })

  it('expires entries after TTL', () => {
    const cache = new TTLCache<string, number>(1) // 1 second
    cache.set('a', 1)

    vi.advanceTimersByTime(1001)
    expect(cache.get('a')).toBeUndefined()
  })

  it('supports custom TTL per entry', () => {
    const cache = new TTLCache<string, number>(60)
    cache.set('a', 1, 2) // 2 seconds

    vi.advanceTimersByTime(1500)
    expect(cache.get('a')).toBe(1)

    vi.advanceTimersByTime(600)
    expect(cache.get('a')).toBeUndefined()
  })

  it('has() returns true for valid entries', () => {
    const cache = new TTLCache<string, number>(60)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('has() returns false for expired entries', () => {
    const cache = new TTLCache<string, number>(1)
    cache.set('a', 1)

    vi.advanceTimersByTime(1001)
    expect(cache.has('a')).toBe(false)
  })

  it('delete() removes entries', () => {
    const cache = new TTLCache<string, number>(60)
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.get('a')).toBeUndefined()
  })

  it('delete() returns false for missing keys', () => {
    const cache = new TTLCache<string, number>(60)
    expect(cache.delete('nonexistent')).toBe(false)
  })

  it('clear() removes all entries', () => {
    const cache = new TTLCache<string, number>(60)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBeUndefined()
  })

  it('cleanup() removes expired entries and returns count', () => {
    const cache = new TTLCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3, 60) // long TTL

    vi.advanceTimersByTime(1001)
    const cleaned = cache.cleanup()
    expect(cleaned).toBe(2)
    expect(cache.get('c')).toBe(3)
  })

  it('getStats() returns size and expired count', () => {
    const cache = new TTLCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)

    expect(cache.getStats()).toEqual({ size: 2, expired: 0 })

    vi.advanceTimersByTime(1001)
    expect(cache.getStats()).toEqual({ size: 2, expired: 2 })
  })
})
