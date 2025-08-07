import { readdirSync, statSync, readFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'

import mdsvexConfig from './mdsvex.config.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 캐시된 파일 정보로 성능 최적화
const fileCache = new Map()

// 빌드 시점 라우트 캐시 (중복 계산 방지)
const routeCache = {
  postRoutes: null,
  tags: null,
  lastBuildTime: null
}

// 캐시 무효화 검사 (개발 환경에서만)
function shouldInvalidateCache() {
  if (!routeCache.lastBuildTime) return true
  // 5분 이상 지났으면 캐시 무효화 (개발 편의성)
  return Date.now() - routeCache.lastBuildTime > 5 * 60 * 1000
}

// Phase 3: 점진적 포스트 프리렌더링 확장 - 최신 15개 포스트
function generatePostRoutes(limit = 15) {
  // 캐시된 결과가 있고 유효하다면 반환 (limit 고려)
  if (routeCache.postRoutes && routeCache.postRoutes.length <= limit && !shouldInvalidateCache()) {
    return routeCache.postRoutes
  }

  try {
    const postsDir = join(__dirname, 'posts')

    const getAllMdFiles = (dir) => {
      const files = readdirSync(dir)
      const mdFiles = []

      // 병렬 처리를 위해 파일별 작업을 분리
      for (const file of files) {
        const fullPath = join(dir, file)

        // 캐시에서 파일 상태 확인 (성능 최적화)
        let stat
        if (fileCache.has(fullPath)) {
          stat = fileCache.get(fullPath).stat
        } else {
          stat = statSync(fullPath)
          fileCache.set(fullPath, { stat, lastChecked: Date.now() })
        }

        if (stat.isDirectory()) {
          mdFiles.push(...getAllMdFiles(fullPath))
        } else if (file.endsWith('.md')) {
          // 더 효율적인 draft 상태 확인 - frontmatter만 읽기
          const content = readFileSync(fullPath, 'utf8')
          const frontmatterEnd = content.indexOf('\n---', 4)
          const frontmatter =
            frontmatterEnd !== -1 ? content.slice(0, frontmatterEnd) : content.slice(0, 500)

          if (!frontmatter.includes('draft: true')) {
            const relativePath = relative(postsDir, fullPath)
            const slug = relativePath
              .replace(/(\/index)?\.md$/, '')
              .split('/')
              .pop()

            // 날짜 추출 (최신 순 정렬을 위해)
            const dateMatch = frontmatter.match(/date:\s*['"]?([^'"]+)['"]?/)
            const dateStr = dateMatch ? dateMatch[1] : '1970-01-01'
            const postDate = new Date(dateStr)

            mdFiles.push({
              route: `/post/${slug}`,
              date: postDate,
              dateStr
            })
          }
        }
      }

      return mdFiles
    }

    const allPosts = getAllMdFiles(postsDir)
    // 날짜별 최신순으로 정렬 (최신 포스트 우선)
    const sortedPosts = allPosts.sort((a, b) => b.date - a.date)
    // 처음 N개만 선택하여 route만 추출
    const routes = sortedPosts.slice(0, limit).map((post) => post.route)

    console.log(
      `Phase 3: Generated ${routes.length} of ${allPosts.length} post routes for prerendering (latest first)`
    )

    // 캐시에 저장
    routeCache.postRoutes = routes
    routeCache.lastBuildTime = Date.now()

    return routes
  } catch (error) {
    console.warn('Could not generate post routes:', error)
    return []
  }
}

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

    // Progressive prerendering re-enablement - Phase 3: Basic pages + latest 15 blog posts
    prerender: {
      entries: [
        '/',
        '/about',
        '/posts',
        '/tags',
        '/sitemap.xml',
        '/rss.xml',
        ...generatePostRoutes(15) // Phase 3: Add latest 15 blog posts
      ],
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
