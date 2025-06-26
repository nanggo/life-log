import { name } from '$lib/info'

export const prerender = true

export const load = ({ url }) => {
  return {
    title: name,
    url: url.pathname
  }
}