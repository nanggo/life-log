import { describe, it, expect } from 'vitest'

import { paginate, extractPostMetadata } from './util'

describe('paginate', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('returns first page', () => {
    expect(paginate(data, { page: 1, limit: 3 })).toEqual([1, 2, 3])
  })

  it('returns second page', () => {
    expect(paginate(data, { page: 2, limit: 3 })).toEqual([4, 5, 6])
  })

  it('returns last page with fewer items', () => {
    expect(paginate(data, { page: 4, limit: 3 })).toEqual([10])
  })

  it('returns empty array for out-of-range page', () => {
    expect(paginate(data, { page: 5, limit: 3 })).toEqual([])
  })

  it('defaults to page 1 when page is not specified', () => {
    expect(paginate(data, { limit: 5 })).toEqual([1, 2, 3, 4, 5])
  })

  it('returns all data when limit is 0 (falsy)', () => {
    expect(paginate(data, { limit: 0 })).toEqual(data)
  })
})

describe('extractPostMetadata', () => {
  it('extracts metadata and strips img tags from preview html', () => {
    const posts = [
      {
        slug: 'test-post',
        title: 'Test Post',
        description: 'A test',
        date: '2024-01-01',
        category: 'development',
        tags: ['test'],
        draft: false,
        preview: {
          html: '<p>Hello <img src="test.jpg" /> world</p>',
          text: 'Hello world'
        },
        author: 'Test',
        readingTime: 5,
        image: 'test.jpg',
        content: 'full content here'
      }
    ] as any

    const result = extractPostMetadata(posts)

    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('test-post')
    expect(result[0].preview.html).toBe('<p>Hello  world</p>')
    expect(result[0].preview.html).not.toContain('<img')
    // Should not include content field
    expect((result[0] as any).content).toBeUndefined()
  })

  it('handles self-closing img tags', () => {
    const posts = [
      {
        slug: 's',
        title: 't',
        description: '',
        date: '2024-01-01',
        category: 'daily',
        tags: [],
        draft: false,
        preview: { html: '<img src="a.jpg"><img src="b.jpg"/>', text: '' },
        author: '',
        readingTime: 1,
        image: null
      }
    ] as any

    const result = extractPostMetadata(posts)
    expect(result[0].preview.html).toBe('')
  })
})
