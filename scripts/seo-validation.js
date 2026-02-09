#!/usr/bin/env node

/**
 * SEO Validation and Monitoring Script
 *
 * This script validates SEO elements of the blog including:
 * - Meta tag duplicates detection
 * - Canonical URL validation
 * - Basic HTML structure validation
 * - Report generation
 *
 * Uses only built-in Node.js APIs and existing project dependencies
 */

import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

import { parse } from 'node-html-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const reportsDir = join(projectRoot, '.seo-reports')
const buildDir = join(projectRoot, '.svelte-kit/output')

// Ensure reports directory exists
if (!existsSync(reportsDir)) {
  mkdirSync(reportsDir, { recursive: true })
}

/**
 * Recursively collect prerendered HTML files.
 */
function collectPrerenderedHtmlFiles(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const htmlFiles = []

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      htmlFiles.push(...collectPrerenderedHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(fullPath)
    }
  }

  return htmlFiles
}

/**
 * Convert a prerendered HTML file path to a route path.
 */
function toRoutePathFromBuiltFile(filePath) {
  const pagesDir = join(buildDir, 'prerendered/pages')
  const rel = relative(pagesDir, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\.html$/, '')}`
}

/**
 * Discover testable pages from build output (after build).
 * Falls back to minimal static choices if build output is unavailable.
 */
function discoverTestPages() {
  const defaults = [
    { path: '/', name: 'Homepage' },
    { path: '/about', name: 'About Page' },
    { path: '/posts', name: 'Posts Listing' }
  ]

  try {
    const pagesDir = join(buildDir, 'prerendered/pages')
    if (!existsSync(pagesDir)) {
      return defaults
    }

    const htmlFiles = collectPrerenderedHtmlFiles(pagesDir)
    if (htmlFiles.length === 0) {
      return defaults
    }

    return htmlFiles
      .map((filePath) => {
        const path = toRoutePathFromBuiltFile(filePath)
        const name = path === '/' ? 'Homepage' : path === '/about' ? 'About Page' : `Page ${path}`
        return { path, name, filePath }
      })
      .sort((a, b) => a.path.localeCompare(b.path))
  } catch (_e) {
    // ignore and fall back to defaults
    return defaults
  }
}

/**
 * Configuration for SEO validation
 */
const config = {
  productionDomain: 'https://blog.nanggo.net',
  metaTagsToCheck: [
    'title',
    'description',
    'og:title',
    'og:description',
    'og:url',
    'og:image',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'canonical'
  ],
  requiredStructuralTags: ['title', 'description', 'canonical'],
  // Some meta tags are intentionally repeatable by spec/content model.
  allowDuplicateMetaTags: ['article:tag']
  // Pages to test are discovered after build to match prerendered output
}

/**
 * Utility function to log with timestamp
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

/**
 * Build the project for analysis
 */
function buildProject() {
  log('Building project for SEO analysis...')
  try {
    execSync('pnpm build', { cwd: projectRoot, stdio: 'inherit' })
    log('Project built successfully')
    return true
  } catch (error) {
    log(`Failed to build project: ${error.message}`, 'error')
    return false
  }
}

/**
 * Extract meta tags from HTML content
 */
function extractMetaTags(htmlContent) {
  const root = parse(htmlContent)
  const metaTags = {}
  const duplicates = {}

  // Get title
  const title = root.querySelector('title')
  if (title) {
    metaTags.title = title.text.trim()
  }

  // Get meta tags
  const metas = root.querySelectorAll('meta')
  metas.forEach((meta) => {
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    const content = meta.getAttribute('content')
    if (name && content) {
      if (metaTags[name]) {
        // Duplicate found
        if (!duplicates[name]) {
          duplicates[name] = [metaTags[name]]
        }
        duplicates[name].push(content)
        metaTags[name] = content // Use last occurrence
      } else {
        metaTags[name] = content
      }
    }
  })

  // Get canonical URL
  const canonical = root.querySelector('link[rel="canonical"]')
  if (canonical) {
    metaTags.canonical = canonical.getAttribute('href')
  }

  return { metaTags, duplicates }
}

/**
 * Validate SEO elements for a specific page
 */
function validatePageSEO(htmlContent, pageName) {
  const { metaTags, duplicates } = extractMetaTags(htmlContent)
  const issues = []

  // Check for duplicates
  Object.entries(duplicates).forEach(([key, values]) => {
    if (config.allowDuplicateMetaTags.includes(key)) {
      return
    }

    issues.push({
      type: 'duplicate',
      tag: key,
      values,
      severity: 'error',
      message: `Found ${values.length} duplicate ${key} tags`
    })
  })

  // Check for missing essential tags
  config.requiredStructuralTags.forEach((tag) => {
    if (!metaTags[tag]) {
      issues.push({
        type: 'missing',
        tag,
        severity: 'error',
        message: `Missing required ${tag} tag`
      })
    }
  })

  // Check for missing recommended tags
  config.metaTagsToCheck.forEach((tag) => {
    if (!metaTags[tag] && !config.requiredStructuralTags.includes(tag)) {
      issues.push({
        type: 'missing',
        tag,
        severity: 'warning',
        message: `Missing recommended ${tag} tag`
      })
    }
  })

  // Validate canonical URL
  if (metaTags.canonical) {
    try {
      new URL(metaTags.canonical)
      if (!metaTags.canonical.startsWith(config.productionDomain)) {
        issues.push({
          type: 'canonical_domain',
          tag: 'canonical',
          value: metaTags.canonical,
          severity: 'warning',
          message: 'Canonical URL should use production domain'
        })
      }
    } catch (_error) {
      issues.push({
        type: 'canonical_invalid',
        tag: 'canonical',
        value: metaTags.canonical,
        severity: 'error',
        message: 'Invalid canonical URL format'
      })
    }
  }

  // Validate title length
  if (metaTags.title) {
    if (metaTags.title.length > 60) {
      issues.push({
        type: 'title_too_long',
        tag: 'title',
        value: metaTags.title,
        severity: 'warning',
        message: `Title is ${metaTags.title.length} characters (recommended: 50-60)`
      })
    }
  }

  // Validate description length
  if (metaTags.description) {
    if (metaTags.description.length > 160) {
      issues.push({
        type: 'description_too_long',
        tag: 'description',
        value: metaTags.description,
        severity: 'warning',
        message: `Description is ${metaTags.description.length} characters (recommended: 150-160)`
      })
    } else if (metaTags.description.length < 120) {
      issues.push({
        type: 'description_too_short',
        tag: 'description',
        value: metaTags.description,
        severity: 'warning',
        message: `Description is ${metaTags.description.length} characters (recommended: 150-160)`
      })
    }
  }

  return {
    pageName,
    metaTags,
    duplicates,
    issues,
    isValid: issues.filter((i) => i.severity === 'error').length === 0
  }
}

/**
 * Analyze robots.txt and sitemap.xml files
 */
function validateSEOFiles() {
  const results = {
    robotsTxt: { exists: false, valid: false, issues: [] },
    sitemapXml: { exists: false, valid: false, issues: [] }
  }

  // Check robots.txt
  try {
    const robotsPath = join(projectRoot, 'static/robots.txt')
    if (existsSync(robotsPath)) {
      results.robotsTxt.exists = true
      const robotsContent = readFileSync(robotsPath, 'utf-8')

      // Basic validation
      if (robotsContent.includes('User-agent:')) {
        results.robotsTxt.valid = true
      } else {
        results.robotsTxt.issues.push('Missing User-agent directive')
      }

      if (!robotsContent.includes('Sitemap:')) {
        results.robotsTxt.issues.push('Missing Sitemap directive')
      }
    } else {
      results.robotsTxt.issues.push('robots.txt file not found')
    }
  } catch (error) {
    results.robotsTxt.issues.push(`Error reading robots.txt: ${error.message}`)
  }

  // Check sitemap generation (by checking actual generated file)
  try {
    const sitemapRoutePath = join(projectRoot, 'src/routes/sitemap.xml/+server.js')
    const prerenderedSitemapPath = join(buildDir, 'prerendered/pages/sitemap.xml')

    if (!existsSync(sitemapRoutePath)) {
      results.sitemapXml.issues.push('Sitemap route not found')
    } else {
      results.sitemapXml.exists = true

      // Check if the actual sitemap.xml file was generated
      if (existsSync(prerenderedSitemapPath)) {
        try {
          // Basic validation: read and check if it's valid XML
          const sitemapContent = readFileSync(prerenderedSitemapPath, 'utf-8')
          if (sitemapContent.includes('<urlset') && sitemapContent.includes('<url>')) {
            results.sitemapXml.valid = true
          } else {
            results.sitemapXml.valid = false
            results.sitemapXml.issues.push('Generated sitemap.xml appears to be invalid')
          }
        } catch (readError) {
          results.sitemapXml.valid = false
          results.sitemapXml.issues.push(`Error reading generated sitemap: ${readError.message}`)
        }
      } else {
        results.sitemapXml.valid = false
        results.sitemapXml.issues.push('Sitemap route exists but sitemap.xml was not generated')
      }
    }
  } catch (error) {
    results.sitemapXml.issues.push(`Error checking sitemap: ${error.message}`)
  }

  return results
}

/**
 * Generate comprehensive SEO report
 */
function generateReport(pageResults, seoFiles) {
  const timestamp = new Date().toISOString()
  const reportData = {
    timestamp,
    summary: {
      totalPages: pageResults.length,
      validPages: pageResults.filter((r) => r.isValid).length,
      totalIssues: pageResults.reduce((sum, r) => sum + r.issues.length, 0),
      totalErrors: pageResults.reduce(
        (sum, r) => sum + r.issues.filter((i) => i.severity === 'error').length,
        0
      ),
      totalWarnings: pageResults.reduce(
        (sum, r) => sum + r.issues.filter((i) => i.severity === 'warning').length,
        0
      ),
      robotsTxtValid: seoFiles.robotsTxt.valid,
      sitemapXmlValid: seoFiles.sitemapXml.valid
    },
    pageResults,
    seoFiles
  }

  // Generate HTML report
  const reportTimestamp = Date.now()
  const htmlReport = generateHTMLReport(reportData)
  const htmlPath = join(reportsDir, `seo-report-${reportTimestamp}.html`)
  writeFileSync(htmlPath, htmlReport)

  // Generate JSON report
  const jsonPath = join(reportsDir, `seo-report-${reportTimestamp}.json`)
  writeFileSync(jsonPath, JSON.stringify(reportData, null, 2))

  log(`Reports generated:`)
  log(`  HTML: ${htmlPath}`)
  log(`  JSON: ${jsonPath}`)

  return reportData
}

/**
 * Generate HTML report
 */
function generateHTMLReport(data) {
  const { summary, pageResults, seoFiles } = data

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Validation Report - ${new Date(data.timestamp).toLocaleDateString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; line-height: 1.6; color: #24292f; }
    .header { border-bottom: 2px solid #e1e5e9; padding-bottom: 20px; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric { background: #f6f8fa; padding: 20px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 2rem; font-weight: bold; color: #0969da; }
    .metric-label { color: #656d76; font-size: 0.9rem; }
    .page-result { border: 1px solid #d1d9e0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
    .page-header { background: #f6f8fa; padding: 15px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
    .page-content { padding: 15px; }
    .issue { padding: 10px; margin: 5px 0; border-radius: 4px; }
    .issue.error { background: #fff2f2; border-left: 4px solid #da3633; }
    .issue.warning { background: #fff8e6; border-left: 4px solid #bf8700; }
    .issue.success { background: #f0fff4; border-left: 4px solid #1a7f37; }
    .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem; }
    .status.valid { background: #dcfce7; color: #166534; }
    .status.invalid { background: #fee2e2; color: #dc2626; }
    .meta-tags { font-family: 'SF Mono', Monaco, monospace; font-size: 0.9rem; background: #f6f8fa; padding: 10px; border-radius: 4px; overflow-x: auto; margin: 10px 0; }
    .seo-files { margin-bottom: 30px; }
    .seo-file { background: #f6f8fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SEO Validation Report</h1>
    <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="metric">
      <div class="metric-value">${summary.totalPages}</div>
      <div class="metric-label">Total Pages</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary.validPages}</div>
      <div class="metric-label">Valid Pages</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary.totalErrors}</div>
      <div class="metric-label">Total Errors</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary.totalWarnings}</div>
      <div class="metric-label">Total Warnings</div>
    </div>
  </div>
  
  <div class="seo-files">
    <h2>SEO Files Validation</h2>
    <div class="seo-file">
      <h4>robots.txt <span class="status ${seoFiles.robotsTxt.valid ? 'valid' : 'invalid'}">${seoFiles.robotsTxt.valid ? 'Valid' : 'Invalid'}</span></h4>
      ${seoFiles.robotsTxt.issues.length > 0 ? seoFiles.robotsTxt.issues.map((issue) => `<div class="issue error">❌ ${issue}</div>`).join('') : '<div class="issue success">✅ No issues found</div>'}
    </div>
    <div class="seo-file">
      <h4>sitemap.xml <span class="status ${seoFiles.sitemapXml.valid ? 'valid' : 'invalid'}">${seoFiles.sitemapXml.valid ? 'Valid' : 'Invalid'}</span></h4>
      ${seoFiles.sitemapXml.issues.length > 0 ? seoFiles.sitemapXml.issues.map((issue) => `<div class="issue error">❌ ${issue}</div>`).join('') : '<div class="issue success">✅ No issues found</div>'}
    </div>
  </div>
  
  <h2>Page Results</h2>
  ${pageResults
    .map(
      (result) => `
    <div class="page-result">
      <div class="page-header">
        <span>${result.pageName}</span>
        <span class="status ${result.isValid ? 'valid' : 'invalid'}">${result.isValid ? 'Valid' : 'Invalid'}</span>
      </div>
      <div class="page-content">
        ${
          result.issues.length === 0
            ? '<div class="issue success">✅ No SEO issues found</div>'
            : result.issues
                .map(
                  (issue) => `
            <div class="issue ${issue.severity}">
              <strong>${issue.type.replace(/_/g, ' ').toUpperCase()}</strong>: ${issue.tag}
              ${issue.message ? ` - ${issue.message}` : ''}
              ${issue.values ? ` (Values: ${issue.values.join(', ')})` : ''}
              ${issue.value ? ` (Value: ${issue.value.substring(0, 100)}${issue.value.length > 100 ? '...' : ''})` : ''}
            </div>
          `
                )
                .join('')
        }
        
        ${
          Object.keys(result.metaTags).length > 0
            ? `
          <h4>Found Meta Tags</h4>
          <div class="meta-tags">${Object.entries(result.metaTags)
            .map(([key, value]) => `${key}: ${value}`)
            .join('<br>')}</div>
        `
            : ''
        }
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>
  `.trim()
}

/**
 * Get built HTML content for a page
 */
function getBuiltPageHTML(pagePath) {
  // Dynamically determine the file path from the route.
  // This assumes a standard SvelteKit prerendering output structure.
  const builtFile =
    pagePath === '/' ? 'prerendered/pages/index.html' : `prerendered/pages${pagePath}.html`

  const fullPath = join(buildDir, builtFile)
  if (!existsSync(fullPath)) {
    log(`Built file not found at ${fullPath}`, 'warn')
    return null
  }

  try {
    return readFileSync(fullPath, 'utf-8')
  } catch (error) {
    log(`Error reading built file ${fullPath}: ${error.message}`, 'error')
    return null
  }
}

/**
 * Main execution function
 */
async function main() {
  log('🚀 Starting SEO Validation and Monitoring')

  try {
    // Build the project first
    if (!buildProject()) {
      throw new Error('Failed to build project')
    }

    const pageResults = []

    // Determine pages to test from build output
    const pagesToTest = discoverTestPages()

    // Test each discovered page
    for (const { path, name, filePath } of pagesToTest) {
      log(`Validating page: ${name} (${path})`)

      const htmlContent =
        filePath && existsSync(filePath) ? readFileSync(filePath, 'utf-8') : getBuiltPageHTML(path)
      if (!htmlContent) {
        log(`  ⚠️  Could not read built HTML for ${path}`, 'warn')
        pageResults.push({
          pageName: name,
          metaTags: {},
          duplicates: {},
          issues: [
            {
              type: 'build_error',
              tag: 'html',
              severity: 'error',
              message: 'Could not read built HTML file'
            }
          ],
          isValid: false
        })
        continue
      }

      const result = validatePageSEO(htmlContent, name)
      pageResults.push(result)

      log(`  ${result.isValid ? '✅' : '❌'} ${result.issues.length} issues found`)
    }

    // Validate SEO files
    log('Validating SEO files...')
    const seoFiles = validateSEOFiles()

    // Generate report
    log('📊 Generating SEO report...')
    const report = generateReport(pageResults, seoFiles)

    // Summary
    log('✅ SEO Validation Complete!')
    log(`📈 Summary:`)
    log(`   Total Pages: ${report.summary.totalPages}`)
    log(`   Valid Pages: ${report.summary.validPages}`)
    log(`   Total Errors: ${report.summary.totalErrors}`)
    log(`   Total Warnings: ${report.summary.totalWarnings}`)
    log(`   robots.txt Valid: ${report.summary.robotsTxtValid}`)
    log(`   sitemap.xml Valid: ${report.summary.sitemapXmlValid}`)

    // Exit with error code if validation failed
    const hasErrors =
      report.summary.totalErrors > 0 ||
      !report.summary.robotsTxtValid ||
      !report.summary.sitemapXmlValid

    if (hasErrors) {
      log('❌ SEO validation failed - check the report for details', 'error')
      process.exit(1)
    } else {
      log('✅ All SEO validations passed!')
      process.exit(0)
    }
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
  main().catch((error) => {
    log(`Unhandled error: ${error.message}`, 'error')
    process.exit(1)
  })
}

export { main, validatePageSEO, validateSEOFiles, generateReport }
