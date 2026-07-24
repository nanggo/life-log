import { describe, expect, it } from 'vitest'

import { createRemarkOptimizedImages } from './remark-optimized-images.js'

const manifest = {
  '/example/hero.png': {
    width: 1200,
    height: 800,
    variants: [672, 1200]
  },
  '/example/body.png': {
    width: 900,
    height: 600,
    variants: [672, 900]
  }
}

const transform = (images, frontmatterImage = '') => {
  const tree = {
    type: 'root',
    children: images.map((url) => ({ type: 'image', url, alt: url }))
  }
  const file = {
    path: '/project/posts/example/index.md',
    data: { fm: { image: frontmatterImage } }
  }

  createRemarkOptimizedImages(manifest)(tree, file)
  return tree.children
}

describe('remark optimized images', () => {
  it('별도 히어로가 없으면 첫 로컬 이미지만 LCP 우선순위를 준다', () => {
    const [first, second] = transform(['./hero.png', './body.png'])

    expect(first.value).toContain('loading="eager" fetchpriority="high"')
    expect(first.value).toContain(
      'srcset="/example/hero-672w.webp 672w, /example/hero-1200w.webp 1200w"'
    )
    expect(first.value).toContain('width="1200" height="800"')
    expect(second.value).toContain('loading="lazy"')
    expect(second.value).not.toContain('fetchpriority="high"')
  })

  it('frontmatter 이미지가 본문 첫 이미지와 같으면 본문 이미지를 LCP로 처리한다', () => {
    const [first] = transform(['./hero.png'], './hero.png')

    expect(first.value).toContain('loading="eager" fetchpriority="high"')
    expect(first.value).toContain('data-modal-src="/example/hero.png"')
  })

  it('별도 frontmatter 히어로가 있으면 본문 이미지를 지연 로딩한다', () => {
    const [first] = transform(['./body.png'], './hero.png')

    expect(first.value).toContain('loading="lazy"')
    expect(first.value).not.toContain('fetchpriority="high"')
  })

  it('외부 이미지는 변경하지 않는다', () => {
    const [image] = transform(['https://example.com/image.png'])

    expect(image).toEqual({
      type: 'image',
      url: 'https://example.com/image.png',
      alt: 'https://example.com/image.png'
    })
  })
})
