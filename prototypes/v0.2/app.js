/* 小胆宝 BiliPal v0.1.0 — 交互原型（阶段 2 产物，非业务实现）
 *
 * 三条必须遵守的规矩，写在代码最前面，因为后面每一屏都在执行它：
 *   ① 事实可做（值 / 日期 / 谁说的 / 差值 / 倍数），必须能点回来源；
 *   ② 解释可做（指标是什么、检查查什么、指南原文），必须同时有机构 + 版本 + 页码，缺一项整块不显示；
 *   ③ 判断一句都不生成（好坏 / 稳定 / 进展 / 方案优劣 / 停药 / 是否复发），统一出口是「这一句需要问你的医生」。wording-ok
 *
 * 所以本文件里没有一处把指标值翻译成"好不好"。×ULN 是除法，属于第 ① 层；
 * 想让某个数变成结论，代码里没有这个函数，也没有这个字段。
 *
 * 数据全部由 demo/build-prototype-data.mjs 从 demo/build-demo-data.mjs 生成，两套合成档案。
 */

const APP_INFO = {
  name: '小胆宝', en: 'BiliPal', version: 'v0.1.0', build: '2026-10-24',
  stage: '阶段 2 · HTML 原型（G2 未签）',
  scope: '肝内 / 肝门部 / 远端胆管癌与胆囊癌；壶腹癌不在本项目范围'
};

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let uidSeq = 0;
const uid = (p) => p + (++uidSeq);

/* ---------------- 图标 ---------------- */
const icons = {
  home: 'M3 10.5 12 3l9 7.5V21H3z', badge: 'M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z',
  drop: 'M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z',
  tube: 'M6 3v10a6 6 0 0 0 12 0V3M6 8h4M6 13h4', drip: 'M12 3v6m0 0a4 4 0 0 1 4 4v6H8v-6a4 4 0 0 1 4-4z',
  lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3M7 12h10',
  chart: 'M4 19V5M4 19h16M8 15l3-4 3 3 5-7',
  calendar: 'M7 3v3M17 3v3M3 9h18M5 6h14a2 2 0 0 1 2 2v12H3V8a2 2 0 0 1 2-2z',
  cog: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.6 3h-3.9l-.3 2.4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L2.4 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.4h3.9l.3-2.4a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  heart: 'M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9z',
  alert: 'M12 4 2.5 20h19zM12 10v4M12 17h.01'
};
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[k] || icons.badge}"/></svg>`;

/* ---------------- 页面树（与 docs/FEATURE-INVENTORY.csv 的 id 前缀一一对应） ---------------- */
const PAGES = [
  ['dash', '看板', 'home'],
  ['type', '分型与可切除性', 'badge'],
  ['jaundice', '黄疸与梗阻', 'drop'],
  ['drain', '引流照护', 'tube'],
  ['treat', '治疗', 'drip'],
  ['labs', '化验与报告', 'lab'],
  ['imaging', '影像', 'scan'],
  ['chart', '一图秀', 'chart'],
  ['trials', '临床试验', 'badge'],
  ['care', '复查与准备', 'calendar'],
  ['settings', '全局设置', 'cog']
];
const SUBPAGES = { treat: ['线序', '方案依据', '检测位点'], labs: ['值', '报告', '我不懂的'], trials: ['匹配', '检索', '收藏与跟踪'] };
const SUBTITLES = {
  dash: '四行事实，加两条不当总和的线。这里不写"现在怎么样"，只写"现在有什么记录"。',
  type: '分型是解剖位置，可切除性是别人在某个日期说的。两件事常被当成一件，所以分开放。',
  jaundice: 'A 轴：总胆红素、直接胆红素、引流、有没有发热寒战。只记观察到的事，判断"算不算胆管炎"不在这一屏。',
  drain: '管子是事件不是属性：哪天置入、换过几次、拔没拔。观察项照原话记，不换算成急症等级。',
  treat: '做过什么、按谁说的做、检测过什么。方案好不好，这一屏没有这个字段。',
  labs: '每张单子一行，值有出处，参考范围只认这张单自带的。看不懂的可以打标，打标不给答案。',
  imaging: '每次影像说了什么，原话要点 + 日期 + 谁报的。病灶列表按报告里的描述录，不改写。',
  chart: '所选指标各按自身量程铺开，治疗条与评估竖线对齐时间轴。不做跨指标数值比较。',
  trials: '按你的分型、分期、可切除性、治疗线序与检测结果逐条对照试验条件。符合度是粗筛，不是入组资格；未知项一律留成"待确认"。',
  care: '下次什么时候去、想问什么、带什么。日期来自你自己记的那一条，系统不替你排。',
  settings: '资料放哪、字多大、演示数据怎么隔离。'
};

/* ---------------- 数据层 ---------------- */
const D = window.DEMO_DATA;
const TRIALS = D.trials || [];
const ORDER = { unresectable: 0, borderline: 1, resectable: 2 };
const SUBTYPE_NAME = { icc: '肝内胆管癌（iCCA）', pcc: '肝门部胆管癌（pCCA）', dcc: '远端胆管癌（dCCA）', gbc: '胆囊癌（GBC）', unknown: '分型未记录' };
const CONTEXT_NAME = { initial: '初诊时', post_drainage: '减黄后', preop: '术前', post_treatment: '治疗后', recurrence: '新发结节后' };
const CONCLUSION_NAME = { resectable: '可切除（按当时的记录）', borderline: '临界可切除（按当时的记录）', unresectable: '不可切除（按当时的记录）', unknown: '未记录' };
const MODALITY_NAME = { mri: 'MRI', mrcp: 'MRCP', ct: 'CT', pet: 'PET-CT', us: '超声', pathology: '病理' };
const KIND_NAME = { lab: '化验', imaging: '影像', pathology: '病理', discharge: '出院小结', other: '其他' };
const DEVICE_NAME = { ptcd: 'PTCD 经皮肝穿刺引流', enbd: 'ENBD 鼻胆管引流', stent: '胆道支架', erc: 'ERCP 引流' };
const SIDE_NAME = { right: '右侧', left: '左侧', na: '—' };
const OBS_NAME = { fever: '发热', chills: '寒战', pain: '腹痛', jaundice_deep: '皮肤眼白发黄加重', clay_stool: '陶土样便', dark_urine: '尿色变深', itching: '皮肤瘙痒', dressing_soaked: '敷料湿透' };
const COLOR_NAME = { dark: '深茶色', brown: '棕褐色', golden: '金黄', clear: '清亮', bloody: '带血' };
const PATENCY_NAME = { flowing: '通畅', slow: '偏慢', blocked: '不通' };
const SOURCE_NAME = { self: '患者本人记的', caregiver: '家属记的', clinician_summary: '照医生小结抄的' };
const FLAG_NAME = { unclear: '整句看不懂', unit_question: '单位看不懂', value_question: '数值想问' };

/* 分级对照的出处。页码空着 = 拿不到带页码的原件 = 整块按「未引入」处理（M8）。
   这不是偷懒，是这条规则的演示点：缺一项就不许显示。 */
const GRADE_SRC = { org: 'NCI CTCAE', title: 'Common Terminology Criteria for Adverse Events', version: 'v5.0', page: '' };

const PROFILES = D.profiles;
const state = {
  view: 'dash', sub: { treat: 0, labs: 0, trials: 0 }, profile: 'p1',
  agentOpen: false, agentSize: 'std', font: 1, demoMode: true,
  sel: ['bilirubin_total', 'ca19_9', 'alp'], range: 'all', flip: {},
  // 试验匹配：这些是「我的偏好」，不是医学条件——只影响排序与冲突提示，不参与符合度计算
  prefs: { biopsy: true, placebo: true, city: 'all' },
  trialFilter: { q: '', subtype: 'all', scope: 'all', status: 'all' },
  trialSort: 'fit',
  saved: null,
  openCriteria: {}
};
const P = () => PROFILES[state.profile];
const MET = () => P().metrics;

/* ---------------- 小工具（都只做算术与格式化，不做判读） ---------------- */
const dec = (v, d = 0) => (typeof v === 'number' ? v.toFixed(d) : String(v ?? ''));
const pts = (m) => (m.points || []).filter((p) => typeof p.v === 'number');
const last = (m) => { const a = pts(m); return a.length ? a[a.length - 1] : null; };
const prev = (m) => { const a = pts(m); return a.length > 1 ? a[a.length - 2] : null; };
const diff = (m) => { const a = last(m), b = prev(m); return a && b ? a.v - b.v : null; };
const uln = (m, v) => (m.refHigh ? v / m.refHigh : null);
const fmtUln = (x) => (x === null || x === undefined ? '—' : `${x < 10 ? x.toFixed(1) : Math.round(x)}×ULN`);
const dayGap = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
// 日期差只说"过了几天 / 还有几天"，不写"还有 -4 天"这种负数（DASH-03）
const gapText = (gap) => (gap > 0 ? `还有 ${gap} 天` : gap === 0 ? '就是今天' : `已经过了 ${-gap} 天`);
const TODAY = '2026-10-24';
const pill = (t, c = '') => `<span class="pill ${c}">${esc(t)}</span>`;
const row = (b, p, right = '') => `<div class="row"><div class="row-main"><div><b>${b}</b>${p ? `<p>${p}</p>` : ''}</div></div>${right}</div>`;
const na = (t = '暂无记录') => `<span class="na">${esc(t)}</span>`;
const pageHead = (extra = '') => {
  const meta = PAGES.find((p) => p[0] === state.view);
  const subs = SUBPAGES[state.view];
  return `<div class="page-head"><div><h1>${esc(meta[1])}</h1><p>${esc(SUBTITLES[state.view])}</p></div>${extra ? `<div class="actions">${extra}</div>` : ''}</div>` +
    (subs ? `<div class="subnav" role="tablist">${subs.map((s, i) => `<button role="tab" aria-selected="${(state.sub[state.view] || 0) === i}" data-action="sub" data-sub="${i}">${esc(s)}</button>`).join('')}</div>` : '');
};
/* 唯一允许的判断出口 */
const verdictBox = (what) => `<div class="verdict"><b>${esc(what)}</b><span>这一句需要问你的医生。工作台只摆记录，不给结论。</span></div>`;

/* ---------------- ① 现状卡四行（DASH-01） ---------------- */
function keyMetricLine() {
  const picks = ['bilirubin_total', 'ca19_9', 'weight'].map((k) => MET()[k]).filter(Boolean);
  if (!picks.length) return { html: na(), src: '' };
  const html = picks.map((m) => {
    const a = last(m); if (!a) return '';
    const d = diff(m);
    const ref = m.refHigh ? `本单参考上限 ${m.refHigh} ${m.unit}` : m.refLow ? `本单参考下限 ${m.refLow} ${m.unit}` : '本单未登记参考范围';
    const mult = m.refHigh ? ` · ${fmtUln(uln(m, a.v))}` : '';
    return `<dl><dt>${esc(m.name)}</dt><dd><b>${dec(a.v, m.dec)}</b> ${esc(m.unit)}<span class="muted" style="font-size:11px"> · ${esc(a.d)}${d === null ? '' : ` · 与上次 ${d > 0 ? '+' : ''}${dec(d, m.dec)}`} · ${esc(ref)}${mult}</span></dd></dl>`;
  }).join('');
  const latest = picks.map(last).filter(Boolean).sort((a, b) => b.d.localeCompare(a.d))[0];
  return { html, src: `${latest ? latest.d : ''}<b>${esc('来自化验单')}</b>` };
}

function latestImagingText() {
  const docs = P().docs.filter((d) => d.kind === 'imaging').sort((a, b) => a.on.localeCompare(b.on));
  return docs.length ? docs[docs.length - 1] : null;
}

function currentTreatment() {
  const sys = P().treatments.filter((t) => t.modality === 'systemic' && t.startedOn);
  return sys.length ? sys[sys.length - 1] : null;
}

function nowCard() {
  const km = keyMetricLine();
  const img = latestImagingText();
  const tr = currentTreatment();
  const res = P().resectability.find((r) => r.current);
  const stg = P().stage.find((s) => s.current);
  return `<section class="nowcard">
    <header><h2>现状卡 · 四行事实</h2><small>每行都有日期和说话人；没有记录的写「暂无记录」，不猜</small></header>
    <div class="nowrow"><div class="k">最近关键指标</div>
      <div class="v">${km.html || na()}</div>
      <div class="src">${km.src || '&nbsp;'}</div></div>
    <div class="nowrow"><div class="k">最近一次影像</div>
      <div class="v">${img ? `「${esc(img.line)}」` : na()}</div>
      <div class="src">${img ? `${esc(img.on)}<b>${esc(img.by)}</b>` : '&nbsp;'}</div></div>
    <div class="nowrow"><div class="k">当前治疗周期</div>
      <div class="v">${tr ? `<b>${esc(tr.regimen)}</b> · 计划 ${tr.cyclesPlanned ?? '—'} 周期，已完成 ${tr.cyclesDone ?? '—'} 周期` : na()}</div>
      <div class="src">${tr ? `${esc(tr.startedOn)}<b>${esc(tr.institution || '—')}</b>` : '&nbsp;'}</div></div>
    <div class="nowrow"><div class="k">分期与可切除性</div>
      <div class="v">${stg ? `${esc(stg.system)} ${esc(stg.stage)}` : na()} · ${esc(res ? CONCLUSION_NAME[res.conclusion] : '未记录')}</div>
      <div class="src">${res ? `${esc(res.statedOn)}<b>${esc(res.statedBy)}</b>` : '&nbsp;'}</div></div>
  </section>`;
}

