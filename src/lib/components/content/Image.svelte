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
    }
  }

  // Default dimensions for common image formats to prevent CLS
  if (width === undefined && height === undefined) {
    // Set default aspect ratio for better CLS prevention
    // This will be overridden by CSS max-width: 100%, height: auto
    width = 800
    height = 600
  }

  // 반응형 이미지를 위한 srcset 생성 (GitHub 이미지용)
  const createSrcSet = (originalSrc: string): string | undefined => {
    if (!originalSrc.includes('github.com')) return undefined

    const sizes = [400, 800, 1200]
    return sizes.map((size) => `${optimizeGitHubImage(originalSrc, size)} ${size}w`).join(', ')
  }

  // 최적화된 src와 srcset
  $: optimizedSrc = optimizeGitHubImage(src, 800)
  $: srcset = createSrcSet(src)
  $: defaultSizes = sizes || '(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px'
</script>

<img
  src={optimizedSrc}
  {srcset}
  sizes={srcset ? defaultSizes : sizes}
  {alt}
  {width}
  {height}
  {style}
  loading="lazy"
  decoding="async"
  {...$$restProps}
/>
