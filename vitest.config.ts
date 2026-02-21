import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    typecheck: {
      include: ['**/*.{test,spec}.ts', 'src/test/jest-dom.d.ts']
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/lib/**/*.{ts,js,svelte}'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'build/',
        '.svelte-kit/',
        'static/',
        'scripts/',
        'posts/',
        'src/lib/data/posts.ts',
        'src/lib/components/content/**',
        'src/lib/components/layout/**',
        'src/lib/components/CategoryFilter.svelte',
        'src/lib/components/LazyImage.svelte',
        'src/lib/components/TagCloud.svelte',
        'src/lib/components/VirtualList.svelte',
        'src/lib/components/ui/Button/**',
        'src/lib/components/post/PostsList.svelte',
        'src/lib/components/**/index.ts',
        'src/lib/components/ui/index.ts',
        'src/lib/types.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
