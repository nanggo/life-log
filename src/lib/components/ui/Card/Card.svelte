<script lang="ts">
  export let as: string = 'div'
  export let href: string | undefined = undefined

  let _class: string | undefined = undefined
  export { _class as class }
</script>

<svelte:element
  this={as}
  class={['relative flex flex-col items-start group', _class].join(' ')}
  {...$$restProps}
>
  <slot name="eyebrow" />

  {#if $$slots.title}
    <div class="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
      {#if href}
        <div
          class="absolute z-0 transition scale-95 opacity-0 -inset-y-6 -inset-x-4 bg-zinc-50 group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl"
        ></div>

        <a {href} data-sveltekit-prefetch>
          <span class="absolute z-20 -inset-y-6 -inset-x-4 sm:-inset-x-6 sm:rounded-2xl"></span>
          <span class="relative z-10">
            <slot name="title" />
          </span>
        </a>
      {:else}
        <slot name="title" />
      {/if}
    </div>
  {/if}

  {#if $$slots.description}
    <div
      class="relative z-10 flex-1 text-sm text-zinc-600 dark:text-zinc-400"
      class:mt-2={!!$$slots.title}
    >
      <slot name="description" />
    </div>
  {/if}

  {#if $$slots.actions}
    <div aria-hidden="true" class="relative z-10 flex items-center mt-4">
      <slot name="actions" />
    </div>
  {/if}
</svelte:element>
