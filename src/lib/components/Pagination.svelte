<script>
  import ArrowLeftIcon from './ArrowLeftIcon.svelte'
  import ArrowRightIcon from './ArrowRightIcon.svelte'

  /** @type {number} */
  export let currentPage
  /** @type {boolean} */
  export let hasNextPage
  /** @type {string} */
  export let basePath = '/posts'
  /** @type {string|null} */
  export let tagFilter = null

  $: queryParams = tagFilter ? `?tag=${tagFilter}` : ''
  $: prevPageUrl = `${basePath}/${currentPage - 1}${queryParams}`
  $: nextPageUrl = `${basePath}/${currentPage + 1}${queryParams}`
</script>

<div class="flex items-center justify-between pt-16 pb-8">
  {#if currentPage > 1}
    <a
      href={prevPageUrl}
      data-sveltekit-prefetch
      class="flex items-center gap-1 text-sm font-medium text-teal-500"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      Previous
    </a>
  {:else}
    <div></div>
  {/if}

  {#if hasNextPage}
    <a
      href={nextPageUrl}
      data-sveltekit-prefetch
      class="flex items-center gap-1 text-sm font-medium text-teal-500"
    >
      Next
      <ArrowRightIcon class="w-4 h-4" />
    </a>
  {/if}
</div>
