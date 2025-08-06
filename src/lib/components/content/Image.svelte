<script lang="ts">
  export let src: string
  export let alt: string
  export let width: number | string | undefined = undefined
  export let height: number | string | undefined = undefined
  export let sizes: string | undefined = undefined
  export let style: string | undefined = undefined

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

  // Extract dimensions from filename to prevent layout shift
  // Supports format: image@<width>x<height>.jpg for local images only
  if (width === undefined && height === undefined && !src.startsWith('http')) {
    const dimensionMatch = src.match(/@(\d+)x(\d+)\./)
    if (dimensionMatch) {
      width = dimensionMatch[1]
      height = dimensionMatch[2]
    } else {
      // 알려진 이미지들의 기본 크기 설정 (CLS 방지)
      if (src.includes('radish.png')) {
        width = '590'
        height = '295'
      }
      // GitHub Assets 이미지는 크기를 고정하지 않고 CSS aspect-ratio로 처리
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

  // GitHub 이미지 CLS 방지용 스타일 (크기 고정 대신 aspect-ratio 사용)
  $: dynamicStyle = src.includes('github.com/user-attachments/assets')
    ? `aspect-ratio: 2/1; width: 100%; height: auto; ${style || ''}`
    : style
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
    {...$$restProps}
  />
{/if}
