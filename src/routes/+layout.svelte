<script>
  import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
  import { inject } from '@vercel/analytics'
  import '../app.css'
  import '../prism.css'
  import MoonIcon from 'heroicons-svelte/solid/MoonIcon.svelte'
  import SunIcon from 'heroicons-svelte/solid/SunIcon.svelte'
  import { browser, dev } from '$app/environment'
  import { name, description, author, website } from '$lib/info'
  import { page } from '$app/stores'

  export let data

  let isDarkMode = browser ? Boolean(document.documentElement.classList.contains('dark')) : true

  const disableTransitionsTemporarily = () => {
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  inject({ mode: dev ? 'development' : 'production' })
  injectSpeedInsights()
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={description} />
  <meta name="author" content={author} />
  <link rel="canonical" href={new URL($page.url.pathname, website).href} />
  
  <!-- Performance optimization hints -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="dns-prefetch" href="https://og-image-korean.vercel.app" />
  <link rel="dns-prefetch" href="https://vercel.com" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#14b8a6" />
  <meta name="color-scheme" content="light dark" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={new URL($page.url.pathname, website).href} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={`${website}/favicon.png`} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={new URL($page.url.pathname, website).href} />
  <meta property="twitter:title" content={data.title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={`${website}/favicon.png`} />

  <!-- Organization Schema -->
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: name,
      url: website,
      logo: {
        "@type": "ImageObject",
        url: `${website}/favicon.png`,
        width: 192,
        height: 192
      },
      description: description,
      author: {
        "@type": "Person",
        name: author,
        url: website
      },
      sameAs: [
        "https://github.com/nanggo"
      ]
    })}
  </script>

  <!-- WebSite Schema -->
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: name,
      alternateName: ["낭고", "낭고넷", "nanggo", "NANGGO"],
      url: website,
      description: description,
      inLanguage: "ko-KR",
      keywords: ["낭고", "개발자", "블로그", "개발 일기", "프로그래밍", "기술 블로그"]
    })}
  </script>
</svelte:head>

<div class="flex flex-col min-h-screen">
  <div class="flex flex-col flex-grow w-full px-4 py-2">
    <header class="flex items-center justify-between w-full max-w-2xl py-4 mx-auto lg:pb-8">
      <a
        class="text-lg font-bold sm:text-2xl !text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600 dark:to-teal-400"
        href="/"
      >
        {name}
      </a>

      <button
        type="button"
        role="switch"
        aria-label="Toggle Dark Mode"
        aria-checked={isDarkMode}
        class="w-5 h-5 sm:h-8 sm:w-8 sm:p-1"
        on:click={() => {
          isDarkMode = !isDarkMode
          localStorage.setItem('isDarkMode', isDarkMode.toString())

          disableTransitionsTemporarily()

          if (isDarkMode) {
            document.querySelector('html').classList.add('dark')
          } else {
            document.querySelector('html').classList.remove('dark')
          }
        }}
      >
        <MoonIcon class="hidden text-zinc-500 dark:block" />
        <SunIcon class="block text-zinc-400 dark:hidden" />
      </button>
    </header>
    <main
      class="flex flex-col flex-grow w-full mx-auto"
      class:max-w-2xl={!$page.data.layout?.fullWidth}
    >
      <slot />
    </main>
  </div>
</div>
