#!/usr/bin/env node
// 文案红线检查（M9 / M11 的机器执行）
//
// 为什么要这个脚本：
//   "不给医疗结论"靠人自觉是守不住的。写页面时一句"目前病情稳定"读起来完全正常，
//   评审时也容易被放过；但它是判读，错一次就可能让人误判轻重。
//   把禁用词从判断变成扫描，才有可验收的东西。
//
// 扫哪里：只扫**会进到用户屏幕**的源码（public/ 、src/ 、lib/client.js ，以及阶段 2 的原型主程序）。
//   不扫 docs/ —— 文档里必须能引用这些词（禁用词表本身就在文档里），扫了全是假阳性。
//   不扫 demo/ 与 prototypes/*/demo-data.js —— 那些是医生原话与检验原文，属第 ① 层事实。
//   原型主程序单独列入 SCAN_FILES（而不是把整个 prototypes/ 加进 SCAN），
//   就是为了把同一目录下的 demo-data.js 排除掉。
//
// 例外写法：同一行里写 `wording-ok` 注释即可跳过该行（用于确有必要的原文引用）。
//
// 用法：node scripts/check-wording.mjs [项目根]
// 退出码：0 通过 / 1 命中红线
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.argv[2] || process.cwd()

// 第 ③ 层：判断类。出现即违规，没有任何上下文可以豁免（除非显式 wording-ok）
const JUDGMENT = [
  ['稳定', '病情判断'],
  ['好转', '病情判断'],
  ['恶化', '病情判断'],
  ['进展', '病情判断'],
  ['缓解', '疗效判断'],
  ['良好', '病情判断'],
  ['不乐观', '预后判断'],
  ['预后', '预后判断'],
  ['控制住了', '病情判断'],
  ['问题不大', '病情判断'],
  ['建议治疗', '处置建议'],
  ['可能复发', '复发推断'],
  ['可以停药', '处置建议'],
  ['无需就医', '处置建议'],
  ['治愈率', '预后判断'],
]

// 第 ② 层里越界的那部分：把"解释"写成"要求"
const ADVICE = [
  ['立刻就医', '分诊判断（应改为：请联系你的医疗团队）'],
  ['危险', '分诊判断'],
  ['警惕', '推断提示'],
  ['注意排除', '鉴别提示'],
  ['应该用', '用药建议'],
  ['首选', '方案推荐'],
]

const SCAN = ['public', 'src']
const SCAN_FILES = ['lib/client.js', 'prototypes/v0.2/app.js']
const EXT = /\.(html|js|mjs|css|json)$/

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (EXT.test(name) && !name.endsWith('.map')) out.push(p)
  }
  return out
}

const targets = []
for (const d of SCAN) targets.push(...walk(join(root, d)))
for (const f of SCAN_FILES) {
  const p = join(root, f)
  if (existsSync(p)) targets.push(p)
}

if (!targets.length) {
  console.log('文案红线：暂无 UI 源码（public/ 、src/ 、lib/client.js 、原型主程序均不存在），本检查从阶段 4 起生效。')
  process.exit(0)
}

const hits = []
for (const file of targets) {
  const text = readFileSync(file, 'utf8')
  text.split('\n').forEach((line, i) => {
    if (line.includes('wording-ok')) return
    for (const [word, why] of [...JUDGMENT, ...ADVICE]) {
      if (line.includes(word)) {
        hits.push({ file: relative(root, file), line: i + 1, word, why, text: line.trim().slice(0, 120) })
      }
    }
  })
}

if (hits.length) {
  console.error(`文案红线命中 ${hits.length} 处（M9 / M11）：`)
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  「${h.word}」= ${h.why}`)
    console.error(`    ${h.text}`)
  }
  console.error('\n改法：陈述事实 + 指明这是谁的标准 + 指向医生。例：')
  console.error('  ✗ 目前病情稳定，继续观察')
  console.error('  ✓ 最近一次总胆红素 19 μmol/L（2026-09-15，参考上限 21），与上次差 −3')
  console.error('  ✓ 这项是 2.4 倍参考上限（该化验单自带上限 125 U/L），是否处理请咨询你的医疗团队')
  process.exit(1)
}

console.log(`文案红线通过：扫描 ${targets.length} 个 UI 源文件，0 处命中。`)
