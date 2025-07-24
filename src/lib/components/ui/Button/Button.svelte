<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'tag' | 'ghost' = 'primary'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let href: string | undefined = undefined
  export let type: 'button' | 'submit' | 'reset' = 'button'
  export let disabled: boolean = false

  let _class: string | undefined = undefined
  export { _class as class }

  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantClasses = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500',
    secondary:
      'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 focus:ring-zinc-500',
    tag: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
    ghost:
      'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs rounded-full',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg'
  }

  $: computedClass = [baseClasses, variantClasses[variant], sizeClasses[size], _class]
    .filter(Boolean)
    .join(' ')
</script>

{#if href}
  <a {href} class={computedClass} {...$$restProps}>
    <slot />
  </a>
{:else}
  <button {type} {disabled} class={computedClass} {...$$restProps}>
    <slot />
  </button>
{/if}
