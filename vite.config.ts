import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  plugins: [
    sveltekit(),
    compression({
      algorithm: ['gzip', 'brotliCompress'],
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
        manualChunks: (id) => {
          // 간단한 vendor 청크 분리만 유지
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
              id.includes('reading-time')
            ) {
              return 'markdown-vendor'
            }
            // 기타 모든 vendor 패키지
            return 'main-vendor'
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
