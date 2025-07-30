<script lang="ts">
  import type { PageData } from './$types'

  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { Pagination } from '$lib/components/layout'
  import { PostsList, TagList } from '$lib/components/post'
  import { detail, name, topic, website } from '$lib/info'
  import type { Post } from '$lib/types'

  export let data: PageData

  // layout 데이터에서 전체 포스트와 태그 가져오기
  $: ({ allPosts, allTags } = data)

  // URL에서 태그 파라미터 읽기 (브라우저에서만)
  $: selectedTag = browser ? $page.url.searchParams.get('tag') : null

  // 클라이언트 사이드 필터링 (서버에서는 항상 전체 포스트, 클라이언트에서만 필터링)
  $: filteredPosts =
    browser && selectedTag
      ? allPosts.filter((post: Post) => post.tags.includes(selectedTag))
      : allPosts

  // FOUC 방지: 브라우저에서 태그 필터가 활성화된 상태에서 아직 필터링되지 않은 경우 감지
  $: isHydrated = browser
  $: showContent = !selectedTag || isHydrated

  // 클라이언트 사이드 페이지네이션
  const postsPerPage = data.limit
  $: currentPage = data.page
  $: totalFilteredPosts = filteredPosts.length
  $: totalFilteredPages = Math.ceil(totalFilteredPosts / postsPerPage)
  $: startIndex = (currentPage - 1) * postsPerPage
  $: endIndex = startIndex + postsPerPage
  $: paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  // 필터링 후 현재 페이지가 유효하지 않으면 첫 페이지로 리다이렉트
  $: if (browser && selectedTag && currentPage > 1 && currentPage > totalFilteredPages) {
    goto(`/posts?tag=${encodeURIComponent(selectedTag)}`)
  }

  // 태그 클릭 핸들러
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // 같은 태그 클릭 시 필터 해제
      goto('/posts')
    } else {
      // 새 태그로 필터링
      goto(`/posts?tag=${encodeURIComponent(tag)}`)
    }
  }

  // URL 생성 로직
  const getPageUrl = (p: number) => {
    const base = p > 1 ? `/posts/${p}` : '/posts'
    const searchParams = selectedTag ? `?tag=${encodeURIComponent(selectedTag)}` : ''
    return base + searchParams
  }

  // 현재 페이지 URL 생성
  $: currentUrl = `${website}${getPageUrl(currentPage)}`

  // 페이지 타이틀 생성
  $: pageTitle = selectedTag
    ? `${selectedTag} - ${name}'s life log | Posts`
    : `${name}'s life log | Posts`

  // 메타 설명은 +layout.svelte에서 기본 description 사용
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <!-- description과 author는 +layout.svelte에서 관리됨 -->

  <!-- 표준 메타 태그 -->
  <link rel="canonical" href={currentUrl} />

  <!-- Open Graph과 Twitter 메타태그는 +layout.svelte에서 처리됨 -->
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
      <TagList
        tags={allTags}
        clickable={true}
        selectedTag={browser ? selectedTag : null}
        onTagClick={handleTagClick}
      />
    </div>
  {/if}

  {#if !showContent}
    <!-- FOUC 방지를 위한 로딩 상태 -->
    <div class="mt-16 sm:mt-20 text-center text-zinc-600 dark:text-zinc-400">
      <p>포스트를 불러오는 중...</p>
    </div>
  {:else if !paginatedPosts || paginatedPosts.length === 0}
    <div class="mt-16 sm:mt-20 text-center text-zinc-600 dark:text-zinc-400">
      {#if selectedTag}
        <p>'{selectedTag}' 태그에 해당하는 포스트가 없습니다.</p>
      {:else}
        <p>포스트가 없습니다.</p>
      {/if}
    </div>
  {:else}
    <div class="mt-16 sm:mt-20">
      <PostsList posts={paginatedPosts} />
    </div>

    <Pagination {currentPage} totalPages={totalFilteredPages} {getPageUrl} />
  {/if}
</div>
