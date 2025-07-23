import type { LayoutLoad } from './$types'

import { name } from '$lib/info'

export const prerender = true

export const load: LayoutLoad = ({ url }) => {
  return {
    title: name,
    url: url.pathname
  }
}
