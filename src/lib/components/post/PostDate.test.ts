import { render, screen } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import PostDate from './PostDate.svelte'

import type { Post } from '$lib/types'

// Mock date-fns functions
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatString: string) => {
    if (formatString === 'MMMM d, yyyy') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    return date.toString()
  }),
  parseISO: vi.fn((dateString: string) => new Date(dateString)),
  isValid: vi.fn((date: Date) => !isNaN(date.getTime()))
}))

describe('PostDate 컴포넌트', () => {
  const mockPost: Post = {
    title: '테스트 포스트',
    description: '테스트 포스트 설명',
    slug: 'test-post',
    tags: ['JavaScript'],
    date: '2024-01-15',
    readingTime: '5분 읽기',
    preview: { html: '', text: '' },
    headings: [],
    isIndexFile: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('날짜와 읽기 시간이 올바르게 렌더링된다', () => {
    render(PostDate, { post: mockPost, decorate: false, class: '' })

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
    expect(screen.getByText('5분 읽기')).toBeInTheDocument()
  })

  it('datetime 속성이 올바르게 설정된다', () => {
    render(PostDate, { post: mockPost, decorate: false, class: '' })

    const timeElement = screen.getByText('January 15, 2024')
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15')
  })

  it('decorate가 true일 때 데코레이션 스타일이 적용된다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: true, class: '' })

    const containerElement = container.querySelector('.relative.z-10.order-first.mb-3')
    expect(containerElement).toHaveClass('pl-3.5')

    const decoration = container.querySelector('.absolute.inset-y-0.left-0')
    expect(decoration).toBeInTheDocument()

    const decorationBar = decoration?.querySelector('.h-full.w-0\\.5.rounded-full')
    expect(decorationBar).toHaveClass('bg-zinc-200', 'dark:bg-zinc-500')
  })

  it('decorate가 false일 때 데코레이션이 표시되지 않는다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: false, class: '' })

    const containerElement = container.querySelector('.relative.z-10.order-first.mb-3')
    expect(containerElement).not.toHaveClass('pl-3.5')

    const decoration = container.querySelector('.absolute.inset-y-0.left-0')
    expect(decoration).not.toBeInTheDocument()
  })

  it('collapsed가 false일 때 세로 레이아웃으로 표시된다', () => {
    const { container } = render(PostDate, {
      post: mockPost,
      decorate: false,
      collapsed: false,
      class: ''
    })

    const innerFlexContainer = screen.getByText(mockPost.readingTime).parentElement // 두 번째 .flex 요소 (내부 flex 컨테이너)
    expect(innerFlexContainer).toHaveClass('flex-col')

    // 구분자(•)가 표시되지 않아야 함
    expect(container.querySelector('.mx-1')).not.toBeInTheDocument()
  })

  it('collapsed가 true일 때 가로 레이아웃으로 표시된다', () => {
    const { container } = render(PostDate, {
      post: mockPost,
      decorate: false,
      collapsed: true,
      class: ''
    })

    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).not.toHaveClass('flex-col')

    // 구분자(•)가 표시되어야 함
    const separator = container.querySelector('.mx-1')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveTextContent('•')
  })

  it('커스텀 클래스가 올바르게 적용된다', () => {
    const { container } = render(PostDate, {
      post: mockPost,
      decorate: false,
      class: 'custom-class another-class'
    })

    const containerElement = container.querySelector('.relative.z-10.order-first.mb-3')
    expect(containerElement).toHaveClass('custom-class', 'another-class')
  })

  it('빈 날짜 문자열이 주어질 때 현재 날짜를 사용한다', () => {
    const MOCK_NOW = new Date('2023-10-27T10:00:00Z')

    // Vitest 내장 time-mocking 사용
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_NOW)

    const postWithEmptyDate: Post = {
      ...mockPost,
      date: ''
    }

    render(PostDate, { post: postWithEmptyDate, decorate: false, class: '' })

    // 모킹된 현재 날짜가 렌더링되는지 확인
    const expectedDateString = MOCK_NOW.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    expect(screen.getByText(expectedDateString)).toBeInTheDocument()

    // 실제 타이머로 복원
    vi.useRealTimers()
  })

  it('잘못된 날짜 형식이 주어질 때 현재 날짜를 사용한다', () => {
    const MOCK_NOW = new Date('2023-10-27T10:00:00Z')

    // Vitest 내장 time-mocking 사용
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_NOW)

    const postWithInvalidDate: Post = {
      ...mockPost,
      date: 'invalid-date-string'
    }

    render(PostDate, { post: postWithInvalidDate, decorate: false, class: '' })

    // 모킹된 현재 날짜가 렌더링되는지 확인
    const expectedDateString = MOCK_NOW.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    expect(screen.getByText(expectedDateString)).toBeInTheDocument()

    // 실제 타이머로 복원
    vi.useRealTimers()
  })

  it('ISO 8601 형식의 날짜가 올바르게 파싱된다', () => {
    const postWithISODate: Post = {
      ...mockPost,
      date: '2024-01-15T10:30:00Z'
    }

    render(PostDate, { post: postWithISODate, decorate: false, class: '' })

    const timeElement = screen.getByText('January 15, 2024')
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15T10:30:00Z')
  })

  it('기본 텍스트 색상 클래스가 적용된다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: false, class: '' })

    const containerElement = container.querySelector('.relative.z-10.order-first.mb-3')
    expect(containerElement).toHaveClass('text-zinc-500', 'dark:text-zinc-400')
  })

  it('읽기 시간이 올바르게 표시된다', () => {
    const postWithDifferentReadingTime: Post = {
      ...mockPost,
      readingTime: '10분 읽기'
    }

    render(PostDate, { post: postWithDifferentReadingTime, decorate: false, class: '' })

    expect(screen.getByText('10분 읽기')).toBeInTheDocument()
  })

  it('날짜와 읽기 시간이 flex 컨테이너 안에 있다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: false, class: '' })

    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()

    const timeElement = screen.getByText('January 15, 2024')
    const readingTimeElement = screen.getByText('5분 읽기')

    expect(flexContainer).toContainElement(timeElement)
    expect(flexContainer).toContainElement(readingTimeElement)
  })

  it('데코레이션 바가 올바른 aria-hidden 속성을 가진다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: true, class: '' })

    const decorationContainer = container.querySelector('[aria-hidden="true"]')
    expect(decorationContainer).toBeInTheDocument()
    expect(decorationContainer).toHaveClass(
      'absolute',
      'inset-y-0',
      'left-0',
      'flex',
      'items-center',
      'py-1'
    )
  })

  it('time 엘리먼트가 올바른 시맨틱 구조를 가진다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: false, class: '' })

    const timeElement = container.querySelector('time')
    expect(timeElement).toBeInTheDocument()
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15')
  })
})
