// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { build, createServer } from 'vite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import postLoaders, { toModuleStringLiteral } from './post-loaders.js'

let root
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'life-log-post-loaders-'))
  fs.mkdirSync(path.join(root, 'posts/nested'), { recursive: true })
  fs.writeFileSync(path.join(root, 'main.js'), "export { default } from 'virtual:post-loaders'")
  fs.writeFileSync(path.join(root, 'posts/public.md'), '---\ndraft: false\n---\nPUBLIC_BODY')
  fs.writeFileSync(path.join(root, 'posts/nested/index.md'), '---\ntitle: Nested\n---\nNESTED_BODY')
  fs.writeFileSync(path.join(root, 'posts/draft.md'), '---\ndraft: true\n---\nPRIVATE_DRAFT_BODY')
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('post loader import graph', () => {
  it('생성 코드에서 특수문자를 이스케이프하고 원래 파일 경로를 보존한다', () => {
    const filename = '/posts/"한글"</script>\\name\n\u2028\u2029.md'
    const literal = toModuleStringLiteral(filename)

    expect(literal).not.toMatch(/[<>\u2028\u2029]/)
    expect(JSON.parse(literal)).toBe(filename)
  })

  it('프로덕션 JS와 소스맵에서 초안을 제외하고 공개 글의 지연 로딩을 유지한다', async () => {
    const result = await build({
      root,
      configFile: false,
      publicDir: false,
      logLevel: 'silent',
      plugins: [
        postLoaders(),
        {
          name: 'markdown-fixture',
          transform(code, id) {
            if (id.endsWith('.md')) return `export default ${JSON.stringify(code)}`
          }
        }
      ],
      build: {
        write: false,
        sourcemap: true,
        minify: false,
        lib: { entry: path.join(root, 'main.js'), formats: ['es'] }
      }
    })

    const output = (Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output)
    const serialized = JSON.stringify(output)
    expect(serialized).not.toContain('PRIVATE_DRAFT_BODY')
    expect(serialized).not.toContain('/posts/draft.md')
    expect(serialized).toContain('PUBLIC_BODY')
    expect(serialized).toContain('NESTED_BODY')
    const entry = output.find((item) => item.type === 'chunk' && item.isEntry)
    expect(entry.dynamicImports).toHaveLength(2)
  })

  it('개발 모드에서는 Vite glob이 초안과 공개 글을 모두 로드한다', async () => {
    const server = await createServer({
      root,
      configFile: false,
      publicDir: false,
      logLevel: 'silent',
      plugins: [postLoaders()],
      server: { middlewareMode: true }
    })
    try {
      const result = await server.transformRequest('virtual:post-loaders')
      expect(result.code).toContain('/posts/draft.md')
      expect(result.code).toContain('/posts/public.md')
      expect(result.code).toContain('/posts/nested/index.md')
      expect(result.code).not.toContain('import.meta.glob')
    } finally {
      await server.close()
    }
  })
})
