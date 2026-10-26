#!/usr/bin/env node
// README 截图与 docs/screenshots/ 的对账：
// 1) 目录里有、README 没引用的 → 报错（有图没进文档）
// 2) README 引用、文件不存在的 → 报错（死链）
// 3) 引用了带通配符的路径（如 *.jpg）不算有效引用
// 用法：node scripts/check-readme-shots.mjs .
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv[2] || '.');
const shotsDir = join(root, 'docs/screenshots');
const readmePath = join(root, 'README.md');

if (!existsSync(readmePath) || !existsSync(shotsDir)) {
  console.log('README 截图对账：跳过（缺 README.md 或 docs/screenshots/）');
  process.exit(0);
}

const readme = readFileSync(readmePath, 'utf8');
const files = readdirSync(shotsDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort();

/* 只认 <img src="docs/screenshots/xxx.jpg"> 这种具体路径；带 * 的通配写法当作说明文字忽略 */
const used = new Set();
for (const m of readme.matchAll(/docs\/screenshots\/([^"')\s]+\.(?:jpg|jpeg|png|webp))/gi)) {
  if (m[1].includes('*')) continue;
  used.add(m[1]);
}

const missingInReadme = files.filter((f) => !used.has(f));
const deadLinks = [...used].filter((f) => !existsSync(join(shotsDir, f)));

if (!missingInReadme.length && !deadLinks.length) {
  console.log(`README 截图对账：${files.length} 张全部被引用，无死链。`);
  process.exit(0);
}
if (missingInReadme.length) {
  console.error(`README 截图对账：${missingInReadme.length} 张图在目录里但没进 README：`);
  for (const f of missingInReadme) console.error('  -', `docs/screenshots/${f}`);
}
if (deadLinks.length) {
  console.error(`README 截图对账：${deadLinks.length} 处引用找不到文件（死链）：`);
  for (const f of deadLinks) console.error('  -', `docs/screenshots/${f}`);
}
console.error('改法：在 README「原型截图」一节按页面分组补 <img src="docs/screenshots/…">，或删掉过期引用后重跑 npm run shots:sync。');
process.exit(1);
