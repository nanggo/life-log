import { error } from '@sveltejs/kit'
import { parse } from 'node-html-parser'

import type { PageServerLoad } from './$types'

import { posts } from '$lib/data/posts'
import { website, author } from '$lib/info'
import { normalizeSlug, compareSlug } from '$lib/utils/posts'

// 빌드 시점에 정적 HTML 생성을 위해 prerender 활성화
export const prerender = true

// Technical article detection removed for performance optimization

/**
 * 유효한 날짜를 ISO 문자열로 변환하는 안전한 함수
 * @param {string|Date} dateValue - 변환할 날짜 값
 * @returns {string} - ISO 형식의 날짜 문자열
 */
const safeToISOString = (dateValue: string | Date): string => {
  try {
    const date = new Date(dateValue)
    // Date 객체의 valueOf()가 NaN이면 유효하지 않은 날짜
    return !isNaN(date.valueOf()) ? date.toISOString() : new Date().toISOString()
  } catch (_e) {
    return new Date().toISOString() // 예외 발생 시 현재 날짜 사용
  }
}

export const load: PageServerLoad = async ({ params }) => {
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

    // Load the actual post content for SEO purposes
    let postContent = ''
    let firstImageUrl = ''

    try {
      // Get all markdown files with lazy import for better performance
      const allPostModules = import.meta.glob('/posts/**/*.md')

      // Find the matching post path first
      const postKey = Object.keys(allPostModules).find((key) => {
        const fileName = key
          .replace(/(\/index)?\.md$/, '')
          .split('/')
          .pop()
        return fileName === post.slug
      })

      if (postKey && allPostModules[postKey]) {
        // Only import the specific post we need
        const postModule = (await allPostModules[postKey]()) as {
          default: { render: () => { html: string } }
        }
        const rendered = postModule.default.render()
        const html = parse(rendered.html)
        postContent = html.structuredText || ''
        // wordCount calculation removed for performance optimization

        // Extract first image from content for social media preview
        const imgElement = html.querySelector('img')
        if (imgElement) {
          const src = imgElement.getAttribute('src')
          if (src) {
            try {
              // Handle relative URLs by converting to absolute using post's static file path
              firstImageUrl = new URL(src, `${website}/posts/${post.slug}/`).href
            } catch (_e) {
              // The URL constructor can throw for invalid formats (e.g., data URIs).
              // Catching this prevents a server crash for the page.
              console.warn(
                `Could not resolve image URL "${src}" in post "${post.slug}". It will be skipped.`
              )
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Could not load content for post ${post.slug}:`, err)
    }

    // Fallback to preview text if full content unavailable
    if (!postContent) {
      postContent = post.preview.text || ''
    }

    // Choose social media image with priority: post image > generated OG image
    const ogImage =
      firstImageUrl ||
      `https://og-image-korean.vercel.app/**${encodeURIComponent(
        post.title
      )}**?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-color-logo.svg`

    const url = `${website}/${post.slug}`

    // Create a more SEO-friendly description with simplified fallback logic
    const previewText =
      post.preview?.text?.trim() ||
      postContent?.trim().split('\n')[0]?.trim() ||
      post.title?.trim() ||
      '낭고넷 블로그 포스트'

    const dynamicDescription =
      previewText.length > 160 ? `${previewText.substring(0, 157)}...` : previewText

    // Technical article detection removed for performance optimization

    // Simplified JSON-LD for better mobile performance
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      image: ogImage,
      datePublished: safeToISOString(post.date),
      dateModified: safeToISOString(post.updated || post.date),
      author: {
        '@type': 'Person',
        name: author,
        url: website
      },
      publisher: {
        '@type': 'Organization',
        name: author,
        url: website
      },
      description: dynamicDescription,
      url,
      inLanguage: 'ko-KR'
    }

    // Simplified breadcrumb for better performance
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Posts',
          item: `${website}/posts`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.title,
          item: url
        }
      ]
    }

    return {
      post,
      dynamicDescription,
      jsonLd: JSON.stringify(jsonLd),
      breadcrumbLd: JSON.stringify(breadcrumbLd),
      socialMediaImage: ogImage,
      isPostImage: !!firstImageUrl,
      publishedDate: safeToISOString(post.date),
      modifiedDate: safeToISOString(post.updated || post.date)
    }
  } catch (err) {
    console.error(`Error loading post ${slug}:`, err)
    throw error(404, `Post not found: ${slug}`)
  }
}
