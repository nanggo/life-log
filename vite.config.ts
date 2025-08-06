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
    assetsInlineLimit: 4096, // 4KB 미만 asset은 base64 인라인화

    // Vercel 배포 최적화
    emptyOutDir: true, // 빌드 전 출력 디렉토리 정리
    reportCompressedSize: false, // Vercel CI에서 빌드 속도 향상을 위해 비활성화

    // 정적 자산 최적화
    assetsDir: 'assets',

    // 캐시 버스팅을 위한 파일명 해시 전략
    rollupOptions: {
      ...(() => {
        const config = {
          // Tree shaking 안전성 우선 설정
          treeshake: {
            preset: 'recommended'
          },
          output: {
            // 기존 manualChunks 설정은 유지...
            manualChunks: (id) => {
              if (!id.includes('/node_modules/')) {
                return undefined
              }

              // 청크 매핑 설정 객체 - 유지보수성 개선
              const vendorChunks = {
                'vercel-vendor': ['@vercel/'],
                'svelte-vendor': ['@sveltejs/', 'svelte'],
                'markdown-vendor': [
                  'gray-matter',
                  'reading-time',
                  'github-slugger',
                  'node-html-parser'
                ],
                'utils-vendor': ['date-fns', 'clsx', 'js-yaml', 'heroicons-svelte']
              }

              // 스코프 패키지를 포함한 정확한 패키지 매칭
              const packageMatch = id.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]
              if (!packageMatch) return 'main-vendor'

              // 설정 객체를 순회하여 매칭되는 청크 찾기
              for (const [chunkName, patterns] of Object.entries(vendorChunks)) {
                if (
                  patterns.some((pattern) =>
                    pattern.endsWith('/')
                      ? packageMatch.startsWith(pattern)
                      : packageMatch === pattern
                  )
                ) {
                  return chunkName
                }
              }

              // 기타 모든 vendor 패키지
              return 'main-vendor'
            },
            // Vercel 캐싱 전략에 최적화된 파일명 구조
            chunkFileNames: (chunkInfo) => {
              const name = chunkInfo.name || 'chunk'
              return `assets/js/${name}-[hash].js`
            },
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const extType = assetInfo.name?.split('.').pop()
              if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(extType || '')) {
                return 'assets/images/[name]-[hash].[ext]'
              }
              if (['woff', 'woff2', 'ttf', 'otf'].includes(extType || '')) {
                return 'assets/fonts/[name]-[hash].[ext]'
              }
              return 'assets/[name]-[hash].[ext]'
            }
          }
        }
        return config
      })()
    }
  },
  optimizeDeps: {
    // Tree shaking 최적화를 위한 pre-bundling
    include: ['date-fns', 'clsx', 'js-yaml', 'github-slugger', 'node-html-parser', 'reading-time'],
    // 개발 시 빠른 빌드를 위한 exclude
    exclude: ['@sveltejs/kit', 'svelte']
  }
}))
