import { render, screen } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import TagList from './TagList.svelte'

// Mock window methods
const mockScrollLeft = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

Object.defineProperty(HTMLDivElement.prototype, 'scrollLeft', {
  get() {
    return 0
  },
  set: mockScrollLeft,
  configurable: true
})

Object.defineProperty(HTMLDivElement.prototype, 'addEventListener', {
  value: mockAddEventListener,
  configurable: true
})

Object.defineProperty(HTMLDivElement.prototype, 'removeEventListener', {
  value: mockRemoveEventListener,
  configurable: true
})

describe('TagList 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('태그 목록이 올바르게 렌더링된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags })

    tags.forEach((tag) => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument()
    })
  })

  it('빈 태그 배열일 때 아무것도 렌더링하지 않는다', () => {
    render(TagList, { tags: [] })

    const tagContainer = document.querySelector('.relative')
    expect(tagContainer).not.toBeInTheDocument()
  })

  it('태그가 undefined일 때 기본값으로 동작한다', () => {
    render(TagList, { tags: undefined as any })

    // 빈 태그 배열과 같은 동작을 하므로 렌더링되지 않음
    const tagContainer = document.querySelector('.relative')
    expect(tagContainer).not.toBeInTheDocument()
  })

  it('선택된 태그가 올바른 스타일로 표시된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags, selectedTag: 'Svelte' })

    const selectedTag = screen.getByText('#Svelte')
    expect(selectedTag).toHaveClass(
      'bg-teal-100',
      'text-teal-800',
      'dark:bg-teal-800',
      'dark:text-teal-100'
    )
    expect(selectedTag).toHaveAttribute('aria-current', 'page')
  })

  it('선택되지 않은 태그가 올바른 스타일로 표시된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags, selectedTag: 'Svelte' })

    const unselectedTag = screen.getByText('#JavaScript')
    expect(unselectedTag).toHaveClass(
      'bg-zinc-100',
      'text-zinc-800',
      'hover:bg-zinc-200',
      'dark:bg-zinc-800',
      'dark:text-zinc-200',
      'dark:hover:bg-zinc-700'
    )
    expect(unselectedTag).not.toHaveAttribute('aria-current')
  })

  it('clickable이 true일 때 태그가 링크로 동작한다', () => {
    const tags = ['JavaScript', 'Svelte']
    render(TagList, { tags, clickable: true })

    const jsTag = screen.getByText('#JavaScript')
    expect(jsTag.closest('a')).toHaveAttribute('href', '/tags/JavaScript')
  })

  it('clickable이 false일 때 태그가 링크로 동작하지 않는다', () => {
    const tags = ['JavaScript', 'Svelte']
    render(TagList, { tags, clickable: false })

    const jsTag = screen.getByText('#JavaScript')
    expect(jsTag.closest('a')).toBeNull()
    expect(jsTag.tagName).toBe('SPAN')
  })

  it('커스텀 getTagUrl 함수가 올바르게 적용된다', () => {
    const tags = ['JavaScript', 'Svelte']
    const customGetTagUrl = (tagName: string) => `/custom?tag=${tagName}`

    render(TagList, { tags, clickable: true, getTagUrl: customGetTagUrl })

    const jsTag = screen.getByText('#JavaScript')
    expect(jsTag.closest('a')).toHaveAttribute('href', '/custom?tag=JavaScript')
  })

  it('clickable이 true일 때 올바른 링크를 가진다', () => {
    const tags = ['JavaScript']

    render(TagList, { tags, clickable: true })
    const tagLink = screen.getByText('#JavaScript').closest('a')
    expect(tagLink).toHaveClass('cursor-pointer')
    expect(tagLink).toHaveAttribute('href', '/tags/JavaScript')
  })

  it('스크롤 컨테이너가 올바른 클래스를 가진다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags })

    const scrollContainer = document.querySelector(
      '.flex.gap-2.mt-2.overflow-x-auto.pb-2.scrollbar-thin'
    )
    expect(scrollContainer).toBeInTheDocument()
  })

  it('컴포넌트가 마운트될 때 스크롤 컨테이너가 존재한다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags })

    // 스크롤 컨테이너가 존재하는지 확인
    const scrollContainer = document.querySelector('.overflow-x-auto')
    expect(scrollContainer).toBeInTheDocument()
  })

  it('컴포넌트가 렌더링될 때 올바른 구조를 가진다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags })

    // 기본 구조 확인
    const container = document.querySelector('.relative')
    expect(container).toBeInTheDocument()

    const scrollContainer = container?.querySelector(
      '.flex.gap-2.mt-2.overflow-x-auto.pb-2.scrollbar-thin'
    )
    expect(scrollContainer).toBeInTheDocument()
  })

  it('컴포넌트가 언마운트될 때 wheel 이벤트 리스너가 제거된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    const { unmount } = render(TagList, { tags })

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('wheel', expect.any(Function))
  })

  it('모든 태그에 올바른 기본 스타일이 적용된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags })

    tags.forEach((tag) => {
      const tagElement = screen.getByText(`#${tag}`)
      expect(tagElement).toHaveClass(
        'flex-shrink-0',
        'px-2',
        'py-1',
        'text-xs',
        'font-medium',
        'rounded-full',
        'transition-colors',
        'whitespace-nowrap'
      )
    })
  })

  it('선택된 태그가 없을 때 모든 태그가 기본 스타일로 표시된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(TagList, { tags, selectedTag: null })

    tags.forEach((tag) => {
      const tagElement = screen.getByText(`#${tag}`)
      expect(tagElement).toHaveClass(
        'bg-zinc-100',
        'text-zinc-800',
        'hover:bg-zinc-200',
        'dark:bg-zinc-800',
        'dark:text-zinc-200',
        'dark:hover:bg-zinc-700'
      )
      expect(tagElement).not.toHaveAttribute('aria-current')
    })
  })

  it('태그 텍스트가 # 접두사와 함께 올바르게 표시된다', () => {
    const tags = ['JavaScript', 'React.js', 'C++', '한글태그']
    render(TagList, { tags })

    expect(screen.getByText('#JavaScript')).toBeInTheDocument()
    expect(screen.getByText('#React.js')).toBeInTheDocument()
    expect(screen.getByText('#C++')).toBeInTheDocument()
    expect(screen.getByText('#한글태그')).toBeInTheDocument()
  })

  it('태그 컨테이너가 올바른 구조를 가진다', () => {
    const tags = ['JavaScript', 'Svelte']
    render(TagList, { tags })

    // 최상위 컨테이너
    const outerContainer = document.querySelector('.relative')
    expect(outerContainer).toBeInTheDocument()

    // 스크롤 컨테이너
    const scrollContainer = outerContainer?.querySelector(
      '.flex.gap-2.mt-2.overflow-x-auto.pb-2.scrollbar-thin'
    )
    expect(scrollContainer).toBeInTheDocument()

    // 태그들이 스크롤 컨테이너 안에 있는지 확인
    tags.forEach((tag) => {
      const tagElement = screen.getByText(`#${tag}`)
      expect(scrollContainer).toContainElement(tagElement)
    })
  })
})
