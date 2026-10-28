#!/usr/bin/env node
/**
 * 生成 public/（装机界面）：从 prototypes/v0.2 原样复制四件套 + 36 号 primer 三件套。
 *
 * 为什么需要它：这个仓原先只有 prototypes/，没有 public/，`dsh/index.js` 也没注册静态路由，
 * 装进 Desktop 后外壳（lib/client.js）没有可加载的业务页，面板只剩占位卡片 —— 用户看到的就是空白。
 *
 * 对齐纪律：与原型逐字符对齐，只改 index.html 里的两处版本字面量（title / 顶部说明条），
 * 不改任何视图函数。原型与开发版必须是同一份渲染代码。
 *
 * 用法：
 *   node scripts/build-public.mjs          写入
 *   node scripts/build-public.mjs --check  只校验，不同步退出码 1
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'prototypes', 'v0.2')
const OUT = join(root, 'public')
const checkOnly = process.argv.includes('--check')

const read = (name) => readFileSync(join(SRC, name), 'utf8')
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()

function fail(messages) {
  for (const m of messages) console.error(`✗ ${m}`)
  process.exit(1)
}

function patchIndex(html) {
  const titleFrom = '<title>小胆宝 BiliPal · 胆道癌工作台原型 v0.1.0</title>'
  const titleTo = `<title>小胆宝 BiliPal · 胆道癌工作台 v${version}</title>`
  const barFrom = '<div class="prototype-bar"><span><b>交互原型 v0.1.0</b> · 全部为合成资料，不含真实患者信息</span><span>仅本页演示 · 刷新重置 · 未接入 DSH / AI</span></div>'
  const barTo = `<div class="prototype-bar"><span><b>开发版 v${version}</b> · 全部为合成演示资料，不含真实患者信息</span><span>本机资料整理 · 只记录不判定 · 判断归主诊团队</span></div>`
  for (const needle of [titleFrom, barFrom]) {
    if (!html.includes(needle)) fail(`prototypes/v0.2/index.html 结构变了，找不到锚点：${needle.slice(0, 60)}…`)
  }
  return html.replace(titleFrom, titleTo).replace(barFrom, barTo)
}

/* style/demo-data/primer 三件套原样复制；index.html 只换两处版本字面量。 */
const outputs = {
  'style.css': read('style.css'),
  'demo-data.js': read('demo-data.js'),
  'index.html': patchIndex(read('index.html')),
  'app.js': read('app.js'),
  'primer.css': read('primer.css'),
  'primer-data.js': read('primer-data.js'),
  'primer.js': read('primer.js'),
}

if (checkOnly) {
  const problems = []
  for (const [name, content] of Object.entries(outputs)) {
    const file = join(OUT, name)
    if (!existsSync(file)) problems.push(`缺 public/${name}`)
    else if (readFileSync(file, 'utf8') !== content) problems.push(`public/${name} 与 prototypes/v0.2 不同步（或版本字面量过期）`)
  }
  if (problems.length) fail(problems)
  console.log(`✓ public/ 与 prototypes/v0.2 同步（v${version}，7 个文件）`)
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
for (const [name, content] of Object.entries(outputs)) writeFileSync(join(OUT, name), content)
console.log(`已生成 public/：${Object.keys(outputs).join(', ')}（v${version}）`)