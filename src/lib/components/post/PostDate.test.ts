import { render, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'

import PostDate from './PostDate.svelte'

import type { Post } from '$lib/types'
import { Category } from '$lib/types/blog'

describe('PostDate 컴포넌트', () => {
  const mockPost: Post = {
    title: '테스트 포스트',
    description: '테스트 포스트 설명',
    slug: 'test-post',
    tags: ['JavaScript'],
    date: '2024-01-15',
    displayDate: 'January 15, 2024',
    readingTime: 5,
    preview: { html: '', text: '' },
    headings: [],
    isIndexFile: false,
    category: Category.DEVELOPMENT
  }

  it('날짜와 읽기 시간이 올바르게 렌더링된다', () => {
    render(PostDate, { post: mockPost, decorate: false, class: '' })

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
    expect(screen.getByText('5분')).toBeInTheDocument()
  })

  it('datetime 속성이 올바르게 설정된다', () => {
    render(PostDate, { post: mockPost, decorate: false, class: '' })

    const timeElement = screen.getByText('January 15, 2024')
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15')
  })

  it('displayDate가 없으면 date 문자열로 폴백한다', () => {
    const postWithoutDisplayDate = {
      ...mockPost,
      displayDate: undefined
    } as unknown as Post

    render(PostDate, { post: postWithoutDisplayDate, decorate: false, class: '' })

    const timeElement = screen.getByText('2024-01-15')
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

    const innerFlexContainer = screen.getByText('5분').parentElement // 두 번째 .flex 요소 (내부 flex 컨테이너)
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

  it('기본 텍스트 색상 클래스가 적용된다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: false, class: '' })

    const containerElement = container.querySelector('.relative.z-10.order-first.mb-3')
    expect(containerElement).toHaveClass('text-zinc-500', 'dark:text-zinc-400')
  })

  it('읽기 시간이 올바르게 표시된다', () => {
    const postWithDifferentReadingTime: Post = {
      ...mockPost,
      readingTime: 10
    }

    render(PostDate, { post: postWithDifferentReadingTime, decorate: false, class: '' })

    expect(screen.getByText('10분')).toBeInTheDocument()
  })

  it('날짜와 읽기 시간이 flex 컨테이너 안에 있다', () => {
    const { container } = render(PostDate, { post: mockPost, decorate: false, class: '' })

    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()

    const timeElement = screen.getByText('January 15, 2024')
    const readingTimeElement = screen.getByText('5분')

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
