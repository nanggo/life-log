<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  export let tags: string[] = []
  export let clickable: boolean = true
  export let selectedTag: string | null = null
  export let getTagUrl: (tagName: string) => string = (tagName: string) => `/posts?tag=${tagName}`

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

  const selectedTagClass: string = 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
  const unselectedTagClass: string =
    'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
</script>

{#if tags && tags.length > 0}
  <div class="relative">
    <div bind:this={scrollContainer} class="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
      {#each tags as tag}
        <a
          href={clickable ? getTagUrl(tag) : 'javascript:void(0)'}
          class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap {selectedTag ===
          tag
            ? selectedTagClass
            : unselectedTagClass}"
          class:cursor-pointer={clickable}
          class:cursor-default={!clickable}
          aria-current={selectedTag === tag ? 'page' : undefined}
        >
          #{tag}
        </a>
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
