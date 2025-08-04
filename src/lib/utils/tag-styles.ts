/**
 * 태그 스타일링을 위한 유틸리티 함수들
 */

export const TAG_STYLES = {
  base: 'flex-shrink-0 flex items-center px-3 py-2 min-h-11 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap touch-manipulation leading-relaxed',
  selected: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100',
  unselected:
    'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600',
  clickable:
    'cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1',
  nonClickable: 'cursor-default'
} as const

/**
 * 태그의 CSS 클래스를 생성합니다
 * @param tag - 태그 이름
 * @param selectedTag - 현재 선택된 태그
 * @param clickable - 클릭 가능 여부
 * @returns 생성된 CSS 클래스 문자열
 */
export function generateTagClasses(
  tag: string,
  selectedTag: string | null,
  clickable: boolean
): string {
  const colorClass = selectedTag === tag ? TAG_STYLES.selected : TAG_STYLES.unselected
  const cursorClass = clickable ? TAG_STYLES.clickable : TAG_STYLES.nonClickable
  return `${TAG_STYLES.base} ${colorClass} ${cursorClass}`
}
