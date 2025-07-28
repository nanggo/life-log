import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { addTimezoneOffset, isValidDate, formatDate } from './date'

describe('날짜 유틸리티 함수', () => {
  // 테스트 중 콘솔 스팸 방지를 위한 mock
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // 결정적 테스트를 위한 시간 고정
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-06-15T12:00:00.000Z'))
    // 타임존 오프셋을 고정 (KST: UTC+9, 즉 -540분)
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-540)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('addTimezoneOffset', () => {
    it('날짜에 타임존 오프셋을 추가해야 함', () => {
      const originalDate = new Date('2023-01-01T00:00:00.000Z')
      const offsetDate = addTimezoneOffset(originalDate)

      // KST(-540분) 타임존에서 예상되는 오프셋: -540 * 60 * 1000 = -32400000ms
      const expectedOffset = -540 * 60 * 1000
      expect(offsetDate.getTime() - originalDate.getTime()).toBe(expectedOffset)
    })

    it('다른 타임존을 처리해야 함', () => {
      const date = new Date('2023-06-01T12:00:00.000Z')
      const result = addTimezoneOffset(date)

      expect(result).toBeInstanceOf(Date)
      // KST 고정 타임존에서 결정적 테스트
      const expectedOffset = -540 * 60 * 1000
      expect(result.getTime() - date.getTime()).toBe(expectedOffset)
    })
  })

  describe('isValidDate', () => {
    it('falsy 값들에 대해 false를 반환해야 함', () => {
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
      expect(isValidDate('')).toBe(false)
    })

    it('유효한 Date 객체에 대해 true를 반환해야 함', () => {
      expect(isValidDate(new Date())).toBe(true)
      expect(isValidDate(new Date('2023-01-01'))).toBe(true)
      expect(isValidDate(new Date(2023, 0, 1))).toBe(true)
    })

    it('유효한 날짜 문자열에 대해 true를 반환해야 함', () => {
      expect(isValidDate('2023-01-01')).toBe(true)
      expect(isValidDate('2023-01-01T12:00:00Z')).toBe(true)
      expect(isValidDate('January 1, 2023')).toBe(true)
    })

    it('유효하지 않은 Date 객체에 대해 false를 반환해야 함', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate(new Date(NaN))).toBe(false)
    })

    it('유효하지 않은 날짜 문자열에 대해 false를 반환해야 함', () => {
      expect(isValidDate('invalid date')).toBe(false)
      expect(isValidDate('2023-13-01')).toBe(false) // 유효하지 않은 월
      expect(isValidDate('2023-01-32')).toBe(false) // 유효하지 않은 일
    })
  })

  describe('formatDate', () => {
    it('falsy 값들에 대해 undefined를 반환해야 함', () => {
      expect(formatDate(null)).toBeUndefined()
      expect(formatDate(undefined)).toBeUndefined()
      expect(formatDate('')).toBeUndefined()
    })

    it('유효한 Date 객체를 포맷팅해야 함', () => {
      const date = new Date('2023-01-15T12:00:00Z')
      const result = formatDate(date)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // KST 타임존에서 예측 가능한 결과 (UTC+9)
      expect(result).toBe('2023-01-15')
    })

    it('유효한 날짜 문자열을 포맷팅해야 함', () => {
      const result = formatDate('2023-01-15')

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // KST 타임존에서 예측 가능한 결과
      expect(result).toBe('2023-01-15')
    })

    it('유효하지 않은 날짜를 gracefully 처리해야 함', () => {
      const result = formatDate('invalid date')

      // 고정된 시간에서 예측 가능한 fallback 날짜
      expect(result).toBe('2023-06-15')
      expect(console.warn).toHaveBeenCalled()
    })

    it('Date 생성자 에러를 처리해야 함', () => {
      // 날짜 포맷팅에서 에러를 발생시킬 수 있는 시나리오 생성
      const invalidDate = new Date('2023-02-30') // JavaScript에서 자동으로 2023-03-02로 변환됨
      const result = formatDate(invalidDate)

      // 자동 변환된 날짜가 정상적으로 포맷팅됨
      expect(result).toBe('2023-03-02')
    })

    it('타임존 오프셋을 올바르게 추가해야 함', () => {
      // 알려진 날짜로 테스트하고 타임존 처리 확인
      const utcDate = new Date('2023-01-01T00:00:00.000Z')
      const result = formatDate(utcDate)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // date-fns format은 로컬 시간 기준으로 포맷팅
      expect(result).toBe('2023-01-01')
    })

    it('다양한 날짜 문자열 형식을 처리해야 함', () => {
      const formats = [
        '2023-01-01',
        '2023/01/01',
        'January 1, 2023',
        '2023-01-01T12:00:00Z',
        '2023-01-01T12:00:00.000Z'
      ]

      formats.forEach((dateStr) => {
        const result = formatDate(dateStr)
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })
  })
})
