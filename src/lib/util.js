/**
 * @typedef {Object} PostMetadata
 * @property {string} slug - Post slug identifier
 * @property {string} title - Post title
 * @property {string} date - Formatted post date
 * @property {string[]} tags - Array of post tags
 * @property {Object} preview - Post preview content
 * @property {string} preview.html - HTML preview content
 * @property {string} preview.text - Text preview content
 * @property {string} readingTime - Estimated reading time
 * @property {boolean} isIndexFile - Whether this is an index file
 */

/**
 * @typedef {Object} Post
 * @property {string} slug - Post slug identifier
 * @property {string} title - Post title
 * @property {string} date - Post date
 * @property {string[]} tags - Array of post tags
 * @property {Object} preview - Post preview content
 * @property {string} readingTime - Estimated reading time
 * @property {boolean} isIndexFile - Whether this is an index file
 * @property {string} [content] - Full post content (excluded in metadata)
 */

/**
 * Paginates an array of data.
 *
 * @param {any[]} data - Array of data to paginate
 * @param {{ page?: number, limit: number }} args - Pagination options
 * @returns {any[]} Paginated data array
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
 * @param {Post[]} posts - Array of post objects
 * @returns {PostMetadata[]} Array of post metadata objects
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
