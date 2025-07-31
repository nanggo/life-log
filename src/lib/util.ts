import type { Post, PostMetadata } from '$lib/types'

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
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: (post as Post).category,
    tags: post.tags,
    draft: post.draft,
    preview: post.preview,
    author: post.author,
    readingTime: post.readingTime,
    thumbnail: post.thumbnail
  }))
}
