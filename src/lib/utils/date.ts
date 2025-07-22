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