/* ---------------- ② 双轴概览（DASH-02）：不合并、不加总 ---------------- */
function axisOverview() {
  const tb = MET().bilirubin_total, ca = MET().ca19_9;
  const dev = P().drainageDevices.filter((d) => d.event !== 'remove');
  const obsFever = P().drainageObs.filter((o) => o.kind === 'fever');
  const lastT = P().tumor[P().tumor.length - 1];
  const tested = P().genomics.results.filter((g) => g.tested === 1).length;
  const untested = P().genomics.results.length - tested;
  const a = tb ? last(tb) : null;
  return `<div class="axis-grid">
    <div class="axis a">
      <div class="axis-head"><span class="tag">A</span><h3>梗阻 — 黄疸</h3><small>胆道通不通</small></div>
      <div class="axis-row"><span>最近总胆红素</span><b>${a ? `${dec(a.v)} μmol/L（${esc(a.d)}）` : '暂无记录'}</b></div>
      <div class="axis-row"><span>当前带管</span><b>${dev.length ? esc(DEVICE_NAME[dev[dev.length - 1].kind]) : '无记录'}</b></div>
      <div class="axis-row"><span>发热记录</span><b>${obsFever.length ? `${obsFever.length} 次（最近 ${esc(obsFever[obsFever.length - 1].on)}）` : '无记录'}</b></div>
      <div class="axis-row"><span>ALP 倍数</span><b>${MET().alp && last(MET().alp) ? fmtUln(uln(MET().alp, last(MET().alp).v)) : '—'}</b></div>
      <div class="axis-foot">这一列只回答"胆道这条线现在有哪些记录"。它不和 B 列相加，也不产生任何总分。</div>
    </div>
    <div class="axis b">
      <div class="axis-head"><span class="tag">B</span><h3>肿瘤 — 治疗</h3><small>负荷与线序</small></div>
      <div class="axis-row"><span>最近 CA19-9</span><b>${ca && last(ca) ? `${dec(last(ca).v)} U/mL（${esc(last(ca).d)}）` : '暂无记录'}</b></div>
      <div class="axis-row"><span>最近影像病灶数</span><b>${lastT ? `${lastT.count} 个（${esc(MODALITY_NAME[lastT.modality] || lastT.modality)} ${esc(lastT.on)}）` : '暂无记录'}</b></div>
      <div class="axis-row"><span>当前治疗线</span><b>${currentTreatment() ? esc(`${currentTreatment().line ?? '—'} 线 · ${currentTreatment().regimen}`) : '暂无记录'}</b></div>
      <div class="axis-row"><span>基因位点</span><b>已测 ${tested} · 未检测 ${untested}</b></div>
      <div class="axis-foot">"未检测"和"阴性"是两件事：没测过的位点，任何结论都无从谈起。</div>
    </div>
  </div>`;
}

/* ---------------- ③ 提醒位（DASH-03 / CROSS-03）
   判据只有一条：触发条件来自用户自己记的记录或日期。来自医学阈值的判断一律不生成。 ---------------- */
function reminders() {
  const out = [];
  const nextVisit = P().visits.filter((v) => v.planned && v.on).sort((a, b) => a.on.localeCompare(b.on))[0];
  if (nextVisit) {
    const gap = dayGap(TODAY, nextVisit.on);
    out.push({ t: `你记的下次门诊 ${nextVisit.on} ${gap > 0 ? `还差 ${gap} 天` : gap === 0 ? '就是今天' : `已经过了 ${-gap} 天`}`, d: `这条按你在 ${P().visits.filter((v) => !v.planned).slice(-1)[0]?.on || '—'} 门诊记下的日期算，不是系统排的`, act: '把要问的写下来' });
  }
  const dev = P().drainageDevices.filter((d) => d.event !== 'remove').slice(-1);
  if (dev.length) {
    const days = dayGap(dev[0].insertedOn, TODAY);
    out.push({ t: `管子从 ${dev[0].insertedOn} 起算，已带 ${days} 天`, d: '这条只做了日期减法。管子该不该换，要问给你放管的介入科', act: '看 7 日引流表' });
  }
  const open = P().questions.filter((q) => !q.answered).length;
  if (open) out.push({ t: `有 ${open} 个问题还没得到答复`, d: '这些是你自己写下的，工作台不代答', act: '看问题清单' });
  const flags = P().flags.length;
  if (flags) out.push({ t: `有 ${flags} 条指标你标了"看不懂"`, d: '标了不等于有人解释过，它们已经进了问题清单', act: '看打标记录' });
  if (!out.length) return '';
  return `<div class="alert-strip"><div><b>${esc(out[0].t)}</b><p>${esc(out[0].d)}</p></div><button class="soft" data-action="go" data-page="${state.view === 'dash' && out[0].act.includes('7 日') ? 'drain' : 'care'}">${esc(out[0].act)}</button></div>
    ${out.slice(1).map((o) => `<div class="notice plain" style="margin-bottom:10px"><b>${esc(o.t)}</b><br>${esc(o.d)}</div>`).join('')}`;
}

/* ---------------- 看板 ---------------- */
function vDash() {
  const entries = [
    ['jaundice', 'drop', '记一次化验', '总胆红素 / 直接胆红素 / ALP / CA19-9，值加日期'],
    ['drain', 'tube', '记今天的引流量', '颜色、通畅度、有没有发热'],
    ['care', 'calendar', '写一个想问的问题', '下次门诊带着去'],
    ['chart', 'chart', '看两条线的图', '指标与治疗节点对齐']
  ];
  return pageHead() + reminders() + nowCard() +
    `<div class="section-title"><div><h2>两条线分开看</h2><p>上下并列，不做加权，不产生综合评分</p></div></div>` + axisOverview() +
    `<div class="section-title"><div><h2>直接去记</h2><p>四个入口，都落在"记录"上，没有一个落在"评价"上</p></div></div>
     <div class="task-grid">${entries.map(([p, ic, t, s]) => `<button class="task-entry" data-action="go" data-page="${p}"><span class="entry-icon">${icon(ic)}</span><b>${esc(t)}</b><span>${esc(s)}</span><span class="arrow">→</span></button>`).join('')}</div>
     <div class="notice plain"><b>这一屏为什么没有"目前情况如何"：</b>那是医生的判断。工作台能确定的是"哪一天、哪个值、谁说的"，所以四行都只填这些。<br>想把这四行连起来解读，出口只有一个：带着它去问门诊。</div>`;
}

/* ---------------- 分型与可切除性（TYPE-01~04） ---------------- */
function vType() {
  const cur = P().subtype.find((s) => s.current);
  return pageHead() + `
    <div class="subtype-hero">
      <div>
        <div class="code">TYPE-01 · 当前分型（按最近一次记录）</div>
        <h2>${esc(cur ? SUBTYPE_NAME[cur.subtype] : '未记录')}</h2>
        <p>${esc(cur ? cur.basis : '还没有任何分型记录')}</p>
        <div class="subtype-meta">
          ${cur ? pill(`谁说的：${cur.statedBy}`, 'violet') : ''}
          ${cur ? pill(`哪天：${cur.statedOn}`) : ''}
          ${pill('解剖分型 ≠ 可切除结论', 'grey')}
        </div>
      </div>
      <div class="path-tree">
        <div class="${cur?.subtype === 'icc' ? 'on' : ''}">肝内胆管癌 iCCA</div>
        <div class="lv2 ${cur?.subtype === 'pcc' ? 'on' : ''}">肝门部 pCCA（附 Bismuth-Corlette）</div>
        <div class="lv2 ${cur?.subtype === 'dcc' ? 'on' : ''}">远端胆管癌 dCCA</div>
        <div class="lv2 ${cur?.subtype === 'gbc' ? 'on' : ''}">胆囊癌 GBC</div>
        <div class="lv3 muted">壶腹癌不在本项目范围</div>
      </div>
    </div>

    <section class="card" style="margin-bottom:18px">
      <div class="card-head"><div><h2>「这一段通常指什么」</h2><p>TYPE-01 的通用说明 · 属解释层：机构 + 版本 + 页码三样齐全才显示</p></div></div>
      <div class="gate"><i>!</i><div><b>这一段先不显示。</b>要说明「肝门部胆管癌通常指哪一段、Bismuth-Corlette 分的是哪几支」，必须同时给出<b>机构 + 版本 + 页码</b>。当前库里缺<span class="miss">页码</span>，所以整块按「未引入」处理——不拿"一般认为"顶上。</div></div>
    </section>

    <div class="grid two">
      <section class="card">
        <div class="card-head"><div><h2>分型版本链</h2><p>TYPE-02 · 被更正过的记录留着，划掉但不删</p></div>${pill(`${P().subtype.length} 条`, 'grey')}</div>
        <div class="chain">${P().subtype.slice().sort((a, b) => a.statedOn.localeCompare(b.statedOn)).map((s) => `
          <div class="chain-item ${s.current ? 'on' : 'superseded'}">
            <span class="node"></span>
            <div><b>${esc(SUBTYPE_NAME[s.subtype])}</b>
              <p>${esc(s.basis)}</p>
              <div class="who">${pill(s.statedOn, 'grey')}${pill(s.statedBy)}${s.current ? pill('当前采用', 'violet') : pill('已更正', 'orange')}</div>
            </div></div>`).join('')}</div>
        <div class="small-note">这一屏存在的理由：外院报"肝内"、MDT 更正"肝门部"，如果只存最后一次，病人就永远看不到自己为什么被改了分型。</div>
      </section>

      <div class="stack">
        <section class="card">
          <div class="card-head"><div><h2>分期记录</h2><p>TYPE-03 · 系统 + 期别 + 谁说的 + 依据</p></div></div>
          ${P().stage.length ? P().stage.map((s) => row(`${esc(s.system)} ${esc(s.stage)}`, `${esc(s.statedOn)} · ${esc(s.statedBy)} · ${esc(s.basis)}`, s.current ? pill('当前', 'violet') : '')).join('') : `<div class="empty"><h3>暂无分期记录</h3><p>分期以门诊或 MDT 记录为准</p></div>`}
        </section>
        <section class="card">
          <div class="card-head"><div><h2>可切除性记录</h2><p>TYPE-04 · 每次结论是一句话，不是一次判定</p></div></div>
          ${P().resectability.slice().sort((a, b) => a.statedOn.localeCompare(b.statedOn)).map((r) => row(
            esc(CONCLUSION_NAME[r.conclusion]),
            `${esc(CONTEXT_NAME[r.context] || r.context)} · ${esc(r.statedOn)} · ${esc(r.statedBy)}${r.flr ? ` · ${esc(r.flr)}` : ''}<br>${esc(r.basis)}`,
            r.current ? pill('当前', 'violet') : pill('历史', 'grey')
          )).join('')}
          <div class="small-note">同一句话，在不同日期可以是不同答案。这里保留变化过程，不合并成"最终结论"。</div>
        </section>
      </div>
    </div>`;
}

/* ---------------- 黄疸与梗阻（JAU-01~03） ---------------- */
function bilirubinChart() {
  const m = MET().bilirubin_total;
  if (!m) return `<div class="empty"><h3>暂无总胆红素记录</h3><p>记一次化验后这里会出现柱条</p></div>`;
  const a = pts(m);
  const max = Math.max(...a.map((p) => p.v), m.refHigh || 0);
  const W = 100 / a.length;
  const db = MET().direct_bilirubin;
  const dbl = db ? last(db) : null;
  return `<div class="drain-bars" style="height:132px">${a.map((p) => {
    const h = Math.max(3, (p.v / max) * 100);
    return `<div class="bar" title="${esc(p.d)} · 总胆红素 ${dec(p.v)} μmol/L"><em>${dec(p.v)}</em><i style="height:${h}%;background:${m.color}"></i><span>${esc(p.d.slice(5))}</span></div>`;
  }).join('')}</div>
  <div class="small-note">${m.refHigh ? `虚线来自这张化验单自带的参考上限 ${m.refHigh} ${esc(m.unit)}；换个实验室，上限可能不一样。` : '这张单未登记参考上限，所以只列值与日期。'}
  柱条不做连线：中间缺测的日子，连起来会把缺口抹平。</div>
  <div class="notice plain" style="margin:12px 0 0"><b>这一屏画的是总胆红素（TBIL），不是"胆红素"。</b>
    ${dbl ? `同一张单上直接胆红素（DBIL）是 <b>${dec(dbl.v)} ${esc(db.unit)}</b>（${esc(dbl.d)}）。` : ''}
    总胆红素与直接胆红素是两项检查，分别记录、分别显示，不互相替代；同一张单上直接胆红素不会高于总胆红素，差值是间接胆红素。</div>`;
}

function vJaundice() {
  const sym = P().symptoms;
  const fever = P().drainageObs.filter((o) => ['fever', 'chills'].includes(o.kind));
  return pageHead() + `
    <div class="notice violet"><b>A 轴只做一件事：</b>把"哪天出现过什么"记下来。至于是不是胆管炎、要不要去急诊，那是医生的判断——这一屏不写分诊等级。</div>
    <div class="grid two">
      <section class="card wide">
        <div class="card-head"><div><h2>总胆红素走势（TBIL）</h2><p>JAU-02 · 只画总胆红素；直接胆红素单列，不混称</p></div>${MET().bilirubin_total && last(MET().bilirubin_total) ? pill(`最近 ${dec(last(MET().bilirubin_total).v)} μmol/L · ${last(MET().bilirubin_total).d}`, 'violet') : ''}</div>
        ${bilirubinChart()}
      </section>
      <section class="card">
        <div class="card-head"><div><h2>症状记录</h2><p>JAU-01 · 自己填的，不是医生下的诊断</p></div></div>
        ${sym.length ? `<div class="table-wrap"><table><thead><tr><th>日期</th><th>症状</th><th>程度自评</th><th>备注</th></tr></thead><tbody>
          ${sym.map((s) => `<tr><td class="num">${esc(s.on)}</td><td><b>${esc(s.symptom)}</b></td><td class="num">${s.severity} / 10</td><td>${esc(s.note)}</td></tr>`).join('')}
        </tbody></table></div>` : `<div class="empty"><h3>暂无症状记录</h3></div>`}
        <div class="small-note">自评分数只表示"你自己觉得的程度"，不是医学分级。</div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>发热与寒战</h2><p>JAU-01 · 照原话记：体温、持续多久、你做了什么</p></div></div>
        ${fever.length ? fever.map((o) => row(
          `${esc(OBS_NAME[o.kind])}${o.value ? ` · ${esc(o.value)}℃` : ''}`,
          `${esc(o.on)} · ${esc(o.note)}${o.action ? `<br>当时的处理：${esc(o.action)}` : ''}`,
          pill(`自评 ${o.severity}/10`, 'grey')
        )).join('') : `<div class="empty"><h3>暂无发热记录</h3></div>`}
        <div class="notice plain" style="margin:14px 0 0">出现发热、寒战、皮肤眼白发黄加重、陶土样便、尿色明显变深这些情况时，该联系你的医疗团队。要不要去、去哪、怎么处理，请按他们给你的联系方式问。</div>
      </section>
      <section class="card wide">
        <div class="card-head"><div><h2>这些指标在查什么</h2><p>JAU-03 · 解释的是检查项目本身，不是你的结果</p></div></div>
        <div class="gate"><i>!</i><div><b>这一段先不显示。</b>要解释"总胆红素/直接胆红素/ALP/GGT 各查什么"，必须同时给出<b>机构 + 版本 + 页码</b>。当前库里缺<span class="miss">页码</span>，所以整块按「未引入」处理。
          <div style="margin-top:6px">缺一个就不显示，是因为少了页码的解释，读者没法自己回去核对——那还不如不说。</div></div></div>
        <div class="small-note">同一屏还必须写明：这里讲的是检查项目，不是你的这一份结果。</div>
      </section>
    </div>`;
}

