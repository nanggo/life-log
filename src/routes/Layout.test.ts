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
  browser: false,
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
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      contains: vi.fn(),
      add: vi.fn(),
      remove: vi.fn()
    }
  },
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

    const darkModeToggle = screen.getByRole('switch', { name: 'Toggle Dark Mode' })
    expect(darkModeToggle).toBeInTheDocument()
  })

  it('다크모드 토글 클릭 시 localStorage가 호출된다', async () => {
    render(Layout, { data: mockData })

    const darkModeToggle = screen.getByRole('switch', { name: 'Toggle Dark Mode' })

    // 다크모드 토글 클릭
    await fireEvent.click(darkModeToggle)

    // localStorage.setItem이 어떤 값으로든 호출되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith('isDarkMode', expect.any(String))
  })

  it('메인 콘텐츠 영역이 렌더링된다', () => {
    render(Layout, { data: mockData })

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex', 'flex-col', 'flex-grow', 'w-full', 'mx-auto')
  })

  it('헤더 스타일이 올바르게 적용된다', () => {
    render(Layout, { data: mockData })

    const header = document.querySelector('header')
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
    render(Layout, { data: mockData })

    // MoonIcon (다크모드에서 보이는 아이콘)
    const moonIcon = document.querySelector('.dark\\:block')
    expect(moonIcon).toBeInTheDocument()

    // SunIcon (라이트모드에서 보이는 아이콘)
    const sunIcon = document.querySelector('.dark\\:hidden')
    expect(sunIcon).toBeInTheDocument()
  })

  it('레이아웃 구조가 올바르게 형성된다', () => {
    render(Layout, { data: mockData })

    // 최상위 컨테이너
    const container = document.querySelector('.flex.flex-col.min-h-screen')
    expect(container).toBeInTheDocument()

    // 콘텐츠 영역
    const contentArea = document.querySelector('.flex.flex-col.flex-grow.w-full.px-4.py-2')
    expect(contentArea).toBeInTheDocument()
  })
})
