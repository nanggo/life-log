import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import TagCloud from './TagCloud.svelte'

describe('TagCloud 컴포넌트', () => {
  const tagInfos = [
    { tag: 'Svelte', count: 3 },
    { tag: 'TypeScript', count: 2 }
  ]

  it('클릭 가능한 태그 링크에 선로딩 힌트를 제공한다', () => {
    render(TagCloud, { tagInfos, clickable: true })

    const link = screen.getByRole('link', { name: 'Svelte 태그, 3개 포스트' })
    expect(link).toHaveAttribute('href', '/tags/Svelte')
    expect(link).toHaveAttribute('data-sveltekit-preload-data', 'hover')
    expect(link).toHaveAttribute('data-sveltekit-preload-code', 'viewport')
  })

  it('클릭할 수 없는 태그에는 링크 선로딩 속성을 추가하지 않는다', () => {
    render(TagCloud, { tagInfos, clickable: false })

    const tag = screen.getByLabelText('Svelte 태그, 3개 포스트')
    expect(tag.tagName).toBe('SPAN')
    expect(tag).not.toHaveAttribute('data-sveltekit-preload-data')
    expect(tag).not.toHaveAttribute('data-sveltekit-preload-code')
  })
})
