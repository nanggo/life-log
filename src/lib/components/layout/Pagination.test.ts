import { render, screen } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Pagination from './Pagination.svelte'

const observedLinks: Element[] = []

class TrackingIntersectionObserver {
  disconnect = vi.fn()
  unobserve = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []

  observe(node: Element): void {
    observedLinks.push(node)
  }
}

describe('Pagination', () => {
  afterEach(() => {
    observedLinks.length = 0
    vi.unstubAllGlobals()
  })

  it('다음 목록 페이지 링크를 viewport 선로딩 대상으로 등록한다', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      TrackingIntersectionObserver as unknown as typeof IntersectionObserver
    )

    render(Pagination, {
      currentPage: 1,
      totalPages: 3,
      getPageUrl: (page: number) => (page === 1 ? '/posts' : `/posts/${page}`)
    })

    const nextLink = screen.getByRole('link', { name: 'Next' })
    expect(nextLink).toHaveAttribute('href', '/posts/2')
    expect(observedLinks).toEqual([nextLink])
  })

  it('중간 페이지에서는 다음 페이지만 viewport 선로딩 대상으로 등록한다', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      TrackingIntersectionObserver as unknown as typeof IntersectionObserver
    )

    render(Pagination, {
      currentPage: 2,
      totalPages: 3,
      getPageUrl: (page: number) => (page === 1 ? '/posts' : `/posts/${page}`)
    })

    const previousLink = screen.getByRole('link', { name: 'Previous' })
    const nextLink = screen.getByRole('link', { name: 'Next' })

    expect(previousLink).toHaveAttribute('href', '/posts')
    expect(nextLink).toHaveAttribute('href', '/posts/3')
    expect(observedLinks).toEqual([nextLink])
  })

  it('마지막 페이지에서는 이전 페이지만 viewport 선로딩 대상으로 등록한다', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      TrackingIntersectionObserver as unknown as typeof IntersectionObserver
    )

    render(Pagination, {
      currentPage: 3,
      totalPages: 3,
      getPageUrl: (page: number) => (page === 1 ? '/posts' : `/posts/${page}`)
    })

    const previousLink = screen.getByRole('link', { name: 'Previous' })
    expect(previousLink).toHaveAttribute('href', '/posts/2')
    expect(screen.queryByRole('link', { name: 'Next' })).not.toBeInTheDocument()
    expect(observedLinks).toEqual([previousLink])
  })
})
