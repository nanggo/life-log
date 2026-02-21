import { describe, it, expect } from 'vitest'

import { TAG_STYLES, generateTagClasses } from './tag-styles'

describe('TAG_STYLES', () => {
  it('has expected style keys', () => {
    expect(TAG_STYLES.base).toBeDefined()
    expect(TAG_STYLES.selected).toBeDefined()
    expect(TAG_STYLES.unselected).toBeDefined()
    expect(TAG_STYLES.clickable).toBeDefined()
    expect(TAG_STYLES.nonClickable).toBeDefined()
  })
})

describe('generateTagClasses', () => {
  it('returns selected + clickable classes for selected tag', () => {
    const classes = generateTagClasses('svelte', 'svelte', true)
    expect(classes).toContain(TAG_STYLES.base)
    expect(classes).toContain(TAG_STYLES.selected)
    expect(classes).toContain(TAG_STYLES.clickable)
  })

  it('returns unselected + clickable classes for non-selected tag', () => {
    const classes = generateTagClasses('react', 'svelte', true)
    expect(classes).toContain(TAG_STYLES.unselected)
    expect(classes).toContain(TAG_STYLES.clickable)
  })

  it('returns non-clickable class when not clickable', () => {
    const classes = generateTagClasses('svelte', null, false)
    expect(classes).toContain(TAG_STYLES.nonClickable)
    expect(classes).not.toContain(TAG_STYLES.clickable)
  })

  it('returns unselected when selectedTag is null', () => {
    const classes = generateTagClasses('svelte', null, true)
    expect(classes).toContain(TAG_STYLES.unselected)
  })
})
