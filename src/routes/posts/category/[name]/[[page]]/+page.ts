import { Category } from '$lib/types/blog'

export const prerender = true

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  return Object.values(Category).map((category) => ({ name: category }))
}
