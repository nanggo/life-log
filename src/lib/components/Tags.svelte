<script>
  import { onMount } from 'svelte'

  export let tags = []
  export let clickable = true
  export let selectedTag = null
  export let onClick = (tag) => {}

  // 이벤트 전파 방지 함수
  function handleTagClick(tag, event) {
    if (clickable) {
      event.preventDefault()
      event.stopPropagation()
      onClick(tag)
    }
  }

  // 스크롤 컨테이너 참조 변수
  let scrollContainer

  // 마우스 휠 이벤트로 가로 스크롤 처리
  function handleWheel(event) {
    if (scrollContainer) {
      event.preventDefault()

      // 스크롤 속도 조절 (휠 감도)
      const scrollSpeed = 25
      scrollContainer.scrollLeft += event.deltaY > 0 ? scrollSpeed : -scrollSpeed
    }
  }

  onMount(() => {
    if (scrollContainer) {
      // passive: false를 설정하여 preventDefault가 작동하도록 함
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        scrollContainer.removeEventListener('wheel', handleWheel)
      }
    }
  })
</script>

{#if tags && tags.length > 0}
  <div class="relative">
    <div bind:this={scrollContainer} class="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
      {#each tags as tag}
        <button
          class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap {selectedTag ===
          tag
            ? 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
            : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'}"
          class:cursor-pointer={clickable}
          class:cursor-default={!clickable}
          on:click|stopPropagation={(e) => handleTagClick(tag, e)}
          on:keydown|stopPropagation={(e) => e.key === 'Enter' && handleTagClick(tag, e)}
        >
          #{tag}
        </button>
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
