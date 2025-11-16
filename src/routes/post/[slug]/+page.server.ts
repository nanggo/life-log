import { error } from '@sveltejs/kit'

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

    // Choose social media image with priority:
    // 1) frontmatter image, 2) 본문에서 추출한 첫 번째 이미지, 3) 생성형 OG 이미지
    const configuredImage = post.image?.trim()
    const contentFirstImage = post.firstImageUrl?.trim()
    const ogImage =
      configuredImage ||
      contentFirstImage ||
      `https://og-image-korean.vercel.app/**${encodeURIComponent(
        post.title
      )}**?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-color-logo.svg`
    const usedPostImage = !!(configuredImage || contentFirstImage)

    const url = `${website}/post/${post.slug}`

    // Create a more SEO-friendly description with simplified fallback logic
    const previewText =
      post.preview?.text?.trim() ||
      post.description?.trim() ||
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
      inLanguage: 'ko-KR',
      mainEntityOfPage: url,
      keywords: post.tags,
      articleSection: post.category,
      timeRequired: `PT${post.readingTime}M`
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
      jsonLd: JSON.stringify(jsonLd, null, 0),
      breadcrumbLd: JSON.stringify(breadcrumbLd, null, 0),
      socialMediaImage: ogImage,
      isPostImage: usedPostImage,
      publishedDate: safeToISOString(post.date),
      modifiedDate: safeToISOString(post.updated || post.date)
    }
  } catch (err) {
    console.error(`Error loading post ${slug}:`, err)
    throw error(404, `Post not found: ${slug}`)
  }
}
