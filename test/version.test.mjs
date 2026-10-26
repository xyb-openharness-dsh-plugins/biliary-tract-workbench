// 版本四处一致里能自动判的三处：VERSION / package.json / lib/version.js。
// 第四处（页面字面量）在 check-conformance 里查。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { version } from '../lib/version.js'

const root = new URL('../', import.meta.url)
const fileVersion = readFileSync(new URL('VERSION', root), 'utf8').trim()
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))

test('lib/version.js 与 VERSION 一致', () => {
  assert.equal(version, fileVersion)
})

test('package.json 与 VERSION 一致', () => {
  assert.equal(pkg.version, fileVersion)
})

test('版本号是合法 semver 形状', () => {
  assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/)
})
