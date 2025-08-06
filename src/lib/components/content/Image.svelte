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

  // Type guard for runtime validation
  function isValidImageMetadata(data: unknown): data is ImageMetadata {
    if (!data || typeof data !== 'object') return false

    const metadata = data as Record<string, unknown>

    return Object.entries(metadata).every(([key, value]) => {
      if (typeof key !== 'string' || !value || typeof value !== 'object') return false

      const item = value as Record<string, unknown>
      return (
        typeof item.width === 'number' &&
        typeof item.height === 'number' &&
        typeof item.aspectRatio === 'string' &&
        item.width > 0 &&
        item.height > 0 &&
        parseFloat(item.aspectRatio) > 0
      )
    })
  }

  // Safe metadata loading with fallback
  const imageMetadata: ImageMetadata = isValidImageMetadata(imageMetadataJson)
    ? imageMetadataJson
    : {}

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

  // 캐시에서 비율 로드 (안전한 접근)
  onMount(() => {
    if (!browser || !src.startsWith('http')) return

    try {
      const cacheData = localStorage.getItem(IMAGE_RATIO_CACHE_KEY)
      if (!cacheData) return

      const cache = JSON.parse(cacheData)
      if (!cache || typeof cache !== 'object') return

      const cached = cache[src]
      if (typeof cached === 'number' && cached > 0 && isFinite(cached)) {
        cachedRatio = cached
      }
    } catch (error) {
      console.warn('Failed to load image ratio cache:', error)
      // 캐시 손상 시 초기화
      try {
        localStorage.removeItem(IMAGE_RATIO_CACHE_KEY)
      } catch {
        // localStorage 접근 실패 시 무시
      }
    }
  })

  // 이미지 로드 후 비율 캐싱 (안전한 저장)
  const handleImageLoad = (event: Event) => {
    if (!browser || !src.startsWith('http')) return

    const img = event.target as HTMLImageElement
    if (
      !img?.naturalWidth ||
      !img?.naturalHeight ||
      img.naturalWidth <= 0 ||
      img.naturalHeight <= 0
    ) {
      return
    }

    const ratio = img.naturalWidth / img.naturalHeight
    if (!isFinite(ratio) || ratio <= 0) return

    cachedRatio = ratio

    try {
      const cacheData = localStorage.getItem(IMAGE_RATIO_CACHE_KEY)
      let cache: Record<string, number>

      if (cacheData) {
        const parsed = JSON.parse(cacheData)
        cache = parsed && typeof parsed === 'object' ? parsed : {}
      } else {
        cache = {}
      }

      cache[src] = ratio

      // 캐시 크기 제한 (최대 200개, 오래된 것부터 삭제)
      const entries = Object.entries(cache).filter(
        ([, value]) => typeof value === 'number' && isFinite(value) && value > 0
      )

      const trimmed = Object.fromEntries(entries.slice(-200))
      localStorage.setItem(IMAGE_RATIO_CACHE_KEY, JSON.stringify(trimmed))
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
      if (metadata && metadata.width > 0 && metadata.height > 0) {
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

  // CSS 속성 안전 파싱 (CSS injection 방지)
  function sanitizeStyle(styleString: string | undefined): string {
    if (!styleString || typeof styleString !== 'string') return ''

    // 안전한 CSS 속성만 허용 (XSS 위험 속성 제외)
    const allowedProperties = [
      'width',
      'height',
      'max-width',
      'max-height',
      'min-width',
      'min-height',
      'border',
      'border-radius',
      'margin',
      'padding',
      'object-fit',
      'object-position',
      'opacity',
      // 'filter' 제거 - url("javascript:...") XSS 공격 가능
      // 'transform' 제거 - 복잡한 값으로 인한 잠재적 위험
      'transition-duration',
      'transition-timing-function',
      'box-shadow',
      'outline',
      'aspect-ratio',
      'display',
      'vertical-align'
    ]

    // 위험한 패턴들 차단 (XSS 방지)
    const dangerousPatterns = [
      '}',
      '{',
      '@', // CSS injection
      'javascript:',
      'data:', // Script execution
      'url(',
      'expression(', // Code execution
      '<',
      '>' // HTML injection
    ]

    if (dangerousPatterns.some((pattern) => styleString.toLowerCase().includes(pattern))) {
      console.warn('Potentially unsafe CSS detected, ignoring style prop')
      return ''
    }

    // 각 속성을 개별적으로 검증하고 값도 검사
    const properties = styleString.split(';').filter((prop) => prop.trim())
    const safeProperties = properties.filter((prop) => {
      const [property, value] = prop.split(':').map((p) => p.trim().toLowerCase())

      // 속성명 검증
      const isAllowedProperty = allowedProperties.some(
        (allowed) => property === allowed || property.startsWith(allowed + '-')
      )

      // 값 검증 - 위험한 함수나 키워드 차단
      const hasUnsafeValue =
        value &&
        (value.includes('javascript:') ||
          value.includes('data:') ||
          value.includes('url(') ||
          value.includes('expression(') ||
          value.includes('<') ||
          value.includes('>'))

      return isAllowedProperty && !hasUnsafeValue
    })

    return safeProperties.join('; ')
  }

  // 동적 스타일 계산 (점진적 개선)
  $: dynamicStyle = (() => {
    const safeStyle = sanitizeStyle(style)

    // 로컬 이미지는 안전한 스타일만 적용
    if (!src.startsWith('http')) return safeStyle

    const defaults = getDefaultsForUrl(src)

    // 우선순위: 1) 캐시된 비율 2) 도메인별 기본값 3) 기본 스타일
    const ratio = cachedRatio || defaults?.ratio

    if (ratio && ratio > 0) {
      const aspectRatioStyle = `aspect-ratio: ${ratio.toFixed(3)}; width: 100%; height: auto`
      return safeStyle ? `${aspectRatioStyle}; ${safeStyle}` : aspectRatioStyle
    }

    // 비율 정보가 없으면 기본 스타일만 적용
    const baseStyle = 'width: 100%; height: auto'
    return safeStyle ? `${baseStyle}; ${safeStyle}` : baseStyle
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
