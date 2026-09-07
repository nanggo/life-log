import fs from 'node:fs'
import path from 'node:path'

export function createPostFile(postsDirectory, slug, content) {
  const filePath = path.join(postsDirectory, `${slug}.md`)
  if (fs.existsSync(filePath) || fs.existsSync(path.join(postsDirectory, slug, 'index.md'))) {
    throw new Error(`이미 사용 중인 slug입니다: ${slug}. 다른 slug를 입력해주세요.`)
  }

  // Exclusive creation also prevents overwriting a file created after the check above.
  fs.writeFileSync(filePath, content, { flag: 'wx' })
  return filePath
}
