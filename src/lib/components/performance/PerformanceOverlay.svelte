<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { browser } from '$app/environment'
  import { performanceMonitor, type SectionPerformanceMetrics, type PostPerformanceMetrics } from '$lib/utils/performanceMonitor'

  export let show: boolean = false
  export let position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'

  let mounted = false
  let expanded = false
  let postMetrics: PostPerformanceMetrics | null = null
  let sectionMetrics: SectionPerformanceMetrics[] = []
  let aggregateMetrics = {
    averageLoadTime: 0,
    totalContentSize: 0,
    cacheHitRate: 0,
    slowestSection: null as SectionPerformanceMetrics | null,
    fastestSection: null as SectionPerformanceMetrics | null
  }

  let updateInterval: number | null = null

  // Only show in development mode
  $: shouldShow = show && !import.meta.env.PROD && browser && mounted

  onMount(() => {
    mounted = true
    
    if (shouldShow) {
      startPerformanceUpdates()
    }
  })

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval)
    }
  })

  function startPerformanceUpdates() {
    updatePerformanceData()
    
    // Update every 2 seconds
    updateInterval = window.setInterval(updatePerformanceData, 2000)
  }

  function updatePerformanceData() {
    if (!browser) return

    const summary = performanceMonitor.getPerformanceSummary()
    postMetrics = summary.postMetrics
    sectionMetrics = summary.sectionMetrics
    aggregateMetrics = summary.aggregateMetrics
  }

  function toggleExpanded() {
    expanded = !expanded
  }

  function copyReportToClipboard() {
    const report = performanceMonitor.generateDevelopmentReport()
    navigator.clipboard.writeText(report).then(() => {
      console.log('Performance report copied to clipboard')
    })
  }

  function downloadReport() {
    const report = performanceMonitor.generateDevelopmentReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${postMetrics?.postSlug || 'unknown'}-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get position classes
  $: positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }[position]

  // Performance status colors
  $: averageLoadStatus = aggregateMetrics.averageLoadTime > 500 ? 'red' : 
                        aggregateMetrics.averageLoadTime > 200 ? 'yellow' : 'green'
  
  $: cacheStatusColor = aggregateMetrics.cacheHitRate > 0.8 ? 'green' :
                       aggregateMetrics.cacheHitRate > 0.5 ? 'yellow' : 'red'
</script>

