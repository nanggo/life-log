<script lang="ts">
  import { page } from '$app/stores'
  import { Breadcrumb } from '$lib/components/layout'
  import { PostsList, TagList } from '$lib/components/post'
  import { name, website } from '$lib/info'
  import type { PostMetadata } from '$lib/types'
  import { jsonLdScript } from '$lib/utils/json-ld'

  /** @type {import('./$types').PageData} */
  export let data

  // OG defaults and page URL
  $: ogImage = `https://og-image-korean.vercel.app/**${encodeURIComponent(
    data.seo.title
  )}**?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-color-logo.svg`
  $: pageUrl = new URL($page.url.pathname, website).href

  // Extract unique tags from posts (excluding current tag)
  $: allTagsFromPosts = [...new Set((data.posts as PostMetadata[]).flatMap((post) => post.tags))]
    .filter((tag) => tag !== data.tagName)
    .sort()

  // Breadcrumb items
  $: breadcrumbItems = [
    { label: '태그', href: '/tags' },
    { label: `#${data.tagName}`, current: true }
  ]

  $: collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${data.seo.title} - ${name}'s life log`,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (data.posts || []).map((p: PostMetadata, idx: number) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${website}/post/${encodeURIComponent(p.slug)}`,
        name: p.title
      }))
    }
  }
</script>

<svelte:head>
  <title>{data.seo.title} - {name}'s life log</title>
  <meta name="description" content={data.seo.description} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:title" content={`${data.seo.title} - ${name}'s life log`} />
  <meta property="og:description" content={data.seo.description} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content={name} />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${data.seo.title} - ${name}'s life log`} />
  <meta name="twitter:description" content={data.seo.description} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content={`${data.tagName} 태그 - ${name}`} />

  {@html jsonLdScript(collectionPageJsonLd)}
</svelte:head>

<div class="flex flex-col flex-grow">
  <div class="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb Navigation -->
    <div class="mt-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>

    <!-- Tag Header -->
    <header class="flex flex-col mt-8">
      <h1
        class="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl mb-3 md:mb-4"
      >
        #{data.tagName}
      </h1>
      <p class="mt-2 md:mt-3 text-base text-zinc-600 dark:text-zinc-400">
        총 {data.postCount}개의 포스트
      </p>
    </header>

    <!-- Related Tags -->
    {#if allTagsFromPosts && allTagsFromPosts.length > 0}
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">관련 태그</h2>
        <TagList tags={allTagsFromPosts} clickable={true} selectedTag={data.tagName} />
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
