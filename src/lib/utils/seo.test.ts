import { describe, expect, it } from 'vitest'

import { MIN_INDEXABLE_TAG_POSTS, isTagIndexable } from './seo'

describe('tag indexability', () => {
  it('indexes tags at or above the shared post threshold', () => {
    expect(isTagIndexable(MIN_INDEXABLE_TAG_POSTS - 1)).toBe(false)
    expect(isTagIndexable(MIN_INDEXABLE_TAG_POSTS)).toBe(true)
    expect(isTagIndexable(MIN_INDEXABLE_TAG_POSTS + 1)).toBe(true)
  })

  it('rejects invalid counts', () => {
    expect(isTagIndexable(Number.NaN)).toBe(false)
    expect(isTagIndexable(2.5)).toBe(false)
  })
})
