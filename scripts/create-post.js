import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

// __dirname and __filename are not available in ES modules, so we need to define them
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter the post title: ', (title) => {
  const date = new Date().toISOString().split('T')[0]
  const fileName = title.toLowerCase().replace(/ /g, '-') + '.md'
  const filePath = path.join(__dirname, '../posts', fileName)

  const templatePath = path.join(__dirname, '../templates/post.md')
  let content = fs.readFileSync(templatePath, 'utf-8')
  content = content.replace('New Post Title', title).replace('YYYY-MM-DD', date)

  fs.writeFileSync(filePath, content)
  console.log(`Post created: ${filePath}`)

  rl.close()
})
