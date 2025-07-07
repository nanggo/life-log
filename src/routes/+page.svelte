<script>
  import ArrowRightIcon from '$lib/components/ArrowRightIcon.svelte'
  import PostsList from '$lib/components/PostsList.svelte'
  import SocialLinks from '$lib/components/SocialLinks.svelte'
  import { avatar, bio, name, website } from '$lib/info.js'
  /** @type {import('./$types').PageData} */
  export let data

  const url = website
  const title = `낭고넷 - ${name}'s life log`
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={bio} />
  <meta name="author" content={name} />

  <!-- 표준 메타 태그 -->
  <link rel="canonical" href={url} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={bio} />
  <meta property="og:image" content={avatar} />
  <meta property="og:site_name" content={name} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content={website} />
  <meta property="twitter:url" content={url} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={bio} />
  <meta name="twitter:image" content={avatar} />
</svelte:head>

<div class="flex flex-col flex-grow gap-8 pb-16">
  <!-- bio -->
  <section class="flex flex-col items-center gap-16 pt-8 pb-16">
    <div class="flex flex-col items-center w-full gap-6 rounded-lg">
      <a href="/about" class="inline-block rounded-full">
        <img
          src={avatar}
          alt={name}
          class="mx-auto rounded-full w-36 h-36 ring-2 ring-zinc-200 dark:ring-zinc-700"
        />
      </a>
      <div class="flex gap-6">
        <SocialLinks />
      </div>
      <p class="text-base text-zinc-600 dark:text-zinc-400">
        {bio}
      </p>
    </div>
  </section>
  <section class="w-full">
    <div class="flex items-center justify-between gap-4 mb-8">
      <h2 class="text-sm font-medium sm:text-base text-zinc-500 dark:text-zinc-400">
        Recently Published
      </h2>
      <a href="/posts" class="flex items-center gap-1 text-sm font-medium text-teal-500"
        >View All <ArrowRightIcon class="w-4 h-4" /></a
      >
    </div>
    <PostsList posts={data.posts} />
  </section>
</div>
