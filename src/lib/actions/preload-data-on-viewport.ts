import { preloadData } from '$app/navigation'
import { page } from '$app/stores'
import { createOptimizedIntersectionObserver } from '$lib/utils/performance'

interface NetworkInformation {
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
}

export interface PreloadDataOnViewportOptions {
  deviceScope?: 'all' | 'mobile'
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
const desktopMediaQueryListeners = new Set<() => void>()

let activePreloadHref: string | null = null
let currentPageUrl: URL | null = null
let desktopMediaQuery: MediaQueryList | null | undefined
let observer: IntersectionObserver | null = null
let observerGeneration = 0
let selectionScheduled = false
let unsubscribeFromPage: (() => void) | null = null

const getDesktopMediaQuery = (): MediaQueryList | null => {
  if (desktopMediaQuery !== undefined) return desktopMediaQuery

  desktopMediaQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? (window.matchMedia('(min-width: 768px)') ?? null)
      : null
  return desktopMediaQuery
}

const notifyDesktopMediaQueryListeners = (): void => {
  for (const listener of desktopMediaQueryListeners) {
    listener()
  }
}

const subscribeToDesktopMediaQuery = (listener: () => void): (() => void) => {
  const mediaQuery = getDesktopMediaQuery()
  if (!mediaQuery) {
    return () => {
      desktopMediaQuery = undefined
    }
  }

  desktopMediaQueryListeners.add(listener)
  if (desktopMediaQueryListeners.size === 1) {
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', notifyDesktopMediaQueryListeners)
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(notifyDesktopMediaQueryListeners)
    }
  }

  return () => {
    desktopMediaQueryListeners.delete(listener)
    if (desktopMediaQueryListeners.size > 0) return

    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', notifyDesktopMediaQueryListeners)
    } else if (typeof mediaQuery.removeListener === 'function') {
      mediaQuery.removeListener(notifyDesktopMediaQueryListeners)
    }
    desktopMediaQuery = undefined
  }
}

const isCurrentLocation = (href: string): boolean => {
  try {
    const location = currentPageUrl ?? new URL(window.location.href)
    const target = new URL(href, location)
    return (
      target.origin === location.origin &&
      target.pathname === location.pathname &&
      target.search === location.search
    )
  } catch {
    return false
  }
}

const shouldSkipPreload = (options: PreloadDataOnViewportOptions): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true
  if (options.deviceScope !== 'all' && getDesktopMediaQuery()?.matches) {
    return true
  }

  return (navigator as NavigatorWithConnection).connection?.saveData === true
}

const selectDominantCandidate = (): void => {
  selectionScheduled = false

  const visibleCandidates = Array.from(candidates.values()).filter(
    (candidate) => candidate.visible && !isCurrentLocation(candidate.href)
  )
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

const ensurePageSubscription = (): void => {
  if (unsubscribeFromPage) return

  unsubscribeFromPage = page.subscribe(($page) => {
    const locationChanged =
      currentPageUrl !== null &&
      (currentPageUrl.origin !== $page.url.origin ||
        currentPageUrl.pathname !== $page.url.pathname ||
        currentPageUrl.search !== $page.url.search)

    currentPageUrl = $page.url
    if (locationChanged) {
      activePreloadHref = null
    }
    scheduleCandidateSelection()
  })
}

const unregisterCandidate = (node: HTMLAnchorElement): void => {
  observer?.unobserve(node)
  candidates.delete(node)

  if (candidates.size === 0) {
    observer?.disconnect()
    observer = null
    observerGeneration += 1
    activePreloadHref = null
    unsubscribeFromPage?.()
    unsubscribeFromPage = null
    currentPageUrl = null
    return
  }

  scheduleCandidateSelection()
}

const registerCandidate = (
  node: HTMLAnchorElement,
  options: PreloadDataOnViewportOptions
): boolean => {
  const href = options.href?.trim()
  if (options.enabled === false || !href || shouldSkipPreload(options)) {
    return false
  }

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
  ensurePageSubscription()
  return true
}

export const preloadDataOnViewport = (
  node: HTMLAnchorElement,
  initialOptions: PreloadDataOnViewportOptions = {}
) => {
  let options = initialOptions
  let unsubscribeFromDesktopMediaQuery: (() => void) | null = null
  let registered = registerCandidate(node, options)

  const reconcileDeviceScope = (): void => {
    const href = options.href?.trim()
    const shouldRegister = options.enabled !== false && !!href && !shouldSkipPreload(options)

    if (registered && !shouldRegister) {
      unregisterCandidate(node)
      registered = false
    } else if (!registered && shouldRegister) {
      registered = registerCandidate(node, options)
    }
  }

  const syncDesktopMediaQuerySubscription = (): void => {
    const needsSubscription = options.deviceScope !== 'all'
    if (needsSubscription && !unsubscribeFromDesktopMediaQuery) {
      unsubscribeFromDesktopMediaQuery = subscribeToDesktopMediaQuery(reconcileDeviceScope)
    } else if (!needsSubscription && unsubscribeFromDesktopMediaQuery) {
      unsubscribeFromDesktopMediaQuery()
      unsubscribeFromDesktopMediaQuery = null
    }
  }

  syncDesktopMediaQuerySubscription()

  return {
    update(nextOptions: PreloadDataOnViewportOptions = {}): void {
      const unchanged =
        nextOptions.deviceScope === options.deviceScope &&
        nextOptions.enabled === options.enabled &&
        nextOptions.href?.trim() === options.href?.trim() &&
        nextOptions.priority === options.priority
      if (unchanged) return

      if (registered) {
        unregisterCandidate(node)
      }

      options = nextOptions
      syncDesktopMediaQuerySubscription()
      registered = registerCandidate(node, options)
    },
    destroy(): void {
      if (registered) {
        unregisterCandidate(node)
        registered = false
      }
      unsubscribeFromDesktopMediaQuery?.()
      unsubscribeFromDesktopMediaQuery = null
    }
  }
}
