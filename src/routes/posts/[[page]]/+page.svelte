<script>
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { detail, name, topic, website } from '$lib/info.js'
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import Tags from '$lib/components/Tags.svelte'
  import { 
    postsMetadata, 
    allTags, 
    isLoading, 
    error,
    selectedTag, 
    currentPage,
    paginatedPosts,
    hasNextPage,
    totalPages,
    setTagFilter,
    clearTagFilter,
    setPage
  } from '$lib/stores/posts'

  /** @type {import('./$types').PageData} */
  export let data

  // 초기화 상태 추적
  let isInitialized = false

  // 초기 데이터 설정 (한 번만 실행)
  $: if (data.posts && !isInitialized) {
    postsMetadata.set(data.posts)
    allTags.set(data.allTags)
    isInitialized = true
  }

  // 클라이언트 사이드에서 URL 파라미터 처리
  onMount(() => {
    // URL 파라미터에서 태그 및 페이지 정보 읽기 (클라이언트 사이드에서만)
    const urlTag = $page.url.searchParams.get('tag')
    const urlPage = parseInt($page.params.page || '1')
    
    if (urlTag && urlTag !== $selectedTag) {
      setTagFilter(urlTag)
    } else if (!urlTag && $selectedTag) {
      clearTagFilter()
    }
    
    if (urlPage !== $currentPage) {
      setPage(urlPage)
    }
  })

  // 태그 클릭 이벤트 핸들러 (즉시 반응, 서버 요청 없이)
  const handleTagClick = (tag) => {
    if ($selectedTag === tag) {
      clearTagFilter()
      const newUrl = '/posts'
      window.history.pushState({}, '', newUrl)
    } else {
      setTagFilter(tag)
      const newUrl = `/posts?tag=${tag}`
      window.history.pushState({}, '', newUrl)
    }
  }

  // 페이지 변경 핸들러 (서버 요청 없이)
  const handlePageChange = (newPage) => {
    setPage(newPage)
    const url = newPage > 1 ? `/posts/${newPage}` : '/posts'
    const searchParams = $selectedTag ? `?tag=${$selectedTag}` : ''
    const newUrl = url + searchParams
    window.history.pushState({}, '', newUrl)
  }

  // 현재 페이지 URL 생성
  $: currentUrl = `${website}/posts${$currentPage > 1 ? '/' + $currentPage : ''}${$selectedTag ? '?tag=' + $selectedTag : ''}`

  // 페이지 타이틀 생성
  $: pageTitle = $selectedTag
    ? `${$selectedTag} - ${name}'s life log | Posts`
    : `${name}'s life log | Posts`

  // 메타 설명 생성
  $: metaDescription = $selectedTag ? `${detail} - ${$selectedTag} 관련 포스트 모음` : detail
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

  {#if $allTags && $allTags.length > 0}
    <div class="mt-6">
      <Tags
        tags={$allTags}
        clickable={true}
        selectedTag={$selectedTag}
        onClick={handleTagClick}
      />
    </div>
  {/if}

  {#if $error}
    <div class="mt-16 sm:mt-20 flex flex-col items-center gap-4">
      <div class="text-red-500 dark:text-red-400 text-center">
        <p class="text-lg font-semibold">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{$error}</p>
      </div>
      <button 
        on:click={() => { location.reload(); }}
        class="px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors"
      >
        페이지 새로고침
      </button>
    </div>
  {:else if $isLoading}
    <div class="mt-16 sm:mt-20 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
    </div>
  {:else}
    <div class="mt-16 sm:mt-20">
      <PostsList posts={$paginatedPosts} />
    </div>

    <Pagination 
      currentPage={$currentPage} 
      hasNextPage={$hasNextPage} 
      totalPages={$totalPages}
      onPageChange={handlePageChange}
    />
  {/if}
</div>
