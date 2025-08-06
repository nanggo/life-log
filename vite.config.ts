import * as fs from 'fs'
import * as path from 'path'

import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression2'

// 대용량 포스트 자동 감지 및 청크 분리 설정
const LARGE_POST_THRESHOLD = 5000 // 5KB 이상 마크다운 파일
const POSTS_DIR = './posts'

// 대용량 포스트 목록 생성
function getLargePostSlugs(): Set<string> {
  const largePostSlugs = new Set<string>()

  try {
    const postsPath = path.resolve(POSTS_DIR)
    if (!fs.existsSync(postsPath)) return largePostSlugs

    const files = fs.readdirSync(postsPath, { withFileTypes: true })

    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.md')) {
        const filePath = path.join(postsPath, file.name)
        const stats = fs.statSync(filePath)

        if (stats.size >= LARGE_POST_THRESHOLD) {
          const slug = file.name.replace('.md', '')
          largePostSlugs.add(slug)
          console.log(`📦 Large post detected: ${slug} (${Math.round(stats.size / 1024)}KB)`)
        }
      } else if (file.isDirectory()) {
        // 디렉토리 내 index.md 확인
        const indexPath = path.join(postsPath, file.name, 'index.md')
        if (fs.existsSync(indexPath)) {
          const stats = fs.statSync(indexPath)
          if (stats.size >= LARGE_POST_THRESHOLD) {
            largePostSlugs.add(file.name)
            console.log(`📦 Large post detected: ${file.name} (${Math.round(stats.size / 1024)}KB)`)
          }
        }
      }
    }
  } catch (error) {
    console.warn('Warning: Could not scan posts directory for chunking:', error.message)
  }

  return largePostSlugs
}

const largePostSlugs = getLargePostSlugs()

export default defineConfig(({ mode }) => ({
  plugins: [
    sveltekit(),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      deleteOriginalAssets: false
    })
  ],
  // allows vite access to ./posts
  server: {
    fs: {
      allow: ['./']
    }
  },
  build: {
    rollupOptions: {
      output: {
        // 체계적인 청크 파일 네이밍
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: (id) => {
          // 대용량 포스트 청크 분리 (최우선 처리)
          if (id.includes('posts/') && (id.includes('.md') || id.includes('.svx'))) {
            for (const slug of Array.from(largePostSlugs)) {
              if (
                id.includes(`${slug}.md`) ||
                id.includes(`${slug}/index.md`) ||
                id.includes(`${slug}.svx`)
              ) {
                console.log(`🎯 Chunking large post: ${slug}`)
                return `large-post-${slug}`
              }
            }
          }

          // Vendor 패키지 청크 분리
          if (id.includes('/node_modules/')) {
            // Svelte 관련 패키지
            if (id.includes('@sveltejs') || id.includes('svelte')) {
              return 'svelte-vendor'
            }
            // 유틸리티 라이브러리
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('js-yaml')) {
              return 'utils-vendor'
            }
            // 마크다운 관련
            if (
              id.includes('mdsvex') ||
              id.includes('gray-matter') ||
              id.includes('reading-time') ||
              id.includes('remark') ||
              id.includes('rehype') ||
              id.includes('unified')
            ) {
              return 'markdown-vendor'
            }
            // 기타 모든 vendor 패키지
            return 'main-vendor'
          }

          // 큰 컴포넌트나 유틸리티 모듈 분리
          if (
            id.includes('src/lib/components/post/LargePostRenderer.svelte') ||
            id.includes('src/lib/components/post/DynamicSectionRenderer.svelte') ||
            id.includes('src/lib/utils/sectionParser.')
          ) {
            return 'large-post-components'
          }

          // 앱 코드는 기본 청킹 사용
          return undefined
        }
      }
    },
    // CSS 코드 분할
    cssCodeSplit: true,
    // 소스맵 최적화 (프로덕션에서는 hidden)
    sourcemap: mode === 'development' ? true : 'hidden',
    // 압축 최적화
    minify: 'esbuild',
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    // Tree shaking 최적화를 위한 pre-bundling
    include: ['date-fns', 'clsx', 'js-yaml', 'github-slugger', 'node-html-parser', 'reading-time'],
    // 개발 시 빠른 빌드를 위한 exclude
    exclude: ['@sveltejs/kit', 'svelte']
  }
}))
