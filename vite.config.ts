import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [sveltekit(), imagetools()],
  // allows vite access to ./posts
  server: {
    fs: {
      allow: ['./']
    }
  }
})
