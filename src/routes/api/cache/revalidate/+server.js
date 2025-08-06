import { json } from '@sveltejs/kit'

import { globalCacheManager, CACHE_TAGS } from '$lib/utils/cache-manager'

// Use Node.js runtime for compatibility with ISR
export const config = {
  runtime: 'nodejs18.x'
}

export async function POST({ request }) {
  try {
    const { tags, keys } = await request.json()

    let invalidatedCount = 0

    // 특정 태그로 캐시 무효화
    if (tags && Array.isArray(tags)) {
      invalidatedCount += globalCacheManager.invalidateByTags(tags)
    }

    // 특정 키로 캐시 무효화
    if (keys && Array.isArray(keys)) {
      for (const key of keys) {
        if (globalCacheManager.delete(key)) {
          invalidatedCount++
        }
      }
    }

    // 만료된 캐시 정리
    const cleanedCount = globalCacheManager.cleanup()

    return json({
      success: true,
      invalidated: invalidatedCount,
      cleaned: cleanedCount,
      stats: globalCacheManager.getStats()
    })
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 400 })
  }
}

// 전체 캐시 무효화 (GET 요청으로도 지원)
export async function DELETE() {
  const stats = globalCacheManager.getStats()
  globalCacheManager.clear()

  return json({
    success: true,
    message: 'All cache cleared',
    previousStats: stats
  })
}

// 캐시 상태 조회
export async function GET() {
  return json({
    stats: globalCacheManager.getStats(),
    availableTags: Object.values(CACHE_TAGS)
  })
}
