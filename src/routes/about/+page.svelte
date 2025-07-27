<script lang="ts">
  // import ArrowLeftIcon from '$lib/components/ArrowLeftIcon.svelte'
  // import { afterNavigate } from '$app/navigation'
  import type { PageData } from './$types'

  import { website, name } from '$lib/info'

  export let data: PageData

  const url: string = `${website}/about`

  // Used in template JSON-LD script tag below
  // @ts-ignore: Used in Svelte template
  // eslint-disable-next-line no-unused-vars
  const _jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '유지성 (Jisung Yoo)',
    alternateName: 'NANGGO',
    url: website,
    sameAs: [
      'https://github.com/nanggo',
      'https://linkedin.com/in/jisung-yoo',
      'https://blog.nanggo.net'
    ],
    jobTitle: 'Frontend Engineer',
    description: '도전을 좋아하고, 효율적으로 일하며, 커뮤니케이션을 좋아하는 엔지니어입니다.',
    email: 'yamsiri@gmail.com',
    knowsAbout: ['Frontend Development', 'React', 'Vue.js', 'TypeScript', 'Next.js'],
    workLocation: {
      '@type': 'Place',
      name: 'South Korea'
    }
  }
</script>

<svelte:head>
  <title>{data.aboutData.title}</title>
  <meta name="description" content={data.aboutData.description} />
  <!-- author는 +layout.svelte에서 관리됨 -->
  <meta
    name="keywords"
    content="NANGGO, 유지성, Frontend Engineer, React, Vue.js, TypeScript, 프론트엔드 개발자"
  />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={url} />
  <meta property="og:type" content="profile" />
  <meta property="og:title" content={data.aboutData.title} />
  <meta property="og:description" content={data.aboutData.description} />
  <meta property="og:site_name" content={name} />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content={website.replace('https://', '')} />
  <meta property="twitter:url" content={url} />
  <meta name="twitter:title" content={data.aboutData.title} />
  <meta name="twitter:description" content={data.aboutData.description} />
  <meta name="twitter:creator" content="@nanggo" />

  <!-- Additional SEO Meta Tags -->
  <!-- robots and googlebot are handled globally in src/app.html -->
  <!-- canonical is handled globally in +layout.svelte -->

  <script type="application/ld+json">
{@html JSON.stringify(_jsonLd)}
  </script>
</svelte:head>

<main class="about max-w-2xl mx-auto lg:max-w-none">
  <div class="hidden lg:block pt-8">
    <div class="sticky top-0 w-full flex justify-end pt-11 pr-8"></div>
  </div>

  <div class="w-full mx-auto overflow-x-hidden">
    <article>
      <header class="flex flex-col">
        <h1 class="sr-only">{data.aboutData.title}</h1>
        <p class="sr-only">Last updated: {data.aboutData.lastUpdated}</p>
      </header>

      <section class="prose dark:prose-invert" aria-label="About content">
        <svelte:component this={data.component} />
      </section>
    </article>
  </div>
</main>

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
