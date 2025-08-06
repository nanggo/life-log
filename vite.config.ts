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
      // Tree shaking 명시적 활성화
      treeshake: {
        preset: 'recommended',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      },
      output: {
        // 더 세밀한 청크 분리
        manualChunks: (id) => {
          if (id.includes('/node_modules/')) {
            // Vercel Analytics 분리 (큰 라이브러리)
            if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
              return 'vercel-vendor'
            }
            // Svelte 관련 패키지
            if (id.includes('@sveltejs') || id.includes('svelte')) {
              return 'svelte-vendor'
            }
            // 유틸리티 라이브러리
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('js-yaml')) {
              return 'utils-vendor'
            }
            // 마크다운 관련 (큰 번들)
            if (
              id.includes('mdsvex') ||
              id.includes('gray-matter') ||
              id.includes('reading-time') ||
              id.includes('github-slugger') ||
              id.includes('node-html-parser')
            ) {
              return 'markdown-vendor'
            }
            // 기타 모든 vendor 패키지
            return 'main-vendor'
          }
          // 앱 코드는 기본 청킹 사용
          return undefined
        },
        // 파일명 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk'
          return `${facadeModuleId}-[hash].js`
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
