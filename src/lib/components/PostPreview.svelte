<script lang="ts">
  import ArrowRightIcon from './ArrowRightIcon.svelte'
  import Card from './Card.svelte'

  import { goto } from '$app/navigation'
  import type { Post } from '$lib/types'
  import { createSafeSlug } from '$lib/utils/posts'

  export let post: Post
  // 프리뷰에서 최대로 표시할 태그 개수 (기본값: 3개)
  export let maxTagsToShow: number = 3

  // 태그 클릭 시 필터링
  const handleTagClick = (tag: string): void => {
    goto(`/posts?tag=${encodeURIComponent(tag)}`)
  }

  // 더보기 클릭 시 포스트 페이지로 이동
  const handleMoreTagsClick = (): void => {
    goto(getSafeUrl(post.slug))
  }

  // 태그 제한 처리
  $: visibleTags = post.tags ? post.tags.slice(0, maxTagsToShow) : []
  $: hiddenTagsCount = post.tags ? Math.max(0, post.tags.length - maxTagsToShow) : 0
  $: hasMoreTags = hiddenTagsCount > 0

  // 안전한 URL 생성
  const getSafeUrl = (slug: string): string => {
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

  /* Preview 이미지 크기 및 간격 설정 */
  .prose > :global(p img) {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    .prose > :global(p img) {
      max-width: 85%;
      margin: 0.75rem auto;
    }
  }

  /* 다크모드에서 그림자 조정 */
  :global(.dark) .prose > :global(p img) {
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
  }

  /* Override prose image constraints for enhanced images */
  .prose > :global(p img.enhanced-image) {
    max-width: 100% !important;
  }

  /* On desktop, limit to 4/5 width with auto margins for centering */
  @media (min-width: 768px) {
    .prose > :global(p img.enhanced-image) {
      max-width: 80% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
  }
</style>
