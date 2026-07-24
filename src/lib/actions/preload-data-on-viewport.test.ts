import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { preloadDataOnViewport } from './preload-data-on-viewport'

const { preloadDataMock } = vi.hoisted(() => ({
  preloadDataMock: vi.fn()
}))

vi.mock('$app/navigation', () => ({
  preloadData: preloadDataMock
}))

interface TestObserver {
  callback: ObserverCallback
  disconnect: ReturnType<typeof vi.fn>
  observe: ReturnType<typeof vi.fn>
  options?: ObserverOptions
  unobserve: ReturnType<typeof vi.fn>
}

type ObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void
type ObserverOptions = {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}
type TestAction = ReturnType<typeof preloadDataOnViewport>

const actions: TestAction[] = []
const observers: TestObserver[] = []
const originalConnection = Object.getOwnPropertyDescriptor(navigator, 'connection')

class MockIntersectionObserver {
  callback: ObserverCallback
  disconnect = vi.fn()
  observe = vi.fn()
  options?: ObserverOptions
  unobserve = vi.fn()

  constructor(callback: ObserverCallback, options?: ObserverOptions) {
    this.callback = callback
    this.options = options
    observers.push(this)
  }

  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

const createAction = (
  node: HTMLAnchorElement,
  options: Parameters<typeof preloadDataOnViewport>[1] = {}
): TestAction => {
  const action = preloadDataOnViewport(node, options)
  actions.push(action)
  return action
}

const setSaveData = (saveData: boolean): void => {
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: { saveData }
  })
}

const entry = (
  node: Element,
  {
    intersectionRatio = 1,
    isIntersecting = true
  }: { intersectionRatio?: number; isIntersecting?: boolean } = {}
): IntersectionObserverEntry =>
  ({
    intersectionRatio,
    isIntersecting,
    target: node
  }) as IntersectionObserverEntry

const intersect = (observer: TestObserver, entries: IntersectionObserverEntry[]): void => {
  observer.callback(entries, observer as unknown as IntersectionObserver)
}

const rectAt = (top: number, height = 100): DOMRect =>
  ({
    bottom: top + height,
    height,
    left: 0,
    right: 100,
    top,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({})
  }) as DOMRect

