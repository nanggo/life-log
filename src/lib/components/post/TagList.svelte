<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { generateTagClasses } from '$lib/utils/tag-styles'

  export let tags: string[] = []
  export let clickable: boolean = true
  export let selectedTag: string | null = null
  export let getTagUrl: (tagName: string) => string = (tagName: string) => `/posts?tag=${tagName}`
  export let onTagClick: ((tagName: string) => void) | null = null

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
      scrollContainer.scrollLeft = 0
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
</script>

{#if tags && tags.length > 0}
  <div class="relative">
    <div bind:this={scrollContainer} class="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
      {#each tags as tag}
        {#if onTagClick && clickable}
          <button
            type="button"
            on:click={() => onTagClick(tag)}
            class={getTagClasses(tag, true)}
            aria-current={selectedTag === tag ? 'page' : undefined}
          >
            #{tag}
          </button>
        {:else if clickable}
          <a
            href={getTagUrl(tag)}
            class={getTagClasses(tag, true)}
            aria-current={selectedTag === tag ? 'page' : undefined}
          >
            #{tag}
          </a>
        {:else}
          <span
            class={getTagClasses(tag, false)}
            aria-current={selectedTag === tag ? 'page' : undefined}
          >
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
