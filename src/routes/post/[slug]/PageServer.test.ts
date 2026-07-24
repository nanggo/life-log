// Route-level contract tests for server-generated post metadata.
import { describe, expect, it, vi } from 'vitest'

const { mockPost, mockBodyImagePost } = vi.hoisted(() => ({
  mockPost: {
    slug: 'current-post',
    title: '현재 글',
    description: '현재 글 설명',
    date: '2026-07-10',
    displayDate: '2026년 7월 10일',
    category: '개발',
    tags: ['svelte'],
    preview: { html: '<p>현재 글 설명</p>', text: '현재 글 설명' },
    readingTime: 2,
    image: '/current-post/cover.webp',
    isIndexFile: false,
    headings: [],
    previous: { slug: 'older-post', title: '이전 글' },
    next: { slug: 'newer-post', title: '다음 글' }
  },
  mockBodyImagePost: {
    slug: 'body-image-post',
    title: '본문 이미지 글',
    description: '본문 이미지 글 설명',
    date: '2026-07-11',
    displayDate: '2026년 7월 11일',
    category: '개발',
    tags: ['image'],
    preview: { html: '<p>본문 이미지 글 설명</p>', text: '본문 이미지 글 설명' },
    readingTime: 1,
    firstImageUrl: '/body-image-post/body.png',
    isIndexFile: false,
    headings: []
  }
}))

vi.mock('$lib/data/posts', () => ({ posts: [mockPost, mockBodyImagePost] }))
vi.mock('$lib/data/image-manifest.json', () => ({
  default: {
    '/current-post/cover.webp': {
      width: 1200,
      height: 800,
      variants: [672, 1200]
    },
    '/body-image-post/body.png': {
      width: 900,
      height: 600,
      variants: [672, 900]
    }
  }
}))
vi.mock('$lib/info', () => ({
  website: 'https://example.com',
  author: '낭고',
  defaultOgImage: 'https://example.com/og.png',
  name: '낭고넷'
}))

import { load } from './+page.server'

describe('포스트 상세 서버 로드', () => {
  it('화면과 동일한 4단계 breadcrumb JSON-LD를 제공한다', async () => {
    const result = await load({ params: { slug: mockPost.slug } } as never)

    expect(result).toBeTruthy()
    if (!result) throw new Error('포스트 데이터가 없습니다.')

    const breadcrumb = JSON.parse(result.breadcrumbLd as string)

    expect(breadcrumb.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://example.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '포스트',
        item: 'https://example.com/posts'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '개발',
        item: 'https://example.com/posts/category/%EA%B0%9C%EB%B0%9C'
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: '현재 글',
        item: 'https://example.com/post/current-post'
      }
    ])
  })

  it('이전·다음 글 메타데이터를 상세 페이지에 전달한다', async () => {
    const result = await load({ params: { slug: mockPost.slug } } as never)

    expect(result).toBeTruthy()
    if (!result) throw new Error('포스트 데이터가 없습니다.')

    expect(result.post).toMatchObject({
      previous: mockPost.previous,
      next: mockPost.next
    })
  })

  it('로컬 대표 이미지의 반응형 전송 정보를 전달한다', async () => {
    const result = await load({ params: { slug: mockPost.slug } } as never)

    expect(result).toBeTruthy()
    if (!result) throw new Error('포스트 데이터가 없습니다.')

    expect(result.heroImage).toEqual({
      src: '/current-post/cover.webp',
      srcset: '/current-post/cover-672w.webp 672w, /current-post/cover-1200w.webp 1200w',
      sizes: '(min-width: 704px) 672px, 100vw',
      width: 1200,
      height: 800
    })
  })

  it('frontmatter 대표 이미지가 없으면 첫 본문 이미지 정보를 전달한다', async () => {
    const result = await load({ params: { slug: mockBodyImagePost.slug } } as never)

    expect(result).toBeTruthy()
    if (!result) throw new Error('포스트 데이터가 없습니다.')

    expect(result.heroImage).toEqual({
      src: '/body-image-post/body.png',
      srcset: '/body-image-post/body-672w.webp 672w, /body-image-post/body-900w.webp 900w',
      sizes: '(min-width: 704px) 672px, 100vw',
      width: 900,
      height: 600
    })
  })
})
