// 演示数据上的领域不变量——把 M 口径里"能算出来"的部分变成断言。
// 注意：演示数据是合成的，这里断言的是"结构上不可能发生的事"，不是临床结论。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const demo = JSON.parse(readFileSync(new URL('../demo/demo-data.json', import.meta.url), 'utf8'))

test('M12：同一张单上直接胆红素 ≤ 总胆红素', () => {
  for (const p of demo.profiles) {
    for (const row of p.labs) {
      if (row.tb == null || row.db == null) continue
      assert.ok(row.db <= row.tb, `${p.id} ${row.on}: DBIL ${row.db} > TBIL ${row.tb}`)
    }
  }
})

test('M2：ULN 型指标都要能取到本单参考上限', () => {
  const map = { tb: 'totalBilirubinHigh', db: 'directBilirubinHigh', alp: 'alpHigh', ggt: 'ggtHigh', alt: 'altHigh', ast: 'astHigh' }
  for (const p of demo.profiles) {
    for (const [metric, key] of Object.entries(map)) {
      const has = p.labs.some((row) => row[metric] != null)
      if (has) assert.ok(p.labRef[key] > 0, `${p.id} 有 ${metric} 却缺 ${key}`)
    }
  }
})

test('M6：分型只允许 gbc / icc / pcc / dcc', () => {
  const allowed = new Set(['gbc', 'icc', 'pcc', 'dcc'])
  for (const p of demo.profiles) {
    for (const s of p.subtype) assert.ok(allowed.has(s.subtype), `${p.id} 出现越界分型 ${s.subtype}`)
  }
})

test('M5：可切除性每条都带 context / statedBy / statedOn（只记谁说的哪天）', () => {
  for (const p of demo.profiles) {
    for (const r of p.resectability) {
      assert.ok(r.context && r.statedBy && r.statedOn, `${p.id} 缺来源字段`)
      assert.ok(!('auto' in r) && !('score' in r), `${p.id} 出现自动判定字段`)
    }
  }
})

test('M13：没有核验日期的试验不得标为招募中', () => {
  for (const t of demo.trials) {
    if (t.status === 'recruiting') assert.ok(t.verifiedOn, `${t.id} 标了招募中却没有 verified_on`)
  }
})

test('M13：硬性条件必须带结构化判据，不能只有一句自然语言', () => {
  for (const t of demo.trials) {
    const hard = t.criteria.filter((c) => c.hard)
    for (const c of hard) assert.ok(c.field && c.op, `${t.id} 硬性条件缺 field/op：${c.text}`)
  }
})