{#if shouldShow}
  <!-- Performance Overlay -->
  <div 
    class="fixed z-50 {positionClasses} max-w-md"
    role="region" 
    aria-label="Performance Monitor"
  >
    <div 
      class="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 font-mono text-xs overflow-hidden"
      class:w-80={expanded}
      class:w-48={!expanded}
    >
      <!-- Header -->
      <div 
        class="flex items-center justify-between p-3 bg-gray-800 cursor-pointer"
        on:click={toggleExpanded}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && toggleExpanded()}
      >
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span class="font-medium">Performance Monitor</span>
        </div>
        <div class="text-gray-300">
          {expanded ? '−' : '+'}
        </div>
      </div>

      <!-- Content -->
      {#if expanded}
        <div class="p-3 space-y-3 max-h-96 overflow-y-auto">
          <!-- Post Overview -->
          {#if postMetrics}
            <div class="border-b border-gray-700 pb-2">
              <div class="text-gray-300 mb-1">📄 Post Analysis</div>
              <div class="space-y-1 text-xs">
                <div>Slug: <span class="text-blue-300">{postMetrics.postSlug}</span></div>
                <div>Large Post: <span class="text-{postMetrics.isLargePost ? 'green' : 'gray'}-300">{postMetrics.isLargePost ? 'Yes' : 'No'}</span></div>
                <div>Sections: <span class="text-yellow-300">{postMetrics.sectionsLoaded}/{postMetrics.totalSections}</span></div>
                <div>Bundle: <span class="text-purple-300">{(postMetrics.initialBundleSize / 1024).toFixed(1)}KB</span></div>
                {#if postMetrics.connectionType}
                  <div>Connection: <span class="text-cyan-300">{postMetrics.connectionType}</span></div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Performance Metrics -->
          <div class="border-b border-gray-700 pb-2">
            <div class="text-gray-300 mb-1">📊 Performance</div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>Avg Load Time:</span>
                <span class="text-{averageLoadStatus}-300">
                  {aggregateMetrics.averageLoadTime.toFixed(0)}ms
                </span>
              </div>
              <div class="flex justify-between">
                <span>Cache Hit Rate:</span>
                <span class="text-{cacheStatusColor}-300">
                  {(aggregateMetrics.cacheHitRate * 100).toFixed(1)}%
                </span>
              </div>
              <div class="flex justify-between">
                <span>Total Size:</span>
                <span class="text-blue-300">
                  {(aggregateMetrics.totalContentSize / 1024).toFixed(1)}KB
                </span>
              </div>
            </div>
          </div>

          <!-- Section Performance -->
          {#if sectionMetrics.length > 0}
            <div class="border-b border-gray-700 pb-2">
              <div class="text-gray-300 mb-1">⚡ Sections ({sectionMetrics.length})</div>
              <div class="space-y-1 text-xs max-h-32 overflow-y-auto">
                {#each sectionMetrics.slice(0, 5) as section}
                  <div class="flex justify-between items-center">
                    <span class="truncate flex-1 mr-2">
                      #{section.sectionIndex + 1}
                    </span>
                    <div class="flex items-center space-x-2">
                      <span class="text-{section.loadDuration > 500 ? 'red' : section.loadDuration > 200 ? 'yellow' : 'green'}-300">
                        {section.loadDuration.toFixed(0)}ms
                      </span>
                      {#if section.fromCache}
                        <span class="text-green-400 text-xs">💾</span>
                      {/if}
                    </div>
                  </div>
                {/each}
                {#if sectionMetrics.length > 5}
                  <div class="text-gray-400 text-center">
                    +{sectionMetrics.length - 5} more sections
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Extremes -->
          {#if aggregateMetrics.slowestSection || aggregateMetrics.fastestSection}
            <div class="border-b border-gray-700 pb-2">
              <div class="text-gray-300 mb-1">🏁 Extremes</div>
              <div class="space-y-1 text-xs">
                {#if aggregateMetrics.fastestSection}
                  <div class="flex justify-between">
                    <span class="text-green-300">⚡ Fastest:</span>
                    <span>{aggregateMetrics.fastestSection.loadDuration.toFixed(0)}ms</span>
                  </div>
                {/if}
                {#if aggregateMetrics.slowestSection}
                  <div class="flex justify-between">
                    <span class="text-red-300">🐌 Slowest:</span>
                    <span>{aggregateMetrics.slowestSection.loadDuration.toFixed(0)}ms</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              on:click={copyReportToClipboard}
              class="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              title="Copy report to clipboard"
            >
              📋 Copy
            </button>
            <button
              on:click={downloadReport}
              class="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              title="Download performance report"
            >
              💾 Download
            </button>
          </div>
        </div>
      {:else}
        <!-- Collapsed view -->
        <div class="p-3">
          <div class="flex justify-between items-center text-xs">
            <div class="space-y-1">
              <div class="text-{averageLoadStatus}-300">
                {aggregateMetrics.averageLoadTime.toFixed(0)}ms avg
              </div>
              <div class="text-{cacheStatusColor}-300">
                {(aggregateMetrics.cacheHitRate * 100).toFixed(0)}% cache
              </div>
            </div>
            <div class="text-right space-y-1">
              <div class="text-blue-300">
                {sectionMetrics.length} sections
              </div>
              <div class="text-purple-300">
                {(aggregateMetrics.totalContentSize / 1024).toFixed(0)}KB
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style lang="postcss">
  /* Ensure overlay stays above other content */
  .z-50 {
    z-index: 50;
  }

  /* Smooth transitions for expand/collapse */
  .max-w-md {
    transition: width 0.2s ease-in-out;
  }

  /* Custom scrollbar for metrics */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #374151;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>