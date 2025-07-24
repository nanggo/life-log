/**
 * Dynamically loads the svelte component for the post (only possible in +page.js)
 * and pass on the data from +page.server.js
 *
 * @type {import('@sveltejs/kit').PageLoad}
 */
export const prerender = true

// Pre-load all posts using import.meta.glob
const allPosts = import.meta.glob('/posts/**/*.md')

export async function load({ data }) {
  // Find the correct post file
  const postKey = data.post.isIndexFile
    ? `/posts/${data.post.slug}/index.md`
    : `/posts/${data.post.slug}.md`

  const postLoader = allPosts[postKey]
  if (!postLoader) {
    throw new Error(`Post not found: ${postKey}`)
  }

  const component = await postLoader()

  return {
    post: data.post,
    component: component.default,
    dynamicDescription: data.dynamicDescription,
    jsonLd: data.jsonLd,
    breadcrumbLd: data.breadcrumbLd,
    layout: {
      fullWidth: true
    }
  }
}
