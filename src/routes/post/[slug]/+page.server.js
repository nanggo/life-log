import { posts } from '$lib/data/posts'
import { error } from '@sveltejs/kit'
import { normalizeSlug, compareSlug } from '$lib/utils/posts'
import { website, name, avatar } from '$lib/info.js'

// 빌드 시점에 정적 HTML 생성을 위해 prerender 활성화
export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params

  try {
    if (!slug) {
      throw error(404, 'Slug parameter is missing')
    }

    const decodedSlug = decodeURIComponent(slug)
    const normalizedRequestSlug = normalizeSlug(decodedSlug)

    // 1. 정확한 매칭 시도
    let post = posts.find((post) => post.slug === decodedSlug)

    // 2. 정규화된 매칭 시도
    if (!post) {
      post = posts.find((post) => compareSlug(post.slug, decodedSlug))
    }

    // 3. 부분 매칭 시도 (더 관대한 매칭)
    if (!post) {
      post = posts.find(
        (post) =>
          normalizeSlug(post.slug).includes(normalizedRequestSlug) ||
          normalizedRequestSlug.includes(normalizeSlug(post.slug))
      )
    }

    if (!post) {
      console.error(`Post not found: ${decodedSlug}`)
      throw error(404, `Post not found: ${decodedSlug}`)
    }

    const ogImage = `https://og-image-korean.vercel.app/**${encodeURIComponent(
      post.title
    )}**?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-color-logo.svg`

    const url = `${website}/${post.slug}`

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      headline: post.title,
      image: ogImage,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: name
      },
      publisher: {
        '@type': 'Organization',
        name: name,
        logo: {
          '@type': 'ImageObject',
          url: `${website}/favicon.png`
        }
      },
      description: post.preview.text
    }

    return {
      post,
      jsonLd: JSON.stringify(jsonLd)
    }
  } catch (err) {
    console.error(`Error loading post ${slug}:`, err)
    throw error(404, `Post not found: ${slug}`)
  }
}
