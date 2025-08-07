import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'

import mdsvexConfig from './mdsvex.config.js'

// Phase 2에서 개별 블로그 포스트 프리렌더링에 사용할 함수들
// generatePostRoutes(), extractTagsFromPosts() - 임시 비활성화

// 통합된 prerender entries 생성 함수 - Phase 2에서 재활성화 예정
// function _generateAllPrerenderEntries() { ... }
// Phase 1에서는 수동으로 정의된 기본 페이지만 사용

// Posts 목록 페이지 생성 함수는 generateAllPrerenderEntries()로 통합되어 더 이상 사용되지 않음

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true
    }),
    mdsvex(mdsvexConfig)
  ],

  kit: {
    adapter: adapter({
      runtime: 'nodejs22.x'
    }),
    alias: {
      $lib: 'src/lib'
    },

    // Progressive prerendering re-enablement - Phase 1: Basic pages only
    prerender: {
      entries: ['/', '/about', '/posts', '/tags', '/sitemap.xml', '/rss.xml'],
      handleMissingId: 'warn',
      handleHttpError: ({ status, path, referrer, message }) => {
        // Ignore 404 errors for asset files during prerendering
        if (
          status === 404 &&
          (path.includes('.png') ||
            path.includes('.jpg') ||
            path.includes('.jpeg') ||
            path.includes('.webp') ||
            path.includes('.avif'))
        ) {
          console.warn(`Ignoring missing image during prerender: ${path}`)
          return
        }
        throw new Error(`${status} ${path} (referenced from ${referrer}): ${message}`)
      }
    }
  }
}

export default config
