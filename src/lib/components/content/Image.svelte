<script lang="ts">
  import { dev } from '$app/environment'
  import type { ImageSource } from '$lib/types/image'

  export let src: string
  export let alt: string
  export let width: number | string | undefined = undefined
  export let height: number | string | undefined = undefined
  export let sizes: string | undefined = undefined
  export let style: string | undefined = undefined

  // vite-imagetools can't handle external URLs, so we just use a regular img tag for them
  const isExternal: boolean = src.startsWith('http')

  // In dev mode, vite-imagetools doesn't play nicely with the dynamic imports
  // so we just use a regular img tag.
  if (dev || isExternal) {
    // To prevent layout shift, we need to know the dimensions of the image.
    // We can't know this ahead of time for external images, so we'll just have to
    // live with the layout shift. For local images, we can try to get the dimensions
    // from the path if they are specified in the format `image@<width>x<height>.jpg`.
    if (width === undefined && height === undefined) {
      const match: RegExpMatchArray | null = src.match(/@(\d+)x(\d+)\./)
      if (match) {
        width = match[1]
        height = match[2]
      }
    }
  }

  // Disable vite-imagetools for now to prevent dev mode errors
  // Use simple fallback for all images
  const image: ImageSource | undefined = undefined
  const { sources, img } = image || { sources: {}, img: { src } }
</script>

{#if dev || isExternal}
  <img {src} {alt} {width} {height} {sizes} {style} loading="lazy" {...$$restProps} />
{:else}
  <picture>
    {#each Object.entries(sources) as [format, source]}
      <source type={`image/${format}`} srcset={String(source)} {sizes} />
    {/each}
    <img {...img} {alt} {sizes} {style} loading="lazy" {...$$restProps} />
  </picture>
{/if}
