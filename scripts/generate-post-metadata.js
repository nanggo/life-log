/**
 * 빌드 타임에 포스트 메타데이터를 미리 생성하는 스크립트
 * 현재는 개발 단계이므로 간단한 플레이스홀더로 구현
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

/**
 * 포스트 메타데이터 캐시 생성 (플레이스홀더)
 */
async function generatePostMetadata() {
  console.log('🚀 Generating post metadata cache (placeholder)...')

  // 캐시 디렉토리 생성
  const cacheDir = join(PROJECT_ROOT, '.svelte-kit', 'cache')
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true })
  }

  // 빈 메타데이터 파일 생성 (개발 단계)
  const metadata = {
    _note: 'Post metadata cache - will be populated in production builds',
    generatedAt: new Date().toISOString()
  }

  // 메타데이터 저장
  const cacheFile = join(cacheDir, 'post-metadata.json')
  writeFileSync(cacheFile, JSON.stringify(metadata, null, 2))

  console.log(`📦 Generated metadata cache placeholder`)
  console.log(`💾 Saved to: ${cacheFile}`)
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePostMetadata().catch(console.error)
}

export { generatePostMetadata }
