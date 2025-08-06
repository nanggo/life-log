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

// 모든 포스트 경로를 생성하는 함수 - 성능 최적화 적용
function generatePostRoutes() {
  // 캐시된 결과가 있고 유효하다면 반환
  if (routeCache.postRoutes && !shouldInvalidateCache()) {
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
          mdFiles.push(...getAllMdFiles(fullPath)) // spread 대신 concat 사용으로 메모리 최적화
        } else if (file.endsWith('.md')) {
          // 더 효율적인 draft 상태 확인 - frontmatter만 읽기
          const content = readFileSync(fullPath, 'utf8')
          const frontmatterEnd = content.indexOf('\n---', 4) // 최대 frontmatter만 검사
          const frontmatter =
            frontmatterEnd !== -1 ? content.slice(0, frontmatterEnd) : content.slice(0, 500)

          if (!frontmatter.includes('draft: true')) {
            const relativePath = relative(postsDir, fullPath)
            const slug = relativePath
              .replace(/(\/index)?\.md$/, '')
              .split('/')
              .pop()
            mdFiles.push(`/post/${slug}`)
          }
        }
      }

      return mdFiles
    }

    const routes = getAllMdFiles(postsDir)
    console.log(`Generated ${routes.length} post routes for prerendering`)

    // 캐시에 저장
    routeCache.postRoutes = routes
    routeCache.lastBuildTime = Date.now()

    return routes
  } catch (error) {
    console.warn('Could not generate post routes:', error)
    return []
  }
}

// 실제 포스트에서 태그를 추출하는 함수 - 성능 최적화 적용
function extractTagsFromPosts() {
  // 캐시된 결과가 있고 유효하다면 반환
  if (routeCache.tags && !shouldInvalidateCache()) {
    return routeCache.tags
  }

  try {
    const postsDir = join(__dirname, 'posts')
    const tags = new Set()

    const extractFromDirectory = (dir) => {
      const files = readdirSync(dir)

      for (const file of files) {
        const fullPath = join(dir, file)

        // 이전에 캐시된 파일 상태 재사용
        let stat
        if (fileCache.has(fullPath)) {
          stat = fileCache.get(fullPath).stat
        } else {
          stat = statSync(fullPath)
          fileCache.set(fullPath, { stat, lastChecked: Date.now() })
        }

        if (stat.isDirectory()) {
          extractFromDirectory(fullPath)
        } else if (file.endsWith('.md')) {
          // 최적화된 파일 읽기: frontmatter만 읽고 처리
          const content = readFileSync(fullPath, 'utf8')
          const frontmatterEnd = content.indexOf('\n---', 4)
          const frontmatter =
            frontmatterEnd !== -1 ? content.slice(0, frontmatterEnd) : content.slice(0, 500)

          // draft인 포스트는 제외 (더 빠른 체크)
          if (frontmatter.includes('draft: true')) continue

          // 더 효율적인 태그 추출을 위한 정규식 최적화
          const tagsMatch = frontmatter.match(/^tags:\s*\n((?:\s*-\s*.+(?:\n|$))+)/m)
          if (tagsMatch) {
            // 한 번에 모든 태그 추출하여 반복 최소화
            const tagsList = tagsMatch[1]
              .split('\n')
              .map((line) => line.replace(/^\s*-\s*/, '').trim())
              .filter((tag) => tag && tag.length > 0 && tag.length < 50)

            // Set에 한번에 추가
            tagsList.forEach((tag) => tags.add(tag))
          }
        }
      }
    }

    extractFromDirectory(postsDir)
    const tagArray = Array.from(tags).sort() // 정렬로 일관된 출력
    console.log(
      `Extracted ${tagArray.length} tags for prerendering: ${tagArray.slice(0, 5).join(', ')}${tagArray.length > 5 ? '...' : ''}`
    )

    // 캐시에 저장
    routeCache.tags = tagArray

    return tagArray
  } catch (error) {
    console.warn('Could not extract tags from posts:', error)
    return []
  }
}

// 통합된 prerender entries 생성 함수 (최대 성능 최적화)
function generateAllPrerenderEntries() {
  try {
    console.log('🚀 Generating optimized prerender entries...')

    // 포스트 라우트 생성 (캐시 활용)
    const postRoutes = generatePostRoutes()

    // 페이지 기본 라우트
    const baseRoutes = [
      '*', // 자동 탐지 라우트
      '/sitemap.xml',
      '/rss.xml',
      '/posts' // 기본 posts 페이지
    ]

    // 페이지네이션 라우트 생성
    const postsPerPage = 10
    const totalPages = Math.ceil(postRoutes.length / postsPerPage)
    const paginationRoutes = []

    for (let i = 2; i <= totalPages; i++) {
      paginationRoutes.push(`/posts/${i}`)
    }

    // 태그 라우트 생성 (캐시된 태그 사용)
    const tags = routeCache.tags || extractTagsFromPosts()
    const tagRoutes = []

    tags.forEach((tag) => {
      const encodedTag = encodeURIComponent(tag)
      tagRoutes.push(`/posts?tag=${encodedTag}`)
      tagRoutes.push(`/posts/2?tag=${encodedTag}`) // 태그별 최대 2페이지
    })

    // 전체 라우트 통합
    const allEntries = [...baseRoutes, ...postRoutes, ...paginationRoutes, ...tagRoutes]

    console.log(
      `✅ Generated ${allEntries.length} prerender entries (${postRoutes.length} posts, ${totalPages} pages, ${tags.length} tags)`
    )
    return allEntries
  } catch (error) {
    console.error('❌ Error generating prerender entries:', error)
    return ['*', '/sitemap.xml', '/rss.xml', '/posts'] // 기본 fallback
  }
}

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
    adapter: adapter(),
    alias: {
      $lib: 'src/lib'
    },

    // remove this if you don't want prerendering
    prerender: {
      entries: generateAllPrerenderEntries(),
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
