// This is an endpoint that generates a basic sitemap for the index page and all posts.
// It's helpful for SEO but does require you to keep it updated to reflect the routes of your website.
// It is OK to delete this file if you'd rather not bother with it.

import { parse } from 'node-html-parser'

import { posts } from '$lib/data/posts'
import { website } from '$lib/info'
import { generateCacheHeaders } from '$lib/utils/cache'
import { createSafeSlug } from '$lib/utils/posts'

export const prerender = true

// Use Node.js runtime due to node-html-parser dependency
export const config = {
  runtime: 'nodejs20.x' // Using stable Node.js 20 LTS
}

// make sure this matches your post route
const getPostUrl = (slug) => `${website}/post/${createSafeSlug(slug)}`

/**
 * 유효한 날짜를 ISO 문자열로 변환하는 안전한 함수
 * @param {string|Date} dateValue - 변환할 날짜 값
 * @returns {string} - ISO 형식의 날짜 문자열
 */
const safeToISOString = (dateValue) => {
  try {
    const date = new Date(dateValue)
    // Date 객체의 valueOf()가 NaN이면 유효하지 않은 날짜
    return !isNaN(date.valueOf()) ? date.toISOString() : new Date().toISOString() // 유효하지 않은 경우 현재 날짜 사용
  } catch (_e) {
    return new Date().toISOString() // 예외 발생 시 현재 날짜 사용
  }
}

/**
 * 포스트에서 첫 번째 이미지 정보를 추출하는 함수
 * @param {Object} post - 포스트 객체
 * @returns {Object|null} - 이미지 정보 또는 null
 */
const extractFirstImage = (post) => {
  try {
    // 포스트의 preview HTML에서 이미지 찾기
    if (post.preview?.html) {
      const previewHtml = parse(post.preview.html)
      const img = previewHtml.querySelector('img')
      if (img) {
        const src = img.getAttribute('src')
        const alt = img.getAttribute('alt') || post.title
        if (src) {
          // 상대 경로를 절대 URL로 변환
          const imageUrl = src.startsWith('http') ? src : `${website}${src}`
          return {
            url: imageUrl,
            title: alt,
            alt
          }
        }
      }
    }
  } catch (error) {
    // Silently fail - image extraction is optional for sitemap
    // This prevents console spam while maintaining functionality
    void error
  }
  return null
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ setHeaders }) {
  const { etag, lastModified } = generateCacheHeaders(posts)

  setHeaders({
    'Cache-Control': `max-age=0, s-max-age=3600`, // 1시간 캐시로 증가
    'Content-Type': 'application/xml',
    ETag: etag,
    'Last-Modified': lastModified
  })

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
    >
      <url>
        <loc>${website}</loc>
        <lastmod>${safeToISOString(new Date())}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${website}/about</loc>
        <lastmod>${safeToISOString(new Date())}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${website}/posts</loc>
        <lastmod>${safeToISOString(posts[0]?.date || new Date())}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>

      ${posts
        .map((post) => {
          const image = extractFirstImage(post)
          const imageXml = image
            ? `
            <image:image>
              <image:loc>${image.url}</image:loc>
              <image:title>${image.title}</image:title>
              <image:caption>${image.alt}</image:caption>
            </image:image>`
            : ''

          return `<url>
            <loc>${getPostUrl(post.slug)}</loc>
            <lastmod>${safeToISOString(post.updated || post.date)}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>${imageXml}
          </url>`
        })
        .join('')}
    </urlset>`

  return new Response(xml)
}
