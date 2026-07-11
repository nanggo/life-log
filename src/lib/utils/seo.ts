export const MIN_INDEXABLE_TAG_POSTS = 2

export function isTagIndexable(postCount: number): boolean {
  return Number.isInteger(postCount) && postCount >= MIN_INDEXABLE_TAG_POSTS
}
