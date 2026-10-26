#!/usr/bin/env node
/**
 * 把原型真机截图（PNG 原图，不入库）压成 README 用的 JPEG 副本（入库）。
 *
 * 为什么要有这一步：原图 27 张 21 MB，直接进仓库太重；README 只需要看得清字。
 * 压到 1440 宽、质量 82，约 4.8 MB，正文与表格仍然可读。
 *
 * 用法：node scripts/sync-screenshots.mjs [项目根]     （npm run shots:sync）
 * 依赖：macOS 自带 sips；Linux/Windows 需 ImageMagick（magick/convert）。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';
const srcDir = join(root, 'prototypes/_evidence');
const outDir = join(root, 'docs/screenshots');

if (!existsSync(srcDir)) {
  console.error(`找不到截图原图目录：${srcDir}\n先跑 npm run probe:proto 生成。`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const has = (bin) => {
  try { execFileSync('which', [bin], { stdio: 'ignore' }); return true; } catch { return false; }
};
const sips = process.platform === 'darwin' && has('sips');
const magick = !sips && (has('magick') ? 'magick' : has('convert') ? 'convert' : null);
if (!sips && !magick) {
  console.error('没有可用的图片转换工具：macOS 需要 sips，其它平台需要 ImageMagick。');
  process.exit(1);
}

const pngs = readdirSync(srcDir).filter((f) => f.endsWith('.png')).sort();
let bytes = 0;
for (const f of pngs) {
  const src = join(srcDir, f);
  const out = join(outDir, f.replace(/\.png$/, '.jpg'));
  if (sips) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', '--resampleWidth', '1440', src, '--out', out], { stdio: 'ignore' });
  } else {
    execFileSync(magick, [src, '-resize', '1440x', '-quality', '72', '-interlace', 'Plane', out], { stdio: 'ignore' });
  }
  bytes += statSync(out).size;
}
console.log(`截图同步完成：${pngs.length} 张 → docs/screenshots/（${(bytes / 1024 / 1024).toFixed(1)} MB）`);
