#!/usr/bin/env node
/**
 * M2–M9 口径的机器执行（G2 走查期间只做校验，不写业务代码）。
 *
 * 每条规则对应 DEV-REQUIREMENTS 的一行 M 条目；能机器判的在这里判，
 * 判不了的（如 M5「不生成可切除判断」）用源码切片 + 词表近似，并在输出里标「近似」。
 *
 * 用法：node scripts/check-medical-rules.mjs .   （已接入 npm run check）
 * 退出码：0 全通过；1 有 fail。
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || '.';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const appJs = read('prototypes/v0.2/app.js');
const demo = JSON.parse(read('demo/demo-data.json'));

/** 按顶层 function 切源码：返回 { name: body } */
function fnSlices(src) {
  const out = {};
  const re = /^function ([A-Za-z0-9_]+)\(\)\s*\{/gm;
  const marks = [];
  let m;
  while ((m = re.exec(src))) marks.push({ name: m[1], start: m.index });
  marks.forEach((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].start : src.length;
    out[mk.name] = src.slice(mk.start, end);
  });
  return out;
}
const F = fnSlices(appJs);

/** 禁用词扫描：返回命中行（排除 wording-ok 豁免行） */
function forbid(sliceName, words) {
  const body = F[sliceName];
  if (!body) return [{ rule: 'slice-missing', slice: sliceName, hit: '（找不到该函数）' }];
  const lines = body.split('\n');
  const hits = [];
  lines.forEach((l, i) => {
    if (l.includes('wording-ok')) return; // 显式豁免：用于"说明不写什么"的元叙述
    for (const w of words) {
      if (!l.includes(w)) continue;
      // 否定语境豁免："这一屏不写分诊等级"「不折算成急症等级」是在声明规则，不是违规。
      // 只在同一个短句内（≤12 字）出现否定词才算豁免，防止把真违规整行放过。
      if (new RegExp(`(不写|不判|不折算|不做|不给|不生成|不总结|不读|不解读|不是|没有)[^，。；]{0,12}${w}`).test(l)) continue;
      hits.push({ slice: sliceName, line: i + 1, word: w, text: l.trim().slice(0, 90) });
    }
  });
  return hits;
}

/** 整文件扫描：页面正文常写在 helper 函数里，按页面函数切片会漏 */
function forbidAll(words) {
  const hits = [];
  appJs.split('\n').forEach((l, i) => {
    if (l.includes('wording-ok')) return;
    for (const w of words) {
      if (!l.includes(w)) continue;
      if (new RegExp(`(不写|不判|不折算|不做|不给|不生成|不总结|不读|不解读|不是|没有)[^，。；]{0,12}${w}`).test(l)) continue;
      hits.push({ slice: 'app.js', line: i + 1, word: w, text: l.trim().slice(0, 80) });
    }
  });
  return hits;
}

const results = [];
const add = (id, name, ok, detail, approx = false) =>
  results.push({ id, name, ok, detail, approx });

/* ---------- M1 · 分级只用「对照」，不自创轻/中/重 ---------- */
{
  const invented = ['轻度', '中度', '重度'].filter((w) => appJs.includes(w))
  const hasCtcae = /CTCAE/.test(appJs)
  const hasRange = /×ULN/.test(appJs)
  // 当前原型里分级整块是「未引入」（缺页码），所以判据是：不自创分级词 + 引用了 CTCAE 名称与区间写法
  add('M1', '分级用 CTCAE 对照，不自创轻/中/重', invented.length === 0 && hasCtcae && hasRange,
    invented.length ? `出现自创分级词：${invented.join(' / ')}`
      : `CTCAE 出现=${hasCtcae}，×ULN 区间写法出现=${hasRange}（当前整块为「未引入」）`);
}

