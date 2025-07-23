// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  interface Window {
    openImageModal: (src: string, alt: string) => void
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

declare module '*.svelte' {
  import type { SvelteComponent } from 'svelte'

  const component: typeof SvelteComponent
  export default component
}

export {}
