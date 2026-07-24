import { preloadData } from '$app/navigation'
import { createOptimizedIntersectionObserver } from '$lib/utils/performance'

interface NetworkInformation {
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
}

export interface PreloadDataOnViewportOptions {
  enabled?: boolean
  href?: string
  priority?: number
}

interface PreloadCandidate {
  href: string
  intersectionRatio: number
  node: HTMLAnchorElement
  priority: number
  visible: boolean
}

const candidates = new Map<HTMLAnchorElement, PreloadCandidate>()

let activePreloadHref: string | null = null
let observer: IntersectionObserver | null = null
let observerGeneration = 0
let selectionScheduled = false

const shouldSkipPreload = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true
  if (window.matchMedia('(min-width: 768px)').matches) return true

  return (navigator as NavigatorWithConnection).connection?.saveData === true
}

const selectDominantCandidate = (): void => {
  selectionScheduled = false

  const visibleCandidates = Array.from(candidates.values()).filter((candidate) => candidate.visible)
  if (visibleCandidates.length === 0) {
    activePreloadHref = null
    return
  }

  const viewportCenter = window.innerHeight / 2
  visibleCandidates.sort((left, right) => {
    const priorityDifference = right.priority - left.priority
    if (priorityDifference !== 0) return priorityDifference

    const ratioDifference = right.intersectionRatio - left.intersectionRatio
    if (ratioDifference !== 0) return ratioDifference

    const leftRect = left.node.getBoundingClientRect()
    const rightRect = right.node.getBoundingClientRect()
    const leftDistance = Math.abs(leftRect.top + leftRect.height / 2 - viewportCenter)
    const rightDistance = Math.abs(rightRect.top + rightRect.height / 2 - viewportCenter)
    return leftDistance - rightDistance
  })

  const nextCandidate = visibleCandidates[0]
  if (nextCandidate.href === activePreloadHref) return

  activePreloadHref = nextCandidate.href
  void preloadData(nextCandidate.href).catch(() => {
    if (activePreloadHref === nextCandidate.href) {
      activePreloadHref = null
    }
  })
}

const scheduleCandidateSelection = (): void => {
  if (selectionScheduled) return

  selectionScheduled = true
  queueMicrotask(selectDominantCandidate)
}

const ensureObserver = (): IntersectionObserver | null => {
  if (observer) return observer

  const generation = ++observerGeneration
  observer = createOptimizedIntersectionObserver(
    (entries) => {
      if (generation !== observerGeneration) return

      for (const entry of entries) {
        const candidate = candidates.get(entry.target as HTMLAnchorElement)
        if (!candidate) continue

        candidate.intersectionRatio = entry.intersectionRatio
        candidate.visible = entry.isIntersecting && entry.intersectionRatio >= 0.5
      }
      scheduleCandidateSelection()
    },
    {
      rootMargin: '0px',
      threshold: 0.5
    }
  )

  return observer
}

const unregisterCandidate = (node: HTMLAnchorElement): void => {
  observer?.unobserve(node)
  candidates.delete(node)

  if (candidates.size === 0) {
    observer?.disconnect()
    observer = null
    observerGeneration += 1
    activePreloadHref = null
    return
  }

  scheduleCandidateSelection()
}

const registerCandidate = (
  node: HTMLAnchorElement,
  options: PreloadDataOnViewportOptions
): boolean => {
  const href = options.href?.trim()
  if (options.enabled === false || !href || shouldSkipPreload()) return false

  const sharedObserver = ensureObserver()
  if (!sharedObserver) return false

  candidates.set(node, {
    href,
    intersectionRatio: 0,
    node,
    priority: options.priority ?? 0,
    visible: false
  })
  sharedObserver.observe(node)
  return true
}

export const preloadDataOnViewport = (
  node: HTMLAnchorElement,
  initialOptions: PreloadDataOnViewportOptions = {}
) => {
  let options = initialOptions
  let registered = registerCandidate(node, options)

  return {
    update(nextOptions: PreloadDataOnViewportOptions = {}): void {
      const unchanged =
        nextOptions.enabled === options.enabled &&
        nextOptions.href?.trim() === options.href?.trim() &&
        nextOptions.priority === options.priority
      if (unchanged) return

      if (registered) {
        unregisterCandidate(node)
      }

      options = nextOptions
      registered = registerCandidate(node, options)
    },
    destroy(): void {
      if (registered) {
        unregisterCandidate(node)
        registered = false
      }
    }
  }
}
