// Route-level accessibility and navigation tests for the rendered post page.
import { render, screen, within } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$app/navigation', () => ({
  afterNavigate: vi.fn()
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
