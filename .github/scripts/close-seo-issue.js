// .github/scripts/close-seo-issue.js
module.exports = async ({ github, context }) => {
  try {
    const { data: issues } = await github.rest.issues.listForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open',
      labels: 'seo,post-deployment'
    })

    if (issues.length > 0) {
      for (const issue of issues) {
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          body: `## ✅ SEO 문제 해결됨
          
          배포 후 SEO 검증을 통과했습니다! 확인된 모든 문제가 해결되었습니다.
          
          🎉 이제 모든 페이지가 SEO 검증을 통과합니다.
          
          이슈를 자동으로 닫습니다.
          
          <sub>${new Date().toISOString()}에 배포 후 SEO 검증에 의해 자동으로 해결됨</sub>`
        })

        await github.rest.issues.update({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          state: 'closed'
        })

        console.log(`배포 후 SEO 이슈 #${issue.number}를 닫았습니다.`)
      }
    }
  } catch (error) {
    console.error('SEO 이슈를 닫는 중 오류 발생:', error)
  }
}
