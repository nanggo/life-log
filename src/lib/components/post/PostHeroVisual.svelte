<script lang="ts">
  import type { HeroImage, Post } from '$lib/types/blog'

  export let post: Pick<Post, 'image' | 'imageAlt' | 'title' | 'firstImageUrl'>
  export let heroImage: HeroImage | null = null

  $: alt = post.imageAlt || `${post.title} 대표 이미지`
  $: shouldRender = Boolean(post.image && post.image !== post.firstImageUrl)
</script>

{#if shouldRender}
  <figure
    class="not-prose mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <img
      class="aspect-[3/2] w-full object-contain"
      src={post.image}
      srcset={heroImage?.srcset}
      sizes={heroImage?.sizes}
      {alt}
      width={heroImage?.width ?? 1200}
      height={heroImage?.height ?? 800}
      fetchpriority="high"
      decoding="async"
    />
  </figure>
{/if}
