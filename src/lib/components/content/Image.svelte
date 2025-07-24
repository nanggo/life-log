<script lang="ts">
  import { dev } from '$app/environment'

  export let src: string
  export let alt: string
  export let width: number | string | undefined = undefined
  export let height: number | string | undefined = undefined
  export let sizes: string | undefined = undefined
  export let style: string | undefined = undefined

  // vite-imagetools can't handle external URLs, so we just use a regular img tag for them
  const isExternal: boolean = src.startsWith('http')

  // To prevent layout shift, we need to know the dimensions of the image.
  // For local images, try to get dimensions from the path if specified in format `image@<width>x<height>.jpg`
  if (width === undefined && height === undefined && !isExternal) {
    const match: RegExpMatchArray | null = src.match(/@(\d+)x(\d+)\./)
    if (match) {
      width = match[1]
      height = match[2]
    }
  }

  // Disable vite-imagetools for now to prevent dev mode errors
  // Use simple fallback for all images
  const sources = {}
  const img = { src }
</script>

{#if dev || isExternal}
  <img {src} {alt} {width} {height} {sizes} {style} loading="lazy" {...$$restProps} />
{:else}
  <picture>
    {#each Object.entries(sources) as [format, source]}
      <source type={`image/${format}`} srcset={String(source)} {sizes} />
    {/each}
    <img {...img} {alt} {width} {height} {sizes} {style} loading="lazy" {...$$restProps} />
  </picture>
{/if}