/* ---------------- 引流照护（DR-01~04） ---------------- */
function vDrain() {
  const devs = P().drainageDevices;
  const logs = P().drainageLogs;
  if (!devs.length) {
    return pageHead() + `<div class="empty" style="margin-top:0"><h3>这套档案没有胆道引流记录</h3><p>引流页不是空的装饰：有管子的档案才会出现装置事件与每日记录。</p></div>
      <div class="notice plain">没有管子的档案不显示这一屏的表格，比显示一张空表更诚实。</div>`;
  }
  const maxMl = Math.max(...logs.map((l) => l.ml), 1);
  const active = devs.filter((d) => d.event !== 'remove').slice(-1)[0];
  return pageHead(`<button class="primary" data-action="export-drain">导出 7 日引流表</button>`) + `
    <div class="grid two">
      <section class="card wide">
        <div class="card-head"><div><h2>装置事件</h2><p>DR-01 · 置入 / 换管 / 拔除，各记一行</p></div>${active ? pill(`当前在带：${DEVICE_NAME[active.kind]}`, 'violet') : pill('目前无带管', 'grey')}</div>
        ${devs.map((d) => `<div class="dev">
          <div class="dev-head"><b>${esc(d.event === 'insert' ? '置入' : d.event === 'exchange' ? '换管' : '拔除')} · ${esc(DEVICE_NAME[d.kind])}</b>${pill(`${SIDE_NAME[d.side] || d.side}`, 'grey')}${d.note ? pill(d.note) : ''}</div>
          <dl><div><dt>日期</dt><dd>${esc(d.insertedOn)}${d.removedOn && d.removedOn !== d.insertedOn ? ` → ${esc(d.removedOn)}` : ''}</dd></div>
            <div><dt>做的科室</dt><dd>${esc(d.hospital)}</dd></div></dl></div>`).join('')}
        <div class="small-note">管子是事件不是属性：换过几次、哪次拔的，都会影响后面怎么看引流量的变化。</div>
      </section>

      <section class="card wide">
        <div class="card-head"><div><h2>每日引流量</h2><p>DR-02 · 每天一根柱；没记的日子就空着</p></div>${pill(`共 ${logs.length} 天记录`, 'grey')}</div>
        <div class="drain-bars">${logs.map((l) => `<div class="bar" title="${esc(l.on)} · ${l.ml} mL · ${COLOR_NAME[l.color] || l.color} · ${PATENCY_NAME[l.patency] || l.patency}"><em>${l.ml}</em><i style="height:${Math.max(3, (l.ml / maxMl) * 100)}%"></i><span>${esc(l.on.slice(5))}</span></div>`).join('')}</div>
        <div class="table-wrap" style="margin-top:26px"><table><thead><tr><th>日期</th><th>量</th><th>颜色</th><th>通畅度</th><th>备注</th></tr></thead><tbody>
          ${logs.slice().reverse().map((l) => `<tr><td class="num">${esc(l.on)}</td><td class="num"><b>${l.ml} mL</b></td><td>${esc(COLOR_NAME[l.color] || l.color)}</td><td>${esc(PATENCY_NAME[l.patency] || l.patency)}</td><td>${esc(l.note || '')}</td></tr>`).join('')}
        </tbody></table></div>
      </section>

      <section class="card">
        <div class="card-head"><div><h2>观察项</h2><p>DR-03 · 只记看到的，不折算成急症等级</p></div></div>
        ${P().drainageObs.map((o) => row(
          `${esc(OBS_NAME[o.kind] || o.kind)}${o.value ? ` · ${esc(o.value)}℃` : ''}`,
          `${esc(o.on)} · ${esc(o.note)}${o.action ? `<br>当时的处理：${esc(o.action)}` : ''}`,
          pill(`自评 ${o.severity}/10`, 'grey')
        )).join('')}
        <div class="notice plain" style="margin-top:12px">发热、寒战、腹痛加重、引流液变浑浊或带血、敷料反复湿透——出现这些情况时的联系方式，请按出院时给你的那张单子来。</div>
      </section>

      <section class="card">
        <div class="card-head"><div><h2>带去门诊的两样东西</h2><p>DR-04</p></div></div>
        ${row('7 日引流表', '最近 7 天的量与颜色，一页纸，按日期排；不含任何"好/不好"的判断', `<button class="source-link" data-action="export-drain">预览</button>`)}
        ${row('观察项清单', '同期出现过的发热、寒战、敷料情况，照原话', `<button class="source-link" data-action="export-drain">预览</button>`)}
        <div class="small-note">导出的是原始记录表。工作台不会替你写一段"本周情况小结"——那属于解读。</div>
      </section>
    </div>`;
}

/* ---------------- 治疗（TRT-01~06，三个页签） ---------------- */
function vTreat() {
  const sub = state.sub.treat || 0;
  return pageHead() + (sub === 0 ? treatLine() : sub === 1 ? treatBasis() : treatMarkers());
}

function treatLine() {
  const ts = P().treatments.slice().sort((a, b) => (a.startedOn || '9999').localeCompare(b.startedOn || '9999'));
  const cur = currentTreatment();
  const pct = cur && cur.cyclesPlanned ? Math.min(100, Math.round((cur.cyclesDone / cur.cyclesPlanned) * 100)) : null;
  return `
    ${cur ? `<div class="plan-card" style="margin-bottom:16px">
      <div><div class="small-note" style="margin:0 0 4px">TRT-02 · 当前治疗进度</div>
        <div class="big">${esc(cur.regimen)} <small>${esc(cur.intent === 'adjuvant' ? '术后辅助' : cur.intent === 'palliative' ? '姑息' : '根治性')}</small></div>
        <p style="font-size:12.5px;margin-top:6px">计划 ${cur.cyclesPlanned ?? '—'} 周期，已完成 ${cur.cyclesDone ?? '—'} 周期 · ${esc(cur.institution || '—')}</p>
        ${pct !== null ? `<div class="progress"><i style="width:${pct}%"></i></div>` : ''}
      </div>
      <div>${pill(`${cur.startedOn} 起`, 'violet')}</div>
    </div>` : ''}
    <section class="card">
      <div class="card-head"><div><h2>线序时间轴</h2><p>TRT-01 · 做过什么、按什么意图做、谁在做</p></div>${pill(`${ts.length} 条`, 'grey')}</div>
      ${ts.map((t) => `<div class="milestone ${t.endedOn ? '' : 'on'}">
        <span class="dot"></span>
        <div><b>${esc(t.regimen)}</b>
          <p>${esc(t.institution || '—')} · ${esc(t.intent === 'adjuvant' ? '术后辅助' : t.intent === 'palliative' ? '姑息' : '根治性')}${t.line ? ` · 第 ${t.line} 线` : ''}</p>
          ${t.response ? `<p style="color:var(--ink-2)">医生记录：${esc(t.response)}</p>` : ''}</div>
        <small>${esc(t.startedOn || '—')}${t.endedOn ? ` → ${esc(t.endedOn)}` : ' → 进行中'}</small>
      </div>`).join('')}
      <div class="small-note">"第几线"按记录里的写法照抄。辅助治疗算不算第一线，不同医院写法不一样，工作台不换算。</div>
    </section>`;
}

function treatBasis() {
  const ds = P().decisions;
  const guideline = { org: '', version: '', page: '' };
  const missing = !guideline.org || !guideline.version || !guideline.page;
  return `
    <div class="notice violet"><b>这一屏回答的是"当时为什么这么定"，不是"该不该这么定"。</b>医生原话照抄，涉及哪几个指标就挂哪几个，指标带日期和值。工作台不评价方案。</div>
    ${ds.length ? ds.map((d) => `<section class="card" style="margin-bottom:14px">
      <div class="card-head"><div><h2>${esc(d.topic)}</h2><p>${esc(d.on)} · ${esc(d.statedBy)}</p></div>${pill(SOURCE_NAME[d.source] || d.source, 'grey')}</div>
      <div style="border-left:3px solid var(--violet);padding:2px 0 2px 13px;margin:6px 0 12px">
        <div class="small-note" style="margin:0 0 3px">TRT-03 · 医生原话（不改写）</div>
        <div style="font-size:13.5px;line-height:1.7">「${esc(d.reason)}」</div>
      </div>
      ${d.metrics.length ? `<div class="small-note" style="margin:0 0 6px">TRT-05 · 当时看了这几个指标</div>
        <div class="table-wrap"><table><thead><tr><th>指标</th><th>日期</th><th>值</th><th>本单参考</th><th>倍数</th></tr></thead><tbody>
        ${d.metrics.map(([mid, on]) => {
          const m = MET()[mid]; if (!m) return '';
          const pt = pts(m).find((p) => p.d === on);
          const x = pt && m.refHigh ? uln(m, pt.v) : null;
          const ref = m.refHigh ? `≤ ${m.refHigh}` : m.refLow ? `≥ ${m.refLow}` : '—';
          return `<tr><td><b>${esc(m.name)}</b></td><td class="num">${esc(on)}</td><td class="num">${pt ? `${dec(pt.v, m.dec)} ${esc(m.unit)}` : '—'}</td><td class="num">${ref}</td><td class="num">${x === null ? '—' : fmtUln(x)}</td></tr>`;
        }).join('')}</tbody></table></div>` : `<div class="small-note">这条记录没有挂指标。</div>`}
    </section>`).join('') : `<div class="empty"><h3>还没有方案依据记录</h3><p>这一屏的价值来自"谁在什么时候说了什么"，没有记录就不编</p></div>`}

    <section class="card">
      <div class="card-head"><div><h2>指南条目</h2><p>TRT-04 · 机构 + 版本 + 页码，缺一项整条不显示</p></div></div>
      ${missing ? `<div class="gate"><i>!</i><div><b>本次涉及的指南条目：未引入。</b>缺<span class="miss">${[!guideline.org && '机构', !guideline.version && '版本', !guideline.page && '页码'].filter(Boolean).join(' / ')}</span>。
        库里有 guideline_ref 这张表，字段是 NOT NULL 的——插一条缺页码的记录会被数据库直接拒绝，所以界面这里只能显示"未引入"，而不是"大致按某某指南"。</div></div>`
      : `<div>${esc(guideline.org)} ${esc(guideline.version)} 第 ${esc(guideline.page)} 页</div>`}
      <div class="small-note">为什么不放"你符合哪一条"：那需要把病人的情况往条目里套，是医生的活。这一屏只把"医生当时引了什么"摆在旁边。</div>
    </section>`;
}

function treatMarkers() {
  const g = P().genomics;
  return `
    <section class="card">
      <div class="card-head"><div><h2>检测位点（三态）</h2><p>TRT-06 · 已测阳性 / 已测阴性 / 未检测，三者不混用</p></div>${pill(`${g.test.on} · ${esc(g.test.platform === 'tissue_ngs' ? '组织 NGS' : g.test.platform)}`, 'grey')}</div>
      <div class="small-note" style="margin:0 0 10px">${esc(g.test.lab)} · ${esc(g.test.note)}</div>
      ${g.results.map((r) => {
        const st = r.tested === 0 ? 'untested' : r.result === 'positive' ? 'pos' : r.result === 'negative' ? 'neg' : 'neg';
        const label = r.tested === 0 ? '未检测' : r.result === 'positive' ? '已测 · 阳性' : r.result === 'negative' ? '已测 · 阴性' : '已测 · 不确定';
        return `<div class="tri"><b>${esc(r.gene)}${r.alteration ? ` ${esc(r.alteration)}` : ''}</b>
          <span class="state ${st}">${esc(label)}</span>
          <span class="raw">${esc(r.raw)}${r.value ? ` · ${esc(r.value)}` : ''}</span>
          ${r.tested === 0 ? pill('报告未覆盖', 'orange') : pill('有原文', 'grey')}</div>`;
      }).join('')}
      <div class="notice plain" style="margin-top:14px"><b>为什么"未检测"要单独一种颜色：</b>报告里没写这个位点，不等于它是阴性。库层用 <code>CHECK (tested = 1 OR result IS NULL)</code> 加两个触发器兜住这一点——想存"未检测 + 阴性"会直接被拒。</div>
      <div class="verdict" style="margin-top:10px"><b>测出来阳性意味着什么、要不要据此改方案</b><span>这一句需要问你的医生。</span></div>
    </section>`;
}

/* ---------------- 化验与报告（LAB-01~09，三个页签） ---------------- */
function vLabs() {
  const sub = state.sub.labs || 0;
  return pageHead() + (sub === 0 ? labValues() : sub === 1 ? labReports() : labFlags());
}

