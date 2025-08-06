<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'

  import { browser } from '$app/environment'

  export let section: any
  export let index: number
  export let isVisible: boolean = false
  export const isLoaded: boolean = false

  const dispatch = createEventDispatcher()

  let sectionElement: HTMLElement
  let dynamicComponent: any = null
  let loading = false
  let error: string | null = null

  // Dynamic import for section content
  async function loadSectionContent() {
    if (loading || dynamicComponent || !browser) return

    loading = true
    error = null

    try {
      // Use pre-generated HTML content for this section
      dynamicComponent = createSectionComponent(section)
      dispatch('loaded', { index, success: true })
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
      dispatch('loaded', { index, success: false, error })
    } finally {
      loading = false
    }
  }

  function createSectionComponent(sectionData: any) {
    // Create a component that renders the pre-processed HTML content
    const htmlContent = sectionData.htmlContent || generateFallbackHtml(sectionData)

    return {
      render: () => htmlContent,
      $$render: () => htmlContent
    }
  }

  function generateFallbackHtml(sectionData: any): string {
    // Fallback HTML generation for sections without pre-processed content
    const { title, content, level } = sectionData

    return `
      <div class="section-inner">
        <h${level} id="heading-${sectionData.slug || sectionData.id}" class="section-heading text-${level === 2 ? '2xl' : 'xl'} font-bold mb-4">
          ${title}
        </h${level}>
        <div class="prose dark:prose-invert">
          ${content ? `<p>${content.replace(/\n/g, '</p><p>')}</p>` : '<p>Content not available</p>'}
        </div>
      </div>
    `
  }

  // Load content when section becomes visible
  $: if (isVisible && !dynamicComponent && !loading) {
    loadSectionContent()
  }

  onMount(() => {
    if (sectionElement) {
      dispatch('mounted', { element: sectionElement, index })
    }
  })
</script>

<div
  bind:this={sectionElement}
  class="section-container"
  data-section-index={index}
  data-section-id={section.id}
  role="region"
  aria-labelledby="heading-{section.slug}"
>
  {#if isVisible && dynamicComponent}
    <!-- Render the dynamically loaded section -->
    <div class="section-content fade-in" data-section-loaded="true">
      {@html section.htmlContent || generateFallbackHtml(section)}
    </div>
  {:else if isVisible && loading}
    <!-- Loading state -->
    <div class="section-placeholder loading" aria-hidden="true">
      <div class="skeleton-header">
        <div class="skeleton-line w-3/4 h-8 mb-4"></div>
        <div class="skeleton-line w-1/2 h-4 mb-6"></div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-line w-full h-4 mb-2"></div>
        <div class="skeleton-line w-5/6 h-4 mb-2"></div>
        <div class="skeleton-line w-4/5 h-4 mb-4"></div>
        <div class="skeleton-line w-full h-4 mb-2"></div>
        <div class="skeleton-line w-3/4 h-4"></div>
      </div>
    </div>
  {:else if isVisible && error}
    <!-- Error state -->
    <div
      class="section-error p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
    >
      <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">섹션 로딩 실패</h3>
      <p class="text-red-600 dark:text-red-300 text-sm">
        {error}
      </p>
      <button
        on:click={loadSectionContent}
        class="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        다시 시도
      </button>
    </div>
  {:else}
    <!-- Placeholder for unloaded sections -->
    <div
      class="section-placeholder"
      data-section-index={index}
      style="min-height: {Math.max(200, section.wordCount * 0.3)}px"
      aria-hidden="true"
    >
      <div class="placeholder-content">
        <div class="text-center py-8 text-gray-400">
          <div class="text-lg font-medium">{section.title}</div>
          <div class="text-sm">스크롤하여 내용을 로드합니다</div>
          <div class="text-xs mt-2 opacity-70">
            약 {section.readingTime}분 소요 · {section.wordCount}단어
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
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

  /* Accessibility and performance optimizations */
  @media (prefers-reduced-motion: reduce) {
    .section-content {
      @apply opacity-100 transform translate-y-0;
      animation: none;
    }
  }

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
