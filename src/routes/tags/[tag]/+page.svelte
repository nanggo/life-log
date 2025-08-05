<script lang="ts">
  import { Breadcrumb } from '$lib/components/layout'
  import { PostsList, TagList } from '$lib/components/post'
  import { name } from '$lib/info'
  import type { PostMetadata } from '$lib/types'

  /** @type {import('./$types').PageData} */
  export let data

  // Handle tag click - navigate to that tag's page
  const handleTagClick = (tag: string) => {
    if (tag !== data.tagName) {
      window.location.href = `/tags/${encodeURIComponent(tag)}`
    }
  }

  // Extract unique tags from posts (excluding current tag)
  $: allTagsFromPosts = [...new Set((data.posts as PostMetadata[]).flatMap((post) => post.tags))]
    .filter((tag) => tag !== data.tagName)
    .sort()

  // Breadcrumb items
  $: breadcrumbItems = [
    { label: '태그', href: '/tags' },
    { label: `#${data.tagName}`, current: true }
  ]
</script>

<svelte:head>
  <title>{data.seo.title} - {name}'s life log</title>
  <meta name="description" content={data.seo.description} />
  <meta property="og:title" content="{data.seo.title} - {name}'s life log" />
  <meta property="og:description" content={data.seo.description} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{data.seo.title} - {name}'s life log" />
  <meta name="twitter:description" content={data.seo.description} />
</svelte:head>

<div class="flex flex-col flex-grow">
  <div class="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb Navigation -->
    <div class="mt-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>

    <!-- Tag Header -->
    <header class="flex flex-col mt-8">
      <h1 class="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        #{data.tagName}
      </h1>
      <p class="mt-2 text-base text-zinc-600 dark:text-zinc-400">
        총 {data.postCount}개의 포스트
      </p>
    </header>

    <!-- Related Tags -->
    {#if allTagsFromPosts && allTagsFromPosts.length > 0}
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">관련 태그</h2>
        <TagList
          tags={allTagsFromPosts}
          clickable={true}
          selectedTag={data.tagName}
          {handleTagClick}
        />
      </div>
    {/if}

    <!-- Posts List -->
    {#if data.posts && data.posts.length > 0}
      <div class="mt-16 sm:mt-20">
        <PostsList posts={data.posts} />
      </div>
    {:else}
      <div class="mt-16 sm:mt-20">
        <div class="text-center py-12">
          <p class="text-base text-zinc-600 dark:text-zinc-400">
            '{data.tagName}' 태그에 해당하는 포스트가 없습니다.
          </p>
          <div class="mt-4">
            <a
              href="/posts"
              class="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
            >
              모든 포스트 보기 →
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
