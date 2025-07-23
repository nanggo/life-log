<script lang="ts">
  import type { PageData } from './$types'

  import Pagination from '$lib/components/Pagination.svelte'
  import PostsList from '$lib/components/PostsList.svelte'
  import Tags from '$lib/components/Tags.svelte'
  import { detail, name, topic, website } from '$lib/info'

  export let data: PageData

  $: ({ posts, page, totalPages, allTags, tag } = data)

  // URL 생성 로직
  const getPageUrl = (p: number) => {
    const base = p > 1 ? `/posts/${p}` : '/posts'
    const searchParams = tag ? `?tag=${tag}` : ''
    return base + searchParams
  }

  const getTagUrl = (t: string) => {
    return tag === t ? '/posts' : `/posts?tag=${t}`
  }

  // 현재 페이지 URL 생성
  $: currentUrl = `${website}${getPageUrl(page)}`

  // 페이지 타이틀 생성
  $: pageTitle = tag ? `${tag} - ${name}'s life log | Posts` : `${name}'s life log | Posts`

  // 메타 설명 생성
  $: metaDescription = tag ? `${detail} - ${tag} 관련 포스트 모음` : detail
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />
  <meta name="author" content={name} />

  <!-- 표준 메타 태그 -->
  <link rel="canonical" href={currentUrl} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:site_name" content={name} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content={website} />
  <meta property="twitter:url" content={currentUrl} />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<div class="flex flex-col flex-grow">
  <header class="pt-4">
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
      {topic}
    </h1>
    <p class="mt-6">{detail}</p>
  </header>

  {#if allTags && allTags.length > 0}
    <div class="mt-6">
      <Tags tags={allTags} clickable={true} selectedTag={tag} {getTagUrl} />
    </div>
  {/if}

  {#if !posts || posts.length === 0}
    <div class="mt-16 sm:mt-20 text-center text-zinc-600 dark:text-zinc-400">
      <p>'{tag}' 태그에 해당하는 포스트가 없습니다.</p>
    </div>
  {:else}
    <div class="mt-16 sm:mt-20">
      <PostsList {posts} />
    </div>

    <Pagination currentPage={page} {totalPages} {getPageUrl} />
  {/if}
</div>
