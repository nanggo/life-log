/**
 * Eagerly loads all post components at build time for instant navigation.
 * Trade-off: Larger bundle size, but eliminates delay when clicking posts.
 *
 * @type {import('@sveltejs/kit').PageLoad}
 */
export const prerender = true

// Eagerly load all posts at build time - no lazy loading delay on navigation
const allPosts = import.meta.glob('/posts/**/*.md', { eager: true })

export function load({ data }) {
  // Find the correct post file
  const postKey = data.post.isIndexFile
    ? `/posts/${data.post.slug}/index.md`
    : `/posts/${data.post.slug}.md`

  const post = allPosts[postKey]
  if (!post) {
    throw new Error(`Post not found: ${postKey}`)
  }

  return {
    post: data.post,
    component: post.default,
    dynamicDescription: data.dynamicDescription,
    jsonLd: data.jsonLd,
    breadcrumbLd: data.breadcrumbLd,
    layout: {
      fullWidth: true
    }
  }
}
