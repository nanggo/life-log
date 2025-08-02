<script lang="ts">
  import { PostsList } from '$lib/components/post'

  /** @type {import('./$types').PageData} */
  export let data
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

<div class="flex flex-col flex-grow">
  <div class="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb Navigation -->
    <nav class="mt-4" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
        <li>
          <a href="/posts" class="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            포스트
          </a>
        </li>
        <li class="flex items-center">
          <svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-zinc-900 dark:text-zinc-100 font-medium">{data.category}</span>
        </li>
      </ol>
    </nav>

    <!-- Category Header -->
    <header class="flex flex-col mt-8">
      <h1 class="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
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
