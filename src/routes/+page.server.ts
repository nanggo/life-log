import type { PageServerLoad } from './$types'

import { posts, getCategoryInfos } from '#lib/data/posts.js'
import { name } from '#lib/info.js'
import { extractPostMetadata } from '#lib/util.js'

export const load: PageServerLoad = async () => {
  return {
    posts: extractPostMetadata(posts.slice(0, 5)),
    categoryInfos: getCategoryInfos(),
    seo: {
      title: `${name} - 흔한 개발자의 일상과 기술 블로그`
    }
  }
}
