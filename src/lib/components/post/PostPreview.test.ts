import { render, screen } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import PostPreview from './PostPreview.svelte'

import type { Post } from '$lib/types'
import { Category } from '$lib/types/blog'

// Mock createSafeSlug function
vi.mock('$lib/utils/posts', () => ({
  createSafeSlug: vi.fn((slug: string) => slug)
}))

describe('PostPreview 컴포넌트', () => {
  const mockPost: Post = {
    title: '테스트 포스트 제목',
    description: '테스트 포스트 설명',
    slug: 'test-post-slug',
    tags: ['JavaScript', 'Svelte', 'TypeScript', 'Node.js'],
    date: '2024-01-15',
    category: Category.DEVELOPMENT,
    preview: {
      html: '<p>이것은 테스트 포스트의 미리보기 내용입니다.</p>',
      text: '이것은 테스트 포스트의 미리보기 내용입니다.'
    },
    readingTime: 5,
    headings: [],
    isIndexFile: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('포스트 카드가 올바르게 렌더링된다', () => {
    render(PostPreview, { post: mockPost })

    expect(screen.getByText('테스트 포스트 제목')).toBeInTheDocument()
    expect(screen.getByText('이것은 테스트 포스트의 미리보기 내용입니다.')).toBeInTheDocument()
  })

  it('카드가 올바른 링크를 가진다', () => {
    render(PostPreview, { post: mockPost })

    const cardLink = document.querySelector('a[href="/post/test-post-slug"]')
    expect(cardLink).toBeInTheDocument()
    expect(cardLink).toHaveAttribute('data-sveltekit-preload-data', 'tap')
  })

  it('최대 태그 개수만큼 태그가 표시된다', () => {
    render(PostPreview, { post: mockPost, maxTagsToShow: 2 })

    // 처음 2개 태그만 표시되어야 함
    expect(screen.getByText('#JavaScript')).toBeInTheDocument()
    expect(screen.getByText('#Svelte')).toBeInTheDocument()

    // 3번째, 4번째 태그는 표시되지 않아야 함
    expect(screen.queryByText('#TypeScript')).not.toBeInTheDocument()
    expect(screen.queryByText('#Node.js')).not.toBeInTheDocument()
  })

  it('숨겨진 태그가 있을 때 +n개 버튼이 표시된다', () => {
    render(PostPreview, { post: mockPost, maxTagsToShow: 2 })

    const moreButton = screen.getByText('+2개')
    expect(moreButton).toBeInTheDocument()
  })

  it('숨겨진 태그가 없을 때 +n개 버튼이 표시되지 않는다', () => {
    render(PostPreview, { post: mockPost, maxTagsToShow: 5 })

    expect(screen.queryByText(/\+\d+개/)).not.toBeInTheDocument()
  })

  it('태그가 올바른 링크를 가진다', () => {
    render(PostPreview, { post: mockPost })

    const jsTag = screen.getByText('#JavaScript')
    expect(jsTag.closest('a')).toHaveAttribute('href', '/tags/JavaScript')
  })

  it('더보기 버튼이 포스트 페이지 링크를 가진다', () => {
    render(PostPreview, { post: mockPost, maxTagsToShow: 2 })

    const moreButton = screen.getByText('+2개')
    expect(moreButton.closest('a')).toHaveAttribute('href', '/post/test-post-slug')
  })

  it('태그 링크에 preload 속성이 있다', () => {
    render(PostPreview, { post: mockPost })

    const jsTag = screen.getByText('#JavaScript')
    const link = jsTag.closest('a')
    expect(link).toHaveAttribute('data-sveltekit-preload-data', 'tap')
  })

  it('특수 문자가 포함된 태그가 올바르게 인코딩된다', () => {
    const postWithSpecialTags: Post = {
      ...mockPost,
      tags: ['C++', 'React.js', '한글태그']
    }

    render(PostPreview, { post: postWithSpecialTags })

    const cppTag = screen.getByText('#C++')
    expect(cppTag.closest('a')).toHaveAttribute('href', '/tags/C%2B%2B')

    const reactTag = screen.getByText('#React.js')
    expect(reactTag.closest('a')).toHaveAttribute('href', '/tags/React.js')

    const koreanTag = screen.getByText('#한글태그')
    expect(koreanTag.closest('a')).toHaveAttribute(
      'href',
      '/tags/%ED%95%9C%EA%B8%80%ED%83%9C%EA%B7%B8'
    )
  })

  it('Read 액션 버튼이 올바르게 렌더링된다', () => {
    render(PostPreview, { post: mockPost })

    expect(screen.getByText('Read')).toBeInTheDocument()

    // ArrowRightIcon이 함께 렌더링되는지 확인
    const readSection = screen.getByText('Read').closest('div')
    expect(readSection).toHaveClass('flex', 'items-center', 'text-teal-500')
  })

  it('태그가 없는 포스트도 올바르게 렌더링된다', () => {
    const postWithoutTags: Post = {
      ...mockPost,
      tags: []
    }

    render(PostPreview, { post: postWithoutTags })

    expect(screen.getByText('테스트 포스트 제목')).toBeInTheDocument()
    expect(screen.getByText('이것은 테스트 포스트의 미리보기 내용입니다.')).toBeInTheDocument()
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument()
  })

  it('null 태그 배열이 있는 포스트도 올바르게 렌더링된다', () => {
    const postWithNullTags: Post = {
      ...mockPost,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags: null as any
    }

    render(PostPreview, { post: postWithNullTags })

    expect(screen.getByText('테스트 포스트 제목')).toBeInTheDocument()
    expect(screen.getByText('이것은 테스트 포스트의 미리보기 내용입니다.')).toBeInTheDocument()
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument()
  })

  it('빈 slug일 때 안전한 URL이 생성된다', () => {
    const postWithEmptySlug: Post = {
      ...mockPost,
      slug: ''
    }

    render(PostPreview, { post: postWithEmptySlug })

    const cardLink = document.querySelector('a[href="/posts"]')
    expect(cardLink).toBeInTheDocument()
  })

  it('미리보기 HTML 콘텐츠가 올바르게 렌더링된다', () => {
    const postWithRichPreview: Post = {
      ...mockPost,
      preview: {
        html: '<p>테스트 <strong>강조</strong> 텍스트</p>',
        text: '테스트 강조 텍스트'
      }
    }

    render(PostPreview, { post: postWithRichPreview })

    // HTML이 올바르게 렌더링되는지 확인
    const strongElement = document.querySelector('strong')
    expect(strongElement).toBeInTheDocument()
    expect(strongElement).toHaveTextContent('강조')
  })

  it('태그 버튼에 올바른 스타일이 적용된다', () => {
    render(PostPreview, { post: mockPost })

    const tagButton = screen.getByText('#JavaScript')
    expect(tagButton).toHaveClass(
      'flex-shrink-0',
      'px-3',
      'py-2',
      'text-xs',
      'font-medium',
      'rounded-full',
      'transition-all',
      'whitespace-nowrap'
    )
    expect(tagButton).toHaveClass('cursor-pointer')
  })

  it('더보기 버튼에 올바른 스타일이 적용된다', () => {
    render(PostPreview, { post: mockPost, maxTagsToShow: 2 })

    const moreButton = screen.getByText('+2개')
    expect(moreButton).toHaveClass(
      'flex-shrink-0',
      'px-3',
      'py-2',
      'text-xs',
      'font-medium',
      'rounded-full',
      'transition-all',
      'whitespace-nowrap'
    )
    expect(moreButton).toHaveClass('cursor-pointer')
  })
})
