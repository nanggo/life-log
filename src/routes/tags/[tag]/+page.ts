import { getAllTagsWithCounts } from '$lib/data/posts'

export const prerender = true

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  const tagInfos = getAllTagsWithCounts()
  return tagInfos.map(({ tag }) => ({ tag }))
}
