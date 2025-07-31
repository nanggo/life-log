<script lang="ts">
  export let tagInfos: Array<{ tag: string; count: number }> = []
  export let getTagUrl: (tagName: string) => string = (tagName: string) => `/tags/${tagName}`
  export let clickable: boolean = false
  export let compact: boolean = false

  // 태그 크기 계산 함수 (포스트 개수에 따라)
  function getTagSizeClass(count: number): string {
    if (count >= 7) return 'text-lg font-semibold'
    if (count >= 4) return 'text-base font-medium'
    return 'text-sm font-normal'
  }

  // 태그 투명도 계산 (빈도가 높을수록 진하게)
  function getTagOpacity(count: number, maxCount: number): string {
    const ratio = count / maxCount
    if (ratio >= 0.8) return 'opacity-100'
    if (ratio >= 0.6) return 'opacity-90'
    if (ratio >= 0.4) return 'opacity-80'
    if (ratio >= 0.2) return 'opacity-70'
    return 'opacity-60'
  }

  // 최대 포스트 개수 계산
  $: maxCount = Math.max(...tagInfos.map((info) => info.count), 1)

  // 태그 클래스 생성
  function getTagClasses(tag: string, count: number): string {
    const baseClasses =
      'inline-block px-3 py-1.5 m-1 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md'
    const sizeClass = getTagSizeClass(count)
    const opacityClass = getTagOpacity(count, maxCount)
    const colorClass =
      'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-800/40'

    return `${baseClasses} ${sizeClass} ${opacityClass} ${colorClass}`
  }

  // 컴팩트 모드에서의 클래스
  function getCompactTagClasses(tag: string, count: number): string {
    const baseClasses =
      'inline-block px-2 py-1 m-0.5 text-xs rounded transition-all duration-200 hover:scale-105'
    const opacityClass = getTagOpacity(count, maxCount)
    const colorClass =
      'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'

    return `${baseClasses} ${opacityClass} ${colorClass}`
  }
</script>

{#if tagInfos && tagInfos.length > 0}
  <div class="tag-cloud" class:compact>
    {#if compact}
      <!-- 컴팩트 모드: 작은 태그들 -->
      <div class="flex flex-wrap gap-1">
        {#each tagInfos as { tag, count }}
          {#if clickable}
            <a
              href={getTagUrl(tag)}
              class={getCompactTagClasses(tag, count)}
              title={`${tag} (${count}개 포스트)`}
              aria-label={`${tag} 태그, ${count}개 포스트`}
            >
              #{tag}
            </a>
          {:else}
            <span
              class={getCompactTagClasses(tag, count)}
              title={`${tag} (${count}개 포스트)`}
              aria-label={`${tag} 태그, ${count}개 포스트`}
            >
              #{tag}
            </span>
          {/if}
        {/each}
      </div>
    {:else}
      <!-- 기본 모드: 태그 클라우드 -->
      <div class="flex flex-wrap justify-center items-center gap-2 p-4">
        {#each tagInfos as { tag, count }}
          {#if clickable}
            <a
              href={getTagUrl(tag)}
              class={getTagClasses(tag, count)}
              title={`${tag} (${count}개 포스트)`}
              aria-label={`${tag} 태그, ${count}개 포스트`}
            >
              #{tag}
              <span class="ml-1 text-xs opacity-75">({count})</span>
            </a>
          {:else}
            <span
              class={getTagClasses(tag, count)}
              title={`${tag} (${count}개 포스트)`}
              aria-label={`${tag} 태그, ${count}개 포스트`}
            >
              #{tag}
              <span class="ml-1 text-xs opacity-75">({count})</span>
            </span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="text-center py-8">
    <p class="text-zinc-500 dark:text-zinc-400">아직 태그가 없습니다.</p>
  </div>
{/if}

<style>
  .tag-cloud {
    /* 태그 클라우드 기본 스타일 */
  }

  .tag-cloud a,
  .tag-cloud span {
    text-decoration: none;
    border: 1px solid transparent;
  }

  .tag-cloud a:hover {
    text-decoration: none;
    transform: translateY(-1px);
  }

  .tag-cloud a:focus {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  .tag-cloud span {
    cursor: default;
  }

  /* 컴팩트 모드 스타일 */
  .tag-cloud.compact a {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  /* 다크 모드 호버 효과 */
  :global(.dark) .tag-cloud a:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
</style>
