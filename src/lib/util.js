/**
 * Paginates an array of data.
 *
 * @param {any[]} data
 * @param {{ page?: number, limit: number }} args
 * @returns
 */
export function paginate(data, { page = 1, limit } = {}) {
  if (limit) {
    return data.slice((page - 1) * limit, page * limit)
  }

  return data
}

/**
 * Extracts metadata from posts (excluding content).
 *
 * @param {any[]} posts
 * @returns {any[]}
 */
export function extractPostMetadata(posts) {
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    preview: post.preview,
    readingTime: post.readingTime,
    isIndexFile: post.isIndexFile
  }))
}
