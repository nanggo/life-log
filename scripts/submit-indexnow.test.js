import { describe, expect, it } from 'vitest'

import { normalizeChangedUrls, parseArguments, readPublicKey } from './submit-indexnow.js'

describe('IndexNow CLI input validation', () => {
  it('accepts same-host URLs and absolute paths, then removes duplicates', () => {
    expect(
      normalizeChangedUrls([
        '/post/example',
        'https://blog.nanggo.net/post/example',
        'https://blog.nanggo.net/posts'
      ])
    ).toEqual(['https://blog.nanggo.net/post/example', 'https://blog.nanggo.net/posts'])
  })

  it('rejects other hosts and non-canonical URL variants', () => {
    expect(() => normalizeChangedUrls(['https://example.com/post/example'])).toThrow(
      'production host'
    )
    expect(() => normalizeChangedUrls(['/post/example?preview=true'])).toThrow('query string')
    expect(() => normalizeChangedUrls(['/post/example#section'])).toThrow('fragment')
    expect(() => normalizeChangedUrls(['/post/example/'])).toThrow('trailing slash')
    expect(() => normalizeChangedUrls(['/post/example%zz'])).toThrow('percent encoding')
  })

  it('requires an explicit public key file and at least one URL', () => {
    expect(() => parseArguments(['/post/example'])).toThrow('--key-file is required')
    expect(() => parseArguments(['--key-file', 'static/key.txt'])).toThrow(
      'At least one changed URL'
    )
  })

  it('accepts the pnpm argument separator', () => {
    expect(
      parseArguments(['--', '--dry-run', '--key-file', 'static/key.txt', '/post/example'])
    ).toMatchObject({
      dryRun: true,
      keyFile: 'static/key.txt',
      urls: ['/post/example']
    })
  })

  it('keeps the public key at the site root', async () => {
    await expect(readPublicKey('static/nested/key.txt')).rejects.toThrow('directly under static/')
  })
})
