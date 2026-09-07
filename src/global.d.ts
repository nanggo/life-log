/// <reference types="@sveltejs/kit" />

declare module 'virtual:post-loaders' {
  const loaders: Record<string, () => Promise<{ default: import('svelte').Component }>>
  export default loaders
}