function labValues() {
  const ms = D.metricOrder.map((k) => MET()[k]).filter(Boolean);
  return `
    <div class="notice"><b>LAB-02 · 参考范围只认这张单自带的。</b>同一份血，不同实验室的 ALT 上限能差到 1.4 倍，借通用上限一除，能把 2 级说成 1 级。缺上限时这里显示虚线徽章，不显示倍数。</div>
    <section class="card">
      <div class="card-head"><div><h2>最近一次值与倍数</h2><p>LAB-01 / LAB-02 · 值是事实，倍数是除法</p></div>${pill(`${ms.length} 个指标有记录`, 'grey')}</div>
      <div class="table-wrap"><table><thead><tr><th>指标</th><th>最近值</th><th>日期</th><th>与上次</th><th>本单参考</th><th>倍数</th><th>分级对照</th></tr></thead><tbody>
        ${ms.map((m) => {
          const a = last(m), d = diff(m);
          const x = a && m.refHigh ? uln(m, a.v) : null;
          const ref = m.refHigh ? `≤ ${m.refHigh}` : m.refLow ? `≥ ${m.refLow}` : (m.grade ? '<span class="pill grey">需参考上限</span>' : '<span class="muted">未登记</span>');
          return `<tr><td><b>${esc(m.name)}</b><br><span class="muted" style="font-size:10.5px">${esc(m.short)} · ${esc(m.cat)}</span></td>
            <td class="num"><b>${dec(a.v, m.dec)}</b> <span class="muted">${esc(m.unit)}</span></td>
            <td class="num">${esc(a.d)}</td>
            <td class="num">${d === null ? '—' : `${d > 0 ? '+' : ''}${dec(d, m.dec)}`}</td>
            <td class="num">${ref}</td>
            <td class="num">${x === null ? '—' : fmtUln(x)}</td>
            <td>${m.noGrade ? pill('不做分级', 'grey') : '<span class="muted" style="font-size:11px">未引入</span>'}</td></tr>`;
        }).join('')}
      </tbody></table></div>
      <div class="small-note">"与上次"只减最近两个值，不判断方向是否"有意义"。缺参考上限的指标，倍数一栏留空而不是拿通用值凑。</div>
    </section>

    <div class="grid two" style="margin-top:14px">
      <section class="card">
        <div class="card-head"><div><h2>分级对照</h2><p>LAB-03 · 缺页码就整块不显示</p></div></div>
        <div class="gate"><i>!</i><div><b>分级对照：未引入。</b>要显示"1 级 · &gt;1.0–3.0 ×ULN"，必须给出 ${esc(GRADE_SRC.org)} ${esc(GRADE_SRC.version)} 的<span class="miss">页码</span>；库里这条页码是空的，所以整块先不出现。
          <div style="margin-top:6px">这里刻意保留"什么都不显示"的状态——把它做成"差不多能对上"的表格，读者会以为自己拿到了标准。</div></div></div>
        <div class="actions" style="margin-top:12px"><button class="soft" data-action="grade-preview">看这条规则在做什么</button></div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>CA19-9 为什么不给分级</h2><p>LAB-04</p></div></div>
        <p style="font-size:12.5px">CTCAE 里没有 CA19-9 的分级条目，也没有公认的阈值。所以这一栏永远只做两件事：趋势 + 与参考范围对照，不给徽章。</p>
        <div class="small-note">硬凑一个分级，是最典型的"借数据"：读者会当成标准用，而它其实是我们自己编的。</div>
      </section>
    </div>`;
}

function labReports() {
  const docs = P().docs.slice().sort((a, b) => b.on.localeCompare(a.on));
  return `
    <div class="notice"><b>LAB-05 · 报告只做索引。</b>每份文件一行：日期、类型、谁开的、结果原文首行、有没有进趋势。工作台不读片、不总结"报告说没事"。</div>
    <section class="card">
      <div class="card-head"><div><h2>报告清单</h2><p>原文首行照抄，不改写；截断处不补字</p></div>${pill(`${docs.length} 份`, 'grey')}</div>
      ${docs.map((d) => `<div class="report-row">
        <span class="date">${esc(d.on)}</span>
        <div><b>${esc(d.title)}</b><p>「${esc(d.line)}」</p><span class="muted" style="font-size:10.5px">${esc(KIND_NAME[d.kind] || d.kind)} · ${esc(d.by)}</span></div>
        <div class="tags">${d.trend ? pill('已进趋势', 'violet') : pill('未进趋势', 'grey')}<button class="source-link" data-action="open-doc" data-title="${esc(d.title)}">原件</button></div>
      </div>`).join('')}
      <div class="small-note">LAB-07 · "进趋势"的意思是这份报告里的数值被采进了指标序列；病理、出院小结这类没有数值的，永远不进趋势。</div>
    </section>

    <div class="grid two" style="margin-top:14px">
      <section class="card">
        <div class="card-head"><div><h2>检查项目说明</h2><p>LAB-06 · 说的是检查项目，不是你的结果</p></div></div>
        <div class="gate"><i>!</i><div><b>未引入。</b>解释"总胆红素、直接胆红素、ALP、GGT、CA19-9 各查什么"需要机构 + 版本 + 页码三样，当前缺<span class="miss">页码</span>。
          <div style="margin-top:6px">即便将来补上，这段也会固定带一句：它讲的是检查项目本身，不是你的这一份结果。</div></div></div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>看不出来的时候</h2><p>LAB-08 / LAB-09 的入口</p></div></div>
        <p style="font-size:12.5px">看不懂的地方不用硬扛：整句看不懂、单位看不懂、数值想问，都可以打一个标。标会原样进到问题清单，带去门诊。</p>
        <div class="actions" style="margin-top:12px"><button class="primary" data-action="to-labs-flags">去看打标记录</button></div>
      </section>
    </div>`;
}

function labFlags() {
  const fs = P().flags;
  return `
    <div class="notice violet"><b>LAB-08 · 打标不给答案。</b>标一个"看不懂"，工作台只做一件事：把它原样搬到问题清单里。它不会顺手给一个解释——那会变成用通用说法顶替医生的具体判断。</div>
    <section class="card">
      <div class="card-head"><div><h2>我标过的</h2><p>${fs.length} 条</p></div><button class="soft" data-action="flag-new">标一条</button></div>
      ${fs.length ? fs.map((f) => {
        const m = MET()[f.metric];
        return `<div class="flag-row"><div><b>${esc(m ? m.name : f.metric)} · ${esc(f.on)}</b>
          <p>${esc(f.note)}</p>
          <small>${esc(FLAG_NAME[f.kind] || f.kind)} · 标于 ${esc(f.on)}</small></div>
          ${pill('已进问题清单', 'violet')}</div>`;
      }).join('') : `<div class="empty"><h3>还没标过</h3><p>看到看不懂的行，点右侧"标一条"</p></div>`}
    </section>
    <section class="card" style="margin-top:14px">
      <div class="card-head"><div><h2>LAB-09 · 带进问题清单</h2><p>打标 → 问题，一步，不加工</p></div></div>
      ${row('生成的问题', '每一条标的原话都会变成一条待问事项，写清"这条是哪个指标、哪天"', `<button class="source-link" data-action="go" data-page="care">去清单</button>`)}
      ${row('不会生成的部分', '"这个值意味着什么"的答案。这一栏永远是空的，因为它属于医生', pill('不生成', 'grey'))}
    </section>`;
}

/* ---------------- 影像（IMG-01~02） ---------------- */
function vImaging() {
  const ts = P().tumor.slice().sort((a, b) => b.on.localeCompare(a.on));
  return pageHead() + `
    <div class="notice"><b>IMG-01 · 这一屏抄的是报告里写了什么。</b>病灶数、最大径、淋巴结、远处、血管、胆管分型，逐次记。它不写"比上次好转/进展"——两次之间的变化由医生在门诊读。wording-ok</div>
    ${ts.map((t) => {
      const doc = P().docs.find((d) => d.kind === 'imaging' && d.on === t.on);
      return `<section class="card" style="margin-bottom:13px">
      <div class="card-head"><div><h2>${esc(MODALITY_NAME[t.modality] || t.modality)} · ${esc(t.on)}</h2>
        <p>${t.count === 0 ? '报告未见明确病灶' : `病灶 ${t.count} 个${t.maxMm ? ` · 最大径 ${t.maxMm} mm` : ''}`}</p>
        <p style="font-size:11px;color:var(--muted);margin-top:2px">${doc ? `谁报的：${esc(doc.by)}` : '报告清单里没有这一天的原件，只有日期与数值'}</p></div>
        ${t.duct ? pill(t.duct, 'violet') : ''}</div>
      <div class="table-wrap"><table><thead><tr><th>项目</th><th>报告里写的</th></tr></thead><tbody>
        <tr><td>病灶数 / 最大径</td><td>${t.count} 个${t.maxMm ? ` / ${t.maxMm} mm` : ''}</td></tr>
        <tr><td>淋巴结</td><td>${t.node === 'yes' ? '见肿大淋巴结' : t.node === 'suspected' ? '可疑（报告原文用词）' : '未见'}</td></tr>
        <tr><td>远处转移</td><td>${t.distant === 'yes' ? '见远处病灶' : '未见'}</td></tr>
        <tr><td>血管 / 胆管</td><td>${esc([t.vascular, t.duct].filter(Boolean).join(' · ') || '—')}</td></tr>
        <tr><td>腹水</td><td>${t.ascites === 'none' ? '无' : esc(t.ascites)}</td></tr>
      </tbody></table></div>
      ${t.lesions.length ? `<div class="small-note" style="margin-top:10px">IMG-02 · 病灶列表：${t.lesions.map((l) => `#${l.seq} ${esc(l.segment)} ${l.size} mm`).join(' · ')}</div>` : ''}
    </section>`;
    }).join('')}
    <div class="verdict"><b>这两次影像之间的变化算什么</b><span>这一句需要问你的医生。</span></div>`;
}

/* ---------------- 一图秀（CHT-01~03） ---------------- */
const CW = 980, CH = 420, CX0 = 62, CX1 = 954, CY0 = 132, CY1 = 366;
const fmtNum = (v, d) => (typeof v === 'number' ? v.toFixed(d ?? 1) : String(v ?? ''));
const numPts = pts;
const addDays = (d, n) => new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);

function dataBounds() {
  const ds = [];
  for (const m of Object.values(MET())) for (const p of m.points) ds.push(p.d);
  for (const b of P().bands) { ds.push(b.from); ds.push(b.to); }
  ds.sort();
  return [Date.parse(ds[0]), Date.parse(ds[ds.length - 1])];
}
function domain() {
  const [s, e] = dataBounds();
  const months = { '3m': 3, '6m': 6, all: 0 }[state.range];
  const start = months ? new Date(new Date(e).setMonth(new Date(e).getMonth() - months)) : new Date(s);
  return [start.getTime(), e];
}
const inDomain = (d, t0, t1) => { const t = Date.parse(d); return t >= t0 && t <= t1; };
const xOf = (t, t0, t1) => CX0 + (t - t0) / Math.max(1, t1 - t0) * (CX1 - CX0);

function smoothPath(coords) {
  const n = coords.length;
  if (!n) return '';
  if (n === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  const dx = [], slope = [];
  for (let i = 0; i < n - 1; i++) {
    const ddx = coords[i + 1].x - coords[i].x;
    dx.push(ddx);
    slope.push(ddx ? (coords[i + 1].y - coords[i].y) / ddx : 0);
  }
  const tan = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) tan.push(0);
    else {
      const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
      tan.push((w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]));
    }
  }
  tan.push(slope[n - 2]);
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = coords[i].x + dx[i] / 3, c1y = coords[i].y + tan[i] * dx[i] / 3;
    const c2x = coords[i + 1].x - dx[i] / 3, c2y = coords[i + 1].y - tan[i + 1] * dx[i] / 3;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  return d;
}

function bandsFor(t0, t1) {
  const color = { surgery: '#a03d5c', drain: '#7e6a2c', systemic: '#a9761c' };
  return P().bands
    .filter((b) => Date.parse(b.to) >= t0 && Date.parse(b.from) <= t1)
    .map((b) => {
      const s = Math.max(Date.parse(b.from), t0), e2 = Math.min(Date.parse(b.to), t1);
      return { ...b, color: color[b.kind] || '#a9761c', x1: xOf(s, t0, t1), x2: xOf(e2, t0, t1) };
    });
}
function monthTicks(t0, t1) {
  const out = []; const d = new Date(t0); let cur = new Date(d.getFullYear(), d.getMonth(), 1);
  if (cur.getTime() < t0) cur.setMonth(cur.getMonth() + 1);
  while (cur.getTime() <= t1) {
    const x = xOf(cur.getTime(), t0, t1);
    if (x > CX0 + 6 && x < CX1 - 6) out.push({ x, label: `${cur.getMonth() + 1}月` });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return out.length > 7 ? out.filter((_, i) => i % 2 === 0) : out;
}
function chartSVG(t0, t1) {
  const bands = bandsFor(t0, t1);
  const sel = state.sel.filter((c) => MET()[c]).map((c) => {
    const m = MET()[c]; const all = numPts(m).map((p) => p.v);
    const lo = Math.min(...all), hi = Math.max(...all);
    return { code: c, m, lo, hi, span: hi - lo || Math.max(Math.abs(hi) * 0.08, 1), pts: numPts(m).filter((p) => inDomain(p.d, t0, t1)) };
  }).filter((s) => s.pts.length);
  if (!sel.length) return `<div class="empty"><h3>这个时间窗里没有所选指标</h3><p>扩大时间范围，或在左侧加选一个指标。</p></div>`;
  const yOf = (s, v) => CY1 - (v - s.lo) / s.span * (CY1 - CY0);
  const grid = [0, 1, 2, 3, 4].map((i) => { const y = CY0 + i * (CY1 - CY0) / 4; return `<line class="grid" x1="${CX0}" x2="${CX1}" y1="${y}" y2="${y}"/>`; }).join('');
  const strip = bands.map((b) => {
    const w = Math.max(b.x2 - b.x1, 7).toFixed(1);
    return `<g><rect x="${b.x1.toFixed(1)}" y="36" width="${w}" height="9" rx="4.5" fill="${b.color}" opacity=".32"/>
      <text x="${(b.x1 + 1).toFixed(1)}" y="30" font-size="9" fill="${b.color}" font-weight="500">${esc(b.label)}</text></g>`;
  }).join('');
  /* CHT-03 事件竖线：从顶部画到数据区底，虚线；不写"复发""进展"这类词，只写日期来源。wording-ok */
  const marks = P().marks.filter((mk) => inDomain(mk.d, t0, t1)).map((mk) =>
    `<line x1="${xOf(Date.parse(mk.d), t0, t1).toFixed(1)}" x2="${xOf(Date.parse(mk.d), t0, t1).toFixed(1)}" y1="14" y2="${CY1}" stroke="#b0a692" stroke-width="1" stroke-dasharray="3 6" opacity=".6"/>`).join('');
  const lastPos = sel.map((s) => {
    const c = s.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: yOf(s, p.v) }));
    const l = c[c.length - 1];
    return { s, x: l.x, y: l.y, v: s.pts[s.pts.length - 1].v };
  }).sort((a, b) => a.y - b.y);
  let cursor = -Infinity;
  for (const it of lastPos) { it.ly = Math.max(it.y, cursor + 13); cursor = it.ly; }
  const over = lastPos.length ? Math.max(0, lastPos[lastPos.length - 1].ly - (CY1 + 2)) : 0;
  if (over) for (const it of lastPos) it.ly -= over;
  const lines = sel.map((s) => {
    const coords = s.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: yOf(s, p.v) }));
    const path = s.pts.length > 1 ? `<path class="line" d="${smoothPath(coords)}" stroke="${s.m.color}" pathLength="1"/>` : '';
    const points = coords.map((c, i) => `<circle class="pt" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i === s.pts.length - 1 ? 5.2 : 4}" fill="${s.m.color}"/>`).join('');
    const lp = lastPos.find((x) => x.s === s);
    const nearRight = lp.x > CX1 - 44;
    return `<g>${path}${points}<text class="delta-tag" x="${(nearRight ? lp.x - 8 : lp.x + 8).toFixed(1)}" y="${(lp.ly + 4).toFixed(1)}" text-anchor="${nearRight ? 'end' : 'start'}" fill="${s.m.color}">${fmtNum(lp.v, s.m.dec)}</text></g>`;
  }).join('');
  const ticks = monthTicks(t0, t1).map((t) => `<line class="axis" x1="${t.x.toFixed(1)}" x2="${t.x.toFixed(1)}" y1="${CY1}" y2="${CY1 + 5}"/><text class="tick" x="${t.x.toFixed(1)}" y="${CY1 + 18}" text-anchor="middle">${t.label}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="所选指标的时序图，共 ${sel.length} 条序列">
    ${grid}${ticks}${marks}${strip}${lines}
    <text x="6" y="34" font-size="9" fill="#9c9483">治疗</text>
    <text class="tick" x="${CX0}" y="${CY1 + 36}">各序列按自身全部记录的最小值–最大值归一化，不代表数值可比</text>
  </svg>`;
}

