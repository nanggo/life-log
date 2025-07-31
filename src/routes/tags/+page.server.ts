import { getAllTagsWithCounts } from '$lib/data/posts'

export async function load() {
  const tagInfos = getAllTagsWithCounts()

  return {
    tagInfos,
    totalTags: tagInfos.length,
    seo: {
      title: '모든 태그',
      description: `블로그의 모든 태그를 확인하세요. 총 ${tagInfos.length}개의 태그가 있습니다.`
    }
  }
}
