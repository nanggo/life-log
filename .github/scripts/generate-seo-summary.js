// .github/scripts/generate-seo-summary.js
module.exports = async ({ core }) => {
  const fs = require('fs')
  const path = require('path')

  try {
    const reportsDir = '.seo-reports'
    let triggerInfo = ''
    if (process.env.EVENT_NAME === 'workflow_dispatch') {
      triggerInfo = `🔧 **수동 실행** - 환경: ${process.env.ENVIRONMENT_INPUT || 'production'}`
      if (process.env.VALIDATE_ALL_INPUT === 'true') {
        triggerInfo += ', 모든 페이지 강제 검증'
      }
      triggerInfo += '\n\n'
    }

    if (!fs.existsSync(reportsDir) || fs.readdirSync(reportsDir).length === 0) {
      core.summary.addRaw(`${triggerInfo}❌ SEO 리포트를 찾을 수 없습니다.`)
      await core.summary.write()
      return
    }

    const files = fs
      .readdirSync(reportsDir)
      .filter((file) => file.startsWith('seo-report-') && file.endsWith('.json'))
      .map((file) => path.join(reportsDir, file))

    if (files.length === 0) {
      core.summary.addRaw(`${triggerInfo}❌ SEO 리포트를 찾을 수 없습니다.`)
      await core.summary.write()
      return
    }

    files.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)
    const latestReport = files[0]
    const data = JSON.parse(fs.readFileSync(latestReport, 'utf8'))
    const { summary } = data

    const statusText =
      summary.totalErrors === 0
        ? '✅ **SEO 검증 통과!**'
        : `❌ **SEO 검증 실패** - ${summary.totalErrors}개의 오류 발견`

    core.summary
      .addRaw(triggerInfo)
      .addHeading('📊 SEO 검증 결과', 2)
      .addTable([
        [
          { data: '항목', header: true },
          { data: '값', header: true }
        ],
        ['전체 페이지', summary.totalPages.toString()],
        ['유효한 페이지', summary.validPages.toString()],
        ['총 오류', summary.totalErrors.toString()],
        ['총 경고', summary.totalWarnings.toString()],
        ['robots.txt', summary.robotsTxtValid ? '✅ 유효' : '❌ 비유효'],
        ['sitemap.xml', summary.sitemapXmlValid ? '✅ 유효' : '❌ 비유효']
      ])
      .addHeading('🎯 검증 상태', 3)
      .addRaw(statusText)
      .addHeading('📁 아티팩트', 3)
      .addRaw('- SEO 리포트가 아티팩트로 업로드되어 다운로드할 수 있습니다.')
      .addRaw('- 리포트에는 상세한 HTML 및 JSON 형식이 포함됩니다.')

    await core.summary.write()
  } catch (error) {
    console.error('SEO 요약 생성 중 오류 발생:', error)
    core.summary.addRaw('❌ SEO 요약 생성 중 오류가 발생했습니다. 로그를 확인하세요.')
    await core.summary.write()
  }
}
