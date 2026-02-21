import { describe, it, expect } from 'vitest'

import { generateCacheHeaders } from './cache.js'

describe('generateCacheHeaders', () => {
  const posts = [
    { slug: 'post-1', date: '2024-06-01', updated: '2024-06-15' },
    { slug: 'post-2', date: '2024-05-01' },
    { slug: 'post-3', date: '2024-07-01' }
  ]

  it('returns etag and lastModified', () => {
    const headers = generateCacheHeaders(posts)
    expect(headers).toHaveProperty('etag')
    expect(headers).toHaveProperty('lastModified')
  })

  it('etag is quoted string', () => {
    const { etag } = generateCacheHeaders(posts)
    expect(etag).toMatch(/^".*"$/)
  })

  it('lastModified is a valid UTC date string', () => {
    const { lastModified } = generateCacheHeaders(posts)
    expect(new Date(lastModified).toString()).not.toBe('Invalid Date')
  })

  it('picks latest date across date and updated fields', () => {
    const { lastModified } = generateCacheHeaders(posts)
    // post-3 has date 2024-07-01 which is the latest
    const parsed = new Date(lastModified)
    expect(parsed.getUTCFullYear()).toBe(2024)
    expect(parsed.getUTCMonth()).toBe(6) // July = 6 (0-indexed)
  })

  it('produces different etags for different content', () => {
    const headers1 = generateCacheHeaders(posts)
    const headers2 = generateCacheHeaders([{ slug: 'other', date: '2024-01-01' }])
    expect(headers1.etag).not.toBe(headers2.etag)
  })

  it('produces same etag for same content', () => {
    const headers1 = generateCacheHeaders(posts)
    const headers2 = generateCacheHeaders(posts)
    expect(headers1.etag).toBe(headers2.etag)
  })
})
