import { render, screen, fireEvent } from '@testing-library/svelte'
import { readable } from 'svelte/store'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import Layout from './+layout.svelte'

// Mock modules with proper factory functions
const mockGoto = vi.fn()

vi.mock('$app/navigation', () => ({
  goto: mockGoto
}))

vi.mock('$app/stores', () => ({
  page: readable({
    url: { pathname: '/' },
    data: {},
    route: { id: null }
  })
}))

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true
}))

vi.mock('@vercel/analytics', () => ({
  inject: vi.fn()
}))

vi.mock('@vercel/speed-insights/sveltekit', () => ({
  injectSpeedInsights: vi.fn()
}))

vi.mock('$lib/info', () => ({
  name: '낭고넷',
  description: '개발자 낭고의 기술 블로그',
  author: '낭고',
  bio: '풀스택 개발자',
  website: 'https://nanggo.net',
  twitterHandle: '@nanggo_dev',
  organizationAlternateNames: ['낭고넷', 'Nanggo'],
  jobTitle: '소프트웨어 개발자',
  slogan: '코드로 세상을 바꾸는 개발자',
  foundingDate: '2024-01-01',
  contactLanguages: ['ko-KR', 'en-US'],
  expertiseAreas: ['웹 개발', '백엔드 개발'],
  areaServed: '전 세계',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  avatar: '/avatar.png',
  github: 'nanggo',
  linkedin: 'nanggo',
  email: 'contact@nanggo.net'
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock document methods
const mockClassList = {
  contains: vi.fn(),
  add: vi.fn(),
  remove: vi.fn()
}

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: mockClassList
  },
  writable: true
})

// Mock document.querySelector to return the same element for 'html' but preserve original for others
const originalQuerySelector = document.querySelector.bind(document)
Object.defineProperty(document, 'querySelector', {
  value: vi.fn((selector: string) => {
    if (selector === 'html') {
      return {
        classList: mockClassList
      }
    }
    return originalQuerySelector(selector)
  }),
  writable: true
})

