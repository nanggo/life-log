<script lang="ts">
  import { inject } from '@vercel/analytics'
  import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
  import '../app.css'
  import '../prism.css'
  import MoonIcon from 'heroicons-svelte/solid/MoonIcon.svelte'
  import SunIcon from 'heroicons-svelte/solid/SunIcon.svelte'

  import type { LayoutData } from './$types'

  import { browser, dev } from '$app/environment'
  import { page } from '$app/stores'
  import {
    name,
    description,
    author,
    bio,
    website,
    twitterHandle,
    organizationAlternateNames,
    jobTitle,
    slogan,
    foundingDate,
    contactLanguages,
    expertiseAreas,
    areaServed,
    licenseUrl,
    avatar,
    github,
    linkedin,
    email
  } from '$lib/info'

  export let data: LayoutData

  let isDarkMode: boolean = browser
    ? Boolean(document.documentElement.classList.contains('dark'))
    : true

  // JSON-LD schemas
  // @ts-ignore - used in JSON-LD script tags below
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const _organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': website,
    name,
    alternateName: organizationAlternateNames,
    url: website,
    logo: {
      '@type': 'ImageObject',
      url: `${website}/favicon.png`,
      width: 192,
      height: 192,
      caption: `${name} 로고`,
      description: `${name} 공식 로고`
    },
    description,
    slogan,
    foundingDate,
    founder: {
      '@type': 'Person',
      name: author,
      url: website,
      image: {
        '@type': 'ImageObject',
        url: avatar,
        width: 460,
        height: 460
      },
      jobTitle,
      description: bio,
      sameAs: [`https://github.com/${github}`, `https://www.linkedin.com/in/${linkedin}`]
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email,
        availableLanguage: contactLanguages
      }
    ],
    knowsAbout: expertiseAreas,
    areaServed,
    inLanguage: 'ko-KR'
  }

  // @ts-ignore - used in JSON-LD script tags below
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const _websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    alternateName: organizationAlternateNames,
    url: website,
    description,
    inLanguage: 'ko-KR',
    keywords: ['낭고', '개발자', '블로그', '개발 일기', '프로그래밍', '기술 블로그'],
    author: {
      '@type': 'Person',
      name: author,
      url: website
    },
    publisher: {
      '@type': 'Organization',
      name,
      url: website
    },
    copyrightHolder: {
      '@type': 'Person',
      name: author
    },
    copyrightYear: new Date().getFullYear(),
    license: licenseUrl,
    isAccessibleForFree: true,
    mainEntity: {
      '@type': 'Blog',
      name: `${name} 블로그`,
      description,
      url: website,
      author: {
        '@type': 'Person',
        name: author
      },
      inLanguage: 'ko-KR'
    },
    hasPart: [
      {
        '@type': 'WebPage',
        name: '홈',
        url: website,
        description: '낭고넷 메인 페이지'
      },
      {
        '@type': 'WebPage',
        name: '포스트',
        url: `${website}/posts`,
        description: '블로그 포스트 목록'
      },
      {
        '@type': 'WebPage',
        name: '소개',
        url: `${website}/about`,
        description: '낭고 소개 페이지'
      }
    ],
    audience: {
      '@type': 'Audience',
      audienceType: '개발자, 기술 블로그 독자',
      geographicArea: {
        '@type': 'Country',
        name: '대한민국'
      }
    }
  }

  const disableTransitionsTemporarily = (): void => {
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  inject({ mode: dev ? 'development' : 'production' })
  injectSpeedInsights()

  // Image modal functionality with event delegation (prevents XSS)
  if (browser) {
    const openImageModal = function (src: string, alt: string): void {
      const modal: HTMLDivElement = document.createElement('div')
      modal.className =
        'image-modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'
      modal.style.backdropFilter = 'blur(4px)'

      const modalContent: HTMLDivElement = document.createElement('div')
      modalContent.className = 'relative max-w-full max-h-full'

      const image: HTMLImageElement = document.createElement('img')
      image.src = src
      image.alt = alt
      image.className = 'max-w-full max-h-full object-contain rounded-lg'

      const closeButton: HTMLButtonElement = document.createElement('button')
      closeButton.className =
        'absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 text-xl font-bold'
      closeButton.textContent = '×'

      modalContent.appendChild(image)
      modalContent.appendChild(closeButton)
      modal.appendChild(modalContent)

      const escHandler = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
          closeModal()
        }
      }

      const closeModal = (): void => {
        modal.remove()
        document.removeEventListener('keydown', escHandler)
      }

      closeButton.onclick = closeModal
      modal.onclick = (e: MouseEvent): void => {
        if (e.target === modal) {
          closeModal()
        }
      }

      document.addEventListener('keydown', escHandler)
      document.body.appendChild(modal)
    }

    // Use event delegation to handle clicks on enhanced images
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('enhanced-image') && target.tagName === 'IMG') {
        const src = target.getAttribute('data-modal-src')
        const alt = target.getAttribute('data-modal-alt') || ''
        if (src) {
          openImageModal(src, alt)
        }
      }
    })

    // Maintain backward compatibility for any remaining inline calls
    window.openImageModal = openImageModal
  }
</script>

<svelte:head>
  <title>{data.title}</title>
  {#if !$page.data.post && !$page.route.id?.includes('/about')}
    <meta name="description" content={description} />
  {/if}
  <meta name="author" content={author} />
  <link rel="canonical" href={new URL($page.url.pathname, website).href} />

  <!-- Performance optimization hints -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="dns-prefetch" href="https://og-image-korean.vercel.app" />
  <link rel="dns-prefetch" href="https://vercel.com" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#14b8a6" />
  <meta name="color-scheme" content="light dark" />

  <!-- Open Graph / Facebook -->
  {#if !$page.data.post}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={new URL($page.url.pathname, website).href} />
    <meta property="og:title" content={data.title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={`${website}/favicon.png`} />
    <meta property="og:image:width" content="192" />
    <meta property="og:image:height" content="192" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:site_name" content={name} />
    <meta property="og:locale" content="ko_KR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content={twitterHandle} />
    <meta name="twitter:creator" content={twitterHandle} />
    <meta name="twitter:title" content={data.title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={`${website}/favicon.png`} />
    <meta name="twitter:image:alt" content={`${name} 로고`} />
  {/if}

  <!-- Organization Schema -->
  <script type="application/ld+json">
    {JSON.stringify(_organizationSchema)}
  </script>

  <!-- WebSite Schema -->
  <script type="application/ld+json">
    {JSON.stringify(_websiteSchema)}
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
            document.querySelector('html')?.classList.add('dark')
          } else {
            document.querySelector('html')?.classList.remove('dark')
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
