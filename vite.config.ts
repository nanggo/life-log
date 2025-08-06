import { sveltekit } from '@sveltejs/kit/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  plugins: [
    sveltekit(),
    compression({
      algorithm: ['gzip', 'brotliCompress'],
      deleteOriginalAssets: false
    }),
    // 번들 분석을 위한 visualizer (프로덕션 빌드 시에만)
    ...(mode === 'production'
      ? [
          visualizer({
            filename: 'bundle-analysis.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap' // 'treemap', 'sunburst', 'network'
          })
        ]
      : [])
  ],
  // allows vite access to ./posts
  server: {
    fs: {
      allow: ['./']
    }
  },
  build: {
    // 최신 브라우저 타겟으로 polyfill 최소화
    target: 'es2020',
    rollupOptions: {
      // Tree shaking 안전성 우선 설정
      treeshake: {
        preset: 'recommended'
        // propertyReadSideEffects는 기본값(true) 유지로 안전성 확보
        // tryCatchDeoptimization도 기본값 유지
      },
      output: {
        // 정확한 node_modules 경로 기반 청크 분리 (간소화)
        manualChunks: (id) => {
          // node_modules 패키지만 처리
          if (!id.includes('/node_modules/')) {
            return undefined
          }

          // 스코프 패키지를 포함한 정확한 패키지 매칭
          const packageMatch = id.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]
          if (!packageMatch) return 'main-vendor'

          // Vercel Analytics 패키지 (스코프 패키지 전체 매칭)
          if (packageMatch.startsWith('@vercel/')) {
            return 'vercel-vendor'
          }

          // Svelte 관련 패키지 (스코프 패키지 전체 매칭)
          if (packageMatch.startsWith('@sveltejs/') || packageMatch === 'svelte') {
            return 'svelte-vendor'
          }

          // 유틸리티 라이브러리 (실제 번들에 포함된 것만)
          if (['date-fns', 'github-slugger', 'heroicons-svelte'].includes(packageMatch)) {
            return 'utils-vendor'
          }

          // 기타 모든 vendor 패키지
          return 'main-vendor'
        },
        // 청크 파일명 최적화 - 더 설명적인 네이밍
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk'
          return `chunks/${name}-[hash].js`
        }
      }
    },
    // CSS 코드 분할 및 최적화
    css: {
      codeSplit: true,
      minify: false, // cssnano가 처리하므로 비활성화
      target: 'esnext' // 최신 CSS 기능 사용 허용
    },
    // 소스맵 최적화 (프로덕션에서는 hidden)
    sourcemap: mode === 'development' ? true : 'hidden',
    // 압축 최적화
    minify: 'esbuild',
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 에셋 관련 최적화
    assetsInlineLimit: 4096 // 4KB 미만 asset은 base64 인라인화
  },
  optimizeDeps: {
    // Tree shaking 최적화를 위한 pre-bundling
    include: ['date-fns', 'clsx', 'js-yaml', 'github-slugger', 'node-html-parser', 'reading-time'],
    // 개발 시 빠른 빌드를 위한 exclude
    exclude: ['@sveltejs/kit', 'svelte']
  }
}))
