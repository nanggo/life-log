<script lang="ts">
  import type { PageData } from './$types'

  import { Breadcrumb, Pagination } from '#lib/components/layout/index.js'
  import { PostsList } from '#lib/components/post/index.js'
  import { name as siteName, website, defaultOgImage } from '#lib/info.js'
  import type { PostMetadata } from '#lib/types.js'
  import { jsonLdScript } from '#lib/utils/json-ld.js'
  import { page } from '$app/state'

  const { data }: { data: PageData } = $props()

  // Default OG image for category pages
  const ogImage = defaultOgImage
  const pageUrl = $derived(new URL(page.url.pathname, website).href)

  // Breadcrumb items
  const breadcrumbItems = $derived([
    { label: '포스트', href: '/posts' },
    { label: data.category, current: true }
  ])

  // URL 생성 함수
  const getPageUrl = (p: number) =>
    p === 1
      ? `/posts/category/${encodeURIComponent(data.category)}`
      : `/posts/category/${encodeURIComponent(data.category)}/${p}`

  const collectionPageJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.seo.title,
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
  })
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
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.seo.title} />
  <meta name="twitter:description" content={data.seo.description} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content={`${data.category} 카테고리 - ${siteName}`} />

  {@html jsonLdScript(collectionPageJsonLd)}
</svelte:head>

<div class="flex flex-col flex-grow">
  <div class="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb Navigation -->
    <div class="mt-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>

    <!-- Category Header -->
    <header class="flex flex-col mt-8">
      <h1
        class="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl mb-3 md:mb-4"
      >
        {data.category}
      </h1>
      <p class="mt-2 md:mt-3 text-base text-zinc-600 dark:text-zinc-400">
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
