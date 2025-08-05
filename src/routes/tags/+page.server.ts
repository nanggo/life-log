import { getAllTagsWithCounts } from '$lib/data/posts'

/**
 * 태그별 포스트 수 데이터를 기반으로 통계를 계산합니다.
 * @param tagInfos - 태그 정보 배열
 * @returns 통계 객체 (maxCount, minCount, avgCount, totalPosts)
 */
function calculateTagStatistics(tagInfos: Array<{ tag: string; count: number }>) {
  if (tagInfos.length === 0) {
    return {
      maxCount: 0,
      minCount: 0,
      avgCount: 0,
      totalPosts: 0
    }
  }

  const counts = tagInfos.map((info) => info.count)
  const maxCount = counts.reduce((max, current) => Math.max(max, current), 0)
  const minCount = counts.reduce((min, current) => Math.min(min, current), counts[0])
  const totalTags = tagInfos.length
  const totalPosts = counts.reduce((sum, count) => sum + count, 0)
  const avgCount = Math.round((totalPosts / totalTags) * 10) / 10 // 소수점 첫째 자리까지

  return {
    maxCount,
    minCount,
    avgCount,
    totalPosts
  }
}

export async function load() {
  const tagInfos = getAllTagsWithCounts()
  const statistics = calculateTagStatistics(tagInfos)

  return {
    tagInfos,
    totalTags: tagInfos.length,
    statistics,
    seo: {
      title: '모든 태그',
      description: `블로그의 모든 태그를 확인하세요. 총 ${tagInfos.length}개의 태그가 있습니다.`
    }
  }
}
