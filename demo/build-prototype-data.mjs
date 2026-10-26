// 小胆宝 BiliPal · 原型数据生成器
//
// 唯一数据来源是 demo/build-demo-data.mjs 的 buildDemoProfiles()——原型与演示库共用同一份档案，
// 免得"原型上一个数、库里另一个数"这种最难解释的偏差。
//
// 本文件只做**纯数据整形**（把 labs 的列名摊平成序列、把参考区间挂到指标上），不含任何判断：
// ×ULN 是除法，属于事实层；"偏高/严重/好转"一个都不在这里算，也不在 app.js 里算。
//
// 用法：node demo/build-prototype-data.mjs   （或 npm run build:proto）

import { buildDemoProfiles } from './build-demo-data.mjs';
import { buildDemoTrials } from './trials-catalog.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 指标定义：cat 是双轴归位（A 梗阻—黄疸 / B 肿瘤—治疗 / 安全）。
// refKey 指向 labRef 里的字段——参考上限只认这张化验单自带的，不借通用值（M2）。
const METRIC_DEFS = [
  { id: 'bilirubin_total', name: '总胆红素', short: 'TBIL', unit: 'μmol/L', field: 'tb', cat: 'A 梗阻—黄疸', color: '#A9761C', dec: 0, refHigh: 'totalBilirubinHigh', grade: 'bili' },
  { id: 'direct_bilirubin', name: '直接胆红素', short: 'DBIL', unit: 'μmol/L', field: 'db', cat: 'A 梗阻—黄疸', color: '#C08A2A', dec: 0, refHigh: 'directBilirubinHigh' },
  { id: 'alp', name: '碱性磷酸酶', short: 'ALP', unit: 'U/L', field: 'alp', cat: 'A 梗阻—黄疸', color: '#7E6A2C', dec: 0, refHigh: 'alpHigh', grade: 'alp' },
  { id: 'ggt', name: 'γ-谷氨酰转移酶', short: 'GGT', unit: 'U/L', field: 'ggt', cat: 'A 梗阻—黄疸', color: '#5E7A46', dec: 0, refHigh: 'ggtHigh', grade: 'alp' },
  { id: 'alt', name: '丙氨酸氨基转移酶', short: 'ALT', unit: 'U/L', field: 'alt', cat: 'B 肿瘤—治疗·肝功', color: '#2F6F66', dec: 0, refHigh: 'altHigh', grade: 'alt' },
  { id: 'ast', name: '天门冬氨酸氨基转移酶', short: 'AST', unit: 'U/L', field: 'ast', cat: 'B 肿瘤—治疗·肝功', color: '#3F7F76', dec: 0, refHigh: 'astHigh', grade: 'alt' },
  { id: 'albumin', name: '白蛋白', short: 'ALB', unit: 'g/L', field: 'alb', cat: 'B 肿瘤—治疗·营养', color: '#4C6E93', dec: 1, refLow: 'albuminLow' },
  { id: 'ca19_9', name: 'CA19-9', short: 'CA19-9', unit: 'U/mL', field: 'ca199', cat: 'B 肿瘤—治疗·标志物', color: '#8B5E83', dec: 0, refHigh: 'ca19_9High', noGrade: true },
  { id: 'cea', name: '癌胚抗原', short: 'CEA', unit: 'ng/mL', field: 'cea', cat: 'B 肿瘤—治疗·标志物', color: '#9B6B8F', dec: 1 },
  { id: 'wbc', name: '白细胞计数', short: 'WBC', unit: '×10⁹/L', field: 'wbc', cat: '安全 · 感染观察', color: '#6B7B8C', dec: 1 },
  { id: 'crp', name: 'C 反应蛋白', short: 'CRP', unit: 'mg/L', field: 'crp', cat: '安全 · 感染观察', color: '#8A6A5C', dec: 0 }
];

const CAT_ORDER = ['A 梗阻—黄疸', 'B 肿瘤—治疗·肝功', 'B 肿瘤—治疗·标志物', 'B 肿瘤—治疗·营养', '安全 · 感染观察'];

