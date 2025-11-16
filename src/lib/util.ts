import type { PostMetadata } from '$lib/types'
import type { Post } from '$lib/types/blog'

interface PaginateOptions {
  page?: number
  limit: number
}

/**
 * Paginates an array of data.
 */
export function paginate<T>(data: T[], { page = 1, limit }: PaginateOptions): T[] {
  if (limit) {
    return data.slice((page - 1) * limit, page * limit)
  }

  return data
}

/**
 * Extracts metadata from posts (excluding content).
 */
export function extractPostMetadata(posts: Post[]): PostMetadata[] {
  return posts.map((post) => {
    // 목록 페이지용 미리보기에서는 이미지 태그를 제거해 JSON/payload를 가볍게 유지
    const strippedPreviewHtml = post.preview.html.replace(/<img\b[^>]*>/gi, '')

    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      category: post.category,
      tags: post.tags,
      draft: post.draft,
      preview: {
        ...post.preview,
        html: strippedPreviewHtml
      },
      author: post.author,
      readingTime: post.readingTime,
      image: post.image
    }
  })
}
