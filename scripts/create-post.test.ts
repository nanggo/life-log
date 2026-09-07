// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createPostFile } from './create-post-file.js'

const slug = 'existing-post'
const draft = "---\ntitle: '새 글'\ndraft: true\n---\n"
let directory: string

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'life-log-create-post-'))
})

afterEach(() => {
  vi.restoreAllMocks()
  fs.rmSync(directory, { recursive: true, force: true })
})

describe('새 글 생성', () => {
  it('사용하지 않은 slug로 새 초안을 생성한다', () => {
    createPostFile(directory, slug, draft)
    const content = fs.readFileSync(path.join(directory, 'existing-post.md'), 'utf8')
    expect(content).toBe(draft)
  })

  it.each(['existing-post.md', 'existing-post/index.md'])(
    '기존 %s의 내용을 보존하고 중복 slug를 거부한다',
    (relativePath) => {
      const existing = path.join(directory, relativePath)
      fs.mkdirSync(path.dirname(existing), { recursive: true })
      fs.writeFileSync(existing, 'original post')

      expect(() => createPostFile(directory, slug, draft)).toThrow('이미 사용 중인 slug')
      expect(fs.readFileSync(existing, 'utf8')).toBe('original post')
      if (relativePath.endsWith('/index.md')) {
        expect(fs.existsSync(path.join(directory, 'existing-post.md'))).toBe(false)
      }
    }
  )

  it('존재 확인을 통과해도 이미 생성된 파일을 덮어쓰지 않는다', () => {
    const existing = path.join(directory, 'existing-post.md')
    fs.writeFileSync(existing, 'original post')
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)

    expect(() => createPostFile(directory, slug, draft)).toThrow(/EEXIST/)
    expect(fs.readFileSync(existing, 'utf8')).toBe('original post')
  })
})
