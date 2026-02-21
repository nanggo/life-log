<script lang="ts">
  import { Card } from '../ui/Card'
  import { ArrowRightIcon } from '../ui/Icon'

  import type { Post } from '$lib/types'
  import { createSafeSlug } from '$lib/utils/posts'
  import { TAG_STYLES } from '$lib/utils/tag-styles'

  export let post: Post
  // 프리뷰에서 최대로 표시할 태그 개수 (기본값: 3개)
  export let maxTagsToShow: number = 3

  // Card 내부 태그 링크용 기본 클래스 (compact 사이즈 + z-index for Card overlay)
  const tagBase =
    'relative z-30 flex-shrink-0 px-3 py-2 min-h-[36px] text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap no-underline'
  const tagClass = `${tagBase} ${TAG_STYLES.unselected} ${TAG_STYLES.clickable}`
  const tagMutedClass = `${tagBase} ${TAG_STYLES.muted} ${TAG_STYLES.clickable}`

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

<Card href={getSafeUrl(post.slug)}>
  <slot slot="eyebrow" name="eyebrow" />
  <slot slot="title">{post.title}</slot>
  <div slot="description" class="prose dark:prose-invert">
    {@html post.preview.html ?? ''}
    <div class="flex flex-wrap gap-2 mt-2">
      {#each visibleTags as tag}
        <a
          href="/tags/{encodeURIComponent(tag)}"
          class={tagClass}
          data-sveltekit-preload-data="viewport"
          aria-label={`View posts tagged with ${tag}`}
        >
          #{tag}
        </a>
      {/each}
      {#if hasMoreTags}
        <a
          href={getSafeUrl(post.slug)}
          class={tagMutedClass}
          data-sveltekit-preload-data="viewport"
          aria-label={`View ${hiddenTagsCount} more tags for this post`}
        >
          +{hiddenTagsCount}개
        </a>
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
