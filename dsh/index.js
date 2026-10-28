import Schema from '@deepseek-ai/schemastery'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createStaticHandler } from './server.js'

export const name = 'biliary-tract-workbench-main'
export const inject = ['webServer', 'connection']
export const Config = Schema.object({})
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

export const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
/* 注册用的前缀**不能以 / 结尾**：宿主 dsh-host-webserver 的 match() 判定是
 * `pathname === prefix || pathname.startsWith(prefix + '/')`；写 '…/ui/' 时
 * 子路径要命中 '…/ui//'，于是 /ui/app.js、/ui/style.css 全部落到 SPA 兜底，
 * 浏览器把 index.html 当 JS/CSS 解析 —— 装机后业务区就是白的。
 * 客户端 iframe 的 UI_ENTRY 仍以 / 结尾；静态层按 UI_ENTRY 剥前缀。 */
export const UI_PREFIX = '/api/biliary-tract-workbench/ui'
const UI_ENTRY = `${UI_PREFIX}/`

export function apply(ctx) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')
  /* 业务界面：public/（由 scripts/build-public.mjs 从 prototypes/v0.2 产出）经 iframe 装进面板。
     此前只注册了 /health、也没有 public/ —— 装机后用户看不到任何业务页。 */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix', path: UI_PREFIX, handler: createStaticHandler(PUBLIC_DIR, UI_ENTRY),
  }), 'biliary-tract-workbench ui')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/api/biliary-tract-workbench/health',
    handler(req, res) {
      const send = (status, body) => {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      }
      if (typeof ctx.connection?.requestRejection !== 'function') return send(503, { error: 'connection authentication capability unavailable' })
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) return send(rejection, { error: 'Authentication required' })
      if (req.method !== 'GET') return send(405, { error: 'Method not allowed' })
      send(200, { ok: true, version: manifest.version, apiVersion: 'v1', capabilities: ['health'] })
    },
  }), 'biliary-tract-workbench health')
}