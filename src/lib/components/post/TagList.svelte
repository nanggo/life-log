<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { preloadDataOnViewport } from '$lib/actions/preload-data-on-viewport'
  import { generateTagClasses } from '$lib/utils/tag-styles'

  export let tags: string[] = []
  export let clickable: boolean = true
  export let selectedTag: string | null = null
  export let getTagUrl: (tagName: string) => string = (tagName: string) =>
    `/tags/${encodeURIComponent(tagName)}`
  export let handleTagClick: ((tagName: string) => void) | null = null

  // 스크롤 컨테이너 참조 변수
  let scrollContainer: HTMLDivElement

  // 마우스 휠 이벤트 핸들러
  const handleWheel = (event: WheelEvent): void => {
    if (!scrollContainer) return

    if (Math.abs(event.deltaY) > 0) {
      event.preventDefault()
      const scrollAmount = event.deltaY * 0.5
      scrollContainer.scrollLeft += scrollAmount
    }
  }

  onMount(() => {
    if (scrollContainer) {
      // 좌측 패딩(pl-2 = 8px)을 고려하여 스크롤 위치를 약간 조정
      scrollContainer.scrollLeft = -8
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    }
  })

  onDestroy(() => {
    if (scrollContainer) {
      scrollContainer.removeEventListener('wheel', handleWheel)
    }
  })

  // 태그 클래스 생성을 위한 헬퍼 함수
  const getTagClasses = (tag: string, clickable: boolean): string => {
    return generateTagClasses(tag, selectedTag, clickable)
  }

  // 태그 엘리먼트 속성 생성
  const getTagProps = (tag: string, clickable: boolean) => {
    return {
      class: getTagClasses(tag, clickable),
      'aria-current': (selectedTag === tag ? 'page' : undefined) as 'page' | undefined,
      'data-testid': `tag-item-${tag}`
    }
  }
</script>

{#if tags && tags.length > 0}
  <div class="relative" data-testid="tag-list-container">
    <div
      bind:this={scrollContainer}
      class="flex gap-2 mt-2 pt-1 pl-2 overflow-x-auto overflow-y-visible pb-2 scrollbar-thin"
      data-testid="tag-list-scroll-container"
    >
      {#each tags as tag}
        {@const hasClickHandler = !!(handleTagClick && clickable)}
        {@const elementProps = getTagProps(tag, clickable)}

        {#if hasClickHandler && handleTagClick}
          <button {...elementProps} type="button" on:click={() => handleTagClick(tag)}>
            #{tag}
          </button>
        {:else if clickable}
          <a
            {...elementProps}
            href={getTagUrl(tag)}
            data-sveltekit-preload-data="hover"
            data-sveltekit-preload-code="viewport"
            use:preloadDataOnViewport={{ href: getTagUrl(tag) }}
          >
            #{tag}
          </a>
        {:else}
          <span {...elementProps}>
            #{tag}
          </span>
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style>
  /* 스크롤바 스타일링 */
  .scrollbar-thin::-webkit-scrollbar {
    height: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 999px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  /* 호버 시 스크롤바 표시 */
  .scrollbar-thin:hover::-webkit-scrollbar-thumb {
    opacity: 1;
  }

  /* 다크 모드 스크롤바 */
  :global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
  }

  /* 가로 스크롤 */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  .scrollbar-thin:hover {
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  }

  :global(.dark) .scrollbar-thin:hover {
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
</style>