/* ---------- M2 · ×ULN 只用本单 ref_high ---------- */
{
  const ULN = { tb: 'totalBilirubinHigh', db: 'directBilirubinHigh', alp: 'alpHigh', ggt: 'ggtHigh', alt: 'altHigh', ast: 'astHigh' };
  const bad = [];
  for (const p of demo.profiles) {
    for (const row of p.labs || []) {
      for (const [k, refKey] of Object.entries(ULN)) {
        if (row[k] === null || row[k] === undefined) continue;
        if (!p.labRef || !p.labRef[refKey]) bad.push(`${p.id} ${row.on} ${k}: 缺 ${refKey}`);
      }
    }
  }
  // 源码里不许出现"补一个通用上限"的兜底常量
  const fallback = /\brefHigh\s*\?\?\s*\d+/.test(appJs) || /totalBilirubinHigh\s*\|\|\s*\d+/.test(appJs);
  add('M2', '×ULN 只用本单 ref_high，缺则 needsUln', bad.length === 0 && !fallback,
    bad.length ? bad.slice(0, 5).join(' ; ') : (fallback ? '源码里有 `refHigh ?? 常量` 兜底' : `${demo.profiles.reduce((n, p) => n + (p.labs || []).length, 0)} 条化验记录的上限全部可解析`));
}

/* ---------- M3 · CA19-9 不做分级 ---------- */
{
  const gradeHits = [];
  for (const p of demo.profiles) {
    for (const s of p.safety || []) if (String(s.kind || '').toLowerCase().includes('ca19')) gradeHits.push(`${p.id} ${s.onsetOn} safety.kind=${s.kind}`);
  }
  // 只认"把分级赋给 CA19-9"的代码写法；页面上解释"为什么不给分级"不算违规
  const src = /ca199[^\n]{0,60}\.grade\b/i.test(appJs) || /\bgrade\s*\([^)]*ca19/i.test(appJs);
  add('M3', 'CA19-9 不做分级', gradeHits.length === 0 && !src,
    gradeHits.length ? gradeHits.join(' ; ') : (src ? '原型里出现 CA19-9 与分级同行的写法' : '无 safety 记录把 CA19-9 当分级项；原型未见分级写法'));
}

/* ---------- M4 · 黄疸/梗阻只记观察项，不判急症 ---------- */
{
  const words = ['急症', '急诊', '分诊', '立即就医', '立刻就医', '危险', '立即处理'];
  const hits = [...forbid('vJaundice', words), ...forbid('vDrain', words)];
  add('M4', '黄疸/梗阻只记观察项，不判急症、不给处置', hits.length === 0,
    hits.length ? hits.map((h) => `${h.slice}:${h.line}「${h.word}」`).slice(0, 5).join(' ; ') : '两个页面切片内 0 命中');
}

/* ---------- M5 · 可切除性只记"谁说的哪天"，不自动判定（近似） ---------- */
{
  const words = ['自动判定', '系统判断', '建议手术', '可以手术', '需要手术'];
  const hits = forbid('vType', words);
  const autoFn = /\bfunction\s+(eval|compute|judge)Resect\w*/i.test(appJs);
  add('M5', '可切除性不自动判定', hits.length === 0 && !autoFn,
    hits.length ? hits.map((h) => `vType:${h.line}「${h.word}」`).join(' ; ') : (autoFn ? '存在 resect 判定函数' : '无判定函数；页面只渲染 conclusion/context/statedBy/statedOn'), true);
}

