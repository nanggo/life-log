<script>
  import ArrowLeftIcon from './ArrowLeftIcon.svelte'
  import ArrowRightIcon from './ArrowRightIcon.svelte'

  /** @type {number} */
  export let currentPage
  /** @type {boolean} */
  export let hasNextPage
  /** @type {number} */
  export let totalPages = 1
  /** @type {function} */
  export let onPageChange = () => {}

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1)
    }
  }
</script>

<div class="flex items-center justify-between pt-16 pb-8">
  {#if currentPage > 1}
    <button
      on:click={handlePrevious}
      class="flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      Previous
    </button>
  {:else}
    <div></div>
  {/if}

  <!-- 페이지 번호 표시 -->
  <div class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
    <span>Page {currentPage} of {totalPages}</span>
  </div>

  {#if hasNextPage}
    <button
      on:click={handleNext}
      class="flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
    >
      Next
      <ArrowRightIcon class="w-4 h-4" />
    </button>
  {:else}
    <div></div>
  {/if}
</div>
