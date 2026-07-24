import path from 'path'

import { describe, expect, it } from 'vitest'

import {
  assertSourceImageNameAllowed,
  claimOutputPath,
  getManifestDimensions,
  shouldGenerateVariants
} from './copy-images.js'

describe('copy images pipeline safeguards', () => {
  it('EXIF 회전을 반영한 intrinsic 크기를 manifest에 기록한다', () => {
    expect(
      getManifestDimensions({
        width: 1200,
        height: 800,
        orientation: 6,
        autoOrient: { width: 800, height: 1200 }
      })
    ).toEqual({ width: 800, height: 1200 })
  })

  it('애니메이션은 프레임 높이를 기록하고 정적 변형본을 만들지 않는다', () => {
    const metadata = {
      width: 480,
      height: 960,
      pages: 2,
      pageHeight: 480,
      autoOrient: { width: 480, height: 960 }
    }

    expect(getManifestDimensions(metadata)).toEqual({ width: 480, height: 480 })
    expect(shouldGenerateVariants('.webp', metadata)).toBe(false)
    expect(shouldGenerateVariants('.avif', metadata)).toBe(false)
  })

  it('GIF와 SVG는 변형본 없이 원본 fallback을 유지한다', () => {
    const metadata = { width: 640, height: 360, pages: 1 }

    expect(shouldGenerateVariants('.gif', metadata)).toBe(false)
    expect(shouldGenerateVariants('.svg', metadata)).toBe(false)
  })

  it('서로 다른 원본이 같은 변형본 경로를 만들면 빌드를 중단한다', () => {
    const owners = new Map()
    const variantDest = path.resolve('static/example/hero-672w.webp')
    const jpegSource = path.resolve('posts/example/hero.jpg')
    const pngSource = path.resolve('posts/example/hero.png')

    claimOutputPath(owners, variantDest, jpegSource)

    expect(() => claimOutputPath(owners, variantDest, pngSource)).toThrow('Image output collision')
  })

  it('대소문자만 다른 출력 경로도 같은 충돌로 처리한다', () => {
    const owners = new Map()
    const firstOutput = path.resolve('static/example/Hero-672w.webp')
    const secondOutput = path.resolve('static/example/hero-672w.webp')

    claimOutputPath(owners, firstOutput, path.resolve('posts/example/Hero.png'))

    expect(() =>
      claimOutputPath(owners, secondOutput, path.resolve('posts/example/hero.jpg'))
    ).toThrow('Image output collision')
  })

  it('생성 산출물과 구분할 수 없는 원본 파일명은 거부한다', () => {
    expect(() =>
      assertSourceImageNameAllowed(path.resolve('posts/example/hero-672w.webp'))
    ).toThrow('reserved generated-variant filename pattern')
    expect(() =>
      assertSourceImageNameAllowed(path.resolve('posts/example/hero-672w.WEBP'))
    ).toThrow('reserved generated-variant filename pattern')
  })
})