function mcard(code) {
  const m = MET()[code]; if (!m) return '';
  const a = last(m), d = diff(m);
  const flipped = !!state.flip[code];
  const sp = pts(m);
  const lo = Math.min(...sp.map((p) => p.v)), hi = Math.max(...sp.map((p) => p.v));
  const w = 200, h = 54;
  const path = sp.length > 1 ? smoothPath(sp.map((p, i) => ({ x: (i / (sp.length - 1)) * w, y: h - ((p.v - lo) / (hi - lo || 1)) * (h - 6) - 3 }))) : '';
  return `<button class="mcard" data-action="flip" data-code="${code}" data-flipped="${flipped}" aria-pressed="${flipped}" aria-label="${esc(m.name)}：点按翻面看记录清单">
    <span class="mcard-inner">
      <span class="mface">
        <span class="cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span>
        <span class="name">${esc(m.name)}</span>
        <span class="val">${dec(a.v, m.dec)}<small>${esc(m.unit)}</small></span>
        <span class="delta">${d === null ? '只有 1 次记录' : `与上次 <em>${d > 0 ? '+' : ''}${dec(d, m.dec)}</em>`} · ${esc(a.d)}</span>
        <span class="rec">${sp.length > 1 ? `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path class="sp-line" d="${path}" stroke="${m.color}"/></svg>` : `<span class="hint">只有 1 次记录，暂不连线</span>`}</span>
        <span class="meta"><span>${m.refHigh ? `参考上限 ${m.refHigh}` : m.refLow ? `参考下限 ${m.refLow}` : '未登记参考范围'}</span><span class="hint">点卡片翻面 →</span></span>
      </span>
      <span class="mface back">
        <span class="cat"><i style="background:${m.color}"></i>CHT-02 · 卡背</span>
        <span class="name">${esc(m.name)} · 全部 ${sp.length} 次记录</span>
        <span class="count">${sp.slice(-4).map((p) => `${p.d.slice(5)} ${dec(p.v, m.dec)}`).join(' · ')}</span>
        <span class="rec" style="margin-top:auto">单位 ${esc(m.unit)}${m.refHigh ? ` · 本单上限 ${m.refHigh}` : ''}</span>
        <span class="foot">卡背也是事实清单，不含判读</span>
      </span>
    </span>
  </button>`;
}

function vChart() {
  const [t0, t1] = domain();
  const cats = D.catOrder;
  return pageHead(`<div class="chips">${[['all', '全部'], ['6m', '近 6 个月'], ['3m', '近 3 个月']].map(([k, l]) => `<button class="chip" aria-pressed="${state.range === k}" data-action="range" data-range="${k}">${l}</button>`).join('')}</div>`) + `
    <div class="notice"><b>CHT-01 · 一张图看两条线。</b>指标各按自身量程铺开，所以只看形状与时间对齐，不比大小。治疗色带在上，评估竖线贯穿——它们都是"哪天发生了什么"，不是"效果好不好"。</div>
    <div class="overview">
      <aside class="rail">
        <h3>选指标（最多 4 条）</h3>
        ${cats.map((c) => `<div class="cat-label">${esc(c)}</div>${D.metricOrder.map((k) => MET()[k]).filter((m) => m && m.cat === c).map((m) => `
          <label class="metric-pick"><input type="checkbox" data-action="pick" data-code="${m.id}" ${state.sel.includes(m.id) ? 'checked' : ''}><i style="background:${m.color}"></i><span>${esc(m.name)}</span><small>${pts(m).length}</small></label>`).join('')}`).join('')}
        <div class="small-note">未检测与缺失不会被插值补点。</div>
      </aside>
      <div class="timeline-main">
        <section class="chart-panel">
          <div class="chart-top"><div><h2>指标 · 治疗 · 评估 对齐时间轴</h2><p class="muted" style="font-size:11.5px">${P().name} · ${esc(P().tag)}</p></div></div>
          <div class="legend">${state.sel.filter((c) => MET()[c]).map((c) => `<span><i style="background:${MET()[c].color}"></i><b>${esc(MET()[c].short)}</b> <span class="range">${esc(MET()[c].unit)}</span></span>`).join('')}</div>
          <div class="chart-wrap">${chartSVG(t0, t1)}</div>
        </section>
        <div class="metric-group">
          <div class="metric-group-head"><h3>指标卡</h3><span>点卡片翻面看记录清单（CHT-02）</span></div>
          <div class="metric-grid">${state.sel.filter((c) => MET()[c]).map(mcard).join('')}</div>
        </div>
      </div>
    </div>`;
}

/* ---------------- 复查与准备（CARE-01~03） ---------------- */
function vCare() {
  const visits = P().visits.slice().sort((a, b) => a.on.localeCompare(b.on));
  const planned = visits.filter((v) => v.planned);
  const qs = P().questions;
  return pageHead(`<button class="soft" data-action="print">打印这一页</button>`) + `
    <div class="grid two">
      <section class="card">
        <div class="card-head"><div><h2>复查计划</h2><p>CARE-01 · 日期来自门诊记录，不是系统排的</p></div></div>
        ${planned.length ? planned.map((v) => `<div class="alert-strip" style="margin-bottom:10px"><div><b>${esc(v.on)} · ${esc(v.dept)}</b><p>${esc(v.purpose)}${v.summary ? ` · ${esc(v.summary)}` : ''}</p></div>${pill(gapText(dayGap(TODAY, v.on)), 'violet')}</div>`).join('') : `<div class="empty"><h3>没有下次门诊的日期</h3><p>门诊给了日期，就在这里记一条</p></div>`}
        <div class="divider"></div>
        ${visits.filter((v) => !v.planned).slice().reverse().map((v) => row(`${esc(v.on)} · ${esc(v.dept)}`, `${esc(v.purpose)}${v.summary ? ` · ${esc(v.summary)}` : ''}`)).join('')}
        <div class="small-note">"还有多少天"只是日期减法。要不要提前去、要不要加查项目，按门诊的安排。</div>
      </section>

      <section class="card">
        <div class="card-head"><div><h2>问题清单</h2><p>CARE-02 · ${qs.filter((q) => !q.answered).length} 条待问</p></div><button class="soft" data-action="q-new">加一条</button></div>
        ${qs.map((q) => `<div class="saved-item ${q.answered ? '' : 'private'}">
          <b>${esc(q.body)}</b>
          <p>${esc(q.forVisit ? `带去 ${q.forVisit} 的门诊` : '还没定带去哪天')}${q.answered ? ` · 已有答复：${esc(q.answered)}` : ''}</p>
          <small>记于 ${esc(q.on)}${q.answered ? ' · 答复照原话记' : ''}</small></div>`).join('')}
        ${P().flags.length ? `<div class="small-note">另有 ${P().flags.length} 条是从"我不懂的"打标带过来的。</div>` : ''}
        <div class="verdict" style="margin-top:12px"><b>清单里的问题该得到什么答案</b><span>这一句需要问你的医生。</span></div>
      </section>

      <section class="card wide">
        <div class="card-head"><div><h2>带去门诊的东西</h2><p>CARE-03 · 打印或导出，只含原始记录</p></div></div>
        <div class="grid three">
          ${[['现状卡四行', '最近指标 / 影像原文 / 治疗周期 / 分期与可切除性'], ['7 日引流表', '量与颜色，按日期排'], ['问题清单', '自己写的问题 + 打标带过来的']].map(([t, s]) => `<div class="stat-tile"><span>${esc(s)}</span><b>${esc(t)}</b></div>`).join('')}
        </div>
        <div class="actions" style="margin-top:14px"><button class="primary" data-action="print">打印</button><button class="soft" data-action="export-drain">导出引流表</button></div>
        <div class="small-note">导出的每一页都带一句"这是本人/家属的记录，不是医疗结论"，免得被当成病历摘要转手。</div>
      </section>
    </div>`;
}

/* ---------------- 全局设置（SET-01~03） ---------------- */
function vSettings() {
  return pageHead() + `
    <div class="grid two">
      <section class="card">
        <div class="card-head"><div><h2>资料目录</h2><p>SET-01</p></div>${pill('本地', 'grey')}</div>
        <div class="path-row"><code>~/Documents/小胆宝资料/</code><button class="soft" data-action="pick-dir">选目录</button></div>
        <div class="small-note">档案、报告原件、导出的表格都放这里。目录由你自己选，工作台不默认往系统盘塞东西。</div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>字号档位</h2><p>SET-02 · 三档，跟着面板宽走</p></div></div>
        <div class="set-row"><div class="label"><b>当前档位</b><p>整体按 1 / 1.15 / 1.32 缩放；图表里的 SVG 文字不随档位放大，避免重叠</p></div>
          <div class="seg">${[[1, '标准'], [1.15, '大'], [1.32, '特大']].map(([v, l]) => `<button data-action="font" data-font="${v}" aria-pressed="${state.font === v}">${l}</button>`).join('')}</div></div>
        <div class="small-note">判据是 <code>body.scrollWidth</code> 有没有溢出，不是"看着差不多"。</div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>演示数据</h2><p>SET-03 · 与真实档案物理隔离</p></div>${pill(state.demoMode ? '演示档案在用' : '真实档案在用', state.demoMode ? 'orange' : 'violet')}</div>
        <div class="set-row"><div class="label"><b>使用演示档案</b><p>演示数据放在单独的库里（demo-data.sqlite），开关只切换读哪个库，不做合并。关掉不会删任何东西</p></div>
          <label class="switch"><input type="checkbox" data-action="demo-toggle" ${state.demoMode ? 'checked' : ''}><span>${state.demoMode ? '开' : '关'}</span></label></div>
        <div class="small-note">两套档案都是合成数据，姓名、医院、日期均为虚构。</div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>这一版是什么</h2><p>${esc(APP_INFO.stage)}</p></div>${pill(APP_INFO.version, 'grey')}</div>
        ${row('适用范围', esc(APP_INFO.scope))}
        ${row('不做什么', '不做诊断、不给处置建议、不预测预后、不评价方案优劣')}<!-- wording-ok 这句是在声明不做什么 -->
        ${row('判断出口', '唯一的说法是「这一句需要问你的医生」')}
        <div class="actions" style="margin-top:12px"><button class="soft" data-action="about">关于 / 构建信息</button></div>
      </section>
    </div>`;
}

/* ---------------- 渲染 ---------------- */
/* ---------------- 临床试验（TRL-01~12）：匹配 / 检索 / 收藏跟踪 ----------------
 *
 * 这一屏的规矩（与三层边界一致）：
 *   ① 病理特点、治疗线序、检测结果都是**患者记录里的字段**，每项带日期与来源；
 *   ② 试验条件是外部注册事实的要点，逐条对照成三态：符合 / 不符合 / 待确认；
 *   ③ 「符合度」是粗筛比例，不是入组资格，更不是疗效预期——
 *      硬性条件不满足的单列一组，未知项永远留成「待确认」，不用阴性或符合去填。
 *   演示条目的登记号以 DEMO- 开头，弹窗与页头都写明"合成数据、非真实在招试验"。
 */
const TRIAL_STATUS = { recruiting: '招募中', not_yet_recruiting: '即将招募', active_not_recruiting: '在研不招募', suspended: '暂停招募', terminated: '已终止', completed: '已完成', unknown: '状态未知' };
const SCOPE_NAME = { adjuvant: '术后辅助', neoadjuvant: '术前', advanced_1l: '晚期一线', advanced_2l: '晚期后线', agnostic: '不限瘤种/篮子', registry: '登记研究' };
const CRIT_CAT = { diagnosis: '诊断', subtype: '病理类型', stage: '分期', resectability: '可切除性', prior_tx: '既往治疗', genomic: '检测结果', organ: '器官功能', lab: '化验', age: '年龄', performance: '体能状态', other: '其他' };
const MATCH_STATE = { met: ['符合', 'ok'], unmet: ['不符合', 'no'], unknown: ['待确认', 'q'] };
const ENGINE_VERSION = 'match-0.1.0';

