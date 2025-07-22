<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  export let tags: string[] = []
  export let clickable: boolean = true
  export let selectedTag: string | null = null
  export let onClick: (_tagName: string) => void = (_tagName: string) => {}

  // 이벤트 전파 방지 함수
  const handleTagClick = (tag: string, event: Event): void => {
    if (clickable) {
      event.preventDefault()
      event.stopPropagation()
      onClick(tag)
    }
  }

  // 스크롤 컨테이너 참조 변수
  let scrollContainer: HTMLDivElement

  // 선택된 태그 버튼 참조 - 객체로 참조 저장
  let tagElements: Record<string, HTMLButtonElement> = {}

  // 마우스 휠 이벤트 핸들러
  const handleWheel = (event: WheelEvent): void => {
    if (!scrollContainer) return
    
    // 마우스 휠 이벤트가 있고, deltaY가 0이 아닌 경우에만 처리
    if (Math.abs(event.deltaY) > 0) {
      // 기본 세로 스크롤 방지
      event.preventDefault()
      
      // deltaY 값을 이용해 수평 스크롤
      const scrollAmount = event.deltaY * 0.5 // 스크롤 속도 조절
      scrollContainer.scrollLeft += scrollAmount
    }
  }

  onMount(() => {
    if (scrollContainer) {
      // 초기 로드 시 맨 앞으로 스크롤
      scrollContainer.scrollLeft = 0
      
      // 마우스 휠 이벤트 리스너 등록
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    }
  })

  onDestroy(() => {
    if (scrollContainer) {
      // 이벤트 리스너 제거
      scrollContainer.removeEventListener('wheel', handleWheel)
    }
  })

  // 태그 요소 바인딩 함수
  // const bindTagElement = (tag, el) => {
  //   tagElements[tag] = el
  // }

  // 원래 태그 클래스로 복원
  const selectedTagClass: string = 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
  const unselectedTagClass: string =
    'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
</script>

{#if tags && tags.length > 0}
  <div class="relative">
    <div bind:this={scrollContainer} class="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
      {#each tags as tag}
        <button
          bind:this={tagElements[tag]}
          class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap {selectedTag ===
          tag
            ? selectedTagClass
            : unselectedTagClass}"
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
