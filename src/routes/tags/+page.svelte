<script lang="ts">
  import { TagCloud } from '$lib/components'
  import { ArrowLeftIcon } from '$lib/components/ui/Icon'

  /** @type {import('./$types').PageData} */
  export let data

  interface TagInfo {
    tag: string
    count: number
  }

  const goBack = (): void => {
    history.back()
  }

  // 태그 URL 생성 함수
  const getTagUrl = (tagName: string): string => {
    return `/tags/${encodeURIComponent(tagName)}`
  }

  $: tagInfos = data.tagInfos as TagInfo[]
</script>

<svelte:head>
  <title>{data.seo.title}</title>
  <meta name="description" content={data.seo.description} />
  <meta property="og:title" content={data.seo.title} />
  <meta property="og:description" content={data.seo.description} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={data.seo.title} />
  <meta name="twitter:description" content={data.seo.description} />
</svelte:head>

<div class="root max-w-2xl mx-auto lg:max-w-none">
  <!-- Back Button -->
  <div class="hidden lg:block pt-8">
    <div class="sticky top-0 w-full flex justify-end pt-11 pr-8">
      <button
        type="button"
        class="items-center justify-center hidden w-10 h-10 mb-8 transition bg-white rounded-full shadow-md -top-1 -left-16 lg:flex group shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:focus-visible:ring-2 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
        aria-label="Go back"
        on:click={goBack}
      >
        <ArrowLeftIcon
          class="w-4 h-4 transition stroke-zinc-500 group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400"
        />
      </button>
    </div>
  </div>

  <div class="w-full mx-auto overflow-x-hidden">
    <!-- Tags Header -->
    <header class="flex flex-col text-center">
      <h1
        class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
      >
        모든 태그
      </h1>
      <p class="mt-2 text-base text-zinc-600 dark:text-zinc-400">
        총 {data.totalTags}개의 태그
      </p>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        태그 크기는 포스트 개수에 비례합니다.
      </p>
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
      <!-- 
      <div class="mt-8 text-center">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-lg mx-auto">
          <div
            class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <div class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {maxCount}
            </div>
            <div class="text-xs text-zinc-600 dark:text-zinc-400">최다 포스트</div>
          </div>
          <div
            class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <div class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {minCount}
            </div>
            <div class="text-xs text-zinc-600 dark:text-zinc-400">최소 포스트</div>
          </div>
          <div
            class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <div class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {avgCount}
            </div>
            <div class="text-xs text-zinc-600 dark:text-zinc-400">평균</div>
          </div>
          <div
            class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <div class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {totalCount}
            </div>
            <div class="text-xs text-zinc-600 dark:text-zinc-400">총 포스트</div>
          </div>
        </div>
      </div>
       -->
    {:else}
      <div class="mt-16 sm:mt-20">
        <div class="text-center py-12">
          <p class="text-base text-zinc-600 dark:text-zinc-400">아직 태그가 없습니다.</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .root {
    display: grid;
    grid-template-columns: 1fr;
  }

  @media screen(lg) {
    .root {
      /* 42rem matches max-w-2xl */
      grid-template-columns: 1fr 42rem 1fr;
    }
  }
</style>
