#!/usr/bin/env node
// 家族 README 契约检查（R1–R7）——几十个癌种工作台共用同一套骨架，内容各自填。
//
// 为什么要有这道闸：同族 README 过去一律以「疾病概要」开头（定义 / 指南 / 治疗全景 / 趋势），
// 第一次点进仓库的人读不到「这是什么、谁用、解决什么痛点」，而这三问恰恰是患者决定要不要
// 继续看的关键。骨架一旦写成契约，新仓库生成即合规，老仓库也能一条命令看出差在哪。
//
// 用法：
//   node scripts/check-readme.mjs .            人读输出
//   node scripts/check-readme.mjs . --json     机器读（批量扫几十个仓库时用）
//
// 退出码：0 = 合规；1 = 有 fail。warn 不影响退出码。
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const root = resolve(process.argv[2] || '.');
const asJson = process.argv.includes('--json');
const readmePath = join(root, 'README.md');

const fails = [];
const warns = [];
const fail = (code, message, fix) => fails.push({ code, message, fix });
const warn = (code, message, fix) => warns.push({ code, message, fix });

/* ── 骨架：六节必答，顺序固定；标题可带后缀（如「功能展现（20 屏 / 27 张）」） ── */
const REQUIRED = [
  { id: 'R2a', label: '这是什么', re: /^##\s*这是什么/, min: 120 },
  { id: 'R2b', label: '谁适合用', re: /^##\s*谁适合用/, min: 120 },
  { id: 'R2c', label: '主要功能', re: /^##\s*主要功能/, min: 120 },
  { id: 'R2d', label: '能解决哪些患者痛点', re: /^##\s*能解决哪些患者痛点/, min: 120 },
  { id: 'R2e', label: '功能展现', re: /^##\s*功能展现/, min: 80 },
  { id: 'R2f', label: '第一版不完美', re: /^##\s*第一版不完美/, min: 120 },
];
const SUGGESTED = ['疾病概要', '当前状态', '开发与本地验收', '致谢'];

if (!existsSync(readmePath)) {
  console.error(`README 契约：${root} 下没有 README.md`);
  process.exit(1);
}

const lines = readFileSync(readmePath, 'utf8').split('\n');
const h1 = lines.filter((l) => /^#\s+\S/.test(l));
const h2 = [];
lines.forEach((line, index) => {
  if (/^##\s+\S/.test(line)) h2.push({ index, text: line.replace(/^##\s+/, '').trim() });
});

/* R1：一个 H1，且第一个 H2 必须就是「这是什么」——首屏就要回答"这是什么" */
if (h1.length !== 1) fail('R1', `一级标题应有 1 个，实际 ${h1.length} 个`, '只保留一个 `# 项目名`，其余降为二级标题');
if (h2.length === 0) fail('R1', '没有任何二级标题', '按 templates/README-family.md 的骨架补小节');
else if (!/^这是什么/.test(h2[0].text)) {
  fail('R1', `第一个二级标题是「${h2[0].text}」，应为「这是什么」`, '把「疾病概要」一类背景资料移到首屏六节之后；首节必须是「这是什么」');
}

/* 取某节正文（到下一个同级或更高级标题为止） */
function sectionBody(startIndex) {
  let end = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (/^#{1,2}\s+\S/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(startIndex + 1, end).join('\n');
}

/* 去掉图片 / HTML 标签 / 纯链接地址后数中文与字母，避免"只有一张图也算有内容" */
function contentLength(markdown) {
  return markdown
    .replace(/<img[^>]*>/gi, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s+/g, '')
    .length;
}

/* R2：六节都在、顺序对、各自有实质内容 */
let lastIndex = -1;
for (const spec of REQUIRED) {
  const hit = h2.find((h) => spec.re.test(`## ${h.text}`));
  if (!hit) {
    fail(spec.id, `缺少必答小节「${spec.label}」`, `在 README 加一节「## ${spec.label}」，内容从 templates/README-family.md 对应的填空位开始`);
    continue;
  }
  if (hit.index < lastIndex) {
    fail(spec.id, `「${spec.label}」的位置在上一节之前，骨架顺序被破坏`, '按「这是什么 → 谁适合用 → 主要功能 → 痛点 → 功能展现 → 第一版不完美」重排');
  }
  lastIndex = Math.max(lastIndex, hit.index);
  const size = contentLength(sectionBody(hit.index));
  if (size < spec.min) {
    fail(spec.id, `「${spec.label}」只有 ${size} 字实质内容（少于 ${spec.min}）`, '写具体内容：名词、动作、数字；不要只放标题或一张图');
  }
}

/* R3：痛点节必须是表格，且不是三行样板 */
const painSection = h2.find((h) => /^能解决哪些患者痛点/.test(h.text));
if (painSection) {
  const body = sectionBody(painSection.index);
  const tableRows = (body.match(/^\|.*\|$/gm) || []).length;
  if (tableRows < 5) {
    fail('R3', `痛点节表格只有 ${tableRows} 行（表头 + 分隔线 + 至少 3 条痛点）`, '按「痛点原话 ｜ 现在的难受 ｜ 本台的处理 ｜ 本台不做 ｜ 核实状态」列表，至少 3 条');
  }
}

/* R4：边界句要在首屏（前 60 行），不是藏在文末 */
const head = lines.slice(0, 60).join('\n');
if (!/不替代|不构成医疗建议|不能替代/.test(head)) {
  fail('R4', '前 60 行没有看到"不替代 / 不构成医疗建议"这类边界句', '在标题下一段就写清它不是诊断工具、不推荐方案、不替代医生');
}

/* R5：功能展现节必须有真实截图 */
if (painSection) {
  const shotsSection = h2.find((h) => /^功能展现/.test(h.text));
  if (shotsSection) {
    const body = sectionBody(shotsSection.index);
    if (!/docs\/screenshots\/[^"')\s]+\.(?:jpg|jpeg|png|webp)/i.test(body)) {
      fail('R5', '「功能展现」节里没有 docs/screenshots/ 的真实截图', '把已有截图按页面分组嵌入；没有截图就先跑 npm run probe:proto');
    }
  }
}

/* R6：首版声明要能落地——既认短板，也给 PR 入口 */
const v1Section = h2.find((h) => /^第一版不完美/.test(h.text));
if (v1Section) {
  const body = sectionBody(v1Section.index);
  if (!/(PR|pull request)/i.test(body)) fail('R6', '「第一版不完美」节没有写 PR 入口', '写清最小可合并的 PR 形态，以及哪几类改动会被拒绝');
  if (!/致谢|社区|贡献/.test(body)) warn('R6', '「第一版不完美」节没提到社区与贡献者', '补一句感谢与"哪些贡献最缺"，比抽象号召有效');
}

/* 建议节：缺了只提醒，不拦 */
for (const name of SUGGESTED) {
  if (!h2.some((h) => h.text.startsWith(name))) {
    warn('R7', `建议补一节「${name}」`, '疾病概要给背景、当前状态给闸口进度、开发与本地验收给命令、致谢给来源');
  }
}

/* ── 输出 ── */
const title = basename(root);
if (asJson) {
  console.log(JSON.stringify({ repo: title, ok: fails.length === 0, fails, warns }, null, 2));
} else {
  for (const w of warns) console.warn(`  !  ${w.code} ${w.message}\n     改法：${w.fix}`);
  for (const f of fails) console.error(`  ✗  ${f.code} ${f.message}\n     改法：${f.fix}`);
  if (!fails.length) {
    console.log(`README 契约：${title} 六节齐备、顺序正确、边界句在首屏${warns.length ? `（${warns.length} 条建议）` : ''}。`);
  } else {
    console.error(`README 契约：${title} ${fails.length} 处不合规。骨架见 templates/README-family.md，说明见 docs/32-README-CONTRACT.md。`);
  }
}
process.exit(fails.length ? 1 : 0);
