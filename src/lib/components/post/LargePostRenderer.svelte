<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import DynamicSectionRenderer from './DynamicSectionRenderer.svelte'
  import { extractSectionsFromFrontmatter } from '$lib/utils/sectionParser'

  export let post: any
  export let component: any
  export let fallbackComponent: any = null

  // Large post detection and section processing
  $: isLargePost = post?.isLargePost || false
  $: rawSections = post?.sections || []
  $: sections = extractSectionsFromFrontmatter(post)
  $: sectionCount = sections.length

  // State management for dynamic loading
  let visibleSections = new Set<number>()
  let loadedSections = new Set<number>()
  let intersectionObserver: IntersectionObserver | null = null
  let sectionElements: HTMLElement[] = []
  let sectionComponents: any[] = []
  let mounted = false
  let loadingStats = {
    sectionsLoaded: 0,
    sectionsVisible: 0,
    totalSections: 0
  }
  
  // Memory management
  let lastScrollY = 0
  let scrollDirection: 'up' | 'down' = 'down'
  let memoryCleanupTimer: number | null = null

  // Progressive enhancement: show all content by default for SEO
  // Then progressively enhance with JavaScript if available
  let enhancementEnabled = false

  onMount(async () => {
    mounted = true
    loadingStats.totalSections = sectionCount
    
    // Only enable progressive enhancement in browser with JavaScript
    if (browser && 'IntersectionObserver' in window && isLargePost) {
      // Small delay to ensure SSR content is visible first
      await tick()
      setTimeout(() => {
        enhancementEnabled = true
        initializeProgressiveLoading()
      }, 100)
    }
  })

  function initializeProgressiveLoading() {
    if (!browser || !isLargePost || sectionCount === 0) return

    // Setup intersection observer
    setupIntersectionObserver()

    // Initially show first section
    loadSection(0)

    // Setup scroll tracking for intelligent preloading
    if (browser) {
      window.addEventListener('scroll', updateScrollDirection, { passive: true })
      updateScrollDirection() // Initial direction setup
    }

    console.log(`🚀 Initialized progressive loading for ${sectionCount} sections`)
  }

  function loadSection(index: number) {
    if (index < 0 || index >= sectionCount) return
    
    if (!loadedSections.has(index)) {
      loadedSections.add(index)
      loadingStats.sectionsLoaded++
    }
    
    if (!visibleSections.has(index)) {
      visibleSections.add(index)
      loadingStats.sectionsVisible++
      // Trigger reactivity
      visibleSections = new Set(visibleSections)
    }
  }

  function unloadSection(index: number) {
    // Only unload sections that are far from current view
    // Keep a buffer to prevent thrashing
    const currentViewport = getCurrentViewportSections()
    const bufferSize = 3 // Increased buffer for better UX
    
    if (Math.abs(index - currentViewport.center) > bufferSize) {
      if (visibleSections.has(index)) {
        // Call cleanup on the section component if available
        const sectionComponent = sectionComponents[index]
        if (sectionComponent && typeof sectionComponent.cleanup === 'function') {
          sectionComponent.cleanup()
        }
        
        visibleSections.delete(index)
        loadingStats.sectionsVisible--
        visibleSections = new Set(visibleSections)
        
        console.log(`🗑️ Unloaded section ${index} to save memory`)
      }
    }
  }

  function scheduleMemoryCleanup() {
    if (memoryCleanupTimer) {
      clearTimeout(memoryCleanupTimer)
    }
    
    memoryCleanupTimer = window.setTimeout(() => {
      performMemoryCleanup()
    }, 2000) // Cleanup after 2 seconds of inactivity
  }

  function performMemoryCleanup() {
    if (!browser || !enhancementEnabled) return
    
    const currentViewport = getCurrentViewportSections()
    const sectionsToKeep = 4 // Keep sections around current viewport
    
    visibleSections.forEach((sectionIndex) => {
      const distanceFromCenter = Math.abs(sectionIndex - currentViewport.center)
      if (distanceFromCenter > sectionsToKeep) {
        unloadSection(sectionIndex)
      }
    })
    
    // Preload sections in scroll direction
    if (scrollDirection === 'down') {
      preloadAdjacentSections(currentViewport.center, 1, 3) // Preload more ahead
    } else {
      preloadAdjacentSections(currentViewport.center, 3, 1) // Preload more behind
    }
  }

  function preloadAdjacentSections(currentIndex: number, behind = 2, ahead = 2) {
    // Preload sections around current position with directional bias
    for (let i = -behind; i <= ahead; i++) {
      const targetIndex = currentIndex + i
      if (targetIndex >= 0 && targetIndex < sectionCount && !loadedSections.has(targetIndex)) {
        loadSection(targetIndex)
        
        // Preload content in section component if available
        const sectionComponent = sectionComponents[targetIndex]
        if (sectionComponent && typeof sectionComponent.preload === 'function') {
          sectionComponent.preload()
        }
      }
    }
  }

  // Track scroll direction for intelligent preloading
  function updateScrollDirection() {
    if (!browser) return
    
    const currentScrollY = window.scrollY
    scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up'
    lastScrollY = currentScrollY
    
    scheduleMemoryCleanup()
  }

  function getCurrentViewportSections(): { center: number; start: number; end: number } {
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // Estimate which sections are currently in viewport
    const viewportCenter = scrollY + windowHeight / 2
    const progressRatio = viewportCenter / documentHeight
    const centerSection = Math.floor(progressRatio * sectionCount)
    
    return {
      center: centerSection,
      start: Math.max(0, centerSection - 1),
      end: Math.min(sectionCount - 1, centerSection + 1)
    }
  }

  function handleSectionMounted(event: CustomEvent) {
    const { element, index } = event.detail
    if (element && intersectionObserver) {
      sectionElements[index] = element
      intersectionObserver.observe(element)
    }
  }

  function handleSectionLoaded(event: CustomEvent) {
    const { index, success, fromCache, sectionId } = event.detail
    if (success) {
      console.log(`📖 Section ${index} (${sectionId}) loaded successfully ${fromCache ? '(from cache)' : '(fresh)'}`)
    } else {
      console.warn(`❌ Section ${index} failed to load:`, event.detail.error)
    }
  }

  // Enhanced intersection observer with scroll tracking
  function setupIntersectionObserver() {
    if (intersectionObserver) return

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionIndex = parseInt(entry.target.getAttribute('data-section-index') || '0')
          
          if (entry.isIntersecting) {
            // Load current section and preload adjacent sections
            loadSection(sectionIndex)
            preloadAdjacentSections(sectionIndex)
          } else if (entry.boundingClientRect.top > window.innerHeight * 3) {
            // Unload sections that are very far above viewport
            unloadSection(sectionIndex)
          }
        })
      },
      {
        rootMargin: '500px 0px 500px 0px', // Generous margins for smooth loading
        threshold: [0, 0.1, 0.5, 0.9]
      }
    )
  }

  // Cleanup
  function cleanup() {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
    
    if (browser && window) {
      window.removeEventListener('scroll', updateScrollDirection)
    }
    
    if (memoryCleanupTimer) {
      clearTimeout(memoryCleanupTimer)
      memoryCleanupTimer = null
    }
    
    // Cleanup all section components
    sectionComponents.forEach((component, index) => {
      if (component && typeof component.cleanup === 'function') {
        component.cleanup()
      }
    })
    
    console.log('🧹 Cleaned up large post renderer resources')
  }

  // Auto cleanup on unmount
  onDestroy(cleanup)

  // Update loading stats reactively
  $: {
    loadingStats.sectionsVisible = visibleSections.size
    loadingStats.sectionsLoaded = loadedSections.size
  }
