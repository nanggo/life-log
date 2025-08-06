/**
 * Performance store for managing optimization flags and configuration
 *
 * Provides centralized state management for:
 * - A/B testing flags for performance features
 * - Real-time performance configuration
 * - User-specific optimization settings
 * - Performance experiment tracking
 */

import { writable, derived } from 'svelte/store'

import { browser } from '$app/environment'

export interface PerformanceFlags {
  enableProgressiveLoading: boolean
  enableLargePostOptimization: boolean
  enablePerformanceMonitoring: boolean
  enableRealTimeOverlay: boolean
  enableAnalytics: boolean
  experimentalPreloading: boolean
  aggressiveMemoryCleanup: boolean
  adaptiveChunkSize: boolean
}

export interface PerformanceConfig {
  sizeThreshold: number
  sectionLoadThreshold: number
  preloadDistance: number
  memoryCleanupDelay: number
  analyticssampling: number
  debugMode: boolean
}

export interface ExperimentConfig {
  name: string
  variant: 'control' | 'test'
  startDate: Date
  endDate: Date
  active: boolean
  targetMetric: string
}

// Default performance flags
const defaultFlags: PerformanceFlags = {
  enableProgressiveLoading: true,
  enableLargePostOptimization: true,
  enablePerformanceMonitoring: !import.meta.env.PROD, // Only in dev by default
  enableRealTimeOverlay: !import.meta.env.PROD,
  enableAnalytics: import.meta.env.PROD, // Only in production by default
  experimentalPreloading: false,
  aggressiveMemoryCleanup: false,
  adaptiveChunkSize: false
}

// Default performance configuration
const defaultConfig: PerformanceConfig = {
  sizeThreshold: 10240, // 10KB threshold for large post detection
  sectionLoadThreshold: 500, // 500ms threshold for slow loading sections
  preloadDistance: 2, // Preload 2 sections ahead/behind
  memoryCleanupDelay: 2000, // 2s delay for memory cleanup
  analyticssampling: import.meta.env.PROD ? 0.05 : 1.0, // 5% sampling in prod
  debugMode: !import.meta.env.PROD
}

// Create performance flags store
function createPerformanceFlagsStore() {
  const { subscribe, set, update } = writable<PerformanceFlags>(defaultFlags)

  // Load saved flags from localStorage in browser
  if (browser && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('performanceFlags')
      if (saved) {
        const savedFlags = JSON.parse(saved)
        set({ ...defaultFlags, ...savedFlags })
      }
    } catch (error) {
      console.warn('Failed to load saved performance flags:', error)
    }
  }

  return {
    subscribe,
    set: (flags: PerformanceFlags) => {
      set(flags)
      if (browser) {
        try {
          localStorage.setItem('performanceFlags', JSON.stringify(flags))
        } catch (error) {
          console.warn('Failed to save performance flags:', error)
        }
      }
    },
    update,
    updateFlag: (key: keyof PerformanceFlags, value: boolean) => {
      update((flags) => {
        const newFlags = { ...flags, [key]: value }
        if (browser) {
          try {
            localStorage.setItem('performanceFlags', JSON.stringify(newFlags))
          } catch (error) {
            console.warn('Failed to save performance flags:', error)
          }
        }
        return newFlags
      })
    },
    reset: () => {
      set(defaultFlags)
      if (browser) {
        localStorage.removeItem('performanceFlags')
      }
    }
  }
}

// Create performance config store
function createPerformanceConfigStore() {
  const { subscribe, set, update } = writable<PerformanceConfig>(defaultConfig)

  // Load saved config from localStorage in browser
  if (browser && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('performanceConfig')
      if (saved) {
        const savedConfig = JSON.parse(saved)
        set({ ...defaultConfig, ...savedConfig })
      }
    } catch (error) {
      console.warn('Failed to load saved performance config:', error)
    }
  }

  return {
    subscribe,
    set: (config: PerformanceConfig) => {
      set(config)
      if (browser) {
        try {
          localStorage.setItem('performanceConfig', JSON.stringify(config))
        } catch (error) {
          console.warn('Failed to save performance config:', error)
        }
      }
    },
    update,
    updateConfig: <K extends keyof PerformanceConfig>(key: K, value: PerformanceConfig[K]) => {
      update((config) => {
        const newConfig = { ...config, [key]: value }
        if (browser) {
          try {
            localStorage.setItem('performanceConfig', JSON.stringify(newConfig))
          } catch (error) {
            console.warn('Failed to save performance config:', error)
          }
        }
        return newConfig
      })
    },
    reset: () => {
      set(defaultConfig)
      if (browser) {
        localStorage.removeItem('performanceConfig')
      }
    }
  }
}

