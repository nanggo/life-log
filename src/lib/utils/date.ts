import { format } from 'date-fns'

/**
 * 주어진 날짜에 타임존 오프셋을 추가합니다.
 */
export const addTimezoneOffset = (date: Date): Date => {
  const offsetInMinutes = date.getTimezoneOffset()
  return new Date(date.getTime() + offsetInMinutes * 60 * 1000)
}

/**
 * 날짜가 유효한지 검사합니다.
 */
export const isValidDate = (date: Date | string | null | undefined): date is Date | string => {
  if (!date) return false

  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj instanceof Date && !isNaN(dateObj.valueOf())
}

/**
 * 날짜를 yyyy-MM-dd 형식의 문자열로 포맷팅합니다.
 */
export const formatDate = (date: Date | string | null | undefined): string | undefined => {
  if (!date) return undefined

  try {
    let dateObj: Date

    if (typeof date === 'string') {
      // ISO 8601 형식의 날짜 문자열 처리
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date detected: ${date}`)
      return format(new Date(), 'yyyy-MM-dd') // 현재 날짜로 대체
    }

    // 단순하게 포맷팅 (타임존 처리 제거)
    return format(dateObj, 'yyyy-MM-dd')
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error)
    return format(new Date(), 'yyyy-MM-dd') // 에러 발생시 현재 날짜 반환
  }
}
