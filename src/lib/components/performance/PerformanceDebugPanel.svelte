<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { browser } from '$app/environment'
  import { 
    performanceFlags, 
    performanceConfig, 
    performanceMetrics,
    devTools 
  } from '$lib/stores/performanceStore'
  import { performanceMonitor } from '$lib/utils/performanceMonitor'

  export let visible: boolean = false

  let activeTab: 'flags' | 'config' | 'metrics' | 'analytics' | 'tools' = 'metrics'
  let metricsUpdateInterval: number | null = null
  const webVitals: Record<string, number> = {}

  $: if (visible && browser) {
    startMetricsUpdates()
  } else {
    stopMetricsUpdates()
  }

  onMount(() => {
    // Collect current Web Vitals
    collectWebVitals()
  })

  onDestroy(() => {
    stopMetricsUpdates()
  })

  function startMetricsUpdates() {
    if (metricsUpdateInterval) return

    metricsUpdateInterval = window.setInterval(() => {
      const summary = performanceMonitor.getPerformanceSummary()
      
      // Update performance metrics store
      performanceMetrics.updateVitalMetrics({
        sectionsLoaded: summary.postMetrics?.sectionsLoaded || 0,
        sectionsVisible: summary.postMetrics?.sectionsVisible || 0,
        averageSectionLoadTime: summary.aggregateMetrics.averageLoadTime,
        cacheHitRate: summary.aggregateMetrics.cacheHitRate,
        totalBundleSize: summary.postMetrics?.initialBundleSize || 0
      })
    }, 1000)
  }

  function stopMetricsUpdates() {
    if (metricsUpdateInterval) {
      clearInterval(metricsUpdateInterval)
      metricsUpdateInterval = null
    }
  }

  function collectWebVitals() {
    if (!browser || !window.performance) return

    try {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        webVitals.TTFB = navigation.responseStart - navigation.fetchStart
        webVitals.DOMContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
        webVitals.LoadComplete = navigation.loadEventEnd - navigation.fetchStart
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          webVitals.FCP = entry.startTime
        } else if (entry.name === 'first-paint') {
          webVitals.FP = entry.startTime
        }
      })

      // LCP tracking
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            webVitals.LCP = lastEntry.startTime
          })
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        } catch (e) {
          console.warn('LCP observer failed:', e)
        }
      }
    } catch (error) {
      console.warn('Failed to collect Web Vitals:', error)
    }
  }

  function downloadPerformanceReport() {
    const report = performanceMonitor.generateDevelopmentReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-debug-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function clearPerformanceData() {
    performanceMetrics.reset()
    performanceMonitor.cleanup()
  }

  function simulateSlowLoading() {
    // Add artificial delay for testing
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
      return originalFetch(...args)
    }
    
    setTimeout(() => {
      window.fetch = originalFetch
    }, 10000)
  }

  function testPerformanceFeatures() {
    // Test each optimization feature
    const tests = [
      () => devTools.enableAllFeatures(),
      () => new Promise(resolve => setTimeout(resolve, 2000)),
      () => devTools.disableAllOptimizations(),
      () => new Promise(resolve => setTimeout(resolve, 2000)),
      () => devTools.resetToDefaults()
    ]

    tests.reduce((promise, test) => {
      return promise.then(test)
    }, Promise.resolve())
  }

  // Format numbers for display
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  function formatTime(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  function getMetricStatus(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    }
    
    const threshold = thresholds[metric]
    if (!threshold) return 'good'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }
</script>

