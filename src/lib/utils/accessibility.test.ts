import { describe, it, expect, vi, afterEach } from 'vitest'

import {
  MIN_TOUCH_TARGET_SIZE,
  generateAccessibleButtonClasses,
  generateAccessibleLinkClasses,
  createSkipLink,
  checkColorContrast,
  generateARIAAttributes,
  validateTouchTargetSize,
  createKeyboardHandler,
  announceToScreenReader,
  TouchInteractionManager
} from './accessibility'

describe('MIN_TOUCH_TARGET_SIZE', () => {
  it('is 44px', () => {
    expect(MIN_TOUCH_TARGET_SIZE).toBe(44)
  })
})

describe('generateAccessibleButtonClasses', () => {
  it('returns classes with default params', () => {
    const classes = generateAccessibleButtonClasses()
    expect(classes).toContain('min-h-[44px]')
    expect(classes).toContain('focus:ring-2')
    expect(classes).toContain('bg-teal-600')
    expect(classes).toContain('px-4')
  })

  it('returns sm size classes', () => {
    const classes = generateAccessibleButtonClasses('sm')
    expect(classes).toContain('px-3')
    expect(classes).toContain('text-sm')
  })

  it('returns lg size classes', () => {
    const classes = generateAccessibleButtonClasses('lg')
    expect(classes).toContain('px-6')
    expect(classes).toContain('text-base')
  })

  it('returns secondary variant classes', () => {
    const classes = generateAccessibleButtonClasses('md', 'secondary')
    expect(classes).toContain('bg-zinc-100')
  })

  it('returns ghost variant classes', () => {
    const classes = generateAccessibleButtonClasses('md', 'ghost')
    expect(classes).toContain('text-zinc-700')
  })
})

describe('generateAccessibleLinkClasses', () => {
  it('returns default variant classes', () => {
    const classes = generateAccessibleLinkClasses()
    expect(classes).toContain('text-teal-600')
    expect(classes).toContain('focus:ring-2')
  })

  it('returns button variant classes', () => {
    const classes = generateAccessibleLinkClasses('button')
    expect(classes).toContain('min-h-[44px]')
  })

  it('returns nav variant classes', () => {
    const classes = generateAccessibleLinkClasses('nav')
    expect(classes).toContain('block')
    expect(classes).toContain('transition-colors')
  })
})

describe('createSkipLink', () => {
  it('returns skip link HTML with correct href', () => {
    const html = createSkipLink()
    expect(html).toContain('href="#main-content"')
    expect(html).toContain('Skip to main content')
    expect(html).toContain('sr-only')
  })
})

describe('checkColorContrast', () => {
  it('returns true for black on white (high contrast)', () => {
    expect(checkColorContrast('#000000', '#ffffff')).toBe(true)
  })

  it('returns false for similar colors (low contrast)', () => {
    expect(checkColorContrast('#777777', '#888888')).toBe(false)
  })

  it('handles dark text on light background', () => {
    expect(checkColorContrast('#333333', '#ffffff')).toBe(true)
  })
})

describe('generateARIAAttributes', () => {
  it('returns empty object with no state', () => {
    const attrs = generateARIAAttributes('button')
    expect(attrs).toEqual({})
  })

  it('includes aria-expanded', () => {
    const attrs = generateARIAAttributes('button', { expanded: true })
    expect(attrs['aria-expanded']).toBe(true)
  })

  it('includes aria-selected', () => {
    const attrs = generateARIAAttributes('tab', { selected: false })
    expect(attrs['aria-selected']).toBe(false)
  })

  it('includes aria-current', () => {
    const attrs = generateARIAAttributes('link', { current: 'page' })
    expect(attrs['aria-current']).toBe('page')
  })

  it('includes aria-describedby', () => {
    const attrs = generateARIAAttributes('button', { describedBy: 'desc-1' })
    expect(attrs['aria-describedby']).toBe('desc-1')
  })

  it('includes aria-labelledby', () => {
    const attrs = generateARIAAttributes('button', { labelledBy: 'label-1' })
    expect(attrs['aria-labelledby']).toBe('label-1')
  })

  it('includes aria-label', () => {
    const attrs = generateARIAAttributes('button', { label: 'Close' })
    expect(attrs['aria-label']).toBe('Close')
  })

  it('includes all specified attributes', () => {
    const attrs = generateARIAAttributes('button', {
      expanded: true,
      label: 'Menu',
      describedBy: 'help'
    })
    expect(attrs['aria-expanded']).toBe(true)
    expect(attrs['aria-label']).toBe('Menu')
    expect(attrs['aria-describedby']).toBe('help')
  })
})

