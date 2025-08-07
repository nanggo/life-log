import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

import { posts, allTags } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'

/**
 * 포스트 메타데이터 API 엔드포인트
 * 클라이언트 사이드 필터링을 위한 경량화된 데이터 제공
 */
export const GET: RequestHandler = () => {
  try {
    // 메타데이터만 추출 (본문 제외)
    const metadata = extractPostMetadata(posts)

    return json({
      posts: metadata,
      tags: allTags,
      total: metadata.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching posts metadata:', error)
    return json({ error: 'Failed to fetch posts metadata' }, { status: 500 })
  }
}
