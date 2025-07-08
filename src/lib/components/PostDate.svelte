<script>
  import { format, parseISO, isValid } from 'date-fns'

  export let decorate
  export let post
  export let collapsed = false

  let _class
  export { _class as class }

  // 견고한 날짜 파싱 함수
  function parseDate(dateString) {
    if (!dateString) return new Date()
    
    // 먼저 ISO 8601 형식 시도
    try {
      const isoDate = parseISO(dateString)
      if (isValid(isoDate)) {
        return isoDate
      }
    } catch (error) {
      // ISO 파싱 실패시 무시하고 계속
    }
    
    // 일반 Date 생성자 사용
    const date = new Date(dateString)
    return isValid(date) ? date : new Date()
  }
</script>

<div
  class={['relative z-10 order-first mb-3 flex text-zinc-500 dark:text-zinc-400', _class].join(' ')}
  class:pl-3.5={decorate}
>
  {#if decorate}
    <span class="absolute inset-y-0 left-0 flex items-center py-1" aria-hidden="true">
      <span class="h-full w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500"></span>
    </span>
  {/if}
  <div class="flex" class:flex-col={!collapsed}>
    <time datetime={post.date}>
      {format(parseDate(post.date), 'MMMM d, yyyy')}
    </time>
    {#if collapsed}
      <span class="mx-1">•</span>
    {/if}
    <span>{post.readingTime}</span>
  </div>
</div>
