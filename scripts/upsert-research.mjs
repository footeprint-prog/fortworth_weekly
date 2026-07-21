#!/usr/bin/env node
import { readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { applyResearchPayload } from './research-data.mjs'

const args = process.argv.slice(2)
const payloadArg = args.find((arg) => !arg.startsWith('--'))
if (!payloadArg) {
  console.error('Usage: node scripts/upsert-research.mjs <payload.json> [--write]')
  process.exit(1)
}

const root = resolve(import.meta.dirname, '..')
const paths = {
  leads: resolve(root, 'public/data/leads.json'),
  logs: resolve(root, 'public/data/search-log.json'),
  coverage: resolve(root, 'public/data/area-coverage.json'),
}
const [payload, leads, logs, coverage] = await Promise.all([
  readJson(resolve(process.cwd(), payloadArg)), readJson(paths.leads), readJson(paths.logs), readJson(paths.coverage),
])
const result = applyResearchPayload({ leads, logs, coverage }, payload)

console.log(JSON.stringify(result.summary, null, 2))
if (!args.includes('--write')) {
  console.log('Dry run only. Re-run with --write after reviewing this summary.')
  process.exit(0)
}

await Promise.all([
  atomicJsonWrite(paths.leads, result.data.leads),
  atomicJsonWrite(paths.logs, result.data.logs),
  atomicJsonWrite(paths.coverage, result.data.coverage),
])
console.log('Research files updated. Review git diff and run npm run check before publication.')

async function readJson(path) { return JSON.parse(await readFile(path, 'utf8')) }
async function atomicJsonWrite(path, value) {
  const temporary = `${path}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}
