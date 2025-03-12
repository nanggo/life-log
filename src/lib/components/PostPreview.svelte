<script>
  import Card from './Card.svelte'
  import ArrowRightIcon from './ArrowRightIcon.svelte'
  import Tags from './Tags.svelte'
  import { goto } from '$app/navigation'
  import { createSafeSlug } from '$lib/utils/posts'

  export let post
  // 프리뷰에서 최대로 표시할 태그 개수 (기본값: 3개)
  export let maxTagsToShow = 3

  // 태그 클릭 시 필터링
  function handleTagClick(tag) {
    goto(`/posts?tag=${encodeURIComponent(tag)}`)
  }

  // 더보기 클릭 시 포스트 페이지로 이동
  function handleMoreTagsClick() {
    goto(getSafeUrl(post.slug))
  }

  // 태그 제한 처리
  $: visibleTags = post.tags ? post.tags.slice(0, maxTagsToShow) : []
  $: hiddenTagsCount = post.tags ? Math.max(0, post.tags.length - maxTagsToShow) : 0
  $: hasMoreTags = hiddenTagsCount > 0

  // 안전한 URL 생성
  function getSafeUrl(slug) {
    if (!slug) return '/posts'

    try {
      // 유틸리티 함수를 사용하여 안전한 URL 생성
      return `/post/${createSafeSlug(slug)}`
    } catch (err) {
      console.error('Error creating URL:', err)
      return '/posts'
    }
  }
</script>

<Card href={getSafeUrl(post.slug)} data-sveltekit-prefetch>
  <slot slot="eyebrow" name="eyebrow" />
  <slot slot="title">{post.title}</slot>
  <div slot="description" class="prose dark:prose-invert">
    {@html post.preview.html ?? ''}
    <div class="flex flex-wrap gap-2 mt-2">
      {#each visibleTags as tag}
        <button
          class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
          on:click|stopPropagation|preventDefault={() => handleTagClick(tag)}
        >
          #{tag}
        </button>
      {/each}
      {#if hasMoreTags}
        <button
          class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
          on:click|stopPropagation|preventDefault={handleMoreTagsClick}
        >
          +{hiddenTagsCount}개
        </button>
      {/if}
    </div>
  </div>
  <div slot="actions">
    <div class="flex items-center text-teal-500">
      <span class="text-sm font-medium">Read</span>
      <ArrowRightIcon class="w-4 h-4 ml-1" />
    </div>
  </div>
</Card>

<style>
  .prose > :global(p) {
    margin-top: 0;
    margin-bottom: 0;
  }
</style>