</script>

{#if !isLargePost}
  <!-- Regular post - render normally -->
  <svelte:component this={component} />
{:else}
  <!-- Large post with progressive enhancement -->
  <div class="large-post-container" role="article">
    {#if !enhancementEnabled}
      <!-- Fallback: full content for SEO and no-JS users -->
      <svelte:component this={component} />
    {:else}
      <!-- Progressive enhancement active with section-based rendering -->
      <div class="sections-container">
        {#each sections as section, index}
          <DynamicSectionRenderer
            bind:this={sectionComponents[index]}
            {section}
            {index}
            postSlug={post?.slug || 'unknown'}
            isVisible={visibleSections.has(index)}
            isLoaded={loadedSections.has(index)}
            on:mounted={handleSectionMounted}
            on:loaded={handleSectionLoaded}
          />
        {/each}
      </div>

      <!-- Enhanced loading progress indicator -->
      {#if enhancementEnabled && sectionCount > 1}
        <div class="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="flex flex-col">
              <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">
                진행률: {loadingStats.sectionsVisible} / {loadingStats.totalSections}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                로드됨: {loadingStats.sectionsLoaded}개 섹션
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                  style="width: {loadingStats.totalSections > 0 ? (loadingStats.sectionsVisible / loadingStats.totalSections) * 100 : 0}%"
                ></div>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round(loadingStats.totalSections > 0 ? (loadingStats.sectionsVisible / loadingStats.totalSections) * 100 : 0)}%
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style lang="postcss">
  .large-post-container {
    @apply relative;
  }

  .section-container {
    @apply mb-8 scroll-mt-4;
  }

  .section-content {
    @apply opacity-0 transform translate-y-4;
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .section-content.fade-in {
    @apply opacity-100 transform translate-y-0;
  }

  @keyframes fadeInUp {
    from {
      @apply opacity-0 transform translate-y-4;
    }
    to {
      @apply opacity-100 transform translate-y-0;
    }
  }

  .section-placeholder {
    @apply bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  }

  .section-placeholder.loading {
    @apply animate-pulse;
  }

  .placeholder-content {
    @apply p-6;
  }

  .skeleton-header {
    @apply mb-6;
  }

  .skeleton-line {
    @apply bg-gray-300 dark:bg-gray-600 rounded;
  }

  .skeleton-content .skeleton-line:not(:last-child) {
    @apply mb-3;
  }

  /* Ensure content is always accessible for screen readers */
  @media (prefers-reduced-motion: reduce) {
    .section-content {
      @apply opacity-100 transform translate-y-0;
      animation: none;
    }
  }

  /* Print styles - show all content */
  @media print {
    .section-placeholder {
      @apply hidden;
    }
    
    .section-content {
      @apply opacity-100 transform translate-y-0;
      animation: none;
    }
  }
</style>