<script lang="ts">
  import type { PageData } from './$types'

  import { CategoryFilter } from '$lib/components'
  import { Pagination } from '$lib/components/layout'
  import { PostsList } from '$lib/components/post'
  import { detail, name, topic } from '$lib/info'

  export let data: PageData

  // 페이지네이션 로직
  $: currentPage = data.page
  $: totalPages = data.totalPages
  $: paginatedPosts = data.posts

  // URL 생성 로직
  const getPageUrl = (p: number) => (p === 1 ? '/posts' : `/posts/${p}`)

  // 페이지 타이틀
  $: pageTitle = `${name}'s life log | Posts`

  // 메타 설명은 +layout.svelte에서 기본 description 사용

  // no-op
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <!-- description과 author는 +layout.svelte에서 관리됨 -->

  <!-- 표준 메타 태그는 +layout.svelte에서 관리됨 (canonical 포함) -->

  <!-- Open Graph과 Twitter 메타태그는 +layout.svelte에서 처리됨 -->

  <script type="application/ld+json">
{JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    // url 필드는 생략 가능
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ((paginatedPosts || []) as Array<{ slug: string; title: string }>).map(
        (p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `/post/${encodeURIComponent(p.slug)}`,
          name: p.title
        })
      )
    }
  })}
  </script>
</svelte:head>

<div class="flex flex-col flex-grow">
  <header class="pt-4">
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-3 md:mb-4">
      {topic}
    </h1>
    <p class="mt-2 md:mt-3">{detail}</p>
  </header>

  <!-- Category Filter -->
  <div class="mt-6">
    <CategoryFilter categoryInfos={data.categoryInfos} variant="compact" />
  </div>

  <!-- Tags Navigation Link -->
  <div class="mt-6">
    <div class="flex justify-between items-center">
      <p class="text-sm text-zinc-600 dark:text-zinc-400">태그로 포스트를 찾고 계신다면?</p>
      <a
        href="/tags"
        class="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
      >
        태그로 탐색하기
        <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>

  <!-- Posts Content -->
  <div class="mt-16 sm:mt-20">
    {#if !paginatedPosts || paginatedPosts.length === 0}
      <div class="text-center text-zinc-600 dark:text-zinc-400">
        <p>포스트가 없습니다.</p>
      </div>
    {:else}
      <div>
        <PostsList posts={paginatedPosts} />
      </div>

      <Pagination {currentPage} {totalPages} {getPageUrl} />
    {/if}
  </div>
</div>
