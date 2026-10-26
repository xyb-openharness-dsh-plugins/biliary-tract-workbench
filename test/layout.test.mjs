// 面板参数的家族硬约束（H15）。这些数字被审计脚本按区间卡，改这里之前先看 docs/22-PHASES-AND-GATES.md。
import test from 'node:test'
import assert from 'node:assert/strict'
import { PANEL, AGENT_PANE, CLIENT_LAYOUT } from '../lib/layout.js'

test('customFrame 必须开启', () => {
  assert.equal(PANEL.customFrame, true, '关掉会退回标准分栏，顶栏没有 AI 按钮')
})

test('businessWidth 落在家族区间 0.55–0.75', () => {
  assert.ok(PANEL.businessWidth > 0.55 && PANEL.businessWidth < 0.75, `实际 ${PANEL.businessWidth}`)
})

test('会话区可拖区间在 20%–50% 且 min < max', () => {
  assert.ok(AGENT_PANE.min < AGENT_PANE.max)
  assert.ok(AGENT_PANE.min >= 0.2 && AGENT_PANE.max <= 0.5, `实际 ${AGENT_PANE.min}-${AGENT_PANE.max}`)
})

test('注入客户端的快照是冻结的，且不含多余字段', () => {
  assert.ok(Object.isFrozen(CLIENT_LAYOUT))
  assert.deepEqual(Object.keys(CLIENT_LAYOUT).sort(), ['agentPane', 'businessWidth', 'customFrame'])
})
