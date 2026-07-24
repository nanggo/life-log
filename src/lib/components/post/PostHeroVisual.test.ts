import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import PostHeroVisual from './PostHeroVisual.svelte'

describe('PostHeroVisual 컴포넌트', () => {
  it('이미지가 있는 포스트의 대표 이미지를 렌더링한다', () => {
    render(PostHeroVisual, {
      post: {
        title: '테스트 포스트',
        image: '/test-post/hero.png',
        imageAlt: '테스트 포스트 대표 이미지'
      }
    })

    const image = screen.getByAltText('테스트 포스트 대표 이미지')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-post/hero.png')
    expect(image).toHaveAttribute('width', '1200')
    expect(image).toHaveAttribute('height', '800')
  })

  it('head preload와 같은 반응형 이미지 정보를 사용한다', () => {
    render(PostHeroVisual, {
      post: {
        title: '반응형 테스트 포스트',
        image: '/test-post/hero.png',
        imageAlt: '반응형 대표 이미지'
      },
      heroImage: {
        src: '/test-post/hero.png',
        srcset: '/test-post/hero-672w.webp 672w, /test-post/hero-1200w.webp 1200w',
        sizes: '(min-width: 704px) 672px, 100vw',
        width: 1200,
        height: 630
      }
    })

    const image = screen.getByAltText('반응형 대표 이미지')
    expect(image).toHaveAttribute(
      'srcset',
      '/test-post/hero-672w.webp 672w, /test-post/hero-1200w.webp 1200w'
    )
    expect(image).toHaveAttribute('sizes', '(min-width: 704px) 672px, 100vw')
    expect(image).toHaveAttribute('width', '1200')
    expect(image).toHaveAttribute('height', '630')
    expect(image).toHaveAttribute('fetchpriority', 'high')
    expect(image).toHaveAttribute('decoding', 'async')
  })

  it('이미지가 없는 포스트는 대표 이미지를 렌더링하지 않는다', () => {
    const { container } = render(PostHeroVisual, {
      post: {
        title: '이미지 없는 포스트'
      }
    })

    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('대표 이미지가 본문 첫 이미지와 같으면 중복 렌더링하지 않는다', () => {
    const { container } = render(PostHeroVisual, {
      post: {
        title: '본문 이미지가 있는 포스트',
        image: '/test-post/hero.png',
        firstImageUrl: '/test-post/hero.png'
      }
    })

    expect(container.querySelector('img')).not.toBeInTheDocument()
  })
})
