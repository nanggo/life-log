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
 * 날짜가 유효한지 검사합니다.
 * @param {Date | string} date - 검사할 날짜
 * @returns {boolean} 날짜가 유효하면 true, 그렇지 않으면 false
 */
export const isValidDate = (date) => {
  if (!date) return false

  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj instanceof Date && !isNaN(dateObj.valueOf())
}

/**
 * 날짜를 yyyy-MM-dd 형식의 문자열로 포맷팅합니다.
 * @param {Date | string} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (date) => {
  if (!date) return undefined

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // 유효한 날짜인지 확인
    if (!isValidDate(dateObj)) {
      console.warn(`Invalid date detected: ${date}`)
      return format(new Date(), 'yyyy-MM-dd') // 현재 날짜로 대체
    }

    return format(addTimezoneOffset(dateObj), 'yyyy-MM-dd')
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error)
    return format(new Date(), 'yyyy-MM-dd') // 에러 발생시 현재 날짜 반환
  }
}
