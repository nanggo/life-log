/**
 * Analytics integration for performance monitoring
 *
 * Provides centralized analytics tracking for:
 * - Performance metrics
 * - User behavior patterns
 * - A/B test results
 * - Core Web Vitals
 */

import { browser } from '$app/environment'

declare global {
  interface Window {
    va?: (event: string, properties?: Record<string, any>) => void
    gtag?: (...args: any[]) => void
  }
}

export interface AnalyticsEvent {
  name: string
  properties: Record<string, any>
  timestamp?: number
}

export interface WebVitalsMetrics {
  CLS: number
  FCP: number
  FID: number
  LCP: number
  TTFB: number
  INP?: number
}

class PerformanceAnalytics {
  private enabled: boolean
  private samplingRate: number
  private eventQueue: AnalyticsEvent[] = []
  private sessionId: string
  private debugMode: boolean

  constructor(options: { enabled?: boolean; samplingRate?: number; debugMode?: boolean } = {}) {
    this.enabled = options.enabled ?? import.meta.env.PROD
    this.samplingRate = options.samplingRate ?? (import.meta.env.PROD ? 0.05 : 1.0)
    this.debugMode = options.debugMode ?? !import.meta.env.PROD
    this.sessionId = this.generateSessionId()

    if (browser) {
      this.initializeWebVitals()
    }
  }

  /**
   * Track section loading performance
   */
  trackSectionPerformance(data: {
    sectionId: string
    sectionIndex: number
    loadDuration: number
    contentSize: number
    fromCache: boolean
    postSlug: string
    visibilityTime: number
  }): void {
    if (!this.shouldSample()) return

    this.track('section_performance', {
      section_id: data.sectionId,
      section_index: data.sectionIndex,
      load_duration: Math.round(data.loadDuration),
      content_size: data.contentSize,
      from_cache: data.fromCache,
      post_slug: data.postSlug,
      visibility_time: Math.round(data.visibilityTime),
      session_id: this.sessionId
    })
  }

  /**
   * Track overall post performance
   */
  trackPostPerformance(data: {
    postSlug: string
    isLargePost: boolean
    totalSections: number
    sectionsLoaded: number
    averageLoadTime: number
    cacheHitRate: number
    totalContentSize: number
    initialBundleSize: number
  }): void {
    if (!this.shouldSample()) return

    this.track('post_performance', {
      post_slug: data.postSlug,
      is_large_post: data.isLargePost,
      total_sections: data.totalSections,
      sections_loaded: data.sectionsLoaded,
      average_load_time: Math.round(data.averageLoadTime),
      cache_hit_rate: Math.round(data.cacheHitRate * 100) / 100,
      total_content_size: data.totalContentSize,
      initial_bundle_size: data.initialBundleSize,
      session_id: this.sessionId
    })
  }

  /**
   * Track user interaction patterns
   */
  trackUserBehavior(data: {
    action: 'scroll' | 'click' | 'hover' | 'resize'
    sectionId?: string
    postSlug: string
    timestamp: number
    metadata?: Record<string, any>
  }): void {
    if (!this.shouldSample()) return

    this.track('user_behavior', {
      action: data.action,
      section_id: data.sectionId,
      post_slug: data.postSlug,
      timestamp: data.timestamp,
      session_id: this.sessionId,
      ...data.metadata
    })
  }

