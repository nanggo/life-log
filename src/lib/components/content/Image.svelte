<script lang="ts">
  export let src: string
  export let alt: string
  export let width: number | string | undefined = undefined
  export let height: number | string | undefined = undefined
  export let sizes: string | undefined = undefined
  export let style: string | undefined = undefined

  // To prevent layout shift, we need to know the dimensions of the image.
  // For local images, try to get dimensions from the path if specified in format `image@<width>x<height>.jpg`
  const isExternal: boolean = src.startsWith('http')
  if (width === undefined && height === undefined && !isExternal) {
    const match: RegExpMatchArray | null = src.match(/@(\d+)x(\d+)\./)
    if (match) {
      width = match[1]
      height = match[2]
    }
  }
</script>

<img {src} {alt} {width} {height} {sizes} {style} loading="lazy" {...$$restProps} />
