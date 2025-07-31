<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { browser } from '$app/environment'

  let progress = 0
  let throttleId: number | null = null

  const updateProgress = (): void => {
    if (!browser) return

    const article = document.querySelector('article')
    if (!article) return

    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight

    // Get article's position and height
    const articleRect = article.getBoundingClientRect()
    const articleTop = scrollTop + articleRect.top
    const articleHeight = articleRect.height

    // Calculate progress based on article content only
    const articleStart = articleTop
    const articleEnd = articleTop + articleHeight - windowHeight

    if (scrollTop <= articleStart) {
      progress = 0
    } else if (scrollTop >= articleEnd) {
      progress = 100
    } else {
      progress = ((scrollTop - articleStart) / (articleEnd - articleStart)) * 100
    }
  }

  const throttledUpdateProgress = (): void => {
    if (throttleId) {
      cancelAnimationFrame(throttleId)
    }
    throttleId = requestAnimationFrame(updateProgress)
  }

  onMount(() => {
    if (browser) {
      updateProgress()
      window.addEventListener('scroll', throttledUpdateProgress, { passive: true })
      window.addEventListener('resize', throttledUpdateProgress, { passive: true })
    }
  })

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('scroll', throttledUpdateProgress)
      window.removeEventListener('resize', throttledUpdateProgress)
      if (throttleId) {
        cancelAnimationFrame(throttleId)
      }
    }
  })
</script>

<div
  class="reading-progress-bar fixed top-0 left-0 w-full h-1 z-50 bg-zinc-200/30 dark:bg-zinc-700/30"
>
  <div
    class="h-full bg-gradient-to-r from-teal-500 to-teal-600 dark:to-teal-400 transition-all duration-300 ease-out"
    style="width: {progress}%"
  />
</div>

<style>
  .reading-progress-bar {
    backdrop-filter: blur(4px);
  }
</style>
