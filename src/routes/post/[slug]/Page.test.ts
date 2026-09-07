// Route-level accessibility and navigation tests for the rendered post page.
import type { AfterNavigate } from '@sveltejs/kit'
import { fireEvent, render, screen, within } from '@testing-library/svelte'
import { tick } from 'svelte'
import { describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({
  callback: undefined as ((navigation: AfterNavigate) => void) | undefined
}))

vi.mock('$app/navigation', () => ({
  afterNavigate: vi.fn((callback) => {
    navigation.callback = callback
  })
}))

import Page from './+page.svelte'

import SocialLinks from '$lib/components/layout/SocialLinks.svelte'

const data = {
  post: {
    slug: 'current-post',
    title: '현재 글',
    description: '현재 글 설명',
    date: '2026-07-10',
    displayDate: '2026년 7월 10일',
    category: '개발',
    tags: [],
    preview: { html: '', text: '' },
    image: '/current-post/cover.webp',
    imageAlt: '현재 글 대표 이미지',
    readingTime: 2,
    isIndexFile: false,
    headings: [],
    previous: { slug: 'older-post', title: '이전 글' },
    next: { slug: 'newer-post', title: '다음 글' }
  },
  component: SocialLinks,
  dynamicDescription: '현재 글 설명',
  jsonLd: '{}',
  breadcrumbLd: '{}',
  socialMediaImage: 'https://blog.nanggo.net/og.png',
  isPostImage: true,
  heroImage: {
    src: '/current-post/cover.webp',
    srcset: '/current-post/cover-672w.webp 672w, /current-post/cover-1200w.webp 1200w',
    sizes: '(min-width: 704px) 672px, 100vw',
    width: 1200,
    height: 800
  },
  publishedDate: '2026-07-10T00:00:00.000Z',
  modifiedDate: '2026-07-10T00:00:00.000Z',
  layout: { fullWidth: true }
}

describe('포스트 상세 페이지', () => {
  it('글 이동 시 목차와 본문 앵커 참조를 새 글로 교체한다', async () => {
    const oldScrollY = window.scrollY
    Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true })
    const firstHeading = document.createElement('h2')
    firstHeading.id = 'first-heading'
    const secondHeading = document.createElement('h2')
    secondHeading.id = 'second-heading'
    document.body.append(firstHeading, secondHeading)
    const lookup = vi.spyOn(document, 'getElementById')

    try {
      const { rerender } = render(Page, {
        data: {
          ...data,
          post: {
            ...data.post,
            headings: [{ depth: 2, value: '첫 글 목차', slug: 'first-heading' }]
          }
        } as never
      })
      expect(screen.getByRole('link', { name: '첫 글 목차' })).toHaveAttribute(
        'href',
        '#first-heading'
      )
      lookup.mockClear()

      await rerender({
        data: {
          ...data,
          post: {
            ...data.post,
            slug: 'second-post',
            headings: [{ depth: 2, value: '다음 글 목차', slug: 'second-heading' }]
          }
        } as never
      })

      expect(screen.queryByRole('link', { name: '첫 글 목차' })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: '다음 글 목차' })).toHaveAttribute(
        'href',
        '#second-heading'
      )
      expect(lookup).toHaveBeenCalledWith('second-heading')
      expect(lookup).not.toHaveBeenCalledWith('first-heading')
    } finally {
      lookup.mockRestore()
      firstHeading.remove()
      secondHeading.remove()
      window.scrollY = oldScrollY
    }
  })

  it('목록에서 진입한 경우에만 history로 복귀하고 글 사이 이동 후에는 목록 링크를 쓴다', async () => {
    const { rerender } = render(Page, { data: data as never })
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const navigateFrom = async (pathname: string) => {
      navigation.callback?.({
        from: { url: new URL(pathname, 'https://blog.nanggo.net') }
      } as AfterNavigate)
      await tick()
    }

    try {
      await navigateFrom('/posts/2')
      await fireEvent.click(screen.getByRole('button', { name: 'Go back to posts' }))
      expect(back).toHaveBeenCalledOnce()

      await rerender({ data: { ...data, post: { ...data.post, slug: 'second-post' } } as never })
      await navigateFrom('/post/current-post')
      expect(screen.getByRole('button', { name: 'Go back to posts' })).toHaveAttribute(
        'href',
        '/posts'
      )

      await navigateFrom('/posts/category/개발/2')
      expect(screen.getByRole('button', { name: 'Go back to posts' }).tagName).toBe('BUTTON')
      await navigateFrom('/posts-unrelated')
      expect(screen.getByRole('button', { name: 'Go back to posts' })).toHaveAttribute(
        'href',
        '/posts'
      )
    } finally {
      back.mockRestore()
    }
  })

  it('홈부터 현재 글까지 breadcrumb을 노출한다', () => {
    render(Page, { data: data as never })

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    const links = within(breadcrumb).getAllByRole('link')

    expect(links.map((link) => link.textContent)).toEqual(['홈', '포스트', '개발'])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/posts',
      '/posts/category/%EA%B0%9C%EB%B0%9C'
    ])
    expect(within(breadcrumb).getByText('현재 글')).toHaveAttribute('aria-current', 'page')
  })

  it('접근 가능한 이전·다음 글 링크를 노출하고 canonical을 유지한다', () => {
    render(Page, { data: data as never })

    const navigation = screen.getByRole('navigation', { name: '포스트 탐색' })
    const previousLink = within(navigation).getByRole('link', { name: '이전 글: 이전 글' })
    const nextLink = within(navigation).getByRole('link', { name: '다음 글: 다음 글' })

    expect(previousLink).toHaveAttribute('href', '/post/older-post')
    expect(previousLink).toHaveAttribute('data-sveltekit-preload-data', 'hover')
    expect(previousLink).toHaveAttribute('data-sveltekit-preload-code', 'viewport')
    expect(previousLink).toHaveClass('focus-visible:ring-2')
    expect(nextLink).toHaveAttribute('href', '/post/newer-post')
    expect(nextLink).toHaveAttribute('data-sveltekit-preload-data', 'hover')
    expect(nextLink).toHaveAttribute('data-sveltekit-preload-code', 'viewport')
    expect(nextLink).toHaveClass('focus-visible:ring-2')
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://blog.nanggo.net/post/current-post'
    )
  })

  it('head preload와 실제 hero에 같은 srcset과 sizes를 사용한다', () => {
    render(Page, { data: data as never })

    const preload = document.head.querySelector<HTMLLinkElement>('link[rel="preload"][as="image"]')
    expect(preload).toHaveAttribute('href', '/current-post/cover.webp')
    expect(preload).toHaveAttribute(
      'imagesrcset',
      '/current-post/cover-672w.webp 672w, /current-post/cover-1200w.webp 1200w'
    )
    expect(preload).toHaveAttribute('imagesizes', '(min-width: 704px) 672px, 100vw')
    expect(preload).toHaveAttribute('fetchpriority', 'high')

    const hero = screen.getByAltText('현재 글 대표 이미지')
    expect(hero).toHaveAttribute('srcset', preload?.getAttribute('imagesrcset'))
    expect(hero).toHaveAttribute('sizes', preload?.getAttribute('imagesizes'))
  })
})
