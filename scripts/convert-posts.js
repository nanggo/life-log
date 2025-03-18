import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 영문 제목을 한글로 변환하는 매핑
const titleMapping = {
  'Why I Became Developer': '개발자가 된 이유',
  'Work Life Balance': '일과 삶의 균형',
  'Type Unknown Error at React Query': 'React Query에서 발생하는 Type Unknown 에러',
  'Understanding HTML Input Accept Attribute': 'HTML Input Accept 속성 이해하기',
  'Updating and Running Docker Compose Services': 'Docker Compose 서비스 업데이트 및 실행하기',
  'Validatedomnesting Error at React MUI': 'React MUI에서 발생하는 Validatedomnesting 에러',
  'Weight of Guarantee': '보증의 무게',
  'Recent Status': '최근 근황',
  'Resilience After Failure': '실패 후의 회복력',
  'Resolve AWS ECR CannotPullContainerError': 'AWS ECR CannotPullContainerError 해결하기',
  'Self Esteem': '자존감',
  'Setting Up Alias in Docker Compose': 'Docker Compose에서 Alias 설정하기',
  'Street Coder': '거리의 코더',
  Inertia: '관성',
  'Migrating from Google Domains to Cloudflare': 'Google Domains에서 Cloudflare로 이전하기',
  'New Beginning': '새로운 시작',
  'One Year Freelancer Retrospective': '프리랜서 1년 회고',
  Perfectionism: '완벽주의',
  Playwright: 'Playwright',
  'Dark Pattern': '다크 패턴',
  'Deep Copy': '깊은 복사',
  'Freelancer Life Retrospective': '프리랜서 생활 회고',
  'Gatsby Vercel Audience Analytics Setup': 'Gatsby Vercel Audience Analytics 설정하기',
  'Hide Mac Dock Bar': 'Mac Dock 바 숨기기',
  'As Long as Its Not Me': '내가 아니기만 하면',
  'Controlled and Uncontrolled Component': '제어 컴포넌트와 비제어 컴포넌트'
}

function convertPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.basename(filePath, '.md')

  // frontmatter 추출
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return

  const frontmatter = frontmatterMatch[1]
  const frontmatterLines = frontmatter.split('\n')

  // title 찾기
  const titleLine = frontmatterLines.find((line) => line.startsWith('title:'))
  if (!titleLine) return

  const currentTitle = titleLine
    .replace('title:', '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
  const newTitle = titleMapping[currentTitle] || currentTitle

  // 새로운 frontmatter 생성
  let newFrontmatter = frontmatterLines
    .map((line) => {
      if (line.startsWith('title:')) {
        return `title: "${newTitle}"`
      }
      return line
    })
    .join('\n')

  // slug 추가
  if (!frontmatter.includes('slug:')) {
    newFrontmatter += `\nslug: "${fileName}"`
  }

  // 새로운 content 생성
  const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`)

  // 파일 저장
  fs.writeFileSync(filePath, newContent)
  console.log(`Converted: ${filePath}`)
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory)

  files.forEach((file) => {
    const filePath = path.join(directory, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      processDirectory(filePath)
    } else if (file.endsWith('.md')) {
      convertPost(filePath)
    }
  })
}

const postsDir = path.join(__dirname, '../posts')
processDirectory(postsDir)
