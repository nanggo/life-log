import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { CacheManager, generateCacheKey, CACHE_TAGS } from './cache-manager'

describe('CacheManager', () => {
  let manager: CacheManager

  beforeEach(() => {
    vi.useFakeTimers()
    manager = new CacheManager()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and retrieves values', () => {
    manager.set('key1', 'value1')
    expect(manager.get('key1')).toBe('value1')
  })

  it('returns undefined for missing keys', () => {
    expect(manager.get('missing')).toBeUndefined()
  })

  it('has() checks existence', () => {
    manager.set('key1', 'value1')
    expect(manager.has('key1')).toBe(true)
    expect(manager.has('missing')).toBe(false)
  })

  it('associates tags with keys', () => {
    manager.set('post:1', { title: 'Post 1' }, ['posts', 'home'])
    manager.set('post:2', { title: 'Post 2' }, ['posts'])
    expect(manager.get('post:1')).toEqual({ title: 'Post 1' })
    expect(manager.get('post:2')).toEqual({ title: 'Post 2' })
  })

  it('invalidateByTag removes all entries with that tag', () => {
    manager.set('post:1', 'v1', ['posts'])
    manager.set('post:2', 'v2', ['posts'])
    manager.set('home', 'v3', ['home'])

    const count = manager.invalidateByTag('posts')
    expect(count).toBe(2)
    expect(manager.get('post:1')).toBeUndefined()
    expect(manager.get('post:2')).toBeUndefined()
    expect(manager.get('home')).toBe('v3')
  })

  it('invalidateByTag returns 0 for unknown tag', () => {
    expect(manager.invalidateByTag('nonexistent')).toBe(0)
  })

  it('invalidateByTags removes entries for multiple tags', () => {
    manager.set('post:1', 'v1', ['posts'])
    manager.set('home', 'v2', ['home'])
    manager.set('tags', 'v3', ['tags'])

    const count = manager.invalidateByTags(['posts', 'home'])
    expect(count).toBe(2)
    expect(manager.get('post:1')).toBeUndefined()
    expect(manager.get('home')).toBeUndefined()
    expect(manager.get('tags')).toBe('v3')
  })

  it('delete() removes entry and cleans tag mappings', () => {
    manager.set('key1', 'v1', ['tag1'])
    expect(manager.delete('key1')).toBe(true)
    expect(manager.get('key1')).toBeUndefined()
    // Invalidating tag1 should return 0 since key was already deleted
    expect(manager.invalidateByTag('tag1')).toBe(0)
  })

  it('clear() removes everything', () => {
    manager.set('a', 1, ['t1'])
    manager.set('b', 2, ['t2'])
    manager.clear()
    expect(manager.get('a')).toBeUndefined()
    expect(manager.get('b')).toBeUndefined()
    expect(manager.getStats().cacheSize).toBe(0)
    expect(manager.getStats().tagCount).toBe(0)
  })

  it('cleanup() removes expired entries and cleans tag mappings', () => {
    manager.set('a', 1, ['t1'], 1) // 1 second TTL
    manager.set('b', 2, ['t1'], 60) // 60 second TTL

    vi.advanceTimersByTime(1001)
    const cleaned = manager.cleanup()
    expect(cleaned).toBe(1)
    expect(manager.get('a')).toBeUndefined()
    expect(manager.get('b')).toBe(2)
  })

  it('getStats() returns correct counts', () => {
    manager.set('a', 1, ['t1'])
    manager.set('b', 2, ['t1', 't2'])

    const stats = manager.getStats()
    expect(stats.cacheSize).toBe(2)
    expect(stats.tagCount).toBe(2)
    expect(stats.expiredCount).toBe(0)
  })
})

describe('generateCacheKey', () => {
  it('generates posts key', () => {
    expect(generateCacheKey.posts()).toBe('posts:all:1:10')
    expect(generateCacheKey.posts('svelte')).toBe('posts:svelte:1:10')
    expect(generateCacheKey.posts('svelte', 2, 20)).toBe('posts:svelte:2:20')
  })

  it('generates postDetail key', () => {
    expect(generateCacheKey.postDetail('my-post')).toBe('post:my-post')
  })

  it('generates tagList key', () => {
    expect(generateCacheKey.tagList()).toBe('tags:all')
  })

  it('generates homeData key', () => {
    expect(generateCacheKey.homeData()).toBe('home:data')
  })
})

describe('CACHE_TAGS', () => {
  it('has expected tag values', () => {
    expect(CACHE_TAGS.POSTS).toBe('posts')
    expect(CACHE_TAGS.TAGS).toBe('tags')
    expect(CACHE_TAGS.HOME).toBe('home')
    expect(CACHE_TAGS.PAGINATION).toBe('pagination')
  })
})
