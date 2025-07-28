import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    sveltekit(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false
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
          if (id.includes('node_modules')) {
            if (id.includes('@sveltejs')) {
              return 'svelte-vendor'
            }
            if (id.includes('lucide') || id.includes('heroicons')) {
              return 'ui-vendor'
            }
            if (id.includes('date-fns') || id.includes('clsx')) {
              return 'utils-vendor'
            }
            return 'vendor'
          }
        }
      }
    },
    // CSS 코드 분할
    cssCodeSplit: true,
    // 소스맵 최적화 (프로덕션에서는 hidden)
    sourcemap: process.env.NODE_ENV === 'development',
    // 압축 최적화
    minify: 'esbuild',
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    // Tree shaking 최적화를 위한 pre-bundling
    include: ['date-fns', 'clsx', 'js-yaml', 'github-slugger']
  }
})
