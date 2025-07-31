import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

import { getPostsByTag, getAllTagsWithCounts } from '$lib/data/posts'
import { extractPostMetadata } from '$lib/util'

export const prerender = false // Dynamic route requires SSR

export const load: PageServerLoad = async ({ params }) => {
  const tagName = decodeURIComponent(params.tag)

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

  return {
    tagName,
    posts: tagPostsMetadata,
    postCount,
    seo: {
      title: `${tagName} 태그`,
      description: `'${tagName}' 태그가 포함된 ${postCount}개의 포스트를 확인하세요.`
    }
  }
}
