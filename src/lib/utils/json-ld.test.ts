import { describe, it, expect } from 'vitest'

import { toJsonLdString, jsonLdScript } from './json-ld'

describe('toJsonLdString', () => {
  it('escapes < to prevent script injection', () => {
    const result = toJsonLdString('<script>alert("xss")</script>')
    expect(result).not.toContain('<')
    expect(result).toContain('\\u003c')
  })

  it('serializes objects to JSON', () => {
    const result = toJsonLdString({ name: 'Test' })
    expect(result).toContain('"name"')
    expect(result).toContain('"Test"')
  })

  it('serializes null to "null"', () => {
    expect(toJsonLdString(null)).toBe('null')
  })

  it('returns empty string for undefined', () => {
    expect(toJsonLdString(undefined)).toBe('')
  })

  it('handles strings directly', () => {
    const result = toJsonLdString('hello')
    expect(result).toBe('hello')
  })
})

describe('jsonLdScript', () => {
  it('wraps value in script tag', () => {
    const result = jsonLdScript({ '@type': 'Article' })
    expect(result).toContain('<script type="application/ld+json">')
    expect(result).toContain('</script>')
    expect(result).toContain('"@type"')
  })

  it('escapes < in content', () => {
    const result = jsonLdScript({ text: '<b>bold</b>' })
    expect(result).not.toContain('<b>')
    expect(result).toContain('\\u003c')
  })
})
