<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import type { Post } from '$lib/types'

  export let items: Post[] = []
  export let itemHeight: number = 200
  export let containerHeight: number = 600
  export let buffer: number = 3

  let viewport: HTMLDivElement
  let scrollTop = 0
  let mounted = false

  // 계산된 값들
  $: visibleItemCount = Math.ceil(containerHeight / itemHeight)
  $: totalItems = items.length
  $: totalHeight = totalItems * itemHeight

  // 현재 보이는 아이템들의 범위 계산 (단순화)
  $: startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  $: endIndex = Math.min(totalItems - 1, startIndex + visibleItemCount + buffer * 2)
  $: visibleItems = items.slice(startIndex, endIndex + 1)

  // 스크롤 위치 오프셋
  $: offsetY = startIndex * itemHeight

  // 성능 최적화: 스크롤 이벤트 스로틀링
  let scrollRAF: number | null = null

  function handleScroll() {
    // RAF를 사용한 더 나은 스로틀링
    if (scrollRAF !== null) {
      return
    }

    scrollRAF = requestAnimationFrame(() => {
      if (viewport && mounted) {
        scrollTop = viewport.scrollTop
      }
      scrollRAF = null
    })
  }

  onMount(() => {
    mounted = true

    // cleanup 함수 반환
    return () => {
      mounted = false
      if (scrollRAF !== null) {
        cancelAnimationFrame(scrollRAF)
        scrollRAF = null
      }
    }
  })

  onDestroy(() => {
    mounted = false
    if (scrollRAF !== null) {
      cancelAnimationFrame(scrollRAF)
      scrollRAF = null
    }
  })
</script>

<div class="virtual-list-container" style="height: {containerHeight}px; overflow: hidden;">
  <div
    bind:this={viewport}
    class="virtual-list-viewport"
    style="height: 100%; overflow-y: auto;"
    on:scroll={handleScroll}
  >
    <div class="virtual-list-spacer" style="height: {totalHeight}px; position: relative;">
      <div
        class="virtual-list-items"
        style="transform: translateY({offsetY}px); position: absolute; top: 0; left: 0; right: 0;"
      >
        {#each visibleItems as item, index (item.slug)}
          <div
            class="virtual-list-item"
            style="height: {itemHeight}px;"
            data-index={startIndex + index}
          >
            <slot {item} index={startIndex + index} {totalItems} />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .virtual-list-container {
    position: relative;
  }

  .virtual-list-viewport {
    scrollbar-width: thin;
  }

  .virtual-list-viewport::-webkit-scrollbar {
    width: 6px;
  }

  .virtual-list-viewport::-webkit-scrollbar-track {
    background: transparent;
  }

  .virtual-list-viewport::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .virtual-list-viewport::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .virtual-list-item {
    display: flex;
    align-items: stretch;
  }
</style>
