<script lang="ts">
  export let items: Array<{ label: string; href?: string; current?: boolean }> = []

  // Automatically mark the last item as current if not explicitly set
  $: processedItems = items.map((item, index) => ({
    ...item,
    current: item.current !== undefined ? item.current : index === items.length - 1
  }))
</script>

<nav aria-label="Breadcrumb">
  <ol class="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
    {#each processedItems as item, index}
      <li class="flex items-center">
        {#if index > 0}
          <!-- Separator -->
          <svg
            class="w-4 h-4 mx-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        {/if}

        {#if item.current || !item.href}
          <!-- Current page or non-linked item -->
          <span
            class="text-zinc-900 dark:text-zinc-100 font-medium"
            aria-current={item.current ? 'page' : undefined}
          >
            {item.label}
          </span>
        {:else}
          <!-- Linked item -->
          <a
            href={item.href}
            class="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 rounded-sm"
            aria-label={`Go to ${item.label}`}
          >
            {item.label}
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  /* Responsive text size for mobile */
  @media (max-width: 640px) {
    nav ol {
      font-size: 0.875rem; /* text-sm */
    }
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    nav ol {
      font-size: 0.75rem; /* text-xs */
    }

    /* Smaller separators on mobile */
    nav svg {
      width: 0.875rem; /* w-3.5 */
      height: 0.875rem; /* h-3.5 */
    }
  }
</style>