function metricsFor(p) {
  const out = {};
  for (const d of METRIC_DEFS) {
    const points = p.labs
      .filter((l) => l[d.field] !== null && l[d.field] !== undefined && l[d.field] !== '')
      .map((l) => ({ d: l.on, v: l[d.field], state: l.state }))
      .sort((a, b) => a.d.localeCompare(b.d));
    if (!points.length) continue;
    out[d.id] = {
      id: d.id, name: d.name, short: d.short, unit: d.unit, cat: d.cat, color: d.color,
      dec: d.dec, noGrade: !!d.noGrade, grade: d.grade || '',
      refHigh: d.refHigh ? p.labRef[d.refHigh] ?? null : null,
      refLow: d.refLow ? p.labRef[d.refLow] ?? null : null,
      points
    };
  }
  // 体重来自 body 档案，单独一条序列（营养 / 体能）
  if (p.body?.length) {
    out.weight = {
      id: 'weight', name: '体重', short: 'WT', unit: 'kg', cat: 'B 肿瘤—治疗·营养', color: '#6E7F5A',
      dec: 1, noGrade: true, grade: '', refHigh: null, refLow: null,
      points: p.body.filter((b) => typeof b.weight === 'number').map((b) => ({ d: b.on, v: b.weight, state: 'reported' })).sort((a, b) => a.d.localeCompare(b.d))
    };
  }
  return out;
}

// 治疗条：把 treatment_event 的起止摊成图上的一条横带
function bandsFor(p) {
  return p.treatments
    .filter((t) => t.startedOn)
    .map((t) => ({
      label: t.modality === 'resection' ? '手术' : t.modality === 'stent_palliative' ? '引流减黄' : `${t.line ? t.line + ' 线 · ' : ''}${t.regimen}`,
      from: t.startedOn,
      to: t.endedOn || p.labs[p.labs.length - 1].on,
      kind: t.modality === 'resection' ? 'surgery' : t.modality === 'stent_palliative' ? 'drain' : 'systemic'
    }));
}

// 评估竖线：影像评估日 + 门诊/MDT（都是"谁在哪天说了什么"，不是结论）
function marksFor(p) {
  const out = p.tumor.filter((t) => t.on).map((t) => ({ d: t.on, label: '影像评估', kind: 'imaging' }));
  for (const v of p.visits) if (v.on && !v.planned) out.push({ d: v.on, label: v.dept, kind: 'visit' });
  return out.sort((a, b) => a.d.localeCompare(b.d));
}

export function buildPrototypeData() {
  const { trials, saved } = buildDemoTrials();
  const profiles = {};
  for (const p of buildDemoProfiles()) {
    profiles[p.id] = { ...p, savedTrials: saved[p.id] || [], metrics: metricsFor(p), bands: bandsFor(p), marks: marksFor(p) };
  }
  return {
    generatedAt: '2026-10-24',
    brand: { name: '小胆宝', en: 'BiliPal', slogan: '两条线分开看，才看得清。' },
    catOrder: CAT_ORDER,
    metricOrder: [...METRIC_DEFS.map((d) => d.id), 'weight'],
    trials,
    profiles
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dir = join(root, 'prototypes/v0.2');
  mkdirSync(dir, { recursive: true });
  const data = buildPrototypeData();
  const body =
    '/* 由 demo/build-prototype-data.mjs 生成；勿手改。改数据请改 demo/build-demo-data.mjs 后重跑 npm run build:proto */\n' +
    'window.DEMO_DATA = ' + JSON.stringify(data) + ';\n';
  writeFileSync(join(dir, 'demo-data.js'), body);
  const n = Object.keys(data.profiles).length;
  const m = Object.values(data.profiles).reduce((a, p) => a + Object.keys(p.metrics).length, 0);
  console.log(`已生成 prototypes/v0.2/demo-data.js：${n} 套档案，共 ${m} 条指标序列，${(body.length / 1024).toFixed(0)} KB`);
}