  /**
   * Track A/B test results
   */
  trackExperiment(data: {
    experimentName: string
    variant: 'control' | 'test'
    metric: string
    value: number
    postSlug?: string
  }): void {
    if (!this.shouldSample()) return

    this.track('experiment_result', {
      experiment_name: data.experimentName,
      variant: data.variant,
      metric: data.metric,
      value: data.value,
      post_slug: data.postSlug,
      session_id: this.sessionId
    })
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals(vitals: Partial<WebVitalsMetrics>): void {
    if (!this.shouldSample()) return

    this.track('web_vitals', {
      cls: vitals.CLS,
      fcp: vitals.FCP,
      fid: vitals.FID,
      lcp: vitals.LCP,
      ttfb: vitals.TTFB,
      inp: vitals.INP,
      session_id: this.sessionId
    })
  }

  /**
   * Track bundle size optimizations
   */
  trackBundleOptimization(data: {
    postSlug: string
    originalSize: number
    optimizedSize: number
    compressionRatio: number
    chunkCount: number
    loadStrategy: string
  }): void {
    if (!this.shouldSample()) return

    this.track('bundle_optimization', {
      post_slug: data.postSlug,
      original_size: data.originalSize,
      optimized_size: data.optimizedSize,
      compression_ratio: Math.round(data.compressionRatio * 100) / 100,
      chunk_count: data.chunkCount,
      load_strategy: data.loadStrategy,
      size_reduction: data.originalSize - data.optimizedSize,
      session_id: this.sessionId
    })
  }

  /**
   * Track performance errors
   */
  trackError(error: {
    type: 'loading' | 'rendering' | 'memory' | 'network'
    message: string
    sectionId?: string
    postSlug?: string
    stack?: string
  }): void {
    // Always track errors regardless of sampling
    this.track('performance_error', {
      error_type: error.type,
      error_message: error.message,
      section_id: error.sectionId,
      post_slug: error.postSlug,
      stack: error.stack,
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    })
  }

  /**
   * Batch send queued events
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      // Send to multiple analytics providers
      await Promise.all([this.sendToVercelAnalytics(events), this.sendToGoogleAnalytics(events)])

      this.debug(`Sent ${events.length} analytics events`)
    } catch (error) {
      console.warn('Failed to send analytics events:', error)
      // Re-queue failed events with a limit to prevent infinite growth
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...events.slice(-50))
      }
    }
  }

  /**
   * Update configuration
   */
  configure(options: { enabled?: boolean; samplingRate?: number; debugMode?: boolean }): void {
    if (options.enabled !== undefined) this.enabled = options.enabled
    if (options.samplingRate !== undefined) this.samplingRate = options.samplingRate
    if (options.debugMode !== undefined) this.debugMode = options.debugMode
  }

  // Private methods

  private track(eventName: string, properties: Record<string, any>): void {
    if (!this.enabled) return

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now()
    }

    this.eventQueue.push(event)
    this.debug(`Tracked event: ${eventName}`, properties)

    // Auto-flush if queue gets large
    if (this.eventQueue.length >= 10) {
      this.flush()
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendToVercelAnalytics(events: AnalyticsEvent[]): Promise<void> {
    if (!browser || !window.va) return

    // Send each event individually to Vercel Analytics
    for (const event of events) {
      try {
        window.va(event.name, event.properties)
      } catch (error) {
        console.warn(`Failed to send event ${event.name} to Vercel Analytics:`, error)
      }
    }
  }

  private async sendToGoogleAnalytics(events: AnalyticsEvent[]): Promise<void> {
    if (!browser || !window.gtag) return

    // Send each event to Google Analytics
    for (const event of events) {
      try {
        window.gtag('event', event.name, event.properties)
      } catch (error) {
        console.warn(`Failed to send event ${event.name} to Google Analytics:`, error)
      }
    }
  }

  private initializeWebVitals(): void {
    if (!browser || typeof window.PerformanceObserver === 'undefined') return

    try {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.trackWebVitals({ LCP: lastEntry.startTime })
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.trackWebVitals({ FID: entry.processingStart - entry.startTime })
        })
      }).observe({ type: 'first-input', buffered: true })

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.trackWebVitals({ CLS: clsValue })
      }).observe({ type: 'layout-shift', buffered: true })
    } catch (error) {
      console.warn('Failed to initialize Web Vitals tracking:', error)
    }
  }

  private debug(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[PerformanceAnalytics] ${message}`, data || '')
    }
  }
}

// Global instance
export const performanceAnalytics = new PerformanceAnalytics()

// Convenience functions
export const trackSectionPerformance = (
  data: Parameters<typeof performanceAnalytics.trackSectionPerformance>[0]
) => {
  performanceAnalytics.trackSectionPerformance(data)
}

export const trackPostPerformance = (
  data: Parameters<typeof performanceAnalytics.trackPostPerformance>[0]
) => {
  performanceAnalytics.trackPostPerformance(data)
}

export const trackUserBehavior = (
  data: Parameters<typeof performanceAnalytics.trackUserBehavior>[0]
) => {
  performanceAnalytics.trackUserBehavior(data)
}

export const trackExperiment = (
  data: Parameters<typeof performanceAnalytics.trackExperiment>[0]
) => {
  performanceAnalytics.trackExperiment(data)
}

export const trackBundleOptimization = (
  data: Parameters<typeof performanceAnalytics.trackBundleOptimization>[0]
) => {
  performanceAnalytics.trackBundleOptimization(data)
}

export const trackError = (data: Parameters<typeof performanceAnalytics.trackError>[0]) => {
  performanceAnalytics.trackError(data)
}

// Auto-flush events on page unload
if (browser) {
  window.addEventListener('beforeunload', () => {
    performanceAnalytics.flush()
  })

  // Periodic flush for long-running sessions
  setInterval(() => {
    performanceAnalytics.flush()
  }, 30000) // Flush every 30 seconds
}
