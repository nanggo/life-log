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

<main class="about max-w-2xl mx-auto lg:max-w-none overflow-x-hidden">
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
    margin-top: 0;
    margin-bottom: 13px;
  }
  :global(.about ol) {
    margin-top: 13px;
    margin-bottom: 13px;
  }
  :global(.about ul) {
    margin-top: 0;
    margin-bottom: 6px;
  }
  :global(.about li) {
    margin-top: 0;
    margin-bottom: 2px;
  }
  :global(.about h1) {
    border-left: 12px solid var(--tw-prose-links);
    padding-left: 8px;
    padding-bottom: 0px;
    line-height: 1.05;
    margin-top: 2em;
    font-size: 1.8em;
    font-weight: bolder;
    letter-spacing: -1px;
    border-bottom: transparent;
  }

  @media (min-width: 640px) {
    :global(.about h1) {
      font-size: 2.4em;
    }
  }

  :global(.about h2) {
    position: relative;
    display: inline-block;
    margin-top: 2em;
    margin-bottom: 0.2em;
    font-size: 1.6em;
    font-weight: bold;
    letter-spacing: -1px;
    border-bottom: transparent;
  }

  @media (min-width: 640px) {
    :global(.about h2) {
      font-size: 2.15em;
    }
  }

  :global(.about h2::after) {
    position: absolute;
    display: inline-block;
    top: 0;
    right: -10px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--tw-prose-links);
    content: '';
  }

  @media (min-width: 640px) {
    :global(.about h2::after) {
      right: -12px;
      width: 12px;
      height: 12px;
    }
  }

  :global(.about h3) {
    margin-top: 1.5em;
    margin-bottom: 0.3em;
    font-size: 1.25em;
    letter-spacing: -1px;
    border-bottom: transparent;
  }

  @media (min-width: 640px) {
    :global(.about h3) {
      font-size: 1.5em;
    }
  }

  :global(.about h4) {
    font-size: 1.1em;
    font-weight: 600;
    letter-spacing: -1px;
    margin-top: 26px;
    margin-bottom: 13px;
  }

  @media (min-width: 640px) {
    :global(.about h4) {
      font-size: 1.25em;
    }
  }

  :global(.about td:first-child) {
    text-align: right;
    font-weight: bold;
    width: auto;
    min-width: fit-content;
    white-space: nowrap;
  }

  :global(.about table) {
    margin-top: 15px;
    margin-bottom: 13px;
    width: 100%;
    word-break: break-word;
    overflow-wrap: break-word;
    /* Remove custom styling to use global prose table styles with mobile optimization */
  }

  :global(.about td:last-child) {
    width: 100%;
  }

  @media (max-width: 640px) {
    :global(.about table) {
      font-size: 0.9em;
    }

    :global(.about table td) {
      padding: 0.25rem 0.5rem;
    }
  }

  :global(.about code) {
    font-weight: 500;
  }

  :global(.about div.final) {
    margin-top: 5em;
  }

  :global(.about code.language-text) {
    color: var(--tw-prose-links);
    border: 1.4px solid var(--tw-prose-links);
  }
  :global(.about h2 a) {
    color: var(--tw-prose-links);
    text-decoration: none;
    transition: color 0.15s ease-in-out;
  }

  :global(.about h2 a:hover) {
    color: var(--tw-prose-links-hover);
    text-decoration: none;
  }

  @media print {
    :global(*::-webkit-scrollbar) {
      display: none;
    }

    :global(*) {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    :global(.about) {
      overflow: visible;
    }

    :global(html, body) {
      overflow: visible;
    }
  }
</style>
