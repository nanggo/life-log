import { describe, expect, it } from 'vitest'

import { buildSrcset, getVariantWidths, sortImageManifest, variantPath } from './image-variants'

describe('image variants', () => {
  it('원본을 확대하지 않고 672px와 최적화된 최대폭을 선택한다', () => {
    expect(getVariantWidths(2000)).toEqual([672, 1344])
    expect(getVariantWidths(1200)).toEqual([672, 1200])
    expect(getVariantWidths(590)).toEqual([590])
    expect(getVariantWidths(0)).toEqual([])
  })

  it('원본 확장자와 무관하게 안정적인 WebP 경로와 srcset을 만든다', () => {
    expect(variantPath('/post/cover.png', 672)).toBe('/post/cover-672w.webp')
    expect(
      buildSrcset('/post/cover.png', {
        width: 1200,
        height: 800,
        variants: [1200, 672, 1200, 1600]
      })
    ).toBe('/post/cover-672w.webp 672w, /post/cover-1200w.webp 1200w')
  })

  it('변형본이 없는 형식은 원본 fallback을 위해 srcset을 만들지 않는다', () => {
    expect(buildSrcset('/post/animation.gif', undefined)).toBeUndefined()
    expect(
      buildSrcset('/post/animation.gif', { width: 640, height: 360, variants: [] })
    ).toBeUndefined()
  })

  it('manifest 키를 결정적으로 정렬한다', () => {
    expect(sortImageManifest({ '/z.webp': {}, '/a.webp': {}, '/m.webp': {} })).toEqual({
      '/a.webp': {},
      '/m.webp': {},
      '/z.webp': {}
    })
  })
})
