<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  export let src
  export let alt
  export let width = 800
  export let height = undefined
  export let className = ''
  export let loading = 'lazy'

  let imageElement
  let loaded = false
  let error = false

  onMount(() => {
    if (imageElement && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage()
              observer.disconnect()
            }
          })
        },
        { threshold: 0.1, rootMargin: '50px' }
      )
      observer.observe(imageElement)

      return () => {
        observer.disconnect()
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage()
    }
  })

  function loadImage() {
    const img = new Image()
    img.onload = () => {
      loaded = true
    }
    img.onerror = () => {
      error = true
    }
    img.src = src
  }
</script>

<div
  bind:this={imageElement}
  class={`relative overflow-hidden ${className}`}
  style={height ? `height: ${height}px` : ''}
>
  {#if !loaded && !error}
    <!-- Placeholder while loading -->
    <div
      class="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center"
      style={height ? `height: ${height}px` : 'aspect-ratio: 16/9'}
    >
      <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  {:else if error}
    <!-- Error placeholder -->
    <div
      class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500"
      style={height ? `height: ${height}px` : 'aspect-ratio: 16/9'}
    >
      <span>이미지를 불러올 수 없습니다</span>
    </div>
  {:else if loaded}
    <!-- Actual image -->
    <img
      {src}
      {alt}
      {width}
      {height}
      {loading}
      class="w-full h-full object-cover"
      transition:fade={{ duration: 300 }}
    />
  {/if}
</div>
