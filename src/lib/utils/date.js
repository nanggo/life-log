import { format } from 'date-fns'

/**
 * 주어진 날짜에 타임존 오프셋을 추가합니다.
 * @param {Date} date - 변환할 날짜
 * @returns {Date} 타임존이 조정된 날짜
 */
export const addTimezoneOffset = (date) => {
  const offsetInMinutes = date.getTimezoneOffset()
  return new Date(date.getTime() + offsetInMinutes * 60 * 1000)
}

/**
 * 날짜를 yyyy-MM-dd 형식의 문자열로 포맷팅합니다.
 * @param {Date | string} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (date) => {
  if (!date) return undefined
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(addTimezoneOffset(dateObj), 'yyyy-MM-dd')
}
