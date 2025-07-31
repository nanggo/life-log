<script lang="ts">
  import { PostsList, TagList } from '$lib/components/post'
  import { ArrowLeftIcon } from '$lib/components/ui/Icon'
  import { name } from '$lib/info'

  /** @type {import('./$types').PageData} */
  export let data

  interface PostMetadata {
    tags: string[]
  }

  const goBack = (): void => {
    history.back()
  }

  // Handle tag click - navigate to that tag's page
  const handleTagClick = (tag: string) => {
    if (tag !== data.tagName) {
      window.location.href = `/tags/${encodeURIComponent(tag)}`
    }
  }

  // Extract unique tags from posts
  $: typedPosts = data.posts as PostMetadata[]
  $: allTagsFromPosts = [...new Set(typedPosts.flatMap((post) => post.tags))].sort()
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
    <!-- Tag Header -->
    <header class="flex flex-col text-center">
      <h1
        class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
      >
        #{data.tagName}
      </h1>
      <p class="mt-2 text-base text-zinc-600 dark:text-zinc-400">
        {data.postCount}개의 포스트
      </p>
      <div class="mt-4">
        <a
          href="/tags"
          class="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          ← 모든 태그 보기
        </a>
      </div>
    </header>

    <!-- Related Tags -->
    {#if allTagsFromPosts && allTagsFromPosts.length > 1}
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
