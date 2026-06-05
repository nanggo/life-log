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
