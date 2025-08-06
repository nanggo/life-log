/**
 * Performance monitoring utilities for large post loading analysis
 *
 * Provides comprehensive performance tracking for:
 * - Section loading times
 * - Bundle size analysis
 * - User interaction patterns
 * - Real user monitoring (RUM) data collection
 */

import { browser } from '$app/environment'

export interface SectionPerformanceMetrics {
  sectionId: string
  sectionIndex: number
  loadStartTime: number
  loadEndTime: number
  loadDuration: number
  contentSize: number
  fromCache: boolean
  visibilityTime: number
  interactionTime?: number
}

export interface PostPerformanceMetrics {
  postSlug: string
  isLargePost: boolean
  totalSections: number
  initialBundleSize: number
  totalLoadTime: number
  sectionsLoaded: number
  sectionsVisible: number
  userAgent: string
  connectionType?: string
  deviceMemory?: number
  hardwareConcurrency?: number
}

export interface PerformanceConfig {
  enableRealTimeMonitoring: boolean
  enableAnalytics: boolean
  samplingRate: number
  debugMode: boolean
}

class PerformanceMonitor {
  private metrics: Map<string, SectionPerformanceMetrics> = new Map()
  private postMetrics: PostPerformanceMetrics | null = null
  private observers: PerformanceObserver[] = []
  private config: PerformanceConfig
  private sessionStartTime: number
  private analyticsBuffer: any[] = []

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      enableAnalytics: true,
      samplingRate: import.meta.env.PROD ? 0.05 : 1.0, // 5% in production, 100% in dev
      debugMode: !import.meta.env.PROD,
      ...config
    }

    this.sessionStartTime = performance.now()

    if (browser) {
      this.initializePerformanceObservers()
      this.collectDeviceInformation()
    }
  }

  /**
   * Initialize post-level performance tracking
   */
  initializePostTracking(postSlug: string, isLargePost: boolean, totalSections: number): void {
    if (!browser || !this.shouldSample()) return

    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming

    this.postMetrics = {
      postSlug,
      isLargePost,
      totalSections,
      initialBundleSize: this.estimateInitialBundleSize(),
      totalLoadTime: navigationEntry?.loadEventEnd - navigationEntry?.fetchStart || 0,
      sectionsLoaded: 0,
      sectionsVisible: 0,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceMemory: this.getDeviceMemory(),
      hardwareConcurrency: navigator.hardwareConcurrency
    }

    this.debug('🚀 Initialized post performance tracking', this.postMetrics)
  }

  /**
   * Track section loading performance
   */
  trackSectionLoad(
    sectionId: string,
    sectionIndex: number,
    contentSize: number,
    _fromCache: boolean = false
  ): string {
    if (!browser || !this.shouldSample()) return ''

    const _loadStartTime = performance.now()
    const trackingId = `${sectionId}-${Date.now()}`

    // Mark the start of section loading
    performance.mark(`section-load-start-${trackingId}`)

    return trackingId
  }

  /**
   * Complete section loading tracking
   */
  completeSectionLoad(
    trackingId: string,
    sectionId: string,
    sectionIndex: number,
    contentSize: number,
    fromCache: boolean = false
  ): SectionPerformanceMetrics | null {
    if (!browser || !this.shouldSample()) return null

    const loadEndTime = performance.now()
    const loadStartMark = performance.getEntriesByName(`section-load-start-${trackingId}`)[0]

    if (!loadStartMark) return null

    const loadStartTime = loadStartMark.startTime
    const loadDuration = loadEndTime - loadStartTime

    // Create performance mark for section completion
    performance.mark(`section-load-end-${trackingId}`)
    performance.measure(
      `section-load-${trackingId}`,
      `section-load-start-${trackingId}`,
      `section-load-end-${trackingId}`
    )

    const metrics: SectionPerformanceMetrics = {
      sectionId,
      sectionIndex,
      loadStartTime,
      loadEndTime,
      loadDuration,
      contentSize,
      fromCache,
      visibilityTime: loadEndTime - this.sessionStartTime
    }

    this.metrics.set(sectionId, metrics)

    // Update post metrics
    if (this.postMetrics) {
      this.postMetrics.sectionsLoaded++
    }

    this.debug('📊 Section loaded', metrics)

    // Send to analytics if enabled
    if (this.config.enableAnalytics) {
      this.queueAnalyticsEvent('section_loaded', {
        section_id: sectionId,
        section_index: sectionIndex,
        load_duration: loadDuration,
        content_size: contentSize,
        from_cache: fromCache,
        post_slug: this.postMetrics?.postSlug
      })
    }

    return metrics
  }

  /**
   * Track section visibility (when it becomes visible to user)
   */
  trackSectionVisibility(sectionId: string, visibilityTime?: number): void {
    if (!browser || !this.shouldSample()) return

    const metrics = this.metrics.get(sectionId)
    if (metrics) {
      metrics.visibilityTime = visibilityTime || performance.now() - this.sessionStartTime
      this.metrics.set(sectionId, metrics)
    }

    if (this.postMetrics) {
      this.postMetrics.sectionsVisible++
    }

    this.debug('👁️ Section became visible', { sectionId, visibilityTime })
  }

  /**
   * Track user interaction with section (scroll, click, etc.)
   */
  trackSectionInteraction(sectionId: string, interactionType: string): void {
    if (!browser || !this.shouldSample()) return

    const metrics = this.metrics.get(sectionId)
    if (metrics) {
      metrics.interactionTime = performance.now() - this.sessionStartTime
      this.metrics.set(sectionId, metrics)
    }

    if (this.config.enableAnalytics) {
      this.queueAnalyticsEvent('section_interaction', {
        section_id: sectionId,
        interaction_type: interactionType,
        post_slug: this.postMetrics?.postSlug
      })
    }

    this.debug('🖱️ Section interaction', { sectionId, interactionType })
  }

  /**
   * Get performance summary for all loaded sections
   */
  getPerformanceSummary(): {
    postMetrics: PostPerformanceMetrics | null
    sectionMetrics: SectionPerformanceMetrics[]
    aggregateMetrics: {
      averageLoadTime: number
      totalContentSize: number
      cacheHitRate: number
      slowestSection: SectionPerformanceMetrics | null
      fastestSection: SectionPerformanceMetrics | null
    }
  } {
    const sectionMetrics = Array.from(this.metrics.values())

    const aggregateMetrics = {
      averageLoadTime:
        sectionMetrics.reduce((sum, m) => sum + m.loadDuration, 0) / sectionMetrics.length || 0,
      totalContentSize: sectionMetrics.reduce((sum, m) => sum + m.contentSize, 0),
      cacheHitRate: sectionMetrics.filter((m) => m.fromCache).length / sectionMetrics.length || 0,
      slowestSection: sectionMetrics.reduce(
        (slowest, current) =>
          !slowest || current.loadDuration > slowest.loadDuration ? current : slowest,
        null as SectionPerformanceMetrics | null
      ),
      fastestSection: sectionMetrics.reduce(
        (fastest, current) =>
          !fastest || current.loadDuration < fastest.loadDuration ? current : fastest,
        null as SectionPerformanceMetrics | null
      )
    }

    return {
      postMetrics: this.postMetrics,
      sectionMetrics,
      aggregateMetrics
    }
  }

  /**
   * Send performance data to analytics service
   */
  async sendAnalytics(): Promise<void> {
    if (!this.config.enableAnalytics || this.analyticsBuffer.length === 0) return

    try {
      const summary = this.getPerformanceSummary()

      // Send to Vercel Analytics if available
      if (typeof window !== 'undefined' && (window as any).va) {
        ;(window as any).va('track', 'post_performance', {
          post_slug: this.postMetrics?.postSlug,
          is_large_post: this.postMetrics?.isLargePost,
          sections_loaded: this.postMetrics?.sectionsLoaded,
          average_load_time: summary.aggregateMetrics.averageLoadTime,
          cache_hit_rate: summary.aggregateMetrics.cacheHitRate,
          total_content_size: summary.aggregateMetrics.totalContentSize
        })
      }

      // Send buffered events
      for (const event of this.analyticsBuffer) {
        if (typeof window !== 'undefined' && (window as any).va) {
          ;(window as any).va('track', event.name, event.properties)
        }
      }

      this.analyticsBuffer = []
      this.debug('📈 Analytics data sent', summary)
    } catch (error) {
      console.warn('Failed to send analytics data:', error)
    }
  }

  /**
   * Generate detailed performance report for development
   */
  generateDevelopmentReport(): string {
    const summary = this.getPerformanceSummary()

    let report = '\n🚀 Performance Report\n'
    report += '==================\n\n'

    if (summary.postMetrics) {
      report += `📄 Post: ${summary.postMetrics.postSlug}\n`
      report += `📏 Large Post: ${summary.postMetrics.isLargePost ? 'Yes' : 'No'}\n`
      report += `📊 Sections: ${summary.postMetrics.sectionsLoaded}/${summary.postMetrics.totalSections} loaded\n`
      report += `⏱️  Total Load Time: ${summary.postMetrics.totalLoadTime.toFixed(2)}ms\n`
      report += `💾 Initial Bundle: ${(summary.postMetrics.initialBundleSize / 1024).toFixed(1)}KB\n\n`
    }

    report += `📈 Aggregate Metrics:\n`
    report += `   Average Load Time: ${summary.aggregateMetrics.averageLoadTime.toFixed(2)}ms\n`
    report += `   Total Content Size: ${(summary.aggregateMetrics.totalContentSize / 1024).toFixed(1)}KB\n`
    report += `   Cache Hit Rate: ${(summary.aggregateMetrics.cacheHitRate * 100).toFixed(1)}%\n\n`

    if (summary.aggregateMetrics.slowestSection) {
      report += `🐌 Slowest Section: ${summary.aggregateMetrics.slowestSection.sectionId} (${summary.aggregateMetrics.slowestSection.loadDuration.toFixed(2)}ms)\n`
    }

    if (summary.aggregateMetrics.fastestSection) {
      report += `⚡ Fastest Section: ${summary.aggregateMetrics.fastestSection.sectionId} (${summary.aggregateMetrics.fastestSection.loadDuration.toFixed(2)}ms)\n\n`
    }

    report += '📋 Section Details:\n'
    summary.sectionMetrics.forEach((metrics) => {
      report += `   ${metrics.sectionIndex + 1}. ${metrics.sectionId}\n`
      report += `      Load Time: ${metrics.loadDuration.toFixed(2)}ms\n`
      report += `      Size: ${(metrics.contentSize / 1024).toFixed(1)}KB\n`
      report += `      From Cache: ${metrics.fromCache ? 'Yes' : 'No'}\n`
      report += `      Visibility: ${metrics.visibilityTime.toFixed(2)}ms\n\n`
    })

    return report
  }

  /**
   * Clean up performance monitoring resources
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.metrics.clear()
    this.postMetrics = null

    if (this.config.enableAnalytics) {
      this.sendAnalytics()
    }

    this.debug('🧹 Performance monitor cleaned up')
  }

  // Private methods

  private initializePerformanceObservers(): void {
    if (!browser || !window.PerformanceObserver) return

    try {
      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('chunk') || entry.name.includes('section')) {
            this.debug('📦 Resource loaded:', {
              name: entry.name,
              duration: entry.duration,
              transferSize: (entry as PerformanceResourceTiming).transferSize
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.debug('⚠️ Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime
            })

            if (this.config.enableAnalytics) {
              this.queueAnalyticsEvent('long_task', {
                duration: entry.duration,
                post_slug: this.postMetrics?.postSlug
              })
            }
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      console.warn('Failed to initialize performance observers:', error)
    }
  }

  private collectDeviceInformation(): void {
    if (!browser) return

    // Collect device capabilities for performance analysis
    const deviceInfo = {
      memory: this.getDeviceMemory(),
      cores: navigator.hardwareConcurrency,
      connection: this.getConnectionType(),
      userAgent: navigator.userAgent
    }

    this.debug('💻 Device information:', deviceInfo)
  }

  private estimateInitialBundleSize(): number {
    if (!browser) return 0

    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return resourceEntries
      .filter((entry) => entry.name.includes('chunk') || entry.name.includes('.js'))
      .reduce((total, entry) => total + (entry.transferSize || 0), 0)
  }

  private getConnectionType(): string | undefined {
    if (!browser) return undefined

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
    return connection?.effectiveType
  }

  private getDeviceMemory(): number | undefined {
    if (!browser) return undefined

    return (navigator as any).deviceMemory
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate
  }

  private queueAnalyticsEvent(name: string, properties: Record<string, any>): void {
    this.analyticsBuffer.push({ name, properties, timestamp: Date.now() })
  }

  private debug(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[PerformanceMonitor] ${message}`, data || '')
    }
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor()

// Export helper functions for easy integration
export const trackPostPerformance = (
  postSlug: string,
  isLargePost: boolean,
  totalSections: number
) => {
  performanceMonitor.initializePostTracking(postSlug, isLargePost, totalSections)
}

export const trackSectionLoad = (
  sectionId: string,
  sectionIndex: number,
  contentSize: number,
  fromCache?: boolean
) => {
  return performanceMonitor.trackSectionLoad(sectionId, sectionIndex, contentSize, fromCache)
}

export const completeSectionLoad = (
  trackingId: string,
  sectionId: string,
  sectionIndex: number,
  contentSize: number,
  fromCache?: boolean
) => {
  return performanceMonitor.completeSectionLoad(
    trackingId,
    sectionId,
    sectionIndex,
    contentSize,
    fromCache
  )
}

export const trackSectionVisibility = (sectionId: string, visibilityTime?: number) => {
  performanceMonitor.trackSectionVisibility(sectionId, visibilityTime)
}

export const getPerformanceSummary = () => {
  return performanceMonitor.getPerformanceSummary()
}

export const generateDevelopmentReport = () => {
  return performanceMonitor.generateDevelopmentReport()
}
