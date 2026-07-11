// This is an endpoint that generates a basic sitemap for the index page and all posts.
// It's helpful for SEO but does require you to keep it updated to reflect the routes of your website.
// It is OK to delete this file if you'd rather not bother with it.

import { parse } from 'node-html-parser'

import {
  posts,
  getCategoryInfos,
  getPostsByCategory,
  getAllTagsWithCounts,
  getPostsByTag
} from '$lib/data/posts'
import { website } from '$lib/info'
import { generateCacheHeaders } from '$lib/utils/cache'
import { createSafeSlug } from '$lib/utils/posts'
import { isTagIndexable } from '$lib/utils/seo'

export const prerender = true

// 목록 라우트들의 페이지당 포스트 수와 일치해야 함
const POSTS_PER_PAGE = 10

// make sure this matches your post route
const getPostUrl = (slug) => `${website}/post/${createSafeSlug(slug)}`
const getCategoryUrl = (name) => `${website}/posts/category/${encodeURIComponent(name)}`
const getTagUrl = (tag) => `${website}/tags/${encodeURIComponent(tag)}`

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const toPublicImageUrl = (imageUrl, slug) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  if (imageUrl.startsWith('./')) {
    return `/${slug}/${imageUrl.slice(2)}`
  }

  return `/${imageUrl}`
}

const toAbsoluteImageUrl = (imageUrl, slug) => {
  const publicImageUrl = toPublicImageUrl(imageUrl, slug)
  return publicImageUrl.startsWith('http') ? publicImageUrl : `${website}${publicImageUrl}`
}

const toValidTimestamp = (dateValue) => {
  if (!dateValue) return null

  const timestamp = new Date(dateValue).valueOf()
  return Number.isNaN(timestamp) ? null : timestamp
}

const toValidISOString = (dateValue) => {
  const timestamp = toValidTimestamp(dateValue)
  return timestamp === null ? null : new Date(timestamp).toISOString()
}

const getLatestModifiedIso = (items) => {
  const latestTimestamp = items.reduce((latest, item) => {
    const timestamp = toValidTimestamp(item.updated || item.date)
    return timestamp !== null && (latest === null || timestamp > latest) ? timestamp : latest
  }, null)

  return latestTimestamp === null ? null : new Date(latestTimestamp).toISOString()
}

const renderLastmod = (isoDate) => (isoDate ? `<lastmod>${isoDate}</lastmod>` : '')

/**
 * 포스트에서 첫 번째 이미지 정보를 추출하는 함수
 * @param {Object} post - 포스트 객체
 * @returns {Object|null} - 이미지 정보 또는 null
 */
const extractFirstImage = (post) => {
  try {
    if (post.image) {
      const imageUrl = toAbsoluteImageUrl(post.image, post.slug)
      return {
        url: imageUrl,
        title: post.imageAlt || post.title,
        alt: post.imageAlt || post.title
      }
    }

    // 포스트의 preview HTML에서 이미지 찾기
    if (post.preview?.html) {
      const previewHtml = parse(post.preview.html)
      const img = previewHtml.querySelector('img')
      if (img) {
        const src = img.getAttribute('src')
        const alt = img.getAttribute('alt') || post.title
        if (src) {
          // 상대 경로를 절대 URL로 변환
          const imageUrl = toAbsoluteImageUrl(src, post.slug)
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
  const latestPostModified = getLatestModifiedIso(posts)

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
        <loc>${website}/</loc>
        ${renderLastmod(latestPostModified)}
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${website}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${website}/posts</loc>
        ${renderLastmod(latestPostModified)}
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${website}/tags</loc>
        ${renderLastmod(latestPostModified)}
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>

      ${(() => {
        // 페이지네이션 페이지 (/posts/2 이후)도 크롤링 대상에 포함
        const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
        const pages = []
        for (let p = 2; p <= totalPages; p++) {
          pages.push(`<url>
            <loc>${website}/posts/${p}</loc>
            ${renderLastmod(latestPostModified)}
            <changefreq>daily</changefreq>
            <priority>0.6</priority>
          </url>`)
        }
        return pages.join('')
      })()}

      ${posts
        .map((post) => {
          const image = extractFirstImage(post)
          const imageXml = image
            ? `
            <image:image>
              <image:loc>${escapeXml(image.url)}</image:loc>
              <image:title>${escapeXml(image.title)}</image:title>
              <image:caption>${escapeXml(image.alt)}</image:caption>
            </image:image>`
            : ''

          return `<url>
            <loc>${getPostUrl(post.slug)}</loc>
            ${renderLastmod(toValidISOString(post.updated || post.date))}
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>${imageXml}
          </url>`
        })
        .join('')}
      
      ${(() => {
        try {
          const categories = getCategoryInfos()
          return categories
            .map((info) => {
              const catPosts = getPostsByCategory(info.category)
              const lastmod = getLatestModifiedIso(catPosts || [])
              const urls = [
                `<url>
                <loc>${getCategoryUrl(info.category)}</loc>
                ${renderLastmod(lastmod)}
                <changefreq>weekly</changefreq>
                <priority>0.6</priority>
              </url>`
              ]
              // 카테고리 페이지네이션 (2페이지 이후)
              const catTotalPages = Math.ceil((catPosts?.length || 0) / POSTS_PER_PAGE)
              for (let p = 2; p <= catTotalPages; p++) {
                urls.push(`<url>
                <loc>${getCategoryUrl(info.category)}/${p}</loc>
                ${renderLastmod(lastmod)}
                <changefreq>weekly</changefreq>
                <priority>0.5</priority>
              </url>`)
              }
              return urls.join('')
            })
            .join('')
        } catch (_e) {
          return ''
        }
      })()}

      ${(() => {
        try {
          const tags = getAllTagsWithCounts()
          return tags
            .filter(({ count }) => isTagIndexable(count))
            .map(({ tag }) => {
              const tagPosts = getPostsByTag(tag)
              const lastmod = getLatestModifiedIso(tagPosts || [])
              return `<url>
                <loc>${getTagUrl(tag)}</loc>
                ${renderLastmod(lastmod)}
                <changefreq>weekly</changefreq>
                <priority>0.5</priority>
              </url>`
            })
            .join('')
        } catch (_e) {
          return ''
        }
      })()}
    </urlset>`

  return new Response(xml)
}
