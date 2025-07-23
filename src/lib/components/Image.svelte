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

  // Image processing types for vite-imagetools
  interface ImageSource {
    sources: Record<string, string>
    img: {
      src: string
      width?: number
      height?: number
      [key: string]: unknown
    }
  }

  // Get all possible images that could be used
  const modules: Record<string, ImageSource> = import.meta.glob(
    '/posts/**/*.{jpeg,jpg,png,gif,webp}',
    {
      eager: true,
      import: 'default',
      query: {
        w: '480;1024;2048',
        format: 'avif;webp;jpg',
        as: 'picture'
      }
    }
  )

  // Find the image that matches the src
  const image: ImageSource | undefined = modules[src]

  // vite-imagetools gives us an object with src, sources, and img
  // attributes. We can spread these into the picture and img tags.
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
