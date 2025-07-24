<script lang="ts">
  export let src: string
  export let alt: string
  export let width: number | string | undefined = undefined
  export let height: number | string | undefined = undefined
  export let sizes: string | undefined = undefined
  export let style: string | undefined = undefined

  // Extract dimensions from filename to prevent layout shift
  // Supports format: image@<width>x<height>.jpg for local images only
  if (width === undefined && height === undefined && !src.startsWith('http')) {
    const dimensionMatch = src.match(/@(\d+)x(\d+)\./)
    if (dimensionMatch) {
      width = dimensionMatch[1]
      height = dimensionMatch[2]
    }
  }
</script>

<img {src} {alt} {width} {height} {sizes} {style} loading="lazy" {...$$restProps} />