/* ---------- M6 · 分型四种 + unknown，壶腹癌不在范围 ---------- */
{
  const allowed = new Set(['gbc', 'icc', 'pcc', 'dcc']);
  const bad = [];
  for (const p of demo.profiles) for (const s of p.subtype || []) if (!allowed.has(s.subtype)) bad.push(`${p.id} ${s.subtype}`);
  const ampullaAsScope = /subtype\s*[:=]\s*['"]amp/i.test(appJs) || /变体[\s\S]{0,20}壶腹癌[\s\S]{0,20}在范围/.test(appJs);
  add('M6', '分型术语固定四种，壶腹癌不在范围', bad.length === 0 && !ampullaAsScope,
    bad.length ? bad.join(' ; ') : (ampullaAsScope ? '出现把壶腹癌当范围项的写法' : '演示档案的分型值全部在 {gbc,icc,pcc,dcc} 内；界面写「壶腹癌不在本项目范围」'));
}

/* ---------- M7 · 治疗只作记录，不写推荐/首选 ---------- */
{
  const words = ['推荐', '首选', '应该用', '建议用', '一线选择', '标准方案'];
  const hits = [...forbid('vTreat', words), ...forbid('vTrialMatch', words)];
  add('M7', '治疗/位点只作记录，不写推荐与首选', hits.length === 0,
    hits.length ? hits.map((h) => `${h.slice}:${h.line}「${h.word}」`).slice(0, 5).join(' ; ') : 'vTreat / vTrialMatch 切片内 0 命中');
}

/* ---------- M8 · 指南条目三样齐全，缺一即「未引入」 ---------- */
{
  const need = ['org', 'version', 'page'];
  // 只挑"看起来像指南出处"的对象（同时带 org 或 version 或 page 字段）
  const guides = [];
  const walk = (v) => {
    if (!v || typeof v !== 'object') return;
    if (!Array.isArray(v) && (('org' in v) || ('version' in v) || ('page' in v))) guides.push(v);
    for (const x of Object.values(v)) walk(x);
  };
  walk(demo);
  const bad = guides.filter((g) => need.some((k) => !g[k]));
  const sql = read('schema/0001_initial.sql');
  const table = sql.slice(sql.indexOf('CREATE TABLE guideline_ref'), sql.indexOf('CREATE TABLE guideline_ref') + 900);
  const notNull = ['org', 'version', 'page'].every((k) => new RegExp(`${k}\\s+TEXT[^,]*NOT NULL`, 'i').test(table));
  const rendersNotIntroduced = appJs.includes('未引入');
  add('M8', '指南条目须 机构+版本+页码，缺一即未引入', bad.length === 0 && notNull && rendersNotIntroduced,
    bad.length ? `缺字段的指南对象 ${bad.length} 个`
      : `指南对象 ${guides.length} 个（演示库 0 条）；guideline_ref 三列 NOT NULL=${notNull}；界面显示「未引入」=${rendersNotIntroduced}`);
}

/* ---------- M9 · 现状卡只答事实（禁用词表） ---------- */
{
  const words = ['稳定', '好转', '恶化', '进展', '缓解', '良好', '不乐观', '预后', '控制住了', '问题不大'];
  const hits = [...forbid('vDash', words), ...forbid('vChart', words)];
  add('M9', '现状卡只答事实：禁用词 0 命中', hits.length === 0,
    hits.length ? hits.map((h) => `${h.slice}:${h.line}「${h.word}」`).slice(0, 5).join(' ; ') : 'vDash / vChart 切片内 0 命中（与 check-wording.mjs 独立复核）');
}

/* ---------- M10 · 报告只索引不解读 ---------- */
{
  // 「提示复发」在试验入排条件里是标准写法（影像判据），不算产品解读，故不列入
  const words = ['报告说没事', '报告正常', '没有问题', '解读为', '说明复发'];
  const hits = forbidAll(words);
  const saysOk = /报告(显示)?(一切)?正常/.test(appJs);
  add('M10', '报告只索引，不做解读', hits.length === 0 && !saysOk,
    hits.length ? hits.map((h) => `${h.slice}:${h.line}「${h.word}」`).slice(0, 5).join(' ; ')
      : (saysOk ? '出现"报告正常"式结论' : 'vLabs / vImaging 切片内 0 命中'));
}

/* ---------- M12 · 总胆红素/直接胆红素不混称（回归项） ---------- */
{
  const lines = appJs.split('\n');
  const bad = [];
  appJs.split('\n').forEach((l, i) => {
    if (l.includes('wording-ok')) return;
    if (/(不是|不写|不称|不叫|不写孤立)[^，。；]{0,8}胆红素/.test(l)) return; // 元叙述：明确说"不写孤立胆红素"
    const stripped = l.replace(/总胆红素|直接胆红素|间接胆红素/g, '');
    if (stripped.includes('胆红素')) bad.push(`app.js:${i + 1} ${l.trim().slice(0, 70)}`);
  });
  add('M12', '不写孤立「胆红素」', bad.length === 0, bad.length ? bad.slice(0, 4).join(' ; ') : '原型源码中「胆红素」均带「总/直接」前缀');
}

/* ---------- 输出 ---------- */
let fail = 0;
console.log('医学口径校验（M1–M13）：');
for (const r of results) {
  if (!r.ok) fail += 1;
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.id} ${r.name}${r.approx ? '（近似）' : ''} —— ${r.detail}`);
}
if (fail) {
  console.error(`\n${fail} 条口径未通过。口径不是文档装饰：任一条 fail 不得进入 G2 签认。`);
  process.exit(1);
}
console.log(`\n${results.length} 条口径全部通过。`);
