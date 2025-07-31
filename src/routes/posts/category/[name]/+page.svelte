<script lang="ts">
  import { PostsList } from '$lib/components/post'
  import { ArrowLeftIcon } from '$lib/components/ui/Icon'

  /** @type {import('./$types').PageData} */
  export let data

  const goBack = (): void => {
    history.back()
  }
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
    <!-- Category Header -->
    <header class="flex flex-col">
      <h1
        class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
      >
        {data.category}
      </h1>
      <p class="mt-2 text-base text-zinc-600 dark:text-zinc-400">
        총 {data.totalPosts}개의 포스트
      </p>
    </header>

    <!-- Posts List -->
    {#if data.posts.length > 0}
      <div class="mt-16 sm:mt-20">
        <PostsList posts={data.posts} />
      </div>
    {:else}
      <div class="mt-16 sm:mt-20">
        <div class="text-center py-12">
          <p class="text-base text-zinc-600 dark:text-zinc-400">
            아직 {data.category} 카테고리에 포스트가 없습니다.
          </p>
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
