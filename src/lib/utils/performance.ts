/**
 * Performance optimization utilities for client-side operations
 */

/**
 * Creates a debounced version of a function
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Creates a throttled version of a function
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * Simple memoization utility for expensive computations
 * @param func - Function to memoize
 * @param getKey - Function to generate cache key from arguments
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = func(...args)
    cache.set(key, result)
    
    // Prevent cache from growing too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }) as T
}

/**
 * Efficiently batches DOM operations to prevent layout thrashing
 * @param operations - Array of DOM operations to batch
 */
export function batchDOMOperations(operations: (() => void)[]): void {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    window.requestAnimationFrame(() => {
      operations.forEach(op => op())
    })
  } else {
    // Fallback for environments without RAF
    operations.forEach(op => op())
  }
}

/**
 * Optimized scroll event handler with automatic throttling
 * @param callback - Scroll callback function
 * @param delay - Throttle delay (default: 16ms for 60fps)
 * @returns Cleanup function
 */
export function optimizedScrollHandler(
  callback: (event: Event) => void,
  delay: number = 16
): () => void {
  const throttledCallback = throttle(callback, delay)
  
  const handleScroll = (event: Event) => {
    // Use passive listeners for better performance
    throttledCallback(event)
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }
  
  return () => {} // No-op cleanup for SSR
}

/**
 * Memory usage monitoring (development only)
 */
export function logMemoryUsage(label: string): void {
  if (typeof window !== 'undefined' && 'performance' in window && window.performance.memory) {
    const memory = window.performance.memory
    console.debug(`[${label}] Memory usage:`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    })
  }
}

/**
 * Performance timing measurement utility
 */
export class PerformanceTimer {
  private marks: Map<string, number> = new Map()
  
  start(label: string): void {
    if (typeof performance !== 'undefined') {
      this.marks.set(label, performance.now())
    }
  }
  
  end(label: string): number {
    if (typeof performance !== 'undefined' && this.marks.has(label)) {
      const startTime = this.marks.get(label)!
      const duration = performance.now() - startTime
      console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
      this.marks.delete(label)
      return duration
    }
    return 0
  }
}

/**
 * Intersection Observer utility for lazy loading optimization
 * @param callback - Function to call when elements intersect
 * @param options - Intersection observer options
 * @returns Observer instance
 */
export function createOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}