describe('validateTouchTargetSize', () => {
  it('returns true for elements meeting minimum size', () => {
    const el = document.createElement('div')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 44,
      height: 44,
      top: 0,
      left: 0,
      bottom: 44,
      right: 44,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
    expect(validateTouchTargetSize(el)).toBe(true)
  })

  it('returns false for elements below minimum size', () => {
    const el = document.createElement('div')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 30,
      height: 30,
      top: 0,
      left: 0,
      bottom: 30,
      right: 30,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
    expect(validateTouchTargetSize(el)).toBe(false)
  })
})

describe('createKeyboardHandler', () => {
  it('calls onEnter for Enter key', () => {
    const onEnter = vi.fn()
    const handler = createKeyboardHandler(onEnter)

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    vi.spyOn(event, 'preventDefault')
    handler(event)

    expect(onEnter).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('calls onEnter for Space key', () => {
    const onEnter = vi.fn()
    const handler = createKeyboardHandler(onEnter)

    const event = new KeyboardEvent('keydown', { key: ' ' })
    vi.spyOn(event, 'preventDefault')
    handler(event)

    expect(onEnter).toHaveBeenCalledOnce()
  })

  it('calls onEscape for Escape key', () => {
    const onEnter = vi.fn()
    const onEscape = vi.fn()
    const handler = createKeyboardHandler(onEnter, onEscape)

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    vi.spyOn(event, 'preventDefault')
    handler(event)

    expect(onEscape).toHaveBeenCalledOnce()
    expect(onEnter).not.toHaveBeenCalled()
  })

  it('does nothing for Escape if no handler provided', () => {
    const onEnter = vi.fn()
    const handler = createKeyboardHandler(onEnter)

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    handler(event)

    expect(onEnter).not.toHaveBeenCalled()
  })

  it('ignores other keys', () => {
    const onEnter = vi.fn()
    const handler = createKeyboardHandler(onEnter)

    handler(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(onEnter).not.toHaveBeenCalled()
  })
})

describe('announceToScreenReader', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates and appends announcement element', () => {
    vi.useFakeTimers()
    announceToScreenReader('Test message')

    const announcement = document.querySelector('[aria-live="polite"]')
    expect(announcement).not.toBeNull()
    expect(announcement?.textContent).toBe('Test message')

    vi.advanceTimersByTime(1001)
    // Element should be removed after timeout
    expect(announcement?.parentNode).toBeNull()
  })

  it('supports assertive priority', () => {
    vi.useFakeTimers()
    announceToScreenReader('Urgent', 'assertive')

    const announcement = document.querySelector('[aria-live="assertive"]')
    expect(announcement).not.toBeNull()

    vi.advanceTimersByTime(1001)
  })
})

describe('TouchInteractionManager', () => {
  it('detects quick tap', () => {
    const manager = new TouchInteractionManager()
    const onTap = vi.fn()

    // Simulate touch start
    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }]
    } as unknown as TouchEvent

    manager.onTouchStart(startEvent)

    // Simulate touch end at same position, short duration
    const endEvent = {
      changedTouches: [{ clientX: 100, clientY: 100 }],
      preventDefault: vi.fn()
    } as unknown as TouchEvent

    // Need to mock Date.now for timing
    const now = Date.now()
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + 100)

    manager.onTouchStart(startEvent)
    manager.onTouchEnd(endEvent, onTap)

    expect(onTap).toHaveBeenCalledOnce()
  })

  it('detects long press', () => {
    const manager = new TouchInteractionManager()
    const onTap = vi.fn()
    const onLongPress = vi.fn()

    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(1600) // end time (600ms later)

    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }]
    } as unknown as TouchEvent

    manager.onTouchStart(startEvent)

    const endEvent = {
      changedTouches: [{ clientX: 100, clientY: 100 }],
      preventDefault: vi.fn()
    } as unknown as TouchEvent

    manager.onTouchEnd(endEvent, onTap, onLongPress)

    expect(onLongPress).toHaveBeenCalledOnce()
    expect(onTap).not.toHaveBeenCalled()
  })

  it('ignores gesture if moved too far (scroll)', () => {
    const manager = new TouchInteractionManager()
    const onTap = vi.fn()

    vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1100)

    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }]
    } as unknown as TouchEvent

    manager.onTouchStart(startEvent)

    const endEvent = {
      changedTouches: [{ clientX: 200, clientY: 200 }],
      preventDefault: vi.fn()
    } as unknown as TouchEvent

    manager.onTouchEnd(endEvent, onTap)

    expect(onTap).not.toHaveBeenCalled()
  })
})
