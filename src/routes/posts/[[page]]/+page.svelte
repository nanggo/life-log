<script lang="ts">
  import { onMount } from 'svelte'

  import type { PageData } from './$types'

  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { Pagination } from '$lib/components/layout'
  import { PostsList, TagList } from '$lib/components/post'
  import { detail, name, topic, website } from '$lib/info'
  import type { PostMetadata } from '$lib/types'
  import { createTagUrl, createPageUrl } from '$lib/utils/url-helpers'

  export let data: PageData

  // layout 데이터에서 전체 포스트와 태그 가져오기
  $: ({ allPosts, allTags } = data)

  // 성능 최적화: Set을 사용한 O(1) 태그 검증
  const allTagsSet = new Set(allTags)

  // URL에서 태그 파라미터 읽기 및 유효성 검사 (브라우저에서만)
  $: rawSelectedTag = browser ? $page.url.searchParams.get('tag') : null
  $: selectedTag = allTagsSet.has(rawSelectedTag) ? rawSelectedTag : null

  // 클라이언트 사이드 필터링 (서버에서는 항상 전체 포스트, 클라이언트에서만 필터링)
  // 성능 최적화: selectedTag가 변경될 때만 필터링 재실행
  $: filteredPosts = selectedTag
    ? allPosts.filter((post: PostMetadata) => post.tags.includes(selectedTag))
    : allPosts

  // FOUC 방지: 클라이언트 하이드레이션이 완료되고 필터링이 적용될 때까지 기다림
  let isHydrated = false

  onMount(() => {
    // 컴포넌트가 마운트되면 하이드레이션 완료로 표시
    isHydrated = true
  })

  // 잘못된 태그 파라미터 처리 - reactive statement로 이동하여 클라이언트 사이드 네비게이션에서도 작동
  $: if (browser && rawSelectedTag && !selectedTag) {
    // 존재하지 않는 태그로 접근한 경우 기본 posts 페이지로 리다이렉트
    goto('/posts', { replaceState: true })
  }

  // FOUC 방지: CSS 기반 투명도 제어로 하이드레이션 오류 방지
  $: shouldHideContent = rawSelectedTag && (!browser || !isHydrated)

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
    goto(createTagUrl(selectedTag))
  }

  // 태그 클릭 핸들러 - 유틸리티 함수 사용으로 코드 간소화
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // 같은 태그 클릭 시 필터 해제
      goto('/posts')
    } else {
      // 새 태그로 필터링
      goto(createTagUrl(tag))
    }
  }

  // URL 생성 로직 - 유틸리티 함수 사용으로 코드 간소화
  const getPageUrl = (p: number) => createPageUrl(p, selectedTag)

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
        {handleTagClick}
      />
    </div>
  {/if}

  <!-- FOUC 방지: 항상 동일한 DOM 구조 유지, CSS 투명도로 부드러운 전환 -->
  <div class="mt-16 sm:mt-20 transition-opacity duration-300" class:opacity-0={shouldHideContent}>
    {#if shouldHideContent}
      <!-- 로딩 상태 -->
      <div class="text-center text-zinc-600 dark:text-zinc-400">
        <p>포스트를 불러오는 중...</p>
      </div>
    {:else if !paginatedPosts || paginatedPosts.length === 0}
      <!-- 빈 결과 상태 -->
      <div class="text-center text-zinc-600 dark:text-zinc-400">
        {#if selectedTag}
          <p>'{selectedTag}' 태그에 해당하는 포스트가 없습니다.</p>
        {:else}
          <p>포스트가 없습니다.</p>
        {/if}
      </div>
    {:else}
      <!-- 콘텐츠 상태 -->
      <div>
        <PostsList posts={paginatedPosts} />
      </div>

      <Pagination {currentPage} totalPages={totalFilteredPages} {getPageUrl} />
    {/if}
  </div>
</div>
