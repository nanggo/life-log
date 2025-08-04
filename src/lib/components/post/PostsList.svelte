<script lang="ts">
  import PostDate from './PostDate.svelte'
  import PostPreview from './PostPreview.svelte'

  import type { Post } from '$lib/types'

  export let posts: Post[]

  // VirtualList는 제거 - 38개 포스트 정도는 성능 문제 없음
  // 추후 100개 이상일 때 페이지네이션으로 해결
</script>

<!-- 기본 렌더링 - VirtualList 제거 -->
<div class="flex flex-col gap-16 md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
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
