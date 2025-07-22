<script lang="ts">
  // import ArrowLeftIcon from '$lib/components/ArrowLeftIcon.svelte'
  // import { afterNavigate } from '$app/navigation'
  import { website, name } from '$lib/info'
  import type { PageData } from './$types'

  export let data: PageData

  const url: string = `${website}/about`

  // const jsonLd = {
  //   '@context': 'https://schema.org',
  //   '@type': 'Person',
  //   name: name,
  //   url: website,
  //   sameAs: [`https://github.com/${github}`, `https://linkedin.com/in/${linkedin}`],
  //   jobTitle: 'Frontend Engineer',
  //   description: bio,
  //   email: email
  // }
</script>

<svelte:head>
  <title>{data.aboutData.title}</title>
  <meta name="description" content="About NANGGO" />
  <meta name="author" content={name} />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={data.aboutData.title} />
  <meta property="og:description" content="About NANGGO" />
  <meta property="og:site_name" content={name} />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content={website} />
  <meta property="twitter:url" content={url} />
  <meta name="twitter:title" content={data.aboutData.title} />
  <meta name="twitter:description" content="About NANGGO" />

  <script type="application/ld+json">
{@html JSON.stringify(jsonLd)}
  </script>
</svelte:head>
<!-- 
<div class="max-w-2xl mx-auto lg:max-w-3xl">
  <article>
    <header class="flex flex-col">
      <h1
        class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
      >
        About NANGGO
      </h1>
      <time class="flex items-center text-base text-zinc-400 dark:text-zinc-500">
        <span class="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
        <span class="ml-3">Last updated: {data.aboutData.lastUpdated}</span>
      </time>
    </header>

    <div class="mt-8 prose dark:prose-invert">
      <svelte:component this={data.component} />
    </div>
  </article>
</div> 
-->

<div class="about max-w-2xl mx-auto lg:max-w-none">
  <div class="hidden lg:block pt-8">
    <div class="sticky top-0 w-full flex justify-end pt-11 pr-8"></div>
  </div>

  <div class="w-full mx-auto overflow-x-hidden">
    <!-- <article> -->
    <header class="flex flex-col">
      <!--        
        <h1
          class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
        >
          {data.aboutData.title}
        </h1>
        -->
      <!-- <PostDate class="text-sm sm:text-base" post={data.post} decorate collapsed /> -->
    </header>

    <!-- render the post -->
    <div class="prose dark:prose-invert">
      <svelte:component this={data.component} />
    </div>
    <!-- </article> -->
  </div>
</div>

<style lang="postcss">
  :global(.about p) {
    margin-top: 0 !important;
    margin-bottom: 13px !important;
  }
  :global(.about ol) {
    margin-top: 13px !important;
    margin-bottom: 13px !important;
  }
  :global(.about ul) {
    margin-top: 0 !important;
    margin-bottom: 6px !important;
  }
  :global(.about li) {
    margin-top: 0 !important;
    margin-bottom: 2px !important;
  }
  :global(.about h1) {
    border-left: 12px solid #0f6ae5;
    padding-left: 8px;
    padding-bottom: 0px;
    line-height: 1.05;
    margin-top: 2em;
    font-size: 2.4em;
    font-weight: bolder;
    letter-spacing: -1px;
    border-bottom: transparent !important;
  }

  :global(.about h2) {
    position: relative;
    display: inline-block;
    margin-top: 2em;
    margin-bottom: 0.2em;
    font-size: 2.15em;
    font-weight: bold;
    letter-spacing: -1px;
    border-bottom: transparent !important;
  }

  :global(.about h2::after) {
    position: absolute;
    display: inline-block;
    top: 0;
    right: -14px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #0f6ae5;
    content: '';
  }

  :global(.about h3) {
    margin-top: 1.5em;
    margin-bottom: 0.3em;
    font-size: 1.5em;
    letter-spacing: -1px;
    border-bottom: transparent !important;
  }

  :global(.about h4) {
    font-size: 1.25em;
    font-weight: 600;
    letter-spacing: -1px;
    margin-top: 26px !important;
    margin-bottom: 13px !important;
  }

  :global(.about td:first-child) {
    text-align: right !important;
    font-weight: bolder !important;
  }

  :global(.about table) {
    margin-top: 15px;
    margin-bottom: 13px;
  }

  :global(.about th) {
    padding: 0 !important;
  }

  :global(.about code) {
    font-weight: 500 !important;
  }

  :global(.about div.final) {
    margin-top: 5em !important;
  }

  :global(.about code.language-text) {
    color: #0f6ae5;
    border: 1.4px solid #0f6ae5;
  }
  :global(.about h2 a) {
    color: #0687f0;
    text-decoration: none;
  }

  :global(.about h2 a:hover) {
    text-decoration: none;
  }

  @media print {
    :global(*::-webkit-scrollbar) {
      display: none !important;
    }

    :global(*) {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }

    :global(.about) {
      overflow: visible !important;
    }

    :global(html, body) {
      overflow: visible !important;
    }
  }
</style>
