<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { generateTagClasses } from '$lib/utils/tag-styles'

  export let tags: string[] = []
  export let clickable: boolean = true
  export let selectedTag: string | null = null
  export let getTagUrl: (tagName: string) => string = (tagName: string) => `/posts?tag=${tagName}`
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

  // 태그 엘리먼트 타입 결정
  const getTagElementType = (clickable: boolean, hasClickHandler: boolean): string => {
    if (hasClickHandler) return 'button'
    if (clickable) return 'a'
    return 'span'
  }

  // 태그 엘리먼트 속성 생성
  const getTagProps = (tag: string, clickable: boolean, hasClickHandler: boolean) => {
    const baseProps = {
      class: getTagClasses(tag, clickable),
      'aria-current': (selectedTag === tag ? 'page' : undefined) as 'page' | undefined
    }

    if (hasClickHandler) {
      return { ...baseProps, type: 'button' }
    }

    if (clickable) {
      return { ...baseProps, href: getTagUrl(tag) }
    }

    return baseProps
  }
</script>

{#if tags && tags.length > 0}
  <div class="relative">
    <div bind:this={scrollContainer} class="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
      {#each tags as tag}
        {@const hasClickHandler = !!(handleTagClick && clickable)}
        {@const elementType = getTagElementType(clickable, hasClickHandler)}
        {@const elementProps = getTagProps(tag, clickable, hasClickHandler)}

        {#if hasClickHandler && handleTagClick}
          <svelte:element
            this={elementType}
            {...elementProps}
            role={elementType === 'span' ? 'button' : undefined}
            on:click={() => handleTagClick(tag)}
          >
            #{tag}
          </svelte:element>
        {:else}
          <svelte:element this={elementType} {...elementProps}>
            #{tag}
          </svelte:element>
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
