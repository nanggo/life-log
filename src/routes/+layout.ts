import { name } from '$lib/info'
import type { LayoutLoad } from './$types'

export const prerender = true

export const load: LayoutLoad = ({ url }) => {
  return {
    title: name,
    url: url.pathname
  }
}
