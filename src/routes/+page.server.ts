import type { PageServerLoad } from './$types'

import { posts, getCategoryInfos } from '$lib/data/posts'

export const load: PageServerLoad = async () => {
  return {
    posts: posts.slice(0, 5),
    categoryInfos: getCategoryInfos()
  }
}
