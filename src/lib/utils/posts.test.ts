import { describe, it, expect } from 'vitest'

import { normalizeSlug, createSafeSlug, compareSlug } from './posts'

describe('포스트 유틸리티 함수', () => {
  describe('normalizeSlug', () => {
    it('빈 값이나 null/undefined에 대해 빈 문자열을 반환해야 함', () => {
      expect(normalizeSlug('')).toBe('')
      expect(normalizeSlug(null as any)).toBe('')
      expect(normalizeSlug(undefined as any)).toBe('')
    })

    it('대문자를 소문자로 변환해야 함', () => {
      expect(normalizeSlug('HELLO')).toBe('hello')
      expect(normalizeSlug('Hello World')).toBe('hello_world')
    })

    it('하이픈을 언더스코어로 변환해야 함', () => {
      expect(normalizeSlug('hello-world')).toBe('hello_world')
      expect(normalizeSlug('my-awesome-post')).toBe('my_awesome_post')
    })

    it('공백을 언더스코어로 변환해야 함', () => {
      expect(normalizeSlug('hello world')).toBe('hello_world')
      expect(normalizeSlug('multiple   spaces')).toBe('multiple_spaces')
      expect(normalizeSlug('  leading and trailing  ')).toBe('leading_and_trailing') // trim() 추가로 앞뒤 공백 제거
    })

    it('유니코드를 정규화하고 발음기호를 제거해야 함', () => {
      expect(normalizeSlug('café')).toBe('cafe')
      expect(normalizeSlug('naïve')).toBe('naive')
      expect(normalizeSlug('résumé')).toBe('resume')
      // 한글은 NFD 정규화됨
      const koreanResult = normalizeSlug('한글')
      expect(koreanResult).toBeTruthy()
      expect(koreanResult.length).toBeGreaterThan(2) // NFD 정규화로 한글 문자가 확장됨
    })

    it('복잡한 케이스를 올바르게 처리해야 함', () => {
      expect(normalizeSlug('Hello-World Café')).toBe('hello_world_cafe')
      expect(normalizeSlug('My Awesome Post - Part 1')).toBe('my_awesome_post_part_1') // 개선된 정규식으로 연속된 구분자가 하나로 처리됨
    })
  })

  describe('createSafeSlug', () => {
    it('빈 값이나 null/undefined에 대해 빈 문자열을 반환해야 함', () => {
      expect(createSafeSlug('')).toBe('')
      expect(createSafeSlug(null as any)).toBe('')
      expect(createSafeSlug(undefined as any)).toBe('')
    })

    it('공백을 제거하고 소문자로 변환해야 함', () => {
      expect(createSafeSlug('  Hello World  ')).toBe('hello-world')
      expect(createSafeSlug('HELLO')).toBe('hello')
    })

    it('공백을 하이픈으로 변환하고 인코딩해야 함', () => {
      expect(createSafeSlug('hello world')).toBe('hello-world')
      expect(createSafeSlug('multiple   spaces')).toBe('multiple-spaces') // \s+ 정규식이 여러 공백을 하나의 하이픈으로 변환
    })

    it('특수문자를 URL 인코딩해야 함', () => {
      expect(createSafeSlug('hello@world')).toBe('hello%40world')
      expect(createSafeSlug('path/to/file')).toBe('path%2Fto%2Ffile')
      expect(createSafeSlug('query?param=value')).toBe('query%3Fparam%3Dvalue')
    })

    it('유니코드 문자를 처리해야 함', () => {
      expect(createSafeSlug('café')).toBe('caf%C3%A9')
      expect(createSafeSlug('한글')).toBe('%ED%95%9C%EA%B8%80')
    })
  })

  describe('compareSlug', () => {
    it('동일하게 정규화된 slug에 대해 true를 반환해야 함', () => {
      expect(compareSlug('hello', 'hello')).toBe(true)
      expect(compareSlug('hello-world', 'hello_world')).toBe(true)
      expect(compareSlug('HELLO', 'hello')).toBe(true)
    })

    it('다른 slug에 대해 false를 반환해야 함', () => {
      expect(compareSlug('hello', 'world')).toBe(false)
      expect(compareSlug('hello-world', 'hello_earth')).toBe(false)
    })

    it('공백과 하이픈을 동등하게 처리해야 함', () => {
      expect(compareSlug('hello world', 'hello-world')).toBe(true)
      expect(compareSlug('hello world', 'hello_world')).toBe(true)
      expect(compareSlug('hello-world', 'hello_world')).toBe(true)
    })

    it('대소문자를 구분하지 않아야 함', () => {
      expect(compareSlug('Hello World', 'hello-world')).toBe(true)
      expect(compareSlug('HELLO-WORLD', 'hello_world')).toBe(true)
    })

    it('유니코드 정규화를 처리해야 함', () => {
      expect(compareSlug('café', 'cafe')).toBe(true)
      expect(compareSlug('naïve', 'naive')).toBe(true)
    })

    it('빈 값과 falsy 값들을 처리해야 함', () => {
      expect(compareSlug('', '')).toBe(true)
      expect(compareSlug('hello', '')).toBe(false)
      expect(compareSlug('', 'hello')).toBe(false)
      expect(compareSlug(null as any, null as any)).toBe(true)
      expect(compareSlug(undefined as any, undefined as any)).toBe(true)
    })
  })
})
