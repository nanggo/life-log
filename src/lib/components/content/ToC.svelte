<script lang="ts">
  import GithubSlugger from 'github-slugger'
  import { onMount } from 'svelte'

  import { Card } from '../ui/Card'

  import { browser } from '$app/environment'
  import type { Post } from '$lib/types'
  import { optimizedScrollHandler } from '$lib/utils/performance'

  export let post: Post

  interface ProcessedHeading {
    depth: number
    value: string
    slug: string
  }

  let elements: (HTMLElement | null)[] = []
  let shouldRender = false
  let scrollY: number
  let cleanupScroll: (() => void) | null = null

  const headings: ProcessedHeading[] = post.headings.map((heading) => {
    const slugger = new GithubSlugger()
    return {
      ...heading,
      slug: slugger.slug(heading.value)
    }
  })

  // 지연 렌더링을 위한 스크롤 감지
  const checkShouldRender = () => {
    if (!shouldRender && scrollY > 200) {
      shouldRender = true
      updateHeadings()
      setActiveHeading()
    }
  }

  onMount(() => {
    if (browser) {
      // 초기 스크롤 위치 확인
      if (window.scrollY > 200) {
        shouldRender = true
        updateHeadings()
        setActiveHeading()
      }

      // 스크롤 이벤트를 최적화된 핸들러로 처리 (throttle + passive)
      cleanupScroll = optimizedScrollHandler(() => {
        setActiveHeading()
      }, 50)

      window.addEventListener('hashchange', setActiveHeading)
    }

    return () => {
      if (cleanupScroll) {
        cleanupScroll()
      }
      if (browser) {
        window.removeEventListener('hashchange', setActiveHeading)
      }
    }
  })

  let activeHeading: ProcessedHeading = headings[0]

  const updateHeadings = (): void => {
    if (browser) {
      elements = headings.map((heading) => {
        return document.getElementById(heading.slug)
      })
    }
  }

  const setActiveHeading = (): void => {
    scrollY = window.scrollY

    // 지연 렌더링 체크
    checkShouldRender()

    if (!shouldRender) return

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

{#if shouldRender}
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
{:else}
  <!-- placeholder to prevent layout shift -->
  <div class="w-48 h-32 opacity-0" aria-hidden="true"></div>
{/if}

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
