// .github/scripts/create-seo-issue.js
module.exports = async ({ github, context }) => {
  const fs = require('fs')
  const path = require('path')

  try {
    const reportsDir = '.seo-reports'
    if (!fs.existsSync(reportsDir)) {
      console.log('SEO 리포트 디렉토리를 찾을 수 없습니다.')
      return
    }

    const files = fs
      .readdirSync(reportsDir)
      .filter((file) => file.startsWith('seo-report-') && file.endsWith('.json'))
      .map((file) => path.join(reportsDir, file))

    if (files.length === 0) {
      console.log('SEO 리포트를 찾을 수 없습니다.')
      return
    }

    files.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)
    const latestReport = files[0]
    const data = JSON.parse(fs.readFileSync(latestReport, 'utf8'))
    const { summary } = data

    const environment =
      context.eventName === 'workflow_dispatch'
        ? process.env.ENVIRONMENT_INPUT
        : context.payload.deployment_status?.environment || 'production'
    const deploymentUrl = context.payload.deployment_status?.target_url || 'https://blog.nanggo.net'

    const { data: issues } = await github.rest.issues.listForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open',
      labels: 'seo,post-deployment',
      per_page: 1
    })

    if (issues.length > 0) {
      const existingIssue = issues[0]
      const updateComment = `## 🔄 배포 후 SEO 상태 업데이트 - ${new Date().toISOString().split('T')[0]}
      
      **환경**: ${environment}  
      **배포 URL**: ${deploymentUrl}
      
      | 항목 | 값 |
      |--------|-------|
      | 전체 페이지 | ${summary.totalPages} |
      | 유효한 페이지 | ${summary.validPages} |
      | 총 오류 | ${summary.totalErrors} |
      | 총 경고 | ${summary.totalWarnings} |
      | robots.txt | ${summary.robotsTxtValid ? '✅ 유효' : '❌ 비유효'} |
      | sitemap.xml | ${summary.sitemapXmlValid ? '✅ 유효' : '❌ 비유효'} |
      
      📁 **최신 리포트**: 워크플로우 아티팩트에서 [여기](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})를 확인하세요
      
      <sub>배포 후 SEO 검증에 의해 자동 생성됨</sub>`

      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: existingIssue.number,
        body: updateComment
      })
      return
    }

    let issueBody = `## 🚨 배포 후 SEO 문제 발견
    
    **${environment}** 환경 배포 후 SEO 검증에서 문제가 발견되었습니다.
    
    **배포 URL**: ${deploymentUrl}
    
    ### 📊 요약
    
    | 항목 | 값 |
    |--------|-------|
    | 전체 페이지 | ${summary.totalPages} |
    | 유효한 페이지 | ${summary.validPages} |
    | 총 오류 | **${summary.totalErrors}** |
    | 총 경고 | ${summary.totalWarnings} |
    | robots.txt | ${summary.robotsTxtValid ? '✅ 유효' : '❌ 비유효'} |
    | sitemap.xml | ${summary.sitemapXmlValid ? '✅ 유효' : '❌ 비유효'} |
    
    ### 🔍 페이지별 문제
    `

    data.pageResults.forEach((page) => {
      if (page.issues.length > 0) {
        issueBody += `\n**${page.pageName}:**\n`
        const errors = page.issues.filter((i) => i.severity === 'error')
        const warnings = page.issues.filter((i) => i.severity === 'warning')

        errors.forEach((error) => {
          issueBody += `- ❌ **${error.type.replace(/_/g, ' ').toUpperCase()}**: ${error.tag} - ${error.message}\n`
        })

        warnings.forEach((warning) => {
          issueBody += `- ⚠️ **${warning.type.replace(/_/g, ' ').toUpperCase()}**: ${warning.tag} - ${warning.message}\n`
        })
      }
    })

    issueBody += `
    
    ### 🛠 조치 필요
    
    1. [워크플로우 아티팩트](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})에서 상세 SEO 리포트를 검토하세요
    2. 소스 코드에서 확인된 SEO 문제를 수정하세요
    3. \`pnpm seo:validate\`를 사용하여 로컬에서 테스트하세요
    4. 수정 사항을 배포하여 문제를 해결하세요
    
    ---
    
    <sub>이 이슈는 ${new Date().toISOString()}에 배포 후 SEO 검증에 의해 자동으로 생성되었습니다</sub>`

    const issue = await github.rest.issues.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: `🚨 배포 후 SEO 문제 - ${summary.totalErrors}개의 오류 발견`,
      body: issueBody,
      labels: ['seo', 'post-deployment', 'bug']
    })

    console.log(`배포 후 SEO 이슈 생성됨: ${issue.data.html_url}`)
  } catch (error) {
    console.error('SEO 이슈 생성 중 오류 발생:', error)
  }
}
