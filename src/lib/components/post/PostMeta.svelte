<script lang="ts">
  import { goto } from '$app/navigation'

  export let tags: string[]
  export let maxTagsToShow: number = 3
  export let onMoreTagsClick: (() => void) | undefined = undefined
  export let clickable: boolean = true

  // 태그 클릭 시 필터링
  const handleTagClick = (tag: string): void => {
    if (!clickable) return
    goto(`/tags/${encodeURIComponent(tag)}`)
  }

  // 태그 제한 처리
  $: visibleTags = tags ? tags.slice(0, maxTagsToShow) : []
  $: hiddenTagsCount = tags ? Math.max(0, tags.length - maxTagsToShow) : 0
  $: hasMoreTags = hiddenTagsCount > 0
</script>

{#if tags && tags.length > 0}
  <div class="flex flex-wrap gap-2 mt-2">
    {#each visibleTags as tag}
      <button
        class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        class:cursor-pointer={clickable}
        class:cursor-default={!clickable}
        disabled={!clickable}
        on:click|stopPropagation|preventDefault={() => handleTagClick(tag)}
      >
        #{tag}
      </button>
    {/each}
    {#if hasMoreTags}
      <button
        class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
        on:click|stopPropagation|preventDefault={onMoreTagsClick}
      >
        +{hiddenTagsCount}개
      </button>
    {/if}
  </div>
{/if}
