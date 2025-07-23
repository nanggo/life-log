<script lang="ts">
  import ArrowLeftIcon from './ArrowLeftIcon.svelte'
  import ArrowRightIcon from './ArrowRightIcon.svelte'

  export let currentPage: number
  export let totalPages: number
  export let getPageUrl: (_page: number) => string
</script>

<div class="flex items-center justify-between pt-16 pb-8">
  {#if currentPage > 1}
    <a
      href={getPageUrl(currentPage - 1)}
      class="flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      Previous
    </a>
  {:else}
    <div></div>
  {/if}

  <!-- 페이지 번호 표시 -->
  <div class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
    <span>Page {currentPage} of {totalPages}</span>
  </div>

  {#if currentPage < totalPages}
    <a
      href={getPageUrl(currentPage + 1)}
      class="flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
    >
      Next
      <ArrowRightIcon class="w-4 h-4" />
    </a>
  {:else}
    <div></div>
  {/if}
</div>
