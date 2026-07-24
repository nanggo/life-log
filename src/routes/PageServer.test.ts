import { describe, expect, it, vi } from 'vitest'

const { mockPosts } = vi.hoisted(() => ({
  mockPosts: [
    {
      title: '최신 글',
      description: '홈 payload 테스트',
      slug: 'latest-post',
      date: '2026-07-24',
      displayDate: '2026년 7월 24일',
      category: '개발',
      tags: ['svelte'],
      preview: {
        html: '<p>Preview <img src="/latest-post/cover.webp" /></p>',
        text: 'Preview'
      },
      readingTime: 3,
      headings: [{ id: 'heading', text: 'Heading', level: 2 }],
      previous: { slug: 'previous-post', title: '이전 글' },
      next: { slug: 'next-post', title: '다음 글' }
    }
  ]
}))

vi.mock('$lib/data/posts', () => ({
  posts: mockPosts,
  getCategoryInfos: () => []
}))

vi.mock('$lib/info', () => ({
  name: '낭고넷'
}))

import { load } from './+page.server'

describe('홈 서버 로드', () => {
  it('최신 다섯 글의 메타데이터만 직렬화한다', async () => {
    const result = await load({} as never)
    expect(result).toBeTruthy()
    if (!result) throw new Error('홈 데이터가 없습니다.')

    const post = result.posts[0]

    expect(result.posts).toHaveLength(1)
    expect(post).not.toHaveProperty('headings')
    expect(post).not.toHaveProperty('previous')
    expect(post).not.toHaveProperty('next')
    expect(post.preview.html).toBe('<p>Preview </p>')
  })
})
