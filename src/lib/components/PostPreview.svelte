<script>
  import Card from './Card.svelte'
  import ArrowRightIcon from './ArrowRightIcon.svelte'
  import Tags from './Tags.svelte'
  import { goto } from '$app/navigation'

  export let post

  // 태그 클릭 시 필터링
  function handleTagClick(tag) {
    goto(`/posts?tag=${tag}`)
  }
</script>

<Card href={`/post/${post.slug}`} data-sveltekit-prefetch>
  <slot slot="eyebrow" name="eyebrow" />
  <slot slot="title">{post.title}</slot>
  <div slot="description" class="prose dark:prose-invert">
    {@html post.preview.html ?? ''}
    <Tags tags={post.tags ?? []} clickable={true} onClick={handleTagClick} />
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
