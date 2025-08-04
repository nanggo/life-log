<script lang="ts">
  import { page } from '$app/stores'
  import { Category } from '$lib/types/blog'

  export let currentCategory: Category | null = null
  export let showCounts: boolean = true
  export let variant: 'default' | 'compact' = 'default'
  export let categoryInfos: Array<{ category: Category; count: number }> = []

  // 현재 경로에서 활성 카테고리 감지
  $: activeCategory = currentCategory || extractCategoryFromPath($page.url.pathname)

  function extractCategoryFromPath(pathname: string): Category | null {
    const match = pathname.match(/\/posts\/category\/(.+)/)
    if (match) {
      const categoryParam = decodeURIComponent(match[1])
      return Object.values(Category).find((cat) => cat === categoryParam) || null
    }
    return null
  }

  function getCategoryDisplayName(category: Category): string {
    const names = {
      [Category.DAILY]: '일상',
      [Category.DEVELOPMENT]: '개발',
      [Category.THOUGHTS]: '생각',
      [Category.REVIEW]: '리뷰'
    }
    return names[category] || category
  }

  function getCategoryUrl(category: Category): string {
    return `/posts/category/${category}`
  }

  function getCategoryIcon(category: Category): string {
    const icons = {
      [Category.DAILY]: '📝',
      [Category.DEVELOPMENT]: '💻',
      [Category.THOUGHTS]: '🤔',
      [Category.REVIEW]: '📖'
    }
    return icons[category] || '📄'
  }

  function getCategoryClasses(category: Category): string {
    // Enhanced accessibility and touch targets
    const compactClasses =
      'group relative flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap touch-manipulation focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'

    const defaultClasses =
      'group relative flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-lg text-sm font-medium transition-all duration-200 border touch-manipulation focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'

    const baseClasses = variant === 'compact' ? compactClasses : defaultClasses

    if (activeCategory === category) {
      return `${baseClasses} bg-teal-500 text-white border-teal-500 shadow-md`
    }

    return `${baseClasses} bg-white text-zinc-700 border-zinc-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:border-teal-500 dark:hover:bg-zinc-700 dark:hover:text-teal-400 dark:active:bg-zinc-600`
  }
</script>

<nav class="category-filter" aria-label="카테고리 필터">
  {#if variant === 'compact'}
    <!-- 컴팩트 버전: 한 줄 레이아웃 -->
    <div class="flex flex-wrap gap-2">
      {#each categoryInfos as { category, count }}
        <a
          href={getCategoryUrl(category)}
          class={getCategoryClasses(category)}
          aria-current={activeCategory === category ? 'page' : undefined}
        >
          <span class="text-sm" aria-hidden="true">{getCategoryIcon(category)}</span>
          <span>{getCategoryDisplayName(category)}</span>
          {#if showCounts}
            <span class="text-xs opacity-75">({count})</span>
          {/if}
        </a>
      {/each}
    </div>
  {:else}
    <!-- 기본 버전: 반응형 그리드 -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {#each categoryInfos as { category, count }}
        <a
          href={getCategoryUrl(category)}
          class={getCategoryClasses(category)}
          aria-current={activeCategory === category ? 'page' : undefined}
        >
          <div class="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
            <span class="text-lg sm:text-base" aria-hidden="true">{getCategoryIcon(category)}</span>
            <div class="flex flex-col items-center sm:items-start">
              <span class="text-center sm:text-left">{getCategoryDisplayName(category)}</span>
              {#if showCounts}
                <span class="text-xs opacity-75 mt-0.5 sm:mt-0 sm:ml-1 sm:inline">
                  {#if variant === 'default'}<br class="sm:hidden" />{/if}
                  ({count})
                </span>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</nav>

<style>
  .category-filter {
    /* 접근성을 위한 포커스 스타일 개선 */
  }

  .category-filter a:focus {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* 호버 애니메이션 개선 */
  .category-filter a {
    transform: translateY(0);
  }

  .category-filter a:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .category-filter a:active {
    transform: translateY(0);
  }

  /* 다크 모드에서 호버 그림자 */
  :global(.dark) .category-filter a:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
</style>
