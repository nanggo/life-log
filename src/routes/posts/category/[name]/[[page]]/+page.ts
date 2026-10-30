import { Category } from '#lib/types/blog.js'

export const prerender = true

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  return Object.values(Category).map((category) => ({ name: category }))
}
