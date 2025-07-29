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
          // node_modules의 vendor 청크 분리
          if (id.includes('/node_modules/')) {
            // 데이터 주도적 청크 매핑
            const vendorMap = {
              'svelte-vendor': ['@sveltejs'],
              'ui-vendor': ['lucide', 'heroicons'],
              'utils-vendor': ['date-fns', 'clsx']
            }

            // 각 청크 타입별로 패키지 매칭 확인
            for (const [chunkName, packages] of Object.entries(vendorMap)) {
              if (packages.some((pkg) => id.includes(pkg))) {
                return chunkName
              }
            }

            // 모든 기타 node_modules 패키지를 위한 기본 vendor 청크
            return 'vendor'
          }
          // 앱 코드는 기본 청킹 로직 사용
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
    include: ['date-fns', 'clsx', 'js-yaml', 'github-slugger']
  }
}))
