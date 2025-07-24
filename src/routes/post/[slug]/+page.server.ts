import { error } from '@sveltejs/kit'
import { parse } from 'node-html-parser'

import type { PageServerLoad } from './$types'

import { posts } from '$lib/data/posts'
import {
  website,
  name,
  techTags,
  techArticleSection,
  generalArticleSection,
  jobTitle,
  licenseUrl,
  avatar,
  github,
  linkedin,
  email
} from '$lib/info'
import { normalizeSlug, compareSlug } from '$lib/utils/posts'

// 빌드 시점에 정적 HTML 생성을 위해 prerender 활성화
export const prerender = true

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
    let wordCount = 0
    let firstImageUrl = ''

    try {
      // Get all markdown files and find the matching one
      const allPosts: Record<string, { default: { render: () => { html: string } } }> =
        import.meta.glob('/posts/**/*.md', { eager: true })
      const postKey = Object.keys(allPosts).find((key) => {
        const fileName = key
          .replace(/(\/index)?\.md$/, '')
          .split('/')
          .pop()
        return fileName === post.slug
      })

      if (postKey && allPosts[postKey]) {
        const rendered = allPosts[postKey].default.render()
        const html = parse(rendered.html)
        postContent = html.structuredText || ''
        wordCount = postContent.split(/\s+/).filter((word) => word.length > 0).length

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
      wordCount = postContent.split(/\s+/).filter((word) => word.length > 0).length
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

    // Determine if this is a technical article based on tags
    const isTechArticle =
      post.tags?.some((tag) =>
        techTags.some((techTag) => tag.toLowerCase().includes(techTag.toLowerCase()))
      ) || false

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': isTechArticle ? ['BlogPosting', 'TechArticle'] : 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      headline: post.title,
      alternativeHeadline: post.title,
      image: {
        '@type': 'ImageObject',
        url: ogImage,
        width: firstImageUrl ? undefined : 1200,
        height: firstImageUrl ? undefined : 630,
        caption: post.title,
        description: `${post.title}에 관련된 이미지`
      },
      datePublished: safeToISOString(post.date),
      dateModified: safeToISOString(post.date),
      author: {
        '@type': 'Person',
        name,
        url: website,
        image: {
          '@type': 'ImageObject',
          url: avatar,
          width: 460,
          height: 460
        },
        jobTitle,
        description: 'love to write and code',
        sameAs: [
          `https://github.com/${github}`,
          `https://www.linkedin.com/in/${linkedin}`,
          `mailto:${email}`
        ]
      },
      publisher: {
        '@type': 'Organization',
        name,
        url: website,
        logo: {
          '@type': 'ImageObject',
          url: `${website}/favicon.png`,
          width: 192,
          height: 192
        },
        founder: {
          '@type': 'Person',
          name,
          url: website
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email,
          availableLanguage: ['Korean', 'English']
        }
      },
      description: dynamicDescription,
      abstract: dynamicDescription,
      articleBody: postContent,
      articleSection: isTechArticle ? techArticleSection : generalArticleSection,
      keywords: post.tags ? post.tags.join(', ') : '',
      url,
      inLanguage: 'ko-KR',
      wordCount,
      genre: isTechArticle ? ['Technology', 'Programming'] : ['Personal', 'Blog'],
      about: post.tags
        ? post.tags.map((tag) => ({
            '@type': 'Thing',
            name: tag
          }))
        : undefined,
      mentions: post.tags
        ? post.tags.map((tag) => ({
            '@type': 'Thing',
            name: tag
          }))
        : undefined,
      isAccessibleForFree: true,
      copyrightYear: new Date(post.date).getFullYear(),
      copyrightHolder: {
        '@type': 'Person',
        name
      },
      license: licenseUrl,
      ...(isTechArticle && {
        proficiencyLevel: 'Beginner',
        dependencies: '기본적인 웹 개발 지식'
      })
    }

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: website
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Posts',
          item: `${website}/posts`
        },
        {
          '@type': 'ListItem',
          position: 3,
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
      modifiedDate: safeToISOString(post.date)
    }
  } catch (err) {
    console.error(`Error loading post ${slug}:`, err)
    throw error(404, `Post not found: ${slug}`)
  }
}
