// This is an endpoint that generates a basic rss feed for your posts.
// It is OK to delete this file if you don't want an RSS feed.
// credit: https://scottspence.com/posts/make-an-rss-feed-with-sveltekit#add-posts-for-the-rss-feed

import { posts } from '$lib/data/posts'
import { name, author, website } from '$lib/info'
import { generateCacheHeaders } from '$lib/utils/cache'
import { createSafeSlug } from '$lib/utils/posts'

export const prerender = true

// update this to something more appropriate for your website
const websiteDescription = `${name}'s blog`

// Sitemap과 일관된 URL 생성 방식 사용
const getPostUrl = (slug) => `${website}/post/${createSafeSlug(slug)}`

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

  const escapeXml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const xml = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
      <channel>
        <title>${name}'s life log</title>
        <link>${website}</link>
        <description>${websiteDescription}</description>
        <language>ko</language>
        <managingEditor>${author}</managingEditor>
        <atom:link href="${website}/rss.xml" rel="self" type="application/rss+xml" />
        ${posts
          .map(
            (post) =>
              `
              <item>
                <guid>${getPostUrl(post.slug)}</guid>
                <title>${escapeXml(post.title)}</title>
                <description>${escapeXml(post.preview.text)}</description>
                <link>${getPostUrl(post.slug)}</link>
                <dc:creator>${author}</dc:creator>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>${
                  post.category
                    ? `
                <category>${escapeXml(post.category)}</category>`
                    : ''
                }${(post.tags || [])
                  .map(
                    (tag) => `
                <category>${escapeXml(tag)}</category>`
                  )
                  .join('')}
            </item>
          `
          )
          .join('')}
      </channel>
    </rss>`

  return new Response(xml)
}
