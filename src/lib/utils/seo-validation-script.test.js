import { join } from 'path'

import { describe, expect, it } from 'vitest'

import {
  parseSitemapUrls,
  toRoutePath,
  validateXmlStructure
} from '../../../scripts/seo-validation.js'

describe('SEO validation script helpers', () => {
  it('only treats the prerender root index file as the homepage', () => {
    const pagesDirectory = join(process.cwd(), '.svelte-kit/output/prerendered/pages')

    expect(toRoutePath(join(pagesDirectory, 'index.html'))).toBe('/')
    expect(toRoutePath(join(pagesDirectory, 'docs/index.html'))).toBe('/docs/index')
    expect(toRoutePath(join(pagesDirectory, 'tags/%ED%95%9C%EA%B5%AD%EC%96%B4.html'))).toBe(
      '/tags/%ED%95%9C%EA%B5%AD%EC%96%B4'
    )
  })

  it('rejects malformed or multiple XML roots', () => {
    const validIssues = []
    validateXmlStructure(
      '<?xml version="1.0" encoding="UTF-8"?><urlset><url><loc>https://example.com/</loc></url></urlset>',
      validIssues
    )
    expect(validIssues).toEqual([])

    const extraClosingIssues = []
    validateXmlStructure('<urlset><url /></urlset></urlset>', extraClosingIssues)
    expect(extraClosingIssues).toContain('Sitemap XML has an unexpected closing urlset element')

    const multipleRootIssues = []
    validateXmlStructure('<urlset></urlset><urlset></urlset>', multipleRootIssues)
    expect(multipleRootIssues).toContain('Sitemap XML must contain exactly one urlset root element')
  })

  it('requires the XML declaration first and decodes entities once', () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://blog.nanggo.net/a&#x2F;b</loc></url>
        <url><loc>https://blog.nanggo.net/a&amp;lt;b</loc></url>
      </urlset>`

    const issues = []
    expect(parseSitemapUrls(sitemap, issues)).toEqual([
      'https://blog.nanggo.net/a/b',
      'https://blog.nanggo.net/a&lt;b'
    ])
    expect(issues).toEqual([])

    const leadingWhitespaceIssues = []
    parseSitemapUrls(` ${sitemap}`, leadingWhitespaceIssues)
    expect(leadingWhitespaceIssues).toContain(
      'Missing or invalid XML declaration at the start of the file'
    )
  })
})