{#if visible}
  <!-- Performance Debug Panel -->
  <div 
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    role="dialog"
    aria-labelledby="debug-panel-title"
    on:click|self={() => visible = false}
  >
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 id="debug-panel-title" class="text-xl font-semibold text-gray-900 dark:text-white">
          🔧 Performance Debug Panel
        </h2>
        <button
          on:click={() => visible = false}
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
          aria-label="Close debug panel"
        >
          ✕
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        {#each [
          { id: 'metrics', label: '📊 Metrics', icon: '📊' },
          { id: 'flags', label: '🚩 Flags', icon: '🚩' },
          { id: 'config', label: '⚙️ Config', icon: '⚙️' },
          { id: 'analytics', label: '📈 Analytics', icon: '📈' },
          { id: 'tools', label: '🛠️ Tools', icon: '🛠️' }
        ] as tab}
          <button
            class="px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.id 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
            on:click={() => activeTab = tab.id}
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Content -->
      <div class="p-6 max-h-[60vh] overflow-y-auto">
        {#if activeTab === 'metrics'}
          <!-- Performance Metrics Tab -->
          <div class="space-y-6">
            <!-- Real-time Metrics -->
            <div>
              <h3 class="text-lg font-medium mb-3">Real-time Performance</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{$performanceMetrics.sectionsLoaded}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Sections Loaded</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">
                    {formatTime($performanceMetrics.averageSectionLoadTime)}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Avg Load Time</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-purple-600">
                    {($performanceMetrics.cacheHitRate * 100).toFixed(1)}%
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
                </div>
              </div>
            </div>

            <!-- Web Vitals -->
            <div>
              <h3 class="text-lg font-medium mb-3">Core Web Vitals</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each Object.entries(webVitals) as [metric, value]}
                  {@const status = getMetricStatus(metric, value)}
                  <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium">{metric}</span>
                      <span class="w-3 h-3 rounded-full {status === 'good' ? 'bg-green-400' : status === 'needs-improvement' ? 'bg-yellow-400' : 'bg-red-400'}"></span>
                    </div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">
                      {formatTime(value)}
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Bundle Analysis -->
            <div>
              <h3 class="text-lg font-medium mb-3">Bundle Analysis</h3>
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Bundle Size</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBytes($performanceMetrics.totalBundleSize)}
                </div>
              </div>
            </div>
          </div>

        {:else if activeTab === 'flags'}
          <!-- Performance Flags Tab -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Feature Flags</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each Object.entries($performanceFlags) as [key, value]}
                <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span class="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    on:change={(e) => performanceFlags.updateFlag(key, e.target?.checked || false)}
                    class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              {/each}
            </div>
          </div>

        {:else if activeTab === 'config'}
          <!-- Performance Config Tab -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Configuration</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each Object.entries($performanceConfig) as [key, value]}
                <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label class="block text-sm font-medium mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  {#if typeof value === 'boolean'}
                    <input
                      type="checkbox"
                      checked={value}
                      on:change={(e) => performanceConfig.updateConfig(key, e.target?.checked || false)}
                      class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  {:else if typeof value === 'number'}
                    <input
                      type="number"
                      value={value}
                      on:input={(e) => performanceConfig.updateConfig(key, parseFloat(e.target?.value || '0'))}
                      class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                  {:else}
                    <input
                      type="text"
                      value={value}
                      on:input={(e) => performanceConfig.updateConfig(key, e.target?.value || '')}
                      class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                  {/if}
                </div>
              {/each}
            </div>
          </div>

        {:else if activeTab === 'analytics'}
          <!-- Analytics Tab -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Analytics Events</h3>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Performance analytics integration status
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div class="text-center text-gray-500 dark:text-gray-400">
                Analytics tracking is {$performanceFlags.enableAnalytics ? 'enabled' : 'disabled'} 
                (Sampling rate: {($performanceConfig.analyticssampling * 100).toFixed(0)}%)
              </div>
            </div>
          </div>

        {:else if activeTab === 'tools'}
          <!-- Developer Tools Tab -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Developer Tools</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Performance Testing -->
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 class="font-medium mb-3">Performance Testing</h4>
                <div class="space-y-2">
                  <button
                    on:click={simulateSlowLoading}
                    class="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                  >
                    🐌 Simulate Slow Loading
                  </button>
                  <button
                    on:click={testPerformanceFeatures}
                    class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    🧪 Test All Features
                  </button>
                </div>
              </div>

              <!-- Data Management -->
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 class="font-medium mb-3">Data Management</h4>
                <div class="space-y-2">
                  <button
                    on:click={downloadPerformanceReport}
                    class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    💾 Download Report
                  </button>
                  <button
                    on:click={clearPerformanceData}
                    class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    🗑️ Clear Data
                  </button>
                </div>
              </div>

              <!-- Preset Configurations -->
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 class="font-medium mb-3">Quick Presets</h4>
                <div class="space-y-2">
                  <button
                    on:click={devTools.enableAllFeatures}
                    class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    ⚡ Enable All Features
                  </button>
                  <button
                    on:click={devTools.disableAllOptimizations}
                    class="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    🔒 Disable Optimizations
                  </button>
                  <button
                    on:click={devTools.resetToDefaults}
                    class="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
                  >
                    🔄 Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {new Date($performanceMetrics.lastUpdated).toLocaleTimeString()}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Press Escape to close | Debug mode: {$performanceConfig.debugMode ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  /* Ensure panel stays above everything */
  .z-50 {
    z-index: 50;
  }

  /* Custom scrollbar */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  @media (prefers-color-scheme: dark) {
    .overflow-y-auto::-webkit-scrollbar-track {
      background: #374151;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #6b7280;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  }
</style>

<svelte:window on:keydown={(e) => e.key === 'Escape' && (visible = false)} />