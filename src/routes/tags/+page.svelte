<script lang="ts">
  import type { PageData } from './$types'

  import { page } from '$app/stores'
  import { TagCloud } from '$lib/components'
  import { website, name } from '$lib/info'

  export let data: PageData

  // 태그 URL 생성 함수
  const getTagUrl = (tagName: string): string => {
    return `/tags/${encodeURIComponent(tagName)}`
  }

  $: tagInfos = data.tagInfos
  $: statistics = data.statistics

  // 페이지 URL 및 기본 OG 이미지
  $: pageUrl = new URL($page.url.pathname, website).href
  $: ogImage = `https://og-image-korean.vercel.app/**${encodeURIComponent(
    data.seo.title
  )}**?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-color-logo.svg`
</script>

<svelte:head>
  <title>{data.seo.title}</title>
  <meta name="description" content={data.seo.description} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:title" content={data.seo.title} />
  <meta property="og:description" content={data.seo.description} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={data.seo.title} />
  <meta name="twitter:description" content={data.seo.description} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content={`${name} 태그 목록`} />
</svelte:head>

<div class="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
  <!-- Tags Header -->
  <header class="flex flex-col text-center">
    <h1 class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
      모든 태그
    </h1>
    <p class="mt-2 text-base text-zinc-600 dark:text-zinc-400">
      총 {data.totalTags}개의 태그
    </p>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
      태그 크기는 포스트 개수에 비례합니다.
    </p>

    <!-- Posts Navigation Link -->
    <div class="mt-4">
      <a
        href="/posts"
        class="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
      >
        포스트 보기
        <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </header>

  <!-- Tag Cloud -->
  {#if data.tagInfos.length > 0}
    <div class="mt-16 sm:mt-20">
      <div
        class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8"
      >
        <TagCloud {tagInfos} {getTagUrl} clickable={true} />
      </div>
    </div>

    <!-- Tag Statistics -->
    <div class="mt-8">
      <div
        class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8"
      >
        <h3 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4 text-center">
          태그 통계
        </h3>
        <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
          <div
            class="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600"
          >
            <dd class="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {statistics.maxCount}
            </dd>
            <dt class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">최다 포스트</dt>
          </div>
          <div
            class="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600"
          >
            <dd class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {statistics.minCount}
            </dd>
            <dt class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">최소 포스트</dt>
          </div>
          <div
            class="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600"
          >
            <dd class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.avgCount}
            </dd>
            <dt class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">평균 포스트</dt>
          </div>
          <div
            class="text-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600"
          >
            <dd class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.totalPosts}
            </dd>
            <dt class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">총 포스트</dt>
          </div>
        </dl>
      </div>
    </div>
  {:else}
    <div class="mt-16 sm:mt-20">
      <div class="text-center py-12">
        <p class="text-base text-zinc-600 dark:text-zinc-400">아직 태그가 없습니다.</p>
      </div>
    </div>
  {/if}
</div>
