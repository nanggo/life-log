<script lang="ts">
  import { page } from '$app/stores'
  import { Breadcrumb, Pagination } from '$lib/components/layout'
  import { PostsList } from '$lib/components/post'
  import { website } from '$lib/info'

  /** @type {import('./$types').PageData} */
  export let data

  // Default OG image for category pages
  $: ogImage = `https://og-image-korean.vercel.app/**${encodeURIComponent(
    data.seo.title
  )}**?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-color-logo.svg`
  $: pageUrl = new URL($page.url.pathname, website).href

  // Breadcrumb items
  $: breadcrumbItems = [
    { label: '포스트', href: '/posts' },
    { label: data.category, current: true }
  ]

  // URL 생성 함수
  const getPageUrl = (p: number) =>
    p === 1
      ? `/posts/category/${encodeURIComponent(data.category)}`
      : `/posts/category/${encodeURIComponent(data.category)}/${p}`
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

  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: data.seo.title,
      url: pageUrl,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: (data.posts || []).map((p: { slug: string; title: string }, idx: number) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${website}/post/${encodeURIComponent(p.slug)}`,
          name: p.title
        }))
      }
    })}
  </script>
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

      {#if data.totalPages > 1}
        <Pagination currentPage={data.page} totalPages={data.totalPages} {getPageUrl} />
      {/if}
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
