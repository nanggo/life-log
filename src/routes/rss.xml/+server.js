// This is an endpoint that generates a basic rss feed for your posts.
// It is OK to delete this file if you don't want an RSS feed.
// credit: https://scottspence.com/posts/make-an-rss-feed-with-sveltekit#add-posts-for-the-rss-feed

import { createHash } from 'crypto'

import { posts } from '$lib/data/posts'
import { name, website } from '$lib/info'

export const prerender = true

// update this to something more appropriate for your website
const websiteDescription = `${name}'s blog`
const postsUrl = `${website}/posts`

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ setHeaders }) {
  // 모든 포스트의 slug와 날짜를 조합한 SHA-1 해시 기반 ETag 생성
  const postsHash = posts.map((post) => `${post.slug}-${post.date}`).join('|')
  const etag = `"${createHash('sha1').update(postsHash).digest('base64')}"`

  const latestPostDate = posts[0]?.date || new Date()

  setHeaders({
    'Cache-Control': `max-age=0, s-max-age=3600`, // 1시간 캐시로 증가
    'Content-Type': 'application/xml',
    ETag: etag,
    'Last-Modified': new Date(latestPostDate).toUTCString()
  })

  const xml = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
      <channel>
        <title>${name}'s life log</title>
        <link>${website}</link>
        <description>${websiteDescription}</description>
        <atom:link href="${website}/rss.xml" rel="self" type="application/rss+xml" />
        ${posts
          .map(
            (post) =>
              `
              <item>
                <guid>${postsUrl}/${post.slug}</guid>
                <title>${post.title}</title>
                <description>${post.preview.text}</description>
                <link>${postsUrl}/${post.slug}</link>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            </item>
          `
          )
          .join('')}
      </channel>
    </rss>`

  return new Response(xml)
}
