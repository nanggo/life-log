<script lang="ts">
  import VirtualList from '../VirtualList.svelte'

  import PostDate from './PostDate.svelte'
  import PostPreview from './PostPreview.svelte'

  import type { Post } from '$lib/types'



  export let posts: Post[]

  // 성능 최적화: 포스트가 많을 때만 Virtual Scrolling 사용
  $: useVirtualScrolling = posts.length > 15 // 임계값을 15로 낮춤 (더 빠른 활성화)
  const ITEM_HEIGHT = 280 // 각 포스트 아이템의 예상 높이 (조정됨)
  const CONTAINER_HEIGHT = 1400 // Virtual List 컨테이너 높이 (더 많은 아이템 표시)
  
  // 메모이제이션을 위한 키 생성
  $: postsKey = posts.map(p => `${p.slug}-${p.date}`).join(',')
</script>

{#if useVirtualScrolling}
  <!-- Virtual Scrolling 모드 -->
  <VirtualList
    items={posts}
    itemHeight={ITEM_HEIGHT}
    containerHeight={CONTAINER_HEIGHT}
    buffer={2}
    let:item={post}
  >
    <div class="w-full px-4">
      <article
        class="grid items-start grid-cols-4 gap-8 py-8 border-b border-zinc-100 dark:border-zinc-700/40 last:border-b-0"
      >
        <PostDate class="flex-col hidden md:flex text-sm" {post} decorate={false} />

        <div class="col-span-4 md:col-span-3">
          <PostPreview {post}>
            <slot slot="eyebrow">
              <PostDate class="md:hidden" {post} collapsed decorate />
            </slot>
          </PostPreview>
        </div>
      </article>
    </div>
  </VirtualList>
{:else}
  <!-- 기본 모드 -->
  <div
    class="flex flex-col gap-16 md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40"
  >
    {#each posts as post (post.slug)}
      <article class="grid items-start grid-cols-4 gap-8">
        <PostDate class="flex-col hidden md:flex text-sm" {post} decorate={false} />

        <div class="col-span-4 md:col-span-3">
          <PostPreview {post}>
            <slot slot="eyebrow">
              <PostDate class="md:hidden" {post} collapsed decorate />
            </slot>
          </PostPreview>
        </div>
      </article>
    {/each}
  </div>
{/if}
