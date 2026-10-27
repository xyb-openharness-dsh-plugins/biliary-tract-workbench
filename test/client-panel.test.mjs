// 静态断言：会话面板的结构与分隔线基线（不替代 Desktop 实机验收）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const client = readFileSync(new URL('lib/client.js', root), 'utf8')
const layout = readFileSync(new URL('lib/layout.js', root), 'utf8')

test('注册描述符开启 customFrame，Panel 接收宿主 conversation', () => {
  assert.match(client, /customFrame/)
  assert.match(client, /function Panel\s*\(\s*\{\s*conversation\s*\}\s*\)/)
})

test('aside 始终挂载，收起只改 display', () => {
  assert.match(client, /h\('aside'/)
  assert.match(client, /display:\s*paneOpen\s*\?\s*'flex'\s*:\s*'none'/)
})

test('splitter 在 aside 之前（DOM 顺序）', () => {
  const splitter = client.indexOf("role: 'separator'")
  const aside = client.indexOf("h('aside'")
  assert.ok(splitter >= 0, '找不到 separator')
  assert.ok(aside > splitter, `separator@${splitter} 必须在 aside@${aside} 之前`)
})

test('分隔线是 1px 细线 + 11px 透明热区', () => {
  assert.match(client, /width:\s*1,/, '缺 1px 细线')
  assert.match(client, /width:\s*11,/, '缺 11px 热区')
  assert.match(client, /marginRight:\s*-0\.5/, '缺压边界半像素')
})

test('品牌色悬停光晕与拖动遮罩齐全', () => {
  assert.match(client, /SPLITTER_BRAND\s*=\s*'#[0-9a-fA-F]{6}'/)
  assert.match(client, /0 0 6px/, '缺悬停 6px 光晕')
  assert.match(client, /0 0 10px/, '缺拖动 10px 光晕')
  assert.match(client, /dragShieldStyle/)
  assert.match(client, /zIndex:\s*4/)
  assert.match(client, /setPointerCapture/)
  assert.match(client, /⠿/)
})

test('宽度区间 25%–45%、默认 35%、步进 2%', () => {
  assert.match(layout, /min:\s*0\.25/)
  assert.match(layout, /max:\s*0\.45/)
  assert.match(layout, /default:\s*0\.35/)
  assert.match(layout, /step:\s*0\.02/)
})

test('键盘 ←/→/Home/End 与 localStorage 持久化', () => {
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
    assert.ok(client.includes(`'${key}'`), `缺 ${key}`)
  }
  assert.match(client, /localStorage/)
})