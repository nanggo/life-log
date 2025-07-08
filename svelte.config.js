import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'

import adapter from '@sveltejs/adapter-auto'

import preprocess from 'svelte-preprocess'
import { readdirSync, statSync, readFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 모든 포스트 경로를 생성하는 함수
function generatePostRoutes() {
  try {
    // posts 폴더의 모든 .md 파일을 읽어서 경로 생성
    const postsDir = join(__dirname, 'posts')
    
    const getAllMdFiles = (dir) => {
      const files = readdirSync(dir)
      let mdFiles = []
      
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          mdFiles = mdFiles.concat(getAllMdFiles(fullPath))
        } else if (file.endsWith('.md')) {
          // 파일 내용을 읽어서 draft 상태 확인
          const content = readFileSync(fullPath, 'utf8')
          const isDraft = content.includes('draft: true')
          
          // draft가 아닌 포스트만 route 생성
          if (!isDraft) {
            const relativePath = relative(postsDir, fullPath)
            const slug = relativePath.replace(/(\/index)?\.md$/, '').split('/').pop()
            mdFiles.push(`/post/${slug}`)
          }
        }
      }
      
      return mdFiles
    }
    
    return getAllMdFiles(postsDir)
  } catch (error) {
    console.warn('Could not generate post routes:', error)
    return []
  }
}

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
      entries: ['*', '/sitemap.xml', '/rss.xml', ...generatePostRoutes()],
      handleMissingId: 'warn'
    }
  }
}

export default config
