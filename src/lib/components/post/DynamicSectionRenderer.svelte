<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'

  export let section: any
  export let index: number
  export let isVisible: boolean = false
  export const isLoaded: boolean = false
  export const postSlug: string = ''

  const dispatch = createEventDispatcher()

  let sectionElement: HTMLElement
  let sectionContent: string = ''
  let loading = false
  const error: string | null = null

  // Use the pre-processed HTML content for immediate rendering
  $: sectionContent = section?.htmlContent || generateFallbackHtml(section)

  function generateFallbackHtml(sectionData: any): string {
    if (!sectionData) return '<p>Section data not available</p>'

    const { title, content, level, slug } = sectionData

    return `
      <div class="section-inner">
        <h${level} id="heading-${slug || sectionData.id}" class="section-heading text-${level === 2 ? '2xl' : 'xl'} font-bold mb-4">
          ${title}
        </h${level}>
        <div class="prose dark:prose-invert">
          ${content ? `<div class="whitespace-pre-line">${content}</div>` : '<p>Content not available</p>'}
        </div>
      </div>
    `
  }

  // Load content when section becomes visible
  $: if (isVisible && !loading) {
    loadSection()
  }

  function loadSection() {
    if (loading) return

    loading = true
    dispatch('loaded', {
      index,
      success: true,
      fromCache: !!sectionContent,
      sectionId: section?.id
    })

    // Simulate async loading for demonstration
    // In the real implementation, this could fetch additional resources
    setTimeout(() => {
      loading = false
    }, 50)
  }

  onMount(() => {
    if (sectionElement) {
      dispatch('mounted', { element: sectionElement, index })
    }
  })

  // Memory cleanup for sections that are far from viewport
  export function cleanup() {
    // In a more advanced implementation, we could cleanup heavy resources here
    // For now, we keep the HTML content as it's relatively lightweight
  }

  // Preload function for adjacent sections
  export function preload() {
    if (!sectionContent && section?.htmlContent) {
      sectionContent = section.htmlContent
    }
  }
</script>

<div
  bind:this={sectionElement}
  class="section-container"
  data-section-index={index}
  data-section-id={section?.id}
  role="region"
  aria-labelledby="heading-{section?.slug}"
>
  {#if isVisible}
    <!-- Render the section content -->
    <div
      class="section-content fade-in"
      data-section-loaded="true"
      data-section-slug={section?.slug}
    >
      {#if loading}
        <!-- Loading state for dynamic content -->
        <div class="section-loading" aria-hidden="true">
          <div class="skeleton-header">
            <div class="skeleton-line w-3/4 h-8 mb-4"></div>
            <div class="skeleton-line w-1/2 h-4 mb-6"></div>
          </div>
          <div class="skeleton-content">
            <div class="skeleton-line w-full h-4 mb-2"></div>
            <div class="skeleton-line w-5/6 h-4 mb-2"></div>
            <div class="skeleton-line w-4/5 h-4 mb-4"></div>
          </div>
        </div>
      {:else if error}
        <!-- Error state -->
        <div
          class="section-error p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        >
          <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">섹션 로딩 실패</h3>
          <p class="text-red-600 dark:text-red-300 text-sm mb-3">
            {error}
          </p>
          <button
            on:click={() => loadSection()}
            class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      {:else}
        <!-- Render section HTML content -->
        <div class="section-html-content">
          {@html sectionContent}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Placeholder for unloaded sections -->
    <div
      class="section-placeholder"
      data-section-index={index}
      style="min-height: {Math.max(200, (section?.wordCount || 100) * 0.3)}px"
      aria-hidden="true"
    >
      <div class="placeholder-content">
        <div class="text-center py-8 text-gray-400 dark:text-gray-500">
          <div class="text-lg font-medium mb-2">{section?.title || `Section ${index + 1}`}</div>
          <div class="text-sm mb-1">스크롤하여 내용을 로드합니다</div>
          {#if section?.readingTime && section?.wordCount}
            <div class="text-xs opacity-70">
              약 {section.readingTime}분 소요 · {section.wordCount}단어
            </div>
          {/if}
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

  .section-loading {
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

  /* Enhanced section content styling */
  .section-html-content :global(h2),
  .section-html-content :global(h3) {
    @apply scroll-mt-4;
  }

  .section-html-content :global(pre) {
    @apply max-w-full overflow-x-auto;
  }

  .section-html-content :global(img) {
    @apply max-w-full h-auto;
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
