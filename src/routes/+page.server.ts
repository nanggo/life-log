import type { PageServerLoad } from './$types'

import { posts } from '$lib/data/posts'
import { globalCacheManager, generateCacheKey, CACHE_TAGS } from '$lib/utils/cache-manager'

export const load: PageServerLoad = async () => {
  const cacheKey = generateCacheKey.homeData()

  // 캐시에서 확인
  if (globalCacheManager.has(cacheKey)) {
    return globalCacheManager.get(cacheKey)
  }

  const result = {
    posts: posts.slice(0, 5)
  }

  // 캐싱 (개발 환경에서는 캐시 비활성화)
  if (process.env.NODE_ENV === 'production') {
    globalCacheManager.set(cacheKey, result, [CACHE_TAGS.HOME, CACHE_TAGS.POSTS])
  }

  return result
}
