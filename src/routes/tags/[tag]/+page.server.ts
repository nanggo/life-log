import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

import { getPostsByTag, getAllTagsWithCounts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'
import { isTagIndexable } from '$lib/utils/seo'

export const prerender = true

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  const tagInfos = getAllTagsWithCounts()
  return tagInfos.map(({ tag }) => ({ tag }))
}

export const load: PageServerLoad = async ({ params }) => {
  const tagName = params.tag

  // Validate tag exists
  const allTagInfos = getAllTagsWithCounts()
  const tagExists = allTagInfos.some((info) => info.tag === tagName)

  if (!tagExists) {
    throw error(404, `태그 '${tagName}'을 찾을 수 없습니다.`)
  }

  // Get posts for this tag
  const tagPosts = getPostsByTag(tagName)
  const tagPostsMetadata = extractPostMetadata(tagPosts)

  // Get tag info for count
  const tagInfo = allTagInfos.find((info) => info.tag === tagName)
  const postCount = tagInfo?.count || 0
  const indexable = isTagIndexable(postCount)

  return {
    tagName,
    posts: tagPostsMetadata,
    postCount,
    seo: {
      title: `${tagName} 태그`,
      description: `NANGGO's LIFELOG에서 '${tagName}' 태그로 분류된 ${postCount}개의 글을 모았습니다. 관련 개발 경험과 생각, 실무 기록을 살펴보세요.`,
      indexable,
      robots: `${indexable ? 'index' : 'noindex'}, follow, max-image-preview:large`
    }
  }
}
