import type { PageServerLoad } from './$types'

import { posts, getCategoryInfos } from '$lib/data/posts'
import { name } from '$lib/info'
import { extractPostMetadata } from '$lib/util'

export const load: PageServerLoad = async () => {
  return {
    posts: extractPostMetadata(posts.slice(0, 5)),
    categoryInfos: getCategoryInfos(),
    seo: {
      title: `${name} - 흔한 개발자의 일상과 기술 블로그`
    }
  }
}
