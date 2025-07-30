import { readdirSync, statSync, readFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'

import mdsvexConfig from './mdsvex.config.js'

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
            const slug = relativePath
              .replace(/(\/index)?\.md$/, '')
              .split('/')
              .pop()
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

// 실제 포스트에서 태그를 추출하는 함수
function extractTagsFromPosts() {
  try {
    const postsDir = join(__dirname, 'posts')
    const tags = new Set()

    const extractFromDirectory = (dir) => {
      const files = readdirSync(dir)

      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          extractFromDirectory(fullPath)
        } else if (file.endsWith('.md')) {
          const content = readFileSync(fullPath, 'utf8')

          // draft인 포스트는 제외
          if (content.includes('draft: true')) continue

          // frontmatter에서 tags 추출
          const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1]
            const tagsMatch = frontmatter.match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/)

            if (tagsMatch) {
              const tagLines = tagsMatch[1].match(/^\s*-\s*(.+)$/gm)
              if (tagLines) {
                tagLines.forEach((line) => {
                  const tag = line.replace(/^\s*-\s*/, '').trim()
                  if (tag && tag.length < 50) {
                    // 너무 긴 태그는 제외
                    tags.add(tag)
                  }
                })
              }
            }
          }
        }
      }
    }

    extractFromDirectory(postsDir)
    return Array.from(tags)
  } catch (error) {
    console.warn('Could not extract tags from posts:', error)
    return []
  }
}

// Posts 목록 페이지들을 생성하는 함수
function generatePostsListRoutes() {
  try {
    const routes = ['/posts'] // 기본 posts 페이지

    // 실제 포스트 수 계산
    const postsDir = join(__dirname, 'posts')
    let postCount = 0

    const countPosts = (dir) => {
      const files = readdirSync(dir)
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          countPosts(fullPath)
        } else if (file.endsWith('.md')) {
          const content = readFileSync(fullPath, 'utf8')
          if (!content.includes('draft: true')) {
            postCount++
          }
        }
      }
    }

    countPosts(postsDir)

    // 페이지네이션 페이지 생성
    const postsPerPage = 10
    const totalPages = Math.ceil(postCount / postsPerPage)

    for (let i = 2; i <= totalPages; i++) {
      routes.push(`/posts/${i}`)
    }

    // 실제 태그들을 추출해서 태그별 페이지도 생성
    const tags = extractTagsFromPosts()
    console.log('Extracted tags for prerendering:', tags)

    tags.forEach((tag) => {
      routes.push(`/posts?tag=${encodeURIComponent(tag)}`)
      // 태그별 페이지네이션도 일부 생성 (태그별로는 최대 2페이지까지만)
      for (let i = 2; i <= 2; i++) {
        routes.push(`/posts/${i}?tag=${encodeURIComponent(tag)}`)
      }
    })

    return routes
  } catch (error) {
    console.warn('Could not generate posts list routes:', error)
    return ['/posts']
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
      entries: [
        '*',
        '/sitemap.xml',
        '/rss.xml',
        ...generatePostRoutes(),
        ...generatePostsListRoutes()
      ],
      handleMissingId: 'warn',
      handleHttpError: ({ status, path, referrer, message }) => {
        // Ignore 404 errors for asset files during prerendering
        if (
          status === 404 &&
          (path.includes('.png') ||
            path.includes('.jpg') ||
            path.includes('.jpeg') ||
            path.includes('.webp') ||
            path.includes('.avif'))
        ) {
          console.warn(`Ignoring missing image during prerender: ${path}`)
          return
        }
        throw new Error(`${status} ${path} (referenced from ${referrer}): ${message}`)
      }
    }
  }
}

export default config
