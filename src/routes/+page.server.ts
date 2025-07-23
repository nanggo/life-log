import type { PageServerLoad } from './$types'

import { posts } from '$lib/data/posts'

export const load: PageServerLoad = async () => {
  return {
    posts: posts.slice(0, 5)
  }
}