describe('Layout 컴포넌트', () => {
  const mockData = {
    title: '낭고넷 - 테스트 페이지',
    url: '/'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('false')
  })

  it('헤더가 올바르게 렌더링된다', () => {
    render(Layout, { data: mockData })

    // 사이트 이름이 헤더에 표시되는지 확인
    const siteTitle = screen.getByText('낭고넷')
    expect(siteTitle).toBeInTheDocument()
  })

  it('사이트 타이틀이 홈 링크로 동작한다', () => {
    render(Layout, { data: mockData })

    const homeLink = screen.getByRole('link', { name: '낭고넷' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('다크모드 토글 버튼이 렌더링된다', () => {
    render(Layout, { data: mockData })

    const darkModeToggle = screen.getByRole('switch', { name: 'Switch to dark mode' })
    expect(darkModeToggle).toBeInTheDocument()
  })

  it('다크모드 토글 클릭 시 localStorage와 html 클래스가 올바르게 변경된다', async () => {
    // With browser: true and contains() returning false by default, isDarkMode starts as false.
    render(Layout, { data: mockData })
    const darkModeToggle = screen.getByRole('switch', { name: 'Switch to dark mode' })

    // Act: switch to dark mode
    await fireEvent.click(darkModeToggle)

    // Assert
    expect(localStorageMock.setItem).toHaveBeenCalledWith('isDarkMode', 'true')
    expect(mockClassList.add).toHaveBeenCalledWith('[&_*]:!transition-none')
    expect(mockClassList.add).toHaveBeenCalledWith('dark')
  })

  it('메인 콘텐츠 영역이 렌더링된다', () => {
    render(Layout, { data: mockData })

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex', 'flex-col', 'flex-grow', 'w-full', 'mx-auto')
  })

  it('헤더 스타일이 올바르게 적용된다', () => {
    const { container } = render(Layout, { data: mockData })

    const header = container.querySelector('header')
    expect(header).toHaveClass(
      'flex',
      'items-center',
      'justify-between',
      'w-full',
      'max-w-2xl',
      'py-4',
      'mx-auto',
      'lg:pb-8'
    )
  })

  it('사이트 타이틀에 그라디언트 스타일이 적용된다', () => {
    render(Layout, { data: mockData })

    const siteTitle = screen.getByText('낭고넷').closest('a')
    expect(siteTitle).toHaveClass(
      '!text-transparent',
      'bg-clip-text',
      'bg-gradient-to-r',
      'from-teal-500',
      'to-teal-600',
      'dark:to-teal-400'
    )
  })

  it('다크모드 아이콘이 조건부로 표시된다', () => {
    const { container } = render(Layout, { data: mockData })

    // MoonIcon (다크모드에서 보이는 아이콘)
    const moonIcon = container.querySelector('.dark\\:block')
    expect(moonIcon).toBeInTheDocument()

    // SunIcon (라이트모드에서 보이는 아이콘)
    const sunIcon = container.querySelector('.dark\\:hidden')
    expect(sunIcon).toBeInTheDocument()
  })

  it('레이아웃 구조가 올바르게 형성된다', () => {
    const { container: renderedContainer } = render(Layout, { data: mockData })

    // 최상위 컨테이너
    const container = renderedContainer.querySelector('.flex.flex-col.min-h-screen')
    expect(container).toBeInTheDocument()

    // 콘텐츠 영역
    const contentArea = renderedContainer.querySelector('.flex.flex-col.flex-grow.w-full.px-4.py-2')
    expect(contentArea).toBeInTheDocument()
  })

  describe('이미지 모달 기능', () => {
    beforeEach(() => {
      // 각 테스트 전에 모달이 있다면 제거
      const existingModal = document.querySelector('.image-modal')
      if (existingModal) {
        existingModal.remove()
      }
    })

    it('enhanced-image 클래스가 있는 이미지 클릭 시 모달이 열린다', async () => {
      render(Layout, { data: mockData })

      // 테스트용 이미지 요소 생성
      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-src', '/test-image.jpg')
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      document.body.appendChild(testImage)

      // 이미지 클릭
      await fireEvent.click(testImage)

      // 모달이 생성되었는지 확인
      const modal = document.querySelector('.image-modal')
      expect(modal).toBeInTheDocument()
      expect(modal).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-75')

      // 정리
      document.body.removeChild(testImage)
    })

    it('모달 이미지가 올바른 src와 alt 속성을 가진다', async () => {
      render(Layout, { data: mockData })

      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-src', '/test-image.jpg')
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      document.body.appendChild(testImage)

      await fireEvent.click(testImage)

      const modalImage = document.querySelector('.image-modal img')
      expect(modalImage).toHaveAttribute('src', '/test-image.jpg')
      expect(modalImage).toHaveAttribute('alt', '테스트 이미지')

      document.body.removeChild(testImage)
    })

    it('닫기 버튼이 올바른 핸들러와 함께 렌더링된다', async () => {
      render(Layout, { data: mockData })

      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-src', '/test-image.jpg')
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      document.body.appendChild(testImage)

      await fireEvent.click(testImage)

      const modal = document.querySelector('.image-modal')
      expect(modal).toBeInTheDocument()

      const closeButton = modal?.querySelector('button')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveTextContent('×')

      // 닫기 버튼에 onclick 핸들러가 설정되어 있는지 확인
      expect((closeButton as any)?.onclick).toBeDefined()
      expect(typeof (closeButton as any)?.onclick).toBe('function')

      // 테스트 정리
      modal?.remove()
      document.body.removeChild(testImage)
    })

    it('백드롭에 올바른 클릭 핸들러가 설정되어 있다', async () => {
      render(Layout, { data: mockData })

      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-src', '/test-image.jpg')
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      document.body.appendChild(testImage)

      await fireEvent.click(testImage)

      const modal = document.querySelector('.image-modal')
      expect(modal).toBeInTheDocument()

      // 모달(백드롭)에 onclick 핸들러가 설정되어 있는지 확인
      expect((modal as any)?.onclick).toBeDefined()
      expect(typeof (modal as any)?.onclick).toBe('function')

      // 테스트 정리
      modal?.remove()
      document.body.removeChild(testImage)
    })

    it('ESC 키 누르기로 모달이 닫힌다', async () => {
      render(Layout, { data: mockData })

      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-src', '/test-image.jpg')
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      document.body.appendChild(testImage)

      await fireEvent.click(testImage)

      const modal = document.querySelector('.image-modal')
      expect(modal).toBeInTheDocument()

      // ESC 키 누르기
      await fireEvent.keyDown(document, { key: 'Escape' })

      // 모달이 제거되었는지 확인
      expect(document.querySelector('.image-modal')).not.toBeInTheDocument()

      document.body.removeChild(testImage)
    })

    it('data-modal-src가 없는 이미지는 모달을 열지 않는다', async () => {
      render(Layout, { data: mockData })

      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      // data-modal-src 속성이 없음
      document.body.appendChild(testImage)

      await fireEvent.click(testImage)

      // 모달이 생성되지 않았는지 확인
      const modal = document.querySelector('.image-modal')
      expect(modal).not.toBeInTheDocument()

      document.body.removeChild(testImage)
    })

    it('모달에 닫기 버튼이 올바르게 렌더링된다', async () => {
      render(Layout, { data: mockData })

      const testImage = document.createElement('img')
      testImage.className = 'enhanced-image'
      testImage.setAttribute('data-modal-src', '/test-image.jpg')
      testImage.setAttribute('data-modal-alt', '테스트 이미지')
      document.body.appendChild(testImage)

      await fireEvent.click(testImage)

      const modal = document.querySelector('.image-modal')
      expect(modal).toBeInTheDocument()

      const closeButton = modal?.querySelector('button')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveTextContent('×')
      expect(closeButton).toHaveClass(
        'absolute',
        'top-4',
        'right-4',
        'text-white',
        'bg-black',
        'bg-opacity-50',
        'rounded-full',
        'w-10',
        'h-10'
      )

      document.body.removeChild(testImage)
    })
  })
})
