<script>
  import { detail, name, topic, website, bio } from '$lib/info.js'
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import Tags from '$lib/components/Tags.svelte'
  import { goto } from '$app/navigation'

  /** @type {import('./$types').PageData} */
  export let data

  // 서버에서 계산한 hasNextPage 사용
  $: hasNextPage = data.hasNextPage

  // 태그 클릭 이벤트 핸들러
  function handleTagClick(tag) {
    // 이미 선택된 태그를 다시 클릭하면 필터 해제
    if (data.tagFilter === tag) {
      goto('/posts')
    } else {
      goto(`/posts?tag=${tag}`)
    }
  }

  // 현재 페이지 URL 생성
  $: currentUrl = `${website}/posts${data.page > 1 ? '/' + data.page : ''}${data.tagFilter ? '?tag=' + data.tagFilter : ''}`

  // 페이지 타이틀 생성
  $: pageTitle = data.tagFilter
    ? `${data.tagFilter} - ${name}'s life log | Posts`
    : `${name}'s life log | Posts`

  // 메타 설명 생성
  $: metaDescription = data.tagFilter ? `${detail} - ${data.tagFilter} 관련 포스트 모음` : detail
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

  {#if data.allTags && data.allTags.length > 0}
    <div class="mt-6">
      <!-- <h2 class="text-lg font-semibold mb-2">태그로 필터링</h2> -->
      <Tags
        tags={data.allTags}
        clickable={true}
        selectedTag={data.tagFilter}
        onClick={handleTagClick}
      />
    </div>
  {/if}

  <!-- 
  {#if data.tagFilter}
    <div class="mt-4 flex items-center">
      <span class="text-zinc-700 dark:text-zinc-300"
        >태그 필터: <span class="font-medium">#{data.tagFilter}</span></span
      >
      <button
        class="ml-2 text-sm text-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
        on:click={() => goto('/posts')}
      >
        초기화
      </button>
    </div>
  {/if} 
  -->

  <div class="mt-16 sm:mt-20">
    <PostsList posts={data.posts} />
  </div>

  <Pagination currentPage={data.page} {hasNextPage} tagFilter={data.tagFilter} />
</div>

<style>
  a {
    @apply flex items-center gap-2 font-medium text-zinc-700;
  }

  :global(.dark) a {
    @apply text-zinc-300;
  }
</style>
