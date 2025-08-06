<script lang="ts">
  import { onMount } from 'svelte'

  import { browser } from '$app/environment'
  import imageMetadataJson from '$lib/data/image-metadata.json'

  // Type the metadata
  type ImageMetadata = {
    [key: string]: {
      width: number
      height: number
      aspectRatio: string
    }
  }
  const imageMetadata = imageMetadataJson as ImageMetadata

  export let src: string
  export let alt: string
  export let width: number | string | undefined = undefined
  export let height: number | string | undefined = undefined
  export let sizes: string | undefined = undefined
  export let style: string | undefined = undefined

  // 이미지 비율 캐싱 시스템
  const IMAGE_RATIO_CACHE_KEY = 'life-log-image-ratios-v1'
  let cachedRatio: number | undefined = undefined

  // 도메인별 기본 설정
  const getDefaultsForUrl = (url: string) => {
    if (url.includes('github.com/user-attachments/assets')) {
      return { ratio: 16 / 9, priority: 'medium' } // 스크린샷은 대부분 16:9
    }
    if (url.includes('avatars.githubusercontent.com')) {
      return { ratio: 1, priority: 'high' } // 프로필 이미지는 1:1
    }
    if (url.includes('user-images.githubusercontent.com')) {
      return { ratio: 4 / 3, priority: 'medium' } // 일반 업로드 이미지
    }
    if (url.includes('private-user-images.githubusercontent.com')) {
      return { ratio: 4 / 3, priority: 'medium' }
    }
    return null
  }

  // 캐시에서 비율 로드
  onMount(() => {
    if (!browser || !src.startsWith('http')) return

    try {
      const cache = JSON.parse(localStorage.getItem(IMAGE_RATIO_CACHE_KEY) || '{}')
      const cached = cache[src]
      if (cached && typeof cached === 'number' && cached > 0) {
        cachedRatio = cached
      }
    } catch (error) {
      console.warn('Failed to load image ratio cache:', error)
    }
  })

  // 이미지 로드 후 비율 캐싱
  const handleImageLoad = (event: Event) => {
    if (!browser || !src.startsWith('http')) return

    const img = event.target as HTMLImageElement
    if (!img.naturalWidth || !img.naturalHeight) return

    const ratio = img.naturalWidth / img.naturalHeight
    cachedRatio = ratio

    try {
      const cache = JSON.parse(localStorage.getItem(IMAGE_RATIO_CACHE_KEY) || '{}')
      cache[src] = ratio

      // 캐시 크기 제한 (최대 200개, 오래된 것부터 삭제)
      const entries = Object.entries(cache)
      if (entries.length > 200) {
        const trimmed = Object.fromEntries(entries.slice(-200))
        localStorage.setItem(IMAGE_RATIO_CACHE_KEY, JSON.stringify(trimmed))
      } else {
        localStorage.setItem(IMAGE_RATIO_CACHE_KEY, JSON.stringify(cache))
      }
    } catch (error) {
      console.warn('Failed to save image ratio to cache:', error)
    }
  }

  // GitHub 이미지 최적화 함수
  const optimizeGitHubImage = (url: string, targetWidth: number = 800): string => {
    const GITHUB_HOSTS = [
      'github.com/user-attachments/assets/',
      'avatars.githubusercontent.com/',
      'user-images.githubusercontent.com/',
      'private-user-images.githubusercontent.com/'
    ]

    if (GITHUB_HOSTS.some((host) => url.includes(host))) {
      const baseUrl = url.split('?')[0]
      return `${baseUrl}?s=${targetWidth}`
    }
    return url
  }

  // Extract dimensions from filename or metadata to prevent layout shift
  // Priority: 1. Filename pattern, 2. Metadata lookup, 3. Aspect ratio fallback
  if (width === undefined && height === undefined && !src.startsWith('http')) {
    // 1. Check filename for @widthxheight pattern
    const dimensionMatch = src.match(/@(\d+)x(\d+)\./)
    if (dimensionMatch) {
      width = dimensionMatch[1]
      height = dimensionMatch[2]
    } else {
      // 2. Look up dimensions in build-time generated metadata
      const metadataKey = src.startsWith('/') ? src : `/${src}`
      const metadata = imageMetadata[metadataKey]
      if (metadata) {
        width = String(metadata.width)
        height = String(metadata.height)
      }
      // 3. For unknown images, CSS aspect-ratio will be used as fallback
    }
  }

  // 반응형 이미지를 위한 srcset 생성 (GitHub 이미지용)
  const createSrcSet = (originalSrc: string): string | undefined => {
    if (!originalSrc.includes('github.com')) return undefined

    const sizes = [400, 800, 1200]
    return sizes.map((size) => `${optimizeGitHubImage(originalSrc, size)} ${size}w`).join(', ')
  }

  // 로컬 이미지의 WebP/AVIF 변환 지원
  const getOptimizedSources = (originalSrc: string) => {
    if (originalSrc.startsWith('http')) return null

    const basePath = originalSrc.replace(/\.[^/.]+$/, '') // 확장자 제거
    const sizes = [400, 800, 1200]

    return {
      avif: sizes.map((size) => `${basePath}-${size}w.avif ${size}w`).join(', '),
      webp: sizes.map((size) => `${basePath}-${size}w.webp ${size}w`).join(', ')
    }
  }

  // 최적화된 src와 srcset
  $: optimizedSrc = optimizeGitHubImage(src, 800)
  $: srcset = createSrcSet(src)
  $: localSources = getOptimizedSources(src)
  $: defaultSizes = sizes || '(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px'

  // 동적 스타일 계산 (점진적 개선)
  $: dynamicStyle = (() => {
    // 로컬 이미지는 기존 스타일 유지
    if (!src.startsWith('http')) return style

    const defaults = getDefaultsForUrl(src)

    // 우선순위: 1) 캐시된 비율 2) 도메인별 기본값 3) 기본 스타일
    const ratio = cachedRatio || defaults?.ratio

    if (ratio && ratio > 0) {
      const aspectRatioStyle = `aspect-ratio: ${ratio.toFixed(3)}; width: 100%; height: auto;`
      return `${aspectRatioStyle} ${style || ''}`
    }

    // 비율 정보가 없으면 기본 스타일만 적용
    return `width: 100%; height: auto; ${style || ''}`
  })()
</script>

{#if localSources}
  <picture>
    <source srcset={localSources.avif} sizes={defaultSizes} type="image/avif" />
    <source srcset={localSources.webp} sizes={defaultSizes} type="image/webp" />
    <img
      {src}
      {alt}
      {width}
      {height}
      style={dynamicStyle}
      loading="lazy"
      decoding="async"
      on:load={handleImageLoad}
      {...$$restProps}
    />
  </picture>
{:else}
  <img
    src={optimizedSrc}
    {srcset}
    sizes={srcset ? defaultSizes : sizes}
    {alt}
    {width}
    {height}
    style={dynamicStyle}
    loading="lazy"
    decoding="async"
    on:load={handleImageLoad}
    {...$$restProps}
  />
{/if}
