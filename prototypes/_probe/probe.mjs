// 小胆宝原型真机探针：跑真实 Chrome，逐页截图 + 抓 console 错误 + 测溢出
// 用法：NODE_PATH=~/.workbuddy/binaries/node/workspace/node_modules node probe.mjs
import puppeteer from '/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { join } from 'node:path';
import { homedir } from 'node:os';

const URL = 'http://127.0.0.1:8771/prototypes/v0.2/index.html';
const OUT = join(process.env.HOME, 'Downloads/biliary-tract-workbench/prototypes/_evidence');
const proxy = process.env.http_proxy || '';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', ...(proxy ? [`--proxy-server=${proxy}`] : [])]
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url() + ' ' + r.failure()?.errorText));

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'networkidle0' });

const ver = await browser.version();
console.log('浏览器：', ver);

const pages = ['dash', 'type', 'jaundice', 'drain', 'treat', 'labs', 'imaging', 'chart', 'trials', 'care', 'settings'];
const report = [];

async function go(p) {
  await page.evaluate((k) => { document.querySelector(`.nav-button[data-page="${k}"]`).click(); }, p);
  await new Promise((r) => setTimeout(r, 420));
}

for (const p of pages) {
  await go(p);
  const m = await page.evaluate(() => ({
    view: document.querySelector('#breadcrumb').textContent.trim(),
    h1: document.querySelector('#main h1')?.textContent.trim() || '',
    sw: document.body.scrollWidth, cw: document.documentElement.clientWidth,
    cards: document.querySelectorAll('#main .card, #main .nowcard, #main .axis-grid').length,
    text: document.querySelector('#main').innerText.length
  }));
  report.push({ page: p, ...m, overflow: m.sw > m.cw + 1 });
  await page.screenshot({ path: join(OUT, `${String(pages.indexOf(p) + 1).padStart(2, '0')}-${p}.png`), fullPage: true });
}

// 二级页签
for (const [p, n] of [['treat', 3], ['labs', 3], ['trials', 3]]) {
  await go(p);
  for (let i = 0; i < n; i++) {
    await page.evaluate((idx) => { document.querySelectorAll('.subnav button')[idx].click(); }, i);
    await new Promise((r) => setTimeout(r, 380));
    const t = await page.evaluate(() => document.querySelectorAll('.subnav button[aria-selected="true"]')[0]?.textContent.trim());
    await page.screenshot({ path: join(OUT, `sub-${p}-${i + 1}.png`), fullPage: true });
    report.push({ page: `${p}/${t}`, sub: true, overflow: await page.evaluate(() => document.body.scrollWidth > document.documentElement.clientWidth + 1) });
  }
}

// 切换第二套档案
await go('dash');
await page.evaluate(() => document.querySelector('#profile-btn').click());
await new Promise((r) => setTimeout(r, 300));
await page.evaluate(() => document.querySelector('[data-action="pick-profile"][data-id="p2"]').click());
await new Promise((r) => setTimeout(r, 420));
const p2 = await page.evaluate(() => ({ name: document.querySelector('#profile-name').textContent, h1: document.querySelector('#main h1').textContent }));
await page.screenshot({ path: join(OUT, '20-dash-p2.png'), fullPage: true });
console.log('切档案 p2：', JSON.stringify(p2));

// 引流页在 p2 应显示"没有引流记录"
await go('drain');
const drainP2 = await page.evaluate(() => document.querySelector('#main').innerText.slice(0, 80).replace(/\n/g, ' '));
console.log('p2 引流页首行：', drainP2);
await page.screenshot({ path: join(OUT, '21-drain-p2-empty.png'), fullPage: true });

// 一图秀交互：选指标 / 翻卡
await page.evaluate(() => document.querySelector('[data-action="pick-profile"][data-id="p1"]')?.click());
await page.evaluate(() => document.querySelector('#profile-btn').click());
await new Promise((r) => setTimeout(r, 250));
await page.evaluate(() => document.querySelector('[data-action="pick-profile"][data-id="p1"]').click());
await new Promise((r) => setTimeout(r, 350));
await go('chart');
const chartInfo = await page.evaluate(() => ({ svg: !!document.querySelector('svg.chart'), paths: document.querySelectorAll('svg.chart path.line').length, cards: document.querySelectorAll('.mcard').length }));
await page.evaluate(() => document.querySelector('.mcard').click());
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: join(OUT, '22-chart-flip.png'), fullPage: true });
console.log('一图秀：', JSON.stringify(chartInfo));

// 临床试验：匹配数量 / 收藏 / 偏好切换
await go('trials');
await page.evaluate(() => { document.querySelectorAll('.subnav button')[0].click(); });
await new Promise((r) => setTimeout(r, 350));
const trialInfo = await page.evaluate(() => ({
  cards: document.querySelectorAll('.trial-card').length,
  fits: Array.from(document.querySelectorAll('.fit b')).slice(0, 3).map((x) => x.textContent),
  facts: document.querySelectorAll('.fact-grid dl').length,
  unknownMarks: document.querySelectorAll('.crit-mark.q').length
}));
await page.evaluate(() => document.querySelector('[data-action="trial-save"]')?.click());
await new Promise((r) => setTimeout(r, 320));
await page.screenshot({ path: join(OUT, '23-trials-saved.png'), fullPage: true });
await page.evaluate(() => document.querySelector('[data-action="trial-pref"][data-key="biopsy"]')?.click());
await new Promise((r) => setTimeout(r, 320));
await page.evaluate(() => document.querySelector('[data-action="trial-pref"][data-key="biopsy"]')?.click());
await new Promise((r) => setTimeout(r, 320));
await page.evaluate(() => { document.querySelectorAll('.subnav button')[2].click(); });
await new Promise((r) => setTimeout(r, 350));
const trackInfo = await page.evaluate(() => ({ rows: document.querySelectorAll('.track-row').length, cards: document.querySelectorAll('.saved-card').length }));
await page.screenshot({ path: join(OUT, '24-trials-track.png'), fullPage: true });
console.log('临床试验：', JSON.stringify(trialInfo), '跟踪：', JSON.stringify(trackInfo));

// 三档字号 × 两种宽度 溢出检查
const fontCheck = [];
for (const w of [1440, 1280, 1024]) {
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  for (const f of ['1', '1.15', '1.32']) {
    await page.evaluate((ff) => { document.querySelector(`[data-action="font"][data-font="${ff}"]`)?.click(); }, f);
    await new Promise((r) => setTimeout(r, 200));
    const sw = await page.evaluate(() => [document.body.scrollWidth, document.documentElement.clientWidth]);
    fontCheck.push({ w, f, sw: sw[0], cw: sw[1], overflow: sw[0] > sw[1] + 1 });
  }
}
console.log('字号/宽度溢出：', JSON.stringify(fontCheck.filter((x) => x.overflow)));
console.log('溢出页：', JSON.stringify(report.filter((r) => r.overflow)));
console.log('console 错误：', errors.length ? errors : '无');
console.log('页面清单：');
for (const r of report) console.log(' -', r.page, r.h1 || (r.sub ? '(页签)' : ''), r.overflow ? 'OVERFLOW' : '');
await browser.close();