describe('preloadDataOnViewport', () => {
  beforeEach(() => {
    actions.length = 0
    observers.length = 0
    preloadDataMock.mockReset()
    preloadDataMock.mockResolvedValue({ type: 'loaded', status: 200, data: {} })
    setSaveData(false)
    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver as unknown as typeof IntersectionObserver
    )
  })

  afterEach(() => {
    for (const action of actions) {
      action.destroy()
    }

    vi.unstubAllGlobals()

    if (originalConnection) {
      Object.defineProperty(navigator, 'connection', originalConnection)
    } else {
      Reflect.deleteProperty(navigator, 'connection')
    }
  })

  it('viewport 중앙의 링크 데이터를 선로딩하고 같은 후보를 중복 요청하지 않는다', async () => {
    const node = document.createElement('a')
    const action = createAction(node, { href: '/post/test-post' })
    const observer = observers[0]

    expect(observer.observe).toHaveBeenCalledWith(node)
    expect(observer.options).toEqual({
      rootMargin: '0px',
      threshold: 0.5
    })

    intersect(observer, [entry(node)])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledOnce()
    expect(preloadDataMock).toHaveBeenCalledWith('/post/test-post')
    expect(observer.disconnect).not.toHaveBeenCalled()

    intersect(observer, [entry(node)])
    await Promise.resolve()
    action.update({ href: '/post/test-post' })

    expect(preloadDataMock).toHaveBeenCalledOnce()
    expect(observers).toHaveLength(1)

    action.destroy()
    expect(observer.unobserve).toHaveBeenCalledWith(node)
    expect(observer.disconnect).toHaveBeenCalledOnce()
  })

  it('여러 링크 중 화면 중앙에 가장 가까운 후보 하나만 유지한다', async () => {
    const upperNode = document.createElement('a')
    const centerNode = document.createElement('a')
    vi.spyOn(upperNode, 'getBoundingClientRect').mockReturnValue(rectAt(0))
    vi.spyOn(centerNode, 'getBoundingClientRect').mockReturnValue(
      rectAt(window.innerHeight / 2 - 50)
    )

    createAction(upperNode, { href: '/post/upper' })
    createAction(centerNode, { href: '/post/center' })

    expect(observers).toHaveLength(1)
    const observer = observers[0]
    intersect(observer, [entry(upperNode), entry(centerNode)])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledTimes(1)
    expect(preloadDataMock).toHaveBeenLastCalledWith('/post/center')

    intersect(observer, [entry(centerNode, { intersectionRatio: 0, isIntersecting: false })])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledTimes(2)
    expect(preloadDataMock).toHaveBeenLastCalledWith('/post/upper')
  })

  it('priority가 높은 페이지네이션 후보를 글 카드보다 우선한다', async () => {
    const postNode = document.createElement('a')
    const nextNode = document.createElement('a')
    vi.spyOn(postNode, 'getBoundingClientRect').mockReturnValue(rectAt(window.innerHeight / 2 - 50))
    vi.spyOn(nextNode, 'getBoundingClientRect').mockReturnValue(rectAt(window.innerHeight - 100))

    createAction(postNode, { href: '/post/test-post' })
    createAction(nextNode, { href: '/posts/2', priority: 1 })

    const observer = observers[0]
    intersect(observer, [entry(postNode), entry(nextNode)])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledOnce()
    expect(preloadDataMock).toHaveBeenCalledWith('/posts/2')
  })

  it('href 갱신 전 observer의 지연된 콜백을 무시한다', async () => {
    const node = document.createElement('a')
    const action = createAction(node, { href: '/posts/2' })
    const staleObserver = observers[0]

    action.update({ href: '/posts/3' })

    expect(observers).toHaveLength(2)
    expect(staleObserver.unobserve).toHaveBeenCalledWith(node)
    expect(staleObserver.disconnect).toHaveBeenCalledOnce()

    intersect(staleObserver, [entry(node)])
    await Promise.resolve()
    expect(preloadDataMock).not.toHaveBeenCalled()

    const currentObserver = observers[1]
    intersect(currentObserver, [entry(node)])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledOnce()
    expect(preloadDataMock).toHaveBeenCalledWith('/posts/3')
  })

  it('데이터 절약 모드에서는 선로딩하지 않는다', () => {
    setSaveData(true)

    createAction(document.createElement('a'), {
      deviceScope: 'all',
      href: '/about'
    })

    expect(observers).toHaveLength(0)
    expect(preloadDataMock).not.toHaveBeenCalled()
  })

  it('데스크탑에서는 viewport 데이터 선로딩을 추가하지 않는다', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true } as MediaQueryList))

    createAction(document.createElement('a'), { href: '/post/test-post' })

    expect(observers).toHaveLength(0)
    expect(preloadDataMock).not.toHaveBeenCalled()
  })

  it('모든 기기 대상 링크는 데스크탑에서도 viewport 데이터를 선로딩한다', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true } as MediaQueryList))
    const node = document.createElement('a')

    createAction(node, {
      deviceScope: 'all',
      href: '/about'
    })

    expect(observers).toHaveLength(1)
    intersect(observers[0], [entry(node)])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledOnce()
    expect(preloadDataMock).toHaveBeenCalledWith('/about')
  })

  it('기기 범위가 all로 갱신되면 데스크탑에서도 관찰을 시작한다', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true } as MediaQueryList))
    const node = document.createElement('a')
    const action = createAction(node, {
      deviceScope: 'mobile',
      href: '/about'
    })

    expect(observers).toHaveLength(0)

    action.update({
      deviceScope: 'all',
      href: '/about'
    })

    expect(observers).toHaveLength(1)
    intersect(observers[0], [entry(node)])
    await Promise.resolve()

    expect(preloadDataMock).toHaveBeenCalledOnce()
    expect(preloadDataMock).toHaveBeenCalledWith('/about')
  })

  it('비활성화되거나 목적지가 없으면 관찰하지 않는다', () => {
    createAction(document.createElement('a'), {
      enabled: false,
      href: '/post/test-post'
    })
    createAction(document.createElement('a'))

    expect(observers).toHaveLength(0)
  })
})
