<script lang="ts">
  import { Breadcrumb } from '$lib/components/layout'
  import { PostsList } from '$lib/components/post'

  /** @type {import('./$types').PageData} */
  export let data

  // Breadcrumb items
  $: breadcrumbItems = [
    { label: '포스트', href: '/posts' },
    { label: data.category, current: true }
  ]
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
    <div class="mt-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>

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
