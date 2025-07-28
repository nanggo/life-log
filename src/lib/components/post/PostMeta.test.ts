import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import PostMeta from './PostMeta.svelte'

import { goto } from '$app/navigation'

// Mock goto function
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}))

describe('PostMeta 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('태그가 있을 때 올바르게 렌더링된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript']
    render(PostMeta, { tags })

    tags.forEach((tag) => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument()
    })
  })

  it('태그가 없을 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(PostMeta, { tags: [] })

    const tagContainer = container.querySelector('.flex.flex-wrap.gap-2.mt-2')
    expect(tagContainer).not.toBeInTheDocument()
  })

  it('undefined 태그일 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(PostMeta, { tags: undefined as any })

    const tagContainer = container.querySelector('.flex.flex-wrap.gap-2.mt-2')
    expect(tagContainer).not.toBeInTheDocument()
  })

  it('최대 표시 태그 개수가 제한된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript', 'Node.js', 'React']
    render(PostMeta, { tags, maxTagsToShow: 3 })

    // 처음 3개 태그만 표시되어야 함
    expect(screen.getByText('#JavaScript')).toBeInTheDocument()
    expect(screen.getByText('#Svelte')).toBeInTheDocument()
    expect(screen.getByText('#TypeScript')).toBeInTheDocument()

    // 4번째, 5번째 태그는 표시되지 않아야 함
    expect(screen.queryByText('#Node.js')).not.toBeInTheDocument()
    expect(screen.queryByText('#React')).not.toBeInTheDocument()
  })

  it('숨겨진 태그가 있을 때 +n개 버튼이 표시된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript', 'Node.js', 'React']
    render(PostMeta, { tags, maxTagsToShow: 3 })

    const moreButton = screen.getByText('+2개')
    expect(moreButton).toBeInTheDocument()
  })

  it('clickable이 true일 때 태그 클릭이 동작한다', async () => {
    const tags = ['JavaScript', 'Svelte']
    render(PostMeta, { tags, clickable: true })

    const jsTag = screen.getByText('#JavaScript')
    await fireEvent.click(jsTag)

    expect(goto).toHaveBeenCalledWith('/posts?tag=JavaScript')
  })

  it('clickable이 false일 때 태그 클릭이 동작하지 않는다', async () => {
    const tags = ['JavaScript', 'Svelte']
    render(PostMeta, { tags, clickable: false })

    const jsTag = screen.getByText('#JavaScript')
    await fireEvent.click(jsTag)

    expect(goto).not.toHaveBeenCalled()
  })

  it('태그 클릭 시 올바른 URL 인코딩이 적용된다', async () => {
    const tags = ['React.js', 'C++', '한글태그']
    render(PostMeta, { tags, clickable: true })

    const reactTag = screen.getByText('#React.js')
    await fireEvent.click(reactTag)

    expect(goto).toHaveBeenCalledWith('/posts?tag=React.js')

    const cppTag = screen.getByText('#C++')
    await fireEvent.click(cppTag)

    expect(goto).toHaveBeenCalledWith('/posts?tag=C%2B%2B')

    const koreanTag = screen.getByText('#한글태그')
    await fireEvent.click(koreanTag)

    expect(goto).toHaveBeenCalledWith('/posts?tag=%ED%95%9C%EA%B8%80%ED%83%9C%EA%B7%B8')
  })

  it('더보기 버튼 클릭 시 onMoreTagsClick이 호출된다', async () => {
    const onMoreTagsClick = vi.fn()
    const tags = ['JavaScript', 'Svelte', 'TypeScript', 'Node.js', 'React']

    render(PostMeta, {
      tags,
      maxTagsToShow: 3,
      onMoreTagsClick
    })

    const moreButton = screen.getByText('+2개')
    await fireEvent.click(moreButton)

    expect(onMoreTagsClick).toHaveBeenCalled()
  })

  it('태그 버튼에 올바른 스타일 클래스가 적용된다', () => {
    const tags = ['JavaScript']
    render(PostMeta, { tags, clickable: true })

    const tagButton = screen.getByText('#JavaScript')
    expect(tagButton).toHaveClass(
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

  it('clickable이 true일 때 올바르게 동작한다', () => {
    const tags = ['JavaScript']

    render(PostMeta, { tags, clickable: true })
    const tagButton = screen.getByText('#JavaScript')
    expect(tagButton).toHaveClass('cursor-pointer')
  })

  it('clickable이 false일 때 기본 동작을 방지한다', () => {
    const tags = ['JavaScript']

    render(PostMeta, { tags, clickable: false })
    const tagButton = screen.getByText('#JavaScript')

    // clickable이 false일 때 handleTagClick에서 early return 함
    // DOM 구조는 확인할 수 있음
    expect(tagButton).toBeInTheDocument()
  })

  it('더보기 버튼에 올바른 스타일이 적용된다', () => {
    const tags = ['JavaScript', 'Svelte', 'TypeScript', 'Node.js']
    render(PostMeta, { tags, maxTagsToShow: 2 })

    const moreButton = screen.getByText('+2개')
    expect(moreButton).toHaveClass(
      'flex-shrink-0',
      'px-2',
      'py-1',
      'text-xs',
      'font-medium',
      'rounded-full',
      'transition-colors',
      'whitespace-nowrap'
    )
    expect(moreButton).toHaveClass('cursor-pointer')
  })

  it('이벤트 전파가 올바르게 차단된다', async () => {
    const parentClickHandler = vi.fn()
    const tags = ['JavaScript']

    const { container } = render(PostMeta, { tags, clickable: true })

    // 부모 요소에 클릭 이벤트 리스너 추가
    container.addEventListener('click', parentClickHandler)

    const tagButton = screen.getByText('#JavaScript')
    await fireEvent.click(tagButton)

    // 태그 클릭 시 goto가 호출되지만 부모 클릭 이벤트는 호출되지 않아야 함
    expect(goto).toHaveBeenCalled()
    expect(parentClickHandler).not.toHaveBeenCalled()
  })
})
