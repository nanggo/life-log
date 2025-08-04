<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import type { Post } from '$lib/types'

  export let items: Post[] = []
  export let itemHeight: number = 200
  export let containerHeight: number = 600
  export let buffer: number = 3

  let viewport: HTMLDivElement
  let scrollTop = 0

  // 계산된 값들
  $: visibleItemCount = Math.ceil(containerHeight / itemHeight)
  $: totalItems = items.length
  $: totalHeight = totalItems * itemHeight

  // 적응형 버퍼 크기 (성능에 따라 동적 조정)
  let adaptiveBuffer = buffer
  let frameCount = 0
  let lastFrameTime = 0

  // 현재 보이는 아이템들의 범위 계산
  $: startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - adaptiveBuffer)
  $: endIndex = Math.min(totalItems - 1, startIndex + visibleItemCount + adaptiveBuffer * 2)
  $: visibleItems = items.slice(startIndex, endIndex + 1)

  // 성능 모니터링 및 버퍼 조정
  function measurePerformance() {
    const now = performance.now()
    frameCount++

    if (frameCount % 60 === 0) {
      // 60프레임마다 체크
      const fps = (1000 / (now - lastFrameTime)) * 60

      // FPS에 따라 버퍼 크기 적응적 조정
      if (fps < 30) {
        // 성능이 낮으면 버퍼 크기 줄임
        adaptiveBuffer = Math.max(1, buffer - 1)
      } else if (fps > 55) {
        // 성능이 좋으면 버퍼 크기 늘림 (부드러운 스크롤)
        adaptiveBuffer = Math.min(buffer + 2, buffer * 2)
      }

      lastFrameTime = now
      frameCount = 0
    }
  }

  // 스크롤 위치 오프셋
  $: offsetY = startIndex * itemHeight

  // 성능 최적화: 스크롤 이벤트 스로틀링과 디바운싱
  let scrollTimeout: ReturnType<typeof setTimeout>
  let lastScrollTime = 0
  const THROTTLE_DELAY = 16 // ~60fps

  function handleScroll() {
    const now = Date.now()

    // 스로틀링: 60fps 제한으로 성능 향상
    if (now - lastScrollTime >= THROTTLE_DELAY) {
      if (viewport) {
        scrollTop = viewport.scrollTop
        // 성능 모니터링
        measurePerformance()
      }
      lastScrollTime = now
    }

    // 디바운싱: 스크롤이 끝난 후 정리 작업
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      if (viewport) {
        // 최종 스크롤 위치 업데이트
        scrollTop = viewport.scrollTop

        // 메모리 최적화: 보이지 않는 DOM 노드 정리 힌트
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            // 브라우저가 여유가 있을 때 추가 최적화 작업
            if (viewport && viewport.children.length > 50) {
              // 많은 자식 요소가 있을 때만 정리 수행
              // 화면 밖의 요소들에 대한 정리 작업 (필요시)
              if (import.meta.env.DEV) {
                console.debug(`Virtual scroll optimization: ${visibleItems.length} items visible`)
              }
            }
          })
        }
      }
    }, 150)
  }

  onMount(() => {
    // Virtual List 마운트 시 초기화
    lastFrameTime = performance.now()

    // Intersection Observer를 사용한 추가 최적화 (선택적)
    if ('IntersectionObserver' in window && viewport) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement
            if (!entry.isIntersecting) {
              // 화면 밖의 요소에 대한 최적화 (예: 이미지 언로드)
              const images = element.querySelectorAll('img')
              images.forEach((img) => {
                if (img.src && img.dataset.original) {
                  img.src = '' // 메모리 절약을 위해 이미지 언로드
                }
              })
            }
          })
        },
        {
          root: viewport,
          rootMargin: `${adaptiveBuffer * itemHeight}px`,
          threshold: 0
        }
      )

      return () => {
        observer.disconnect()
      }
    }

    // Return void to satisfy TypeScript
    return
  })

  onDestroy(() => {
    // 정리 작업: 타이머 정리
    clearTimeout(scrollTimeout)
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
        {#each visibleItems as item, index (startIndex + index)}
          <div
            class="virtual-list-item"
            style="height: {itemHeight}px;"
            data-index={startIndex + index}
          >
            <slot {item} index={startIndex + index} />
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
