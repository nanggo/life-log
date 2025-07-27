// .github/scripts/comment-pr-with-seo-results.js
module.exports = async ({ github, context }) => {
  const fs = require('fs')
  const path = require('path')

  try {
    const reportsDir = '.seo-reports'
    if (!fs.existsSync(reportsDir)) {
      await github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '❌ **SEO 검증 실패** - 리포트 디렉토리를 찾을 수 없습니다. 워크플로우 로그를 확인하세요.'
      })
      return
    }

    const files = fs
      .readdirSync(reportsDir)
      .filter((file) => file.startsWith('seo-report-') && file.endsWith('.json'))
      .map((file) => path.join(reportsDir, file))

    if (files.length === 0) {
      await github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '❌ **SEO 검증 실패** - 리포트가 생성되지 않았습니다. 워크플로우 로그를 확인하세요.'
      })
      return
    }

    files.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)
    const latestReport = files[0]
    const data = JSON.parse(fs.readFileSync(latestReport, 'utf8'))
    const { summary } = data

    const statusIcon = summary.totalErrors === 0 ? '✅' : '❌'
    const statusText = summary.totalErrors === 0 ? '통과' : '실패'

    let issueDetails = ''
    if (summary.totalErrors > 0 || summary.totalWarnings > 0) {
      issueDetails = '\n\n### 🔍 발견된 문제\n'
      data.pageResults.forEach((page) => {
        if (page.issues.length > 0) {
          issueDetails += `\n**${page.pageName}:**\n`
          const errors = page.issues.filter((i) => i.severity === 'error')
          const warnings = page.issues.filter((i) => i.severity === 'warning')
          if (errors.length > 0) {
            issueDetails += `- ❌ ${errors.length}개의 오류\n`
          }
          if (warnings.length > 0) {
            issueDetails += `- ⚠️ ${warnings.length}개의 경고\n`
          }
        }
      })
    }

    const comment = `## ${statusIcon} SEO 검증 ${statusText}
    
| 항목 | 값 |
|--------|-------|
| 전체 페이지 | ${summary.totalPages} |
| 유효한 페이지 | ${summary.validPages} |
| 총 오류 | ${summary.totalErrors} |
| 총 경고 | ${summary.totalWarnings} |
| robots.txt | ${summary.robotsTxtValid ? '✅ 유효' : '❌ 비유효'} |
| sitemap.xml | ${summary.sitemapXmlValid ? '✅ 유효' : '❌ 비유효'} |
${issueDetails}

📁 **상세 리포트**는 워크플로우 아티팩트에서 확인할 수 있습니다.

<sub>SEO 검증 워크플로우에 의해 생성됨 - 실행 #${process.env.RUN_NUMBER}</sub>`

    await github.rest.issues.createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: comment
    })
  } catch (error) {
    console.error('PR 코멘트 생성 중 오류 발생:', error)
    await github.rest.issues.createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: '❌ **SEO 검증 오류** - 결과 처리 실패. 워크플로우 로그를 확인하세요.'
    })
  }
}
