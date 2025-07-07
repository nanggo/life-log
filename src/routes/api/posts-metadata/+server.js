import { json } from '@sveltejs/kit'
import { posts, allTags } from '$lib/data/posts.js'

/**
 * 포스트 메타데이터 API 엔드포인트
 * 클라이언트 사이드 필터링을 위한 경량화된 데이터 제공
 */
export async function GET() {
  try {
    // 메타데이터만 추출 (본문 제외)
    const metadata = posts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      tags: post.tags,
      preview: post.preview,
      readingTime: post.readingTime,
      isIndexFile: post.isIndexFile
    }))

    return json({
      posts: metadata,
      tags: allTags,
      total: metadata.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching posts metadata:', error)
    return json(
      { error: 'Failed to fetch posts metadata' },
      { status: 500 }
    )
  }
}