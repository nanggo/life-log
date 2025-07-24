<script lang="ts">
  import type { AfterNavigate } from '@sveltejs/kit'

  import type { PageData as BasePageData } from './$types'

  import { afterNavigate } from '$app/navigation'
  import { Image, ToC } from '$lib/components/content'
  import { SocialLinks } from '$lib/components/layout'
  import { PostDate, TagList } from '$lib/components/post'
  import { ArrowLeftIcon } from '$lib/components/ui/Icon'
  import { website, name, bio, avatar, twitterHandle } from '$lib/info'

  interface PageData extends BasePageData {
    dynamicDescription: string
    jsonLd: string
    breadcrumbLd: string
    socialMediaImage: string
    isPostImage: boolean
    publishedDate: string
    modifiedDate: string
  }

  export let data: PageData

  // Use the social media image determined by the server (post image or generated OG image)
  const ogImage: string = data.socialMediaImage

  const url: string = `${website}/post/${data.post.slug}`

  // if we came from /posts, we will use history to go back to preserve
  // posts pagination
  let canGoBack: boolean = false
  afterNavigate(({ from }: AfterNavigate) => {
    if (from && from.url.pathname.startsWith('/posts')) {
      canGoBack = true
    }
  })

  const goBack = (): void => {
    if (canGoBack) {
      history.back()
    }
  }

  const getTagUrl = (tag: string) => {
    return `/posts?tag=${tag}`
  }
</script>

<svelte:head>
  <title>{data.post.title} - {name}</title>
  <meta name="description" content={data.dynamicDescription?.trim() || data.post.title} />
  <meta name="author" content={name} />
  <link rel="canonical" href={url} />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={url} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={data.post.title} />
  <meta property="og:description" content={data.dynamicDescription?.trim() || data.post.title} />
  <meta property="og:image" content={ogImage} />
  {#if !data.isPostImage}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
  {/if}
  <meta property="og:site_name" content={name} />
  <meta property="og:locale" content="ko_KR" />
  <meta property="article:author" content={name} />
  <meta property="article:published_time" content={data.publishedDate} />
  <meta property="article:modified_time" content={data.modifiedDate} />
  {#if data.post.tags && data.post.tags.length > 0}
    {#each data.post.tags as tag}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={twitterHandle} />
  <meta name="twitter:creator" content={twitterHandle} />
  <meta name="twitter:title" content={data.post.title} />
  <meta name="twitter:description" content={data.dynamicDescription?.trim() || data.post.title} />
  <meta name="twitter:image" content={ogImage} />
  <meta
    name="twitter:image:alt"
    content={data.isPostImage ? `${data.post.title}의 관련 이미지` : `${data.post.title} - ${name}`}
  />

  <script type="application/ld+json">
{@html data.jsonLd}
  </script>
  <script type="application/ld+json">
{@html data.breadcrumbLd}
  </script>
</svelte:head>

<div class="root max-w-2xl mx-auto lg:max-w-none">
  <div class="hidden lg:block pt-8">
    <div class="sticky top-0 w-full flex justify-end pt-11 pr-8">
      <svelte:element
        this={canGoBack ? 'button' : 'a'}
        role="button"
        tabindex="0"
        class="items-center justify-center hidden w-10 h-10 mb-8 transition bg-white rounded-full shadow-md -top-1 -left-16 lg:flex group shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:focus-visible:ring-2 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
        href={canGoBack ? undefined : '/posts'}
        aria-label="Go back to posts"
        on:click={goBack}
        on:keydown={goBack}
      >
        <ArrowLeftIcon
          class="w-4 h-4 transition stroke-zinc-500 group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400"
        />
      </svelte:element>
    </div>
  </div>

  <div class="w-full mx-auto overflow-x-hidden">
    <article>
      <header class="flex flex-col">
        <h1
          class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
        >
          {data.post.title}
        </h1>
        <PostDate class="text-sm sm:text-base" post={data.post} decorate collapsed />
        <TagList tags={data.post.tags ?? []} clickable={true} {getTagUrl} />
      </header>

      <!-- render the post -->
      <div class="prose dark:prose-invert">
        <svelte:component this={data.component} />
      </div>
    </article>

    <!-- bio -->
    <hr />
    <div class="py-8">
      <div class="grid gap-8">
        <div class="flex justify-center order-1 col-span-2 gap-6 md:order-2">
          <SocialLinks />
        </div>
        <div class="flex justify-center order-2 md:order-1 col-span-2">
          <a href="/about" class="inline-block rounded-full">
            <Image
              src={avatar}
              alt={name}
              width="96"
              height="96"
              class="w-24 h-24 mx-auto rounded-full md:w-28 md:h-28 ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
          </a>
        </div>
        <p
          class="order-3 text-base text-zinc-600 dark:text-zinc-400 flex justify-center col-span-2"
        >
          {bio}
        </p>
      </div>
    </div>
  </div>

  <!-- table of contents -->
  <div class="hidden xl:block pt-10">
    <aside class="sticky hidden w-48 ml-8 xl:block top-8" aria-label="Table of Contents">
      <ToC post={data.post} />
    </aside>
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
