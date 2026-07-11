#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const PRODUCTION_ORIGIN = 'https://blog.nanggo.net'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS_PER_REQUEST = 10_000
const REQUEST_TIMEOUT_MS = 15_000

const scriptPath = fileURLToPath(import.meta.url)
const projectRoot = resolve(dirname(scriptPath), '..')
const staticDirectory = resolve(projectRoot, 'static')

function printUsage() {
  console.log(`Usage:
  pnpm indexnow:submit -- --key-file static/<key>.txt <URL> [URL...]

Options:
  --key-file <path>  Public IndexNow key file under static/ (required)
  --dry-run          Validate and print the payload without submitting it
  --help             Show this help

URLs must be https://${new URL(PRODUCTION_ORIGIN).host} URLs or absolute paths such as /post/example.`)
}

function parseArguments(args) {
  let keyFile
  let dryRun = false
  const urls = []

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--') continue
    if (argument === '--help') return { help: true, urls: [] }
    if (argument === '--dry-run') {
      dryRun = true
      continue
    }
    if (argument === '--key-file') {
      keyFile = args[index + 1]
      if (!keyFile || keyFile.startsWith('--')) {
        throw new Error('--key-file requires a path')
      }
      index += 1
      continue
    }
    if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`)
    }

    urls.push(argument)
  }

  if (!keyFile) throw new Error('--key-file is required')
  if (urls.length === 0) throw new Error('At least one changed URL is required')
  if (urls.length > MAX_URLS_PER_REQUEST) {
    throw new Error(`A single request can contain at most ${MAX_URLS_PER_REQUEST} URLs`)
  }

  return { help: false, keyFile, dryRun, urls }
}

async function readPublicKey(keyFileArgument) {
  const keyFilePath = resolve(projectRoot, keyFileArgument)
  const relativeKeyPath = relative(staticDirectory, keyFilePath)
  if (
    isAbsolute(relativeKeyPath) ||
    relativeKeyPath === '..' ||
    relativeKeyPath.startsWith(`..${sep}`) ||
    relativeKeyPath.includes(sep)
  ) {
    throw new Error('The key file must be located directly under static/')
  }

  const key = (await readFile(keyFilePath, 'utf8')).trim()
  if (!/^[a-z\d-]{8,128}$/i.test(key)) {
    throw new Error('The key file must contain 8-128 letters, numbers, or dashes')
  }

  const expectedFileName = `${key}.txt`
  const actualFileName = relativeKeyPath.split(sep).at(-1)
  if (actualFileName !== expectedFileName) {
    throw new Error(`The public key filename must be ${expectedFileName}`)
  }

  const encodedKeyPath = relativeKeyPath
    .split(sep)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return {
    key,
    keyLocation: `${PRODUCTION_ORIGIN}/${encodedKeyPath}`
  }
}

function normalizeChangedUrls(urlArguments) {
  const normalizedUrls = urlArguments.map((argument) => {
    if (!argument.startsWith('/') && !/^https:\/\//i.test(argument)) {
      throw new Error(`URL must be an HTTPS URL or an absolute path: ${argument}`)
    }
    if (/%(?![a-f\d]{2})/i.test(argument)) {
      throw new Error(`URL contains invalid percent encoding: ${argument}`)
    }

    const url = new URL(argument, PRODUCTION_ORIGIN)
    if (url.origin !== PRODUCTION_ORIGIN || url.protocol !== 'https:') {
      throw new Error(`URL must use the production host: ${argument}`)
    }
    if (url.username || url.password || url.search || url.hash) {
      throw new Error(
        `URL must not contain credentials, a query string, or a fragment: ${argument}`
      )
    }
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      throw new Error(`URL must not use a trailing slash: ${argument}`)
    }

    return url.href
  })

  return [...new Set(normalizedUrls)]
}

async function submitIndexNow(payload) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    if (response.status !== 200 && response.status !== 202) {
      const responseBody = (await response.text()).trim().slice(0, 500)
      throw new Error(
        `IndexNow returned HTTP ${response.status}${responseBody ? `: ${responseBody}` : ''}`
      )
    }

    console.log(`IndexNow accepted ${payload.urlList.length} URL(s) (HTTP ${response.status}).`)
  } finally {
    clearTimeout(timeout)
  }
}

async function main(args = process.argv.slice(2)) {
  const options = parseArguments(args)
  if (options.help) {
    printUsage()
    return
  }

  const { key, keyLocation } = await readPublicKey(options.keyFile)
  const urlList = normalizeChangedUrls(options.urls)
  const payload = {
    host: new URL(PRODUCTION_ORIGIN).host,
    key,
    keyLocation,
    urlList
  }

  if (options.dryRun) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  await submitIndexNow(payload)
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(`IndexNow submission failed: ${error.message}`)
    process.exitCode = 1
  })
}

export { main, normalizeChangedUrls, parseArguments, readPublicKey }