function trialFacts() {
  const cur = P().subtype.find((s) => s.current);
  const st = P().stage.find((s) => s.current);
  const res = P().resectability.find((r) => r.current);
  const resectedEver = P().treatments.some((t) => t.modality === 'resection');
  const recurrent = resectedEver && res && res.conclusion === 'unresectable';
  const systemic = P().treatments.filter((t) => t.modality === 'systemic' && t.line);
  const palliative = systemic.filter((t) => t.intent === 'palliative');
  const genes = {};
  for (const g of (P().genomics && P().genomics.results) || []) {
    genes[g.gene] = { tested: !!g.tested, result: g.result, value: g.value || '', raw: g.raw || '' };
  }
  const tb = MET().bilirubin_total, al = MET().albumin;
  const tbLast = tb ? last(tb) : null, alLast = al ? last(al) : null;
  return {
    subtype: cur ? cur.subtype : 'unknown',
    subtypeSrc: cur ? `${cur.statedOn} · ${cur.statedBy}` : '未记录',
    stage: st ? st.stage : '',
    stageMajor: st ? (String(st.stage).match(/^(IV|III|II|I)/) || [''])[0] : '',
    stageSrc: st ? `${st.statedOn} · ${st.statedBy}` : '未记录',
    resectability: res ? res.conclusion : 'unknown',
    resectabilityLabel: res ? CONCLUSION_NAME[res.conclusion] : '未记录',
    resectabilitySrc: res ? `${res.statedOn} · ${res.statedBy}` : '未记录',
    resectedEver,
    resectedNow: resectedEver && !recurrent,
    recurrent,
    priorSystemic: systemic.length,
    priorPalliative: palliative.length,
    advancedTxNaive: !resectedEver && palliative.length === 0,
    age: P().age,
    tbUln: tbLast && tb.refHigh ? tbLast.v / tb.refHigh : null,
    tbText: tbLast ? `总胆红素 ${dec(tbLast.v)} μmol/L / 本单上限 ${tb.refHigh ?? '未登记'}（${tbLast.d}）` : '未记录',
    albumin: alLast ? alLast.v : null,
    albuminText: alLast ? `白蛋白 ${dec(alLast.v, 1)} g/L（${alLast.d}）` : '未记录',
    ecog: null,
    ecogText: '未记录（门诊常写，但本工作台没有这个字段）',
    genes,
    geneTestOn: P().genomics && P().genomics.test ? P().genomics.test.on : '',
    biopsyOk: state.prefs.biopsy
  };
}

function geneFact(facts, gene) {
  const g = facts.genes[gene];
  if (!g) return { state: 'unknown', text: `报告里没有 ${gene} 这一项`, tested: false };
  if (!g.tested) return { state: 'unknown', text: `${gene} 未检测（报告原文：${g.raw || '未包含该位点'}）`, tested: false };
  const positive = g.result === 'positive';
  return { state: positive ? 'met' : 'unmet', text: `${gene} ${positive ? '阳性' : '阴性'}（${g.value || g.raw || '报告原文'}）`, tested: true };
}

function evalCriterion(c, facts) {
  if (!c.field) return { state: 'unknown', actual: '条目无法结构化，需人工核对', need: c.text };
  const f = c.field, op = c.op, v = c.value;
  const num = (x) => (typeof x === 'number' ? x : null);
  if (f.startsWith('gene:')) {
    const g = geneFact(facts, f.slice(5));
    if (g.state === 'unknown') return { state: 'unknown', actual: g.text, need: `${f.slice(5)} ${v}` };
    return { state: g.state, actual: g.text, need: `${f.slice(5)} ${v}` };
  }
  switch (f) {
    case 'subtype': {
      const ok = (c.value || []).includes(facts.subtype);
      return { state: ok ? 'met' : 'unmet', actual: `${SUBTYPE_NAME[facts.subtype] || facts.subtype}（${facts.subtypeSrc}）`, need: Array.isArray(v) ? v.map((x) => SUBTYPE_NAME[x] || x).join(' / ') : String(v) };
    }
    case 'stage_major': {
      if (!facts.stageMajor) return { state: 'unknown', actual: '分期未记录', need: Array.isArray(v) ? v.join(' / ') : String(v) };
      const ok = (c.value || []).includes(facts.stageMajor);
      return { state: ok ? 'met' : 'unmet', actual: `${facts.stage}（${facts.stageSrc}）`, need: (c.value || []).join(' / ') };
    }
    case 'resected_now': {
      const val = String(facts.resectedNow);
      return { state: val === v ? 'met' : 'unmet', actual: facts.resectedNow ? '已根治性切除、影像未见残留或复发' : (facts.recurrent ? '影像见新发结节，当前记为不可切除' : '无根治性切除记录'), need: v === 'true' ? '已根治性切除' : v };
    }
    case 'resected_ever':
      return { state: String(facts.resectedEver) === v ? 'met' : 'unmet', actual: facts.resectedEver ? '有根治性切除记录' : '无手术记录', need: '有根治性切除' };
    case 'recurrent':
      return { state: String(facts.recurrent) === v ? 'met' : 'unmet', actual: facts.recurrent ? '当前可切除性记为不可切除（复发后）' : '无复发记录', need: '影像提示复发' };
    case 'advanced_tx_naive': {
      const val = String(facts.advancedTxNaive);
      return { state: val === v ? 'met' : 'unmet', actual: facts.resectedEver ? '已做过根治性切除' : `既往晚期系统治疗 ${facts.priorPalliative} 线`, need: '未接受过晚期系统治疗' };
    }
    case 'prior_systemic': {
      const n = facts.priorSystemic, x = Number(v);
      const ok = op === 'gte' ? n >= x : op === 'lte' ? n <= x : n === x;
      return { state: ok ? 'met' : 'unmet', actual: `${n} 线（按治疗记录计数，含辅助）`, need: `${op === 'gte' ? '≥' : op === 'lte' ? '≤' : '='} ${v} 线` };
    }
    case 'prior_palliative': {
      const ok = facts.priorPalliative === Number(v);
      return { state: ok ? 'met' : 'unmet', actual: `${facts.priorPalliative} 线`, need: `${v} 线` };
    }
    case 'age': {
      const ok = facts.age >= Number(v);
      return { state: ok ? 'met' : 'unmet', actual: `${facts.age} 岁`, need: `≥ ${v} 岁` };
    }
    case 'ecog':
      return { state: 'unknown', actual: facts.ecogText, need: `ECOG ≤ ${v}` };
    case 'tb_uln': {
      if (facts.tbUln === null) return { state: 'unknown', actual: '总胆红素或本单上限缺失', need: `≤ ${v} × ULN` };
      return { state: facts.tbUln <= Number(v) ? 'met' : 'unmet', actual: `${facts.tbText} = ${facts.tbUln.toFixed(1)}×ULN`, need: `≤ ${v} × ULN` };
    }
    case 'albumin': {
      if (facts.albumin === null) return { state: 'unknown', actual: '白蛋白未记录', need: `≥ ${v} g/L` };
      return { state: facts.albumin >= Number(v) ? 'met' : 'unmet', actual: facts.albuminText, need: `≥ ${v} g/L` };
    }
    case 'biopsy_ok':
      return { state: facts.biopsyOk ? 'met' : 'unmet', actual: facts.biopsyOk ? '接受重新活检/提供标本' : '你在偏好里选了"不接受重新活检"', need: '可提供标本或接受活检' };
    default:
      return { state: 'unknown', actual: `字段 ${f} 暂无对应记录`, need: String(v) };
  }
}

function matchTrial(trial, facts) {
  const evals = (trial.criteria || []).map((c) => ({ c, r: evalCriterion(c, facts) }));
  const count = (s) => evals.filter((e) => e.r.state === s).length;
  const met = count('met'), unmet = count('unmet'), unknown = count('unknown');
  const hardUnmet = evals.filter((e) => e.r.state === 'unmet' && e.c.hard);
  const pct = Math.round((met / Math.max(1, met + unmet + unknown)) * 100);
  const band = hardUnmet.length ? 'ineligible' : (pct >= 80 && unknown <= 1) ? 'high' : pct >= 55 ? 'partial' : 'needs_info';
  const conflicts = [];
  if (trial.requiresBiopsy && !state.prefs.biopsy) conflicts.push('需要重新活检');
  if (trial.placebo && !state.prefs.placebo) conflicts.push('含安慰剂对照');
  if (state.prefs.city !== 'all' && !(trial.sites || []).some((s) => s.city === state.prefs.city)) conflicts.push(`没有${state.prefs.city}中心`);
  return { trial, evals, met, unmet, unknown, pct, band, hardUnmet, conflicts };
}

function matchAll() {
  const facts = trialFacts();
  return TRIALS.map((t) => matchTrial(t, facts));
}

function savedList() {
  if (!state.saved) state.saved = (P().savedTrials || []).map((x) => ({ ...x }));
  return state.saved;
}
const savedOf = (id) => savedList().find((s) => s.trialId === id);

const BAND = {
  high: ['高度符合', 'ok'],
  partial: ['部分符合', 'warn'],
  needs_info: ['需补充信息', 'grey'],
  ineligible: ['硬性条件不满足', 'no']
};
const critIcon = (s) => `<span class="crit-mark ${MATCH_STATE[s][1]}" aria-hidden="true">${s === 'met' ? '✓' : s === 'unmet' ? '✕' : '?'}</span>`;

function trialCard(m, facts) {
  const t = m.trial;
  const [bandLabel, bandCls] = BAND[m.band];
  const saved = savedOf(t.id);
  return `<section class="trial-card ${m.band === 'ineligible' ? 'ineligible' : ''}">
    <div class="trial-top">
      <div>
        <div class="trial-tags">${pill(TRIAL_STATUS[t.status], t.status === 'recruiting' ? 'ok' : t.status === 'suspended' ? 'no' : 'grey')}${pill(`${t.phase} 期`, 'grey')}${pill(SCOPE_NAME[t.scope], 'grey')}${t.verifiedOn ? pill(`核验 ${t.verifiedOn}`, 'plain') : pill('未核验', 'no')}</div>
        <h2>${esc(t.title)}</h2>
        <p class="trial-reg">${esc(t.registry)} · ${esc(t.sponsor)} · ${esc((t.sites || []).map((s) => s.city).join(' / ') || '中心待定')}</p>
      </div>
      <div class="fit ${bandCls}"><b>${m.pct}<small>%</small></b><span>粗筛符合度</span><em>${bandLabel}</em></div>
    </div>
    <p class="trial-sum">${esc(t.summary)}</p>
    <div class="match-counts">${pill(`符合 ${m.met}`, 'ok')}${m.unmet ? pill(`不符合 ${m.unmet}`, 'no') : ''}${m.unknown ? pill(`待确认 ${m.unknown}`, 'grey') : ''}${m.conflicts.length ? pill(`与偏好冲突：${m.conflicts.join('、')}`, 'warn') : ''}</div>
    ${(() => {
      const order = { unmet: 0, unknown: 1, met: 2 };
      const sorted = [...m.evals].sort((a, b) => order[a.r.state] - order[b.r.state]);
      const top = sorted.slice(0, 4), rest = sorted.slice(4);
      const line = ({ c, r }) => `<div class="crit ${r.state}">
        <div class="crit-line">${critIcon(r.state)}<b>${c.kind === 'exclude' ? '排除' : '入组'} · ${CRIT_CAT[c.category] || c.category}</b>${c.hard ? '<span class="muted">硬性</span>' : ''}</div>
        <p>${esc(c.text)}</p>
        <small><b>${esc(MATCH_STATE[r.state][0])}</b> · 记录里是：${esc(r.actual)} · 条件要求：${esc(r.need)}</small>
      </div>`;
      return `<div class="crit-list">${top.map(line).join('')}</div>
        ${rest.length ? `<details class="crit-more"><summary>其余 ${rest.length} 条条件</summary><div class="crit-list">${rest.map(line).join('')}</div></details>` : ''}`;
    })()}
    <div class="trial-actions">
      <button class="${saved ? 'soft' : 'primary'}" data-action="trial-save" data-id="${t.id}">${saved ? `已收藏（${saved.state === 'watching' ? '在跟' : saved.state === 'asking' ? '准备问' : '已归档'}）` : '收藏并跟踪'}</button>
      <button class="soft" data-action="trial-ask" data-id="${t.id}">把待确认项加进问题清单</button>
      <button class="text-button" data-action="trial-detail" data-id="${t.id}">看条件原文与中心</button>
    </div>
    <div class="small-note">符合度 = 符合项 ÷ 已对照项。未知项按 0 计，因此它只会偏低、不会偏高。这不是入组资格，也不代表效果。</div>
  </section>`;
}

function vTrialMatch() {
  const facts = trialFacts();
  const all = matchAll();
  const visible = all
    .filter((m) => state.prefs.city === 'all' || !m.conflicts.includes(`没有${state.prefs.city}中心`))
    .sort((a, b) => (a.band === 'ineligible') - (b.band === 'ineligible') || b.pct - a.pct);
  const fit = visible.filter((m) => m.band !== 'ineligible');
  const bad = visible.filter((m) => m.band === 'ineligible');
  return `
    <div class="notice"><b>这里的试验条目是合成演示数据（DEMO- 开头），不是真实在招试验。</b>
      真实版本必须接 ClinicalTrials.gov / ChiCTR，逐条显示登记号、状态与核验日期；没有核验日期的条目只能显示「未核验」，不能显示「招募中」。</div>
    <section class="card facts-card">
      <div class="card-head"><div><h2>用来对照的病理特点</h2><p>TRL-01 · 每一项都来自你的记录，带日期与谁说的；没记的写「未记录」</p></div></div>
      <div class="fact-grid">
        ${[['病理类型', SUBTYPE_NAME[facts.subtype] || facts.subtype, facts.subtypeSrc],
           ['分期', facts.stage || '未记录', facts.stageSrc],
           ['可切除性', facts.resectabilityLabel, facts.resectabilitySrc],
           ['系统治疗线数', `${facts.priorSystemic} 线（含辅助）`, '按治疗记录计数'],
           ['总胆红素 / ULN', facts.tbUln === null ? '未记录' : `${facts.tbUln.toFixed(1)}×`, facts.tbText],
           ['白蛋白', facts.albumin === null ? '未记录' : `${dec(facts.albumin, 1)} g/L`, facts.albuminText],
           ['ECOG 体能', '未记录', facts.ecogText],
           ['基因检测', `${Object.keys(facts.genes).length} 个位点有结果 · ${facts.geneTestOn}`, '未检测的位点不显示为阴性']]
          .map(([k, v, src]) => `<dl><dt>${esc(k)}</dt><dd><b>${esc(v)}</b><span>${esc(src)}</span></dd></dl>`).join('')}
      </div>
      <div class="small-note">这份清单只描述你记录里有什么。分型被更正过、可切除性变过，都按"当前版本"取，历史版本留在相关页。</div>
    </section>
    <section class="card pref-card">
      <div class="card-head"><div><h2>我的偏好（不影响医学条件）</h2><p>TRL-02 · 只改变排序与冲突提示，不改变"符合/不符合"的判断</p></div></div>
      <div class="pref-row">
        <label class="check"><input type="checkbox" data-action="trial-pref" data-key="biopsy" ${state.prefs.biopsy ? 'checked' : ''}> 接受为入组重新活检</label>
        <label class="check"><input type="checkbox" data-action="trial-pref" data-key="placebo" ${state.prefs.placebo ? 'checked' : ''}> 接受安慰剂对照</label>
        <label class="inline-field">可去的城市
          <select data-action="trial-pref" data-key="city">
            ${['all', '上海', '北京', '广州', '杭州', '成都'].map((c) => `<option value="${c}" ${state.prefs.city === c ? 'selected' : ''}>${c === 'all' ? '不限' : c}</option>`).join('')}
          </select></label>
      </div>
    </section>
    <div class="section-title"><div><h2>按当前记录能对上的（${fit.length}）</h2><p>未知项越少排得越前；硬性条件不满足的单列在下面，不会混进来</p></div></div>
    ${fit.length ? fit.map((m) => trialCard(m, facts)).join('') : `<div class="empty"><h3>当前条件下没有可对照的条目</h3><p>把城市或偏好放宽，或到「检索」里按条件找</p></div>`}
    ${bad.length ? `<details class="bad-trials"><summary>硬性条件不满足的 ${bad.length} 条（点开看是哪一条挡住了）</summary>${bad.map((m) => trialCard(m, facts)).join('')}</details>` : ''}`;
}

