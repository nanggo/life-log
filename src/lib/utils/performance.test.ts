import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  debounce,
  throttle,
  memoize,
  batchDOMOperations,
  PerformanceTimer,
  createOptimizedIntersectionObserver,
  optimizedScrollHandler,
  logMemoryUsage
} from './performance'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('passes arguments to the original function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('a', 'b')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('a', 'b')
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('executes immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledOnce()
  })

  it('blocks subsequent calls within delay', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledOnce()
  })

  it('allows calls after delay', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('passes arguments to the original function', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('x', 'y')
    expect(fn).toHaveBeenCalledWith('x', 'y')
  })
})

describe('memoize', () => {
  it('caches results for same arguments', () => {
    const fn = vi.fn((x: unknown) => (x as number) * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(5)).toBe(10)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('computes for different arguments', () => {
    const fn = vi.fn((x: unknown) => (x as number) * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(3)).toBe(6)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('supports custom key function', () => {
    const fn = vi.fn((...args: unknown[]) => {
      const obj = args[0] as { id: number; name: string }
      return obj.name
    })
    const memoized = memoize(fn, (...args: unknown[]) => {
      const obj = args[0] as { id: number }
      return String(obj.id)
    })

    memoized({ id: 1, name: 'a' })
    memoized({ id: 1, name: 'a' })
    expect(fn).toHaveBeenCalledOnce()
  })

  it('evicts oldest entry when cache exceeds 100', () => {
    const fn = vi.fn((x: unknown) => x)
    const memoized = memoize(fn)

    for (let i = 0; i < 102; i++) {
      memoized(i)
    }

    // First entry should have been evicted
    memoized(0)
    // fn should be called again for 0 since it was evicted
    expect(fn).toHaveBeenCalledTimes(103)
  })
})

describe('batchDOMOperations', () => {
  it('executes all operations via requestAnimationFrame', () => {
    const op1 = vi.fn()
    const op2 = vi.fn()
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })

    batchDOMOperations([op1, op2])
    expect(op1).toHaveBeenCalledOnce()
    expect(op2).toHaveBeenCalledOnce()

    rafSpy.mockRestore()
  })
})

describe('PerformanceTimer', () => {
  it('measures duration between start and end', () => {
    const timer = new PerformanceTimer()
    timer.start('test')
    const duration = timer.end('test')
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('returns 0 for non-existent label', () => {
    const timer = new PerformanceTimer()
    expect(timer.end('nonexistent')).toBe(0)
  })

  it('removes mark after end', () => {
    const timer = new PerformanceTimer()
    timer.start('test')
    timer.end('test')
    expect(timer.end('test')).toBe(0)
  })
})

describe('createOptimizedIntersectionObserver', () => {
  it('returns an observer object', () => {
    const cb = vi.fn()
    const observer = createOptimizedIntersectionObserver(cb)
    expect(observer).not.toBeNull()
    expect(observer).toHaveProperty('observe')
    expect(observer).toHaveProperty('disconnect')
  })

  it('applies default options', () => {
    const cb = vi.fn()
    const observer = createOptimizedIntersectionObserver(cb)
    expect(observer).not.toBeNull()
  })

  it('merges custom options', () => {
    const cb = vi.fn()
    const observer = createOptimizedIntersectionObserver(cb, { rootMargin: '100px' })
    expect(observer).not.toBeNull()
  })
})

describe('optimizedScrollHandler', () => {
  it('returns cleanup function', () => {
    const cb = vi.fn()
    const cleanup = optimizedScrollHandler(cb)
    expect(typeof cleanup).toBe('function')
    cleanup()
  })
})

describe('logMemoryUsage', () => {
  it('does not throw', () => {
    expect(() => logMemoryUsage('test')).not.toThrow()
  })
})