// A/B Testing Experiment Management
function createExperimentStore() {
  const { subscribe, set, update } = writable<ExperimentConfig[]>([])

  const addExperiment = (experiment: Omit<ExperimentConfig, 'active'>) => {
    update((experiments) => [...experiments, { ...experiment, active: true }])
  }

  const getActiveExperiment = (name: string): ExperimentConfig | null => {
    let result: ExperimentConfig | null = null
    subscribe((experiments) => {
      result = experiments.find((exp) => exp.name === name && exp.active) || null
    })()
    return result
  }

  const endExperiment = (name: string) => {
    update((experiments) =>
      experiments.map((exp) => (exp.name === name ? { ...exp, active: false } : exp))
    )
  }

  return {
    subscribe,
    set,
    update,
    addExperiment,
    getActiveExperiment,
    endExperiment,
    clear: () => set([])
  }
}

// User assignment for A/B testing
function createUserVariantStore() {
  const { subscribe, set, update } = writable<Record<string, 'control' | 'test'>>({})

  const assignVariant = (experimentName: string, userId?: string): 'control' | 'test' => {
    // Simple hash-based assignment for consistent user experience
    const seed = userId || (browser ? generateUserId() : 'anonymous')
    const hash = simpleHash(experimentName + seed)
    const variant = hash % 2 === 0 ? 'control' : 'test'

    update((variants) => ({ ...variants, [experimentName]: variant }))
    return variant
  }

  const getVariant = (experimentName: string): 'control' | 'test' | null => {
    let result: 'control' | 'test' | null = null
    subscribe((variants) => {
      result = variants[experimentName] || null
    })()
    return result
  }

  return {
    subscribe,
    assignVariant,
    getVariant,
    clear: () => set({})
  }
}

// Performance metrics tracking
function createMetricsStore() {
  const initialMetrics = {
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    totalBlockingTime: 0,
    sectionsLoaded: 0,
    sectionsVisible: 0,
    averageSectionLoadTime: 0,
    cacheHitRate: 0,
    totalBundleSize: 0,
    lastUpdated: Date.now()
  }

  const { subscribe, set, update } = writable(initialMetrics)

  const updateMetric = <K extends keyof typeof initialMetrics>(
    key: K,
    value: (typeof initialMetrics)[K]
  ) => {
    update((metrics) => ({
      ...metrics,
      [key]: value,
      lastUpdated: Date.now()
    }))
  }

  const updateVitalMetrics = (vitals: Partial<typeof initialMetrics>) => {
    update((metrics) => ({
      ...metrics,
      ...vitals,
      lastUpdated: Date.now()
    }))
  }

  return {
    subscribe,
    set,
    update,
    updateMetric,
    updateVitalMetrics,
    reset: () => set({ ...initialMetrics, lastUpdated: Date.now() })
  }
}

// Create store instances
export const performanceFlags = createPerformanceFlagsStore()
export const performanceConfig = createPerformanceConfigStore()
export const experiments = createExperimentStore()
export const userVariants = createUserVariantStore()
export const performanceMetrics = createMetricsStore()

// Derived stores for common combinations
export const isOptimizationEnabled = derived(
  performanceFlags,
  ($flags) => $flags.enableProgressiveLoading && $flags.enableLargePostOptimization
)

export const shouldShowOverlay = derived(
  performanceFlags,
  ($flags) => $flags.enableRealTimeOverlay && $flags.enablePerformanceMonitoring
)

export const analyticsConfig = derived(
  [performanceFlags, performanceConfig],
  ([$flags, $config]) => ({
    enabled: $flags.enableAnalytics,
    sampling: $config.analyticssampling,
    debugMode: $config.debugMode
  })
)

// Utility functions
function generateUserId(): string {
  if (browser && localStorage) {
    let userId = localStorage.getItem('performanceUserId')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('performanceUserId', userId)
    }
    return userId
  }
  return 'anonymous'
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Initialize stores with any URL parameters (for testing)
if (browser && typeof URLSearchParams !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search)

  // Enable performance debugging via URL parameter
  if (urlParams.get('perf-debug') === 'true') {
    performanceFlags.updateFlag('enablePerformanceMonitoring', true)
    performanceFlags.updateFlag('enableRealTimeOverlay', true)
    performanceConfig.updateConfig('debugMode', true)
  }

  // Force specific experiment variant via URL parameter
  const forceVariant = urlParams.get('perf-variant')
  if (forceVariant && (forceVariant === 'control' || forceVariant === 'test')) {
    // This would be implemented per experiment
    console.log(`Forced performance variant: ${forceVariant}`)
  }
}

// Development helpers
export const devTools = {
  enableAllFeatures: () => {
    performanceFlags.set({
      enableProgressiveLoading: true,
      enableLargePostOptimization: true,
      enablePerformanceMonitoring: true,
      enableRealTimeOverlay: true,
      enableAnalytics: true,
      experimentalPreloading: true,
      aggressiveMemoryCleanup: true,
      adaptiveChunkSize: true
    })
  },

  disableAllOptimizations: () => {
    performanceFlags.set({
      ...defaultFlags,
      enableProgressiveLoading: false,
      enableLargePostOptimization: false,
      enablePerformanceMonitoring: true, // Keep monitoring for testing
      enableRealTimeOverlay: true
    })
  },

  resetToDefaults: () => {
    performanceFlags.reset()
    performanceConfig.reset()
    experiments.clear()
    userVariants.clear()
    performanceMetrics.reset()
  }
}
