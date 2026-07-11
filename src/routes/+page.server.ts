import type { PageServerLoad } from './$types'

import { posts, getCategoryInfos } from '$lib/data/posts'
import { name } from '$lib/info'

export const load: PageServerLoad = async () => {
  return {
    posts: posts.slice(0, 5),
    categoryInfos: getCategoryInfos(),
    seo: {
      title: `${name} - 흔한 개발자의 일상과 기술 블로그`
    }
  }
}
