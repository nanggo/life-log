<script lang="ts">
  import GithubSlugger from 'github-slugger'
  import { onMount } from 'svelte'

  import Card from './Card.svelte'

  import { browser } from '$app/environment'
  import type { Post } from '$lib/types'

  export let post: Post

  interface ProcessedHeading {
    depth: number
    value: string
    slug: string
  }

  let elements: (HTMLElement | null)[] = []
  const headings: ProcessedHeading[] = post.headings.map((heading) => {
    const slugger = new GithubSlugger()
    return {
      ...heading,
      slug: slugger.slug(heading.value)
    }
  })

  onMount(() => {
    updateHeadings()
    setActiveHeading()
  })

  let activeHeading: ProcessedHeading = headings[0]
  let scrollY: number

  const updateHeadings = (): void => {
    if (browser) {
      elements = headings.map((heading) => {
        return document.getElementById(heading.slug)
      })
    }
  }

  const setActiveHeading = (): void => {
    scrollY = window.scrollY

    // 현재 스크롤 위치보다 위에 있는 마지막 요소를 찾음
    const visibleIndex: number = elements.reduce(
      (lastVisible: number, element: HTMLElement | null, index: number) => {
        if (element && element.offsetTop <= scrollY) {
          return index
        }
        return lastVisible
      },
      0
    )

    activeHeading = headings[visibleIndex]

    const pageHeight: number = document.body.scrollHeight
    const scrollProgress: number = (scrollY + window.innerHeight) / pageHeight

    if (!activeHeading) {
      if (scrollProgress > 0.5) {
        activeHeading = headings[headings.length - 1]
      } else {
        activeHeading = headings[0]
      }
    }
  }
</script>

<svelte:window on:scroll={setActiveHeading} on:hashchange={setActiveHeading} />

<Card>
  <slot slot="description">
    <ul class="flex flex-col gap-2">
      {#each headings as heading}
        <li
          class="pl-2 transition-colors border-teal-500 heading text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100"
          class:active={activeHeading === heading}
          style={`--depth: ${
            // consider h1 and h2 at the same depth, as h1 will only be used for page title
            Math.max(0, heading.depth - 1)
          }`}
        >
          <a href="#{heading.slug}">
            {heading.value}
          </a>
        </li>
      {/each}
    </ul>
  </slot>
</Card>

<style lang="postcss">
  .heading {
    padding-left: calc(var(--depth, 0) * 0.35rem);
  }

  .active {
    @apply font-medium text-slate-900 border-l-2 -ml-[2px];
  }

  /* can't use dark: modifier in @apply */
  :global(.dark) .active {
    @apply text-slate-100;
  }
</style>
