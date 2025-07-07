<script>
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { detail, name, topic, website, bio } from '$lib/info.js'
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import Tags from '$lib/components/Tags.svelte'
  import { 
    postsMetadata, 
    allTags, 
    isLoading, 
    selectedTag, 
    currentPage,
    paginatedPosts,
    hasNextPage,
    totalPages,
    loadPostsMetadata,
    setTagFilter,
    clearTagFilter,
    setPage
  } from '$lib/stores/posts.js'

  /** @type {import('./$types').PageData} */
  export let data

  // 초기 데이터 설정
  $: if (data.posts) {
    postsMetadata.set(data.posts)
    allTags.set(data.allTags)
    
    // URL 파라미터에서 태그 및 페이지 정보 읽기
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
  }

  // 클라이언트 사이드에서 메타데이터 로드 (초기 로드 이후 캐싱)
  onMount(() => {
    // 브라우저에서 최신 메타데이터 확인
    loadPostsMetadata()
  })

  // 태그 클릭 이벤트 핸들러 (즉시 반응)
  function handleTagClick(tag) {
    if ($selectedTag === tag) {
      clearTagFilter()
      goto('/posts', { replaceState: false })
    } else {
      setTagFilter(tag)
      goto(`/posts?tag=${tag}`, { replaceState: false })
    }
  }

  // 페이지 변경 핸들러
  function handlePageChange(newPage) {
    setPage(newPage)
    const url = newPage > 1 ? `/posts/${newPage}` : '/posts'
    const searchParams = $selectedTag ? `?tag=${$selectedTag}` : ''
    goto(url + searchParams, { replaceState: false })
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

  {#if $isLoading}
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
