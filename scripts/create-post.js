import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { format } from 'date-fns'

// __dirname and __filename are not available in ES modules, so we need to define them
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const questions = [
  { name: 'title', question: 'Enter the post title: ' },
  { name: 'tags', question: 'Enter tags (comma separated): ' }
]

const askQuestion = (index, answers) => {
  if (index >= questions.length) {
    createPost(answers)
    return rl.close()
  }

  const { name, question } = questions[index]
  rl.question(question, (answer) => {
    answers[name] = answer
    askQuestion(index + 1, answers)
  })
}

const createPost = (answers) => {
  const { title, tags } = answers
  const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  const fileName = title.toLowerCase().replace(/ /g, '-') + '.md'
  const filePath = path.join(__dirname, '../posts', fileName)

  const templatePath = path.join(__dirname, '../templates/post.md')
  let content = fs.readFileSync(templatePath, 'utf-8')

  // 태그 처리
  const tagArray = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  content = content.replace('New Post Title', title).replace('YYYY-MM-DD', date)

  // 템플릿에서 기본 태그 항목을 사용자 입력 태그로 대체
  if (tagArray.length > 0) {
    const tagIndent = '  - '
    const tagLines = tagArray.map((tag) => `${tagIndent}${tag}`).join('\n')
    content = content.replace(/tags:[\s\S]*?(draft|---)/, `tags:\n${tagLines}\n$1`)
  }

  fs.writeFileSync(filePath, content)
  console.log(`Post created: ${filePath}`)
}

// 시작
askQuestion(0, {})
