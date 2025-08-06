import fs from 'fs'

import remarkParse from 'remark-parse'
import { unified } from 'unified'

import remarkSplitSections from './remark-split-sections.js'

async function testPlugin() {
  // Read the solid principles post
  const solidPostPath = 'posts/solid-principles-frontend-guide.md'
  const content = fs.readFileSync(solidPostPath, 'utf8')

  console.log(`📖 Testing remark-split-sections plugin with: ${solidPostPath}`)
  console.log(`📏 Original file size: ${Buffer.byteLength(content, 'utf8')} bytes`)

  // Create a VFile-like object
  const vfile = {
    value: content,
    data: { fm: {} }
  }

  // Process with our plugin
  const processor = unified()
    .use(remarkParse)
    .use(remarkSplitSections, {
      sizeThreshold: 10240,
      headingLevels: [2, 3],
      generateIds: true
    })

  const tree = processor.parse(content)
  await processor.run(tree, vfile)

  // Check if sections were generated
  const sections = vfile.data.fm?.sections
  const isLargePost = vfile.data.fm?.isLargePost

  if (isLargePost) {
    console.log(`✅ Post identified as large post`)
    console.log(`📋 Generated ${sections?.length || 0} sections:`)

    sections?.forEach((section, index) => {
      console.log(
        `   ${index + 1}. ${section.title} (Level ${section.level}, ${section.wordCount} words, ${section.readingTime}min read)`
      )
    })

    console.log(`⏱️  Total reading time: ${vfile.data.fm?.totalReadingTime || 0} minutes`)
    console.log(`🔄 Split strategy: ${vfile.data.fm?.splitStrategy || 'unknown'}`)
  } else {
    console.log(`ℹ️  Post is below size threshold, not split`)
  }
}

testPlugin().catch(console.error)
