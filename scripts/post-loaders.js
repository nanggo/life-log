import fs from 'node:fs'
import path from 'node:path'

import { globSync } from 'glob'
import matter from 'gray-matter'

const moduleId = 'virtual:post-loaders'
const resolvedModuleId = '\0' + moduleId

/** Keep draft Markdown out of the client import graph, including its source maps. */
export default function postLoaders() {
  let root
  let building = false

  return {
    name: 'post-loaders',
    configResolved(config) {
      root = config.root
      building = config.command === 'build'
    },
    resolveId(id) {
      if (id === moduleId) return resolvedModuleId
    },
    load(id) {
      if (id !== resolvedModuleId) return

      // Keep Vite's glob handling in development so new posts and edits support HMR.
      if (!building) return "export default import.meta.glob('/posts/**/*.md')"

      const entries = globSync('posts/**/*.md', { cwd: root, nodir: true })
        .sort()
        .filter((file) => {
          const filename = path.resolve(root, file)
          this.addWatchFile(filename)
          return !matter(fs.readFileSync(filename, 'utf8')).data.draft
        })
        .map((file) => {
          const specifier = JSON.stringify('/' + file.split(path.sep).join('/'))
          return `${specifier}: () => import(${specifier})`
        })

      return `export default {${entries.join(',\n')}}`
    }
  }
}