function trialFilterMatch(t) {
  const f = state.trialFilter;
  const q = f.q.trim().toLowerCase();
  const hay = `${t.title} ${t.short} ${t.registry} ${(t.biomarker && t.biomarker.gene) || ''}`.toLowerCase();
  if (q && !hay.includes(q)) return false;
  if (f.subtype !== 'all' && !(t.subtypes || []).includes(f.subtype)) return false;
  if (f.scope !== 'all' && t.scope !== f.scope) return false;
  if (f.status !== 'all' && t.status !== f.status) return false;
  return true;
}

function vTrialSearch() {
  const facts = trialFacts();
  const list = TRIALS.filter(trialFilterMatch).map((t) => matchTrial(t, facts)).sort((a, b) => b.pct - a.pct);
  const sel = (key, opts, label) => `<label class="inline-field">${esc(label)}
    <select data-action="trial-filter" data-key="${key}">${opts.map(([v, n]) => `<option value="${v}" ${state.trialFilter[key] === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
  return `
    <div class="notice violet"><b>TRL-03 · 检索是"按条件找"，不是"替你挑"。</b>排序用同一套逐条对照，不改写条件，也不隐藏不符合的条目。</div>
    <section class="card">
      <div class="card-head"><div><h2>筛条件</h2><p>病理特点 + 试验特征，两者分开</p></div></div>
      <div class="pref-row">
        <label class="inline-field" style="flex:1 1 220px">关键词
          <input id="trial-q" data-action="trial-q" value="${esc(state.trialFilter.q)}" placeholder="登记号 / 药名 / 靶点"></label>
        ${sel('subtype', [['all', '不限'], ['icc', '肝内胆管癌'], ['pcc', '肝门部胆管癌'], ['dcc', '远端胆管癌'], ['gbc', '胆囊癌']], '病理类型')}
        ${sel('scope', [['all', '不限'], ['adjuvant', '术后辅助'], ['advanced_1l', '晚期一线'], ['advanced_2l', '晚期后线'], ['agnostic', '篮子试验'], ['registry', '登记研究']], '治疗场景')}
        ${sel('status', [['all', '不限'], ['recruiting', '招募中'], ['not_yet_recruiting', '即将招募'], ['suspended', '暂停招募']], '状态')}
        <button class="soft" data-action="trial-reset">清空</button>
      </div>
      <div class="small-note">检索只按条目本身筛选；「与我相关」的判断在匹配页，用的是你的当前记录。两者不混在一起，是为了让你能看见"与我无关但存在"的选项。</div>
    </section>
    <div class="section-title"><div><h2>${list.length} 条结果</h2><p>按粗筛符合度排序；状态与核验日期逐条显示</p></div></div>
    ${list.length ? list.map((m) => trialCard(m, facts)).join('') : `<div class="empty"><h3>没有符合条件的条目</h3><p>放宽一个筛选项再试</p></div>`}`;
}

function vTrialSaved() {
  const saved = savedList();
  const archived = saved.filter((s) => s.state === 'archived');
  const active = saved.filter((s) => s.state !== 'archived');
  const card = (s) => {
    const t = TRIALS.find((x) => x.id === s.trialId);
    if (!t) return '';
    const m = matchTrial(t, trialFacts());
    const updates = (t.updates || []).slice().sort((a, b) => b.on.localeCompare(a.on));
    return `<section class="card saved-card">
      <div class="card-head"><div>
        <div class="trial-tags">${pill(TRIAL_STATUS[t.status], t.status === 'recruiting' ? 'ok' : t.status === 'suspended' ? 'no' : 'grey')}${pill(`收藏于 ${s.savedOn}`, 'plain')}${pill(s.state === 'watching' ? '在跟' : s.state === 'asking' ? '准备问' : '已归档', s.state === 'asking' ? 'warn' : 'grey')}</div>
        <h2>${esc(t.short || t.title)}</h2><p class="trial-reg">${esc(t.registry)} · ${esc(SCOPE_NAME[t.scope])} · 最近核验 ${esc(t.verifiedOn || '未核验')}</p></div>
        <div class="fit ${BAND[m.band][1]}"><b>${m.pct}<small>%</small></b><span>粗筛符合度</span><em>${BAND[m.band][0]}</em></div></div>
      ${s.note ? `<div class="notice plain" style="margin:10px 0 0"><b>你记的：</b>${esc(s.note)}</div>` : ''}
      ${t.status === 'suspended' ? `<div class="notice" style="margin:10px 0 0"><b>这条已暂停招募。</b>你收藏之后状态变了，记录仍在；要不要继续等，去门诊问研究护士。</div>` : ''}
      <div class="track">
        <div class="section-title" style="margin:14px 0 8px"><div><h3>状态与中心变化</h3><p>只有带来源的事件才进这条线</p></div></div>
        ${updates.length ? updates.map((u) => `<div class="track-row"><span class="date">${esc(u.on)}</span><div><b>${esc(u.text)}</b><small>${esc(u.source || '来源未记录')}${u.from || u.to ? ` · ${esc(u.from || '—')} → ${esc(u.to || '—')}` : ''}</small></div></div>`).join('') : '<div class="small-note">这条还没有状态变化记录。</div>'}
      </div>
      <div class="crit-mini">${m.evals.filter((e) => e.r.state === 'unknown').slice(0, 3).map((e) => `<span>? ${esc(e.c.text)}</span>`).join('') || '<span>没有待确认项</span>'}</div>
      <div class="trial-actions">
        <button class="soft" data-action="trial-state" data-id="${t.id}" data-state="asking">标为准备问</button>
        <button class="soft" data-action="trial-ask" data-id="${t.id}">加进问题清单</button>
        <button class="text-button" data-action="trial-state" data-id="${t.id}" data-state="archived">归档</button>
      </div>
    </section>`;
  };
  return `
    <div class="notice"><b>TRL-10 · 跟踪的是"试验变了什么"，不是"我该不该进"。</b>
      每次状态、中心、截止日期、入组条件变化都单独记一条，带来源与日期；不合并成"最新情况"，也不预测结果。</div>
    ${active.length ? active.map(card).join('') : `<div class="empty"><h3>还没有收藏的试验</h3><p>在「匹配」里点收藏，这里才会出现跟踪线</p></div>`}
    ${archived.length ? `<details class="bad-trials"><summary>已归档 ${archived.length} 条</summary>${archived.map(card).join('')}</details>` : ''}`;
}

function vTrials() {
  const sub = state.sub.trials || 0;
  return pageHead(sub === 0 ? `<button class="soft" data-action="trial-export">导出这次对照</button>` : '') +
    (sub === 0 ? vTrialMatch() : sub === 1 ? vTrialSearch() : vTrialSaved());
}

function trialDetailDialog(id) {
  const t = TRIALS.find((x) => x.id === id);
  if (!t) return;
  openDialog({
    eyebrow: `TRL-04 · ${t.registry}`,
    title: t.title,
    body: `<p style="font-size:12.5px">${esc(t.summary)}</p>
      <div class="small-note" style="margin:8px 0 14px">条目为合成演示数据，不是真实在招试验；真实版本须给登记平台链接与核验日期。</div>
      <h3 style="margin-bottom:6px">入组 / 排除条件（原文要点）</h3>
      ${(t.criteria || []).map((c) => `<div class="crit ${c.hard ? '' : 'soft'}"><div class="crit-line"><b>${c.kind === 'exclude' ? '排除' : '入组'} · ${CRIT_CAT[c.category] || c.category}</b>${c.hard ? '<span class="muted">硬性</span>' : '<span class="muted">非硬性</span>'}</div><p>${esc(c.text)}</p></div>`).join('')}
      <h3 style="margin:14px 0 6px">中心</h3>
      ${(t.sites || []).map((s) => `<div class="row"><div class="row-main"><div><b>${esc(s.city)} · ${esc(s.hospital)}</b><p>${esc(s.contact)} · ${s.status === 'open' ? '开放' : s.status === 'planned' ? '计划启动' : '暂停'}</p></div></div><span class="muted">${esc(s.updatedOn || '')}</span></div>`).join('') || '<p>中心未登记</p>'}
      <div class="small-note">要不要联系、能不能入组，由研究团队当面评估。工作台只把条件与记录摆在一起。</div>`
  });
}

function saveTrial(id) {
  const list = savedList();
  const i = list.findIndex((s) => s.trialId === id);
  if (i >= 0) { list.splice(i, 1); toast('已取消收藏（原型不落库）'); }
  else { list.push({ trialId: id, savedOn: TODAY, state: 'watching', note: '' }); toast('已收藏到跟踪（原型不落库）'); }
  render();
}

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="trial-q"]');
  if (!el) return;
  state.trialFilter.q = el.value;
  clearTimeout(window.__tq);
  window.__tq = setTimeout(() => { render(); const q = $('#trial-q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 220);
});

const VIEWS = { dash: vDash, type: vType, jaundice: vJaundice, drain: vDrain, treat: vTreat, labs: vLabs, imaging: vImaging, chart: vChart, trials: vTrials, care: vCare, settings: vSettings };


function renderNav() {
  const counts = { drain: P().drainageLogs.length, labs: P().flags.length, care: P().questions.filter((q) => !q.answered).length };
  $('#nav').innerHTML = PAGES.map(([k, label, ic]) => `<button class="nav-button" data-action="go" data-page="${k}" aria-current="${state.view === k ? 'page' : 'false'}">${icon(ic)}<span>${esc(label)}</span>${counts[k] ? `<span class="nav-count">${counts[k]}</span>` : ''}</button>`).join('');
}
function renderProfile() {
  $('#profile-avatar').textContent = P().initial;
  $('#profile-name').textContent = `${P().name}的资料`;
  $('#profile-meta').textContent = `${P().age} 岁 · ${P().tag.split(' · ')[0]}`;
  $('#profile-btn').setAttribute('aria-label', `切换演示档案，当前为${P().name}`);
}
function render() {
  renderNav(); renderProfile();
  $('#breadcrumb').textContent = PAGES.find((p) => p[0] === state.view)[1];
  const main = $('#main');
  main.innerHTML = `<div class="page-enter">${VIEWS[state.view]()}</div>`;
  document.body.classList.toggle('large', state.font > 1.15);
  document.documentElement.style.setProperty('--font', `${15 * state.font}px`);
  $('#font-toggle').setAttribute('aria-pressed', String(state.font > 1));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ---------------- 弹窗 / 提示 ---------------- */
const dlg = $('#dialog');
function openDialog({ eyebrow = '小胆宝', title, body, foot = '' }) {
  $('#dialog-eyebrow').textContent = eyebrow;
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = body;
  $('#dialog-foot').innerHTML = foot || `<button class="soft" data-action="close">关闭</button>`;
  if (!dlg.open) dlg.showModal();
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('visible');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('visible'), 2200);
}

/* 档案切换 */
function profileDialog() {
  openDialog({
    title: '切换演示档案',
    body: Object.values(PROFILES).map((p) => `<button class="profile-row ${p.id === state.profile ? 'on' : ''}" data-action="pick-profile" data-id="${p.id}">
        <div><b>${esc(p.name)} · ${p.age} 岁</b><p>${esc(p.tag)}</p></div>
        <span class="profile-caret">${p.id === state.profile ? '当前' : '切换'}</span></button>`).join('') +
      `<div class="small-note" style="margin-top:12px">两套档案刻意选了相反的主路径：一套是"带管减黄后手术"，一套是"术后影像见新发结节、无引流"。后者在引流页会明确显示"这套档案没有引流记录"，而不是给一张空表。</div>`
  });
}

/* 分级对照规则演示 */
function gradeDialog() {
  openTableDialog();
}
function openTableDialog() {
  openDialog({
    eyebrow: 'LAB-03 · 规则演示',
    title: '为什么这一栏是空的',
    body: `
      <p style="font-size:13px;line-height:1.7">分级对照要显示成「1 级 · &gt;1.0–3.0 ×ULN · 实测 2.4×ULN」，必须同时具备三样：<b>机构</b>、<b>版本</b>、<b>页码</b>。</p>
      <div class="gate" style="margin:12px 0"><i>!</i><div>当前：机构 <b>${esc(GRADE_SRC.org)}</b> ✓ · 版本 <b>${esc(GRADE_SRC.version)}</b> ✓ · 页码 <span class="miss">空</span> ✗
        <div style="margin-top:6px">缺页码 → 这条解释无法被读者回去核对 → 整块按「未引入」处理，界面上不出现任何分级数字。</div></div></div>
      <h3 style="font-size:13px;margin:14px 0 6px">这条规则拦住了三种常见写法</h3>
      <div class="table-wrap"><table><thead><tr><th>会被拦住的写法</th><th>为什么不行</th></tr></thead><tbody>
        <tr><td>「ALT 2 级」</td><td>没有出处，读者无法核对；也没写清用的是哪张单的上限</td></tr>
        <tr><td>「ALT 偏高，需护肝」</td><td>前半是判读，后半是处置建议，两层都越界</td></tr>
        <tr><td>「大致相当于 1–2 级」</td><td>"大致"掩盖了缺页码这件事，比不写更容易被当成标准</td></tr>
      </tbody></table></div>
      <div class="verdict" style="margin-top:14px"><b>这个值要不要处理</b><span>这一句需要问你的医生。</span></div>`
  });
}

/* 7 日引流表导出预览 */
function drainDialog() {
  const logs = P().drainageLogs.slice(-7);
  if (!logs.length) { toast('这套档案没有引流记录'); return; }
  openDialog({
    eyebrow: 'DR-04 · 导出预览',
    title: '7 日引流表',
    body: `<p style="font-size:12px;color:var(--muted)">这是打印出来的样子。表头固定带一句声明，避免被当成病历摘要。</p>
      <div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>日期</th><th>引流量</th><th>颜色</th><th>通畅度</th><th>备注</th></tr></thead><tbody>
      ${logs.map((l) => `<tr><td class="num">${esc(l.on)}</td><td class="num"><b>${l.ml} mL</b></td><td>${esc(COLOR_NAME[l.color] || l.color)}</td><td>${esc(PATENCY_NAME[l.patency] || l.patency)}</td><td>${esc(l.note || '')}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="small-note" style="margin-top:12px">本人 / 家属记录，不是医疗结论。趋势怎么理解，请问门诊。</div>`,
    foot: `<button class="soft" data-action="close">关闭</button><button class="primary" data-action="do-print">打印这一页</button>`
  });
}

function docDialog(title) {
  const d = P().docs.find((x) => x.title === title);
  openDialog({
    eyebrow: '报告原件',
    title: d ? d.title : '原件',
    body: d ? `<div class="saved-item"><b>${esc(d.on)} · ${esc(d.by)}</b><p>「${esc(d.line)}」</p><small>${esc(KIND_NAME[d.kind] || d.kind)}${d.trend ? ' · 数值已进趋势' : ' · 未进趋势'}</small></div>
      <div class="notice plain" style="margin-top:12px">原型不接文件流，这里只演示"点得回原件"这一条：每一条值都能追到它来自哪份报告、谁开的、哪天。</div>`
      : `<div class="empty"><h3>没有对应原件</h3></div>`
  });
}

function aboutDialog() {
  openDialog({
    title: '关于小胆宝',
    body: `<div class="about"><div class="about-meta">
      <div class="about-ver"><b>${APP_INFO.version}</b>${pill(APP_INFO.stage, 'violet')}</div>
      <dl>
        <div><dt>品牌</dt><dd>${esc(APP_INFO.name)} · ${esc(APP_INFO.en)}</dd></div>
        <div><dt>构建</dt><dd>${esc(APP_INFO.build)}（阶段 2 原型，非业务实现）</dd></div>
        <div><dt>范围</dt><dd>${esc(APP_INFO.scope)}</dd></div>
        <div><dt>数据</dt><dd>两套合成档案，姓名 / 医院 / 日期均虚构</dd></div>
        <div><dt>来源</dt><dd>demo/build-demo-data.mjs（与演示库同源）</dd></div>
      </dl></div></div>
      <div class="notice plain" style="margin-top:14px">这一版没有接 AI、没有接 DSH、不落库。刷新页面即重置。</div>`
  });
}

function newFlagDialog() {
  const m = MET().ca19_9 || Object.values(MET())[0];
  openDialog({
    eyebrow: 'LAB-08',
    title: '标一条「我看不懂」',
    body: `<div class="form-grid">
      <div><label class="form-label">哪个指标</label><select>${Object.values(MET()).map((x) => `<option>${esc(x.name)}</option>`).join('')}</select></div>
      <div><label class="form-label">哪天</label><input value="${m && last(m) ? last(m).d : ''}"></div>
      <div class="wide"><label class="form-label">看不懂的是哪一点（照你自己的话说）</label><textarea>${esc(m && last(m) ? `${m.name} 这次是 ${dec(last(m).v)}，比上次低，是正常的波动吗？` : '')}</textarea></div>
    </div>
    <div class="notice plain" style="margin-top:14px">写什么都会原样进问题清单。工作台不会在这里给你一个解释——通用解释顶替不了医生对着你的单子说话。</div>`,
    foot: `<button class="soft" data-action="close">取消</button><button class="primary" data-action="flag-save">存下（原型不落库）</button>`
  });
}

function newQuestionDialog() {
  openDialog({
    eyebrow: 'CARE-02',
    title: '加一条要问的事',
    body: `<div class="form-grid"><div class="wide"><label class="form-label">想问什么</label><textarea placeholder="例如：引流管什么时候可以拔？拔之前要做什么检查？"></textarea></div>
      <div><label class="form-label">带去哪天</label><input value="${(P().visits.find((v) => v.planned) || {}).on || ''}"></div></div>
      <div class="notice plain" style="margin-top:14px">清单只负责"别忘了问"。答案照医生原话记在本条下面。</div>`,
    foot: `<button class="soft" data-action="close">取消</button><button class="primary" data-action="flag-save">存下（原型不落库）</button>`
  });
}

/* ---------------- AI 面板（CROSS-01 / CROSS-03）
   这里是最能说明边界的地方：它只把当前页的**事实**列成清单，然后自己扫一遍禁用词。
   扫到就红，扫不到才绿——跟 npm run check 里的 check-wording 是同一套判据。 ---------------- */
// 下面这一行是禁用词表本身，与 scripts/check-wording.mjs 的字典同源
const BANNED = ['稳定', '好转', '恶化', '进展', '缓解', '良好', '不乐观', '预后', '控制住了', '问题不大', '建议治疗', '可能复发', '可以停药', '无需就医', '治愈率', '立刻就医', '危险', '警惕', '注意排除', '应该用', '首选']; // wording-ok 词表本身

function factsOfPage() {
  const out = [];
  out.push(`档案：${P().name} · ${P().age} 岁 · ${P().tag}`);
  if (state.view === 'dash' || state.view === 'chart') {
    for (const k of ['bilirubin_total', 'ca19_9', 'alp']) {
      const m = MET()[k]; if (!m) continue;
      const a = last(m), d = diff(m);
      out.push(`${m.name}：${dec(a.v, m.dec)} ${m.unit}（${a.d}）${d === null ? '' : `，与上次差 ${d > 0 ? '+' : ''}${dec(d, m.dec)}`}${m.refHigh ? `，本单上限 ${m.refHigh}` : ''}`);
    }
    const img = latestImagingText();
    if (img) out.push(`最近影像（${img.on}，${img.by}）原文首行：「${img.line}」`);
  }
  if (state.view === 'type') {
    const cur = P().subtype.find((s) => s.current);
    if (cur) out.push(`当前分型：${SUBTYPE_NAME[cur.subtype]}，${cur.statedOn} ${cur.statedBy} 记录`);
    out.push(`分型共 ${P().subtype.length} 条记录，其中 ${P().subtype.filter((s) => !s.current).length} 条已被更正（保留）`);
    const r = P().resectability.find((x) => x.current);
    if (r) out.push(`可切除性：${CONCLUSION_NAME[r.conclusion]}，${r.statedOn} ${r.statedBy}`);
  }
  if (state.view === 'drain') { out.push(`引流记录 ${P().drainageLogs.length} 天，装置事件 ${P().drainageDevices.length} 条`); }
  if (state.view === 'labs') { out.push(`有记录的指标 ${Object.keys(MET()).length} 个；参考上限缺失的指标不显示倍数`); }
  if (state.view === 'treat') { const c = currentTreatment(); if (c) out.push(`当前治疗：${c.regimen}，计划 ${c.cyclesPlanned} 周期已完成 ${c.cyclesDone} 周期`); }
  out.push('以上都是记录。哪一句能推出"现在怎么样"，本页不生成。');
  return out;
}

function renderAgent() {
  const body = $('#agent-body');
  if (!state.agentOpen) return;
  body.innerHTML = `
    <div class="agent-note">这一栏只会把当前页的<b>事实</b>排成清单。它不会评价病情，也不会给处置建议——想听判断，请带着清单去问门诊。</div>
    <div class="agent-card"><h4>本页事实清单</h4><pre>${esc(factsOfPage().join('\n'))}</pre></div>
    <div class="agent-card"><h4>自检：这段话里有没有越界词</h4><div class="agent-check" id="agent-check"><span class="muted">点下面的「模拟回复自检」</span></div></div>`;
}
function agentSelfCheck() {
  const text = factsOfPage().join('\n');
  const hits = BANNED.filter((w) => text.includes(w));
  $('#agent-check').innerHTML = hits.length
    ? hits.map((h) => `<span class="hit">命中「${esc(h)}」—— 这句话不是事实陈述，必须删掉或改成"请咨询你的医生"</span>`).join('')
    : `<span class="pass">通过：${factsOfPage().length} 行里没有出现禁用词（判据同 check-wording.mjs，共 ${BANNED.length} 个词）</span>`;
}

/* ---------------- 事件 ---------------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  if (a === 'go') { state.view = el.dataset.page; render(); if (state.agentOpen) renderAgent(); }
  else if (a === 'sub') { state.sub[state.view] = Number(el.dataset.sub); render(); }
  else if (a === 'profiles') profileDialog();
  else if (a === 'pick-profile') { state.profile = el.dataset.id; state.saved = null; dlg.close(); render(); toast(`已切到 ${P().name} 的档案`); }
  else if (a === 'close') dlg.close();
  else if (a === 'about') aboutDialog();
  else if (a === 'help') openDialog({ title: '原型操作说明', body: `<p style="font-size:13px;line-height:1.75">左边是一级导航，共十页。<b>治疗</b>与<b>化验与报告</b>有两级页签。右上「大字」切字号档位，左上的档案卡可切换两套演示档案。</p>
    <div class="notice plain" style="margin-top:12px">原型里的按钮大多只做界面演示，不落库、不调 AI。标注「存下（原型不落库）」的按钮点了只给一句提示。</div>` });
  else if (a === 'open-store') toast('资料目录：本地已激活（原型仅演示状态）');
  else if (a === 'settings') { state.view = 'settings'; render(); }
  else if (a === 'font') { state.font = Number(el.dataset.font); render(); }
  else if (a === 'demo-toggle') { state.demoMode = !state.demoMode; render(); toast(state.demoMode ? '已切到演示档案（独立库）' : '已切到真实档案（原型仅演示）'); }
  else if (a === 'agent') { state.agentOpen = !state.agentOpen; $('#work-grid').classList.toggle('agent-open', state.agentOpen); $('#agent-toggle').setAttribute('aria-expanded', String(state.agentOpen)); $('#agent-state').textContent = state.agentOpen ? '面板已打开' : '未进入激活'; renderAgent(); }
  else if (a === 'agent-size') { state.agentSize = el.dataset.size; $$('.agent-sizes button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === state.agentSize))); $('#work-grid').classList.toggle('agent-wide', state.agentSize === 'wide'); }
  else if (a === 'agent-build') { renderAgent(); toast('已按当前页整理事实清单'); }
  else if (a === 'agent-demo') agentSelfCheck();
  else if (a === 'flip') { const c = el.dataset.code; state.flip[c] = !state.flip[c]; el.dataset.flipped = String(state.flip[c]); el.setAttribute('aria-pressed', String(state.flip[c])); }
  else if (a === 'range') { state.range = el.dataset.range; render(); }
  else if (a === 'grade-preview') gradeDialog();
  else if (a === 'export-drain') drainDialog();
  else if (a === 'do-print') { dlg.close(); toast('原型不调打印，这里仅演示入口'); }
  else if (a === 'print') toast('原型不调打印，这里仅演示入口');
  else if (a === 'open-doc') docDialog(el.dataset.title);
  else if (a === 'flag-new') newFlagDialog();
  else if (a === 'q-new') newQuestionDialog();
  else if (a === 'flag-save') { dlg.close(); toast('原型不落库：这条不会真的存下来'); }
  else if (a === 'to-labs-flags') { state.view = 'labs'; state.sub.labs = 2; render(); }
  else if (a === 'trial-save') saveTrial(el.dataset.id);
  else if (a === 'trial-detail') trialDetailDialog(el.dataset.id);
  else if (a === 'trial-ask') {
    const t = TRIALS.find((x) => x.id === el.dataset.id);
    toast(`原型不落库：会把「${t ? t.short : ''}」的待确认项写成 2 条问题`);
  }
  else if (a === 'trial-state') {
    const s = savedList().find((x) => x.trialId === el.dataset.id);
    if (s) s.state = el.dataset.state;
    render();
    toast(el.dataset.state === 'archived' ? '已归档（原型不落库）' : '已标为准备问（原型不落库）');
  }
  else if (a === 'trial-reset') { state.trialFilter = { q: '', subtype: 'all', scope: 'all', status: 'all' }; render(); }
  else if (a === 'trial-export') toast('原型不导出文件：真实版本导出逐条对照表（含日期与来源）');
});

document.addEventListener('change', (e) => {
  const pref = e.target.closest('[data-action="trial-pref"]');
  if (pref) {
    const k = pref.dataset.key;
    state.prefs[k] = pref.type === 'checkbox' ? pref.checked : pref.value;
    render();
    return;
  }
  const fil = e.target.closest('[data-action="trial-filter"]');
  if (fil) {
    state.trialFilter[fil.dataset.key] = fil.value;
    render();
    return;
  }
  const el = e.target.closest('[data-action="pick"]');
  if (!el) return;
  const c = el.dataset.code;
  if (el.checked) {
    if (state.sel.length >= 4) { el.checked = false; toast('最多同时选 4 条，再多就看不清了'); return; }
    state.sel.push(c);
  } else state.sel = state.sel.filter((x) => x !== c);
  render();
});

$('#font-toggle').addEventListener('click', () => { state.font = state.font >= 1.32 ? 1 : state.font === 1 ? 1.15 : 1.32; render(); });

/* 启动 */
render();
