import { describe, it, expect } from 'vitest'

import { createTagUrl, createPageUrl } from './url-helpers'

describe('createTagUrl', () => {
  it('creates URL with tag parameter', () => {
    expect(createTagUrl('svelte')).toBe('/posts?tag=svelte')
  })

  it('encodes special characters', () => {
    expect(createTagUrl('c++')).toBe('/posts?tag=c%2B%2B')
  })

  it('handles Korean tags', () => {
    const url = createTagUrl('개발')
    expect(url).toContain('/posts?tag=')
    expect(url).toContain('%')
  })
})

describe('createPageUrl', () => {
  it('returns /posts for page 1', () => {
    expect(createPageUrl(1)).toBe('/posts')
  })

  it('returns /posts/N for page > 1', () => {
    expect(createPageUrl(2)).toBe('/posts/2')
    expect(createPageUrl(10)).toBe('/posts/10')
  })

  it('appends tag parameter', () => {
    expect(createPageUrl(1, 'svelte')).toBe('/posts?tag=svelte')
    expect(createPageUrl(3, 'react')).toBe('/posts/3?tag=react')
  })

  it('ignores null/empty tag', () => {
    expect(createPageUrl(1, null)).toBe('/posts')
    expect(createPageUrl(2, null)).toBe('/posts/2')
  })
})
