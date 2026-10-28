window.__ModuleLoader__.load({
  id: "@xyb-community/biliary-tract-workbench",
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const metadata = {"title":"小胆宝 · 胆道癌工作台","description":"本机优先的胆道癌（胆囊癌 / 肝内胆管癌 / 肝外胆管癌）分型与可切除性记录、黄疸与胆道引流照护、治疗线序与复查准备工作台"}
    /* layout:begin（由 scripts/build-version.mjs 从 lib/layout.js 注入，勿手改） */
    const layout = {"customFrame":true,"businessWidth":0.65,"agentPane":{"min":0.25,"max":0.45,"default":0.35,"step":0.02,"narrowBelowPx":760,"drawerMaxPx":420}}
    /* layout:end */
    const theme = "/* Scope to business content; never style host navigation globally. */\n.wb-biliary-tract-workbench {\n  --wb-paper: #f7faf8; --wb-surface: #ffffff; --wb-ink: #34413c;\n  --wb-muted: #596c62; --wb-line: #dce7df; --wb-mint: #e2f2ea;\n  --wb-mint-ink: #22664e; --wb-action: #b95023; --wb-action-ink: #ffffff;\n  --wb-pink: #f8e8eb; --wb-blue: #eaf1f6; --wb-yellow: #faf2d8;\n  --wb-radius: 18px; --wb-gap: 16px; --wb-group-gap: 24px;\n  color: var(--wb-ink); background: var(--wb-paper); font: 16px/1.65 -apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n  font-variant-numeric: tabular-nums; min-width: 0; min-height: 0; container-type: inline-size;\n}\n.wb-biliary-tract-workbench[data-font=large] { font-size: 19px; }\n.wb-biliary-tract-workbench * { box-sizing: border-box; }\n.wb-biliary-tract-workbench button,.wb-biliary-tract-workbench input,.wb-biliary-tract-workbench select { font: inherit; }\n.wb-biliary-tract-workbench button { min-height: 44px; cursor: pointer; }\n.wb-biliary-tract-workbench :focus-visible { outline: 3px solid var(--wb-mint-ink); outline-offset: 3px; }\n.wb-biliary-tract-workbench .wb-primary { background: var(--wb-action); color: var(--wb-action-ink); border: 0; border-radius: 999px; padding: 9px 20px; }\n.wb-biliary-tract-workbench .wb-flower { display: inline-block; width: 24px; height: 24px; flex: 0 0 auto; margin-inline-end: 10px; animation: wb-flower-turn 12s linear infinite; }\n@keyframes wb-flower-turn { to { transform: rotate(360deg); } }\n@media (prefers-color-scheme: dark) {\n  .wb-biliary-tract-workbench { --wb-paper:#17231f; --wb-surface:#20322a; --wb-ink:#edf5ef; --wb-muted:#c0d2c6; --wb-line:#496354; --wb-mint:#294f3f; --wb-mint-ink:#a0ddbd; --wb-action:#f3a578; --wb-action-ink:#39200e; --wb-pink:#45333a; --wb-blue:#283d4c; --wb-yellow:#473e25; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .wb-biliary-tract-workbench .wb-flower { animation:none; }\n}\n"

    /* 面板参数全部来自注入的 lib/layout.js 快照（H15：客户端不写第二份默认值） */
    const AGENT_MIN = layout.agentPane.min
    const AGENT_MAX = layout.agentPane.max
    const AGENT_DEFAULT = layout.agentPane.default
    const AGENT_STEP = layout.agentPane.step
    const NARROW_BELOW = layout.agentPane.narrowBelowPx
    const DRAWER_MAX = layout.agentPane.drawerMaxPx
    const WIDTH_KEY = 'biliary.panelWidth'
    /* 业务界面入口：与 dsh/index.js 的 UI_PREFIX + '/' 对齐（注册路径本身不带尾斜杠，见那边注释） */
    const UI_ENTRY = '/api/biliary-tract-workbench/ui/'

    const clampRatio = (value) => {
      const n = Number(value)
      if (!Number.isFinite(n)) return AGENT_DEFAULT
      return Math.max(AGENT_MIN, Math.min(AGENT_MAX, n))
    }
    const loadWidth = () => {
      try { return clampRatio(localStorage.getItem(WIDTH_KEY)) } catch { return AGENT_DEFAULT }
    }
    const saveWidth = (value) => {
      try { localStorage.setItem(WIDTH_KEY, String(value)) } catch { /* 隐私模式下写不进去，不挡使用 */ }
    }

    /* 分隔线品牌色（与顶栏主按钮同色）；悬停/拖动时由该色派生光晕 */
    const SPLITTER_BRAND = '#22664e'
    const splitterRgba = (hex, alpha) => {
      const raw = hex.replace('#', '')
      const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
      const n = parseInt(full, 16)
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
    }

    function Panel({ conversation }) {
      const [health, setHealth] = React.useState(null)
      const [error, setError] = React.useState('')
      const [large, setLarge] = React.useState(false)
      const [attempt, setAttempt] = React.useState(0)
      const [percent, setPercent] = React.useState(loadWidth)
      const [paneOpen, setPaneOpen] = React.useState(true)
      const [narrow, setNarrow] = React.useState(false)
      const [dragging, setDragging] = React.useState(false)
      const [hovering, setHovering] = React.useState(false)
      const [note, setNote] = React.useState('')
      /* 业务界面在 public/（由 scripts/build-public.mjs 从 prototypes/v0.2 产出）；
         探不到界面才退回占位骨架 —— 否则面板会是一片空白。 */
      const [uiBroken, setUiBroken] = React.useState(false)

      const shellRef = React.useRef(null)
      const frameRef = React.useRef(null)
      const hasConversation = Boolean(conversation)

      React.useEffect(() => {
        const controller = new AbortController()
        fetch(UI_ENTRY, { method: 'HEAD', signal: controller.signal, credentials: 'same-origin' })
          .then((response) => {
            if (!response.ok) setUiBroken(true)
            else {
              /* 宿主的 SPA 兜底会把未知路径回成 text/html；那不是界面，别把 HTML 当页面塞进 iframe */
              const type = String(response.headers.get('content-type') || '')
              if (type && !type.includes('text/html')) setUiBroken(true)
            }
          })
          .catch(() => setUiBroken(true))
        return () => controller.abort()
      }, [attempt])

      React.useEffect(() => {
        const controller = new AbortController()
        setHealth(null); setError('')
        fetch('/api/biliary-tract-workbench/health', { signal: controller.signal, credentials: 'same-origin' })
          .then(async (response) => {
            if (!response.ok) throw new Error(`服务连接失败 (${response.status})`)
            const result = await response.json()
            if (!controller.signal.aborted) setHealth(result)
          })
          .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
        return () => controller.abort()
      }, [attempt])

      /* 窄屏判定用**容器宽度**，不是窗口宽度：宿主主区宽度 ≠ 窗口宽度 */
      React.useEffect(() => {
        const host = shellRef.current
        if (!host || typeof ResizeObserver !== 'function') return undefined
        const observer = new ResizeObserver((entries) => {
          const w = entries[0]?.contentRect?.width ?? 0
          setNarrow(w > 0 && w < NARROW_BELOW)
        })
        observer.observe(host)
        return () => observer.disconnect()
      }, [])

      React.useEffect(() => { saveWidth(percent) }, [percent])

      /* ---------------- splitter：拖动 ---------------- */
      const onSplitterPointerDown = (ev) => {
        const host = shellRef.current
        if (!host) return
        ev.preventDefault()
        setDragging(true)
        /* 捕获失败不是错误：下面的 document 监听同样能收 move/up */
        try { ev.currentTarget.setPointerCapture?.(ev.pointerId) } catch { /* 降级到 document 监听 */ }
        const rect = host.getBoundingClientRect()
        const move = (e) => {
          /* 按容器 rect 夹取，不按 window.innerWidth */
          const ratio = 1 - (e.clientX - rect.left) / rect.width
          setPercent(clampRatio(ratio))
        }
        const up = () => {
          setDragging(false)
          document.removeEventListener('pointermove', move)
          document.removeEventListener('pointerup', up)
          document.removeEventListener('pointercancel', up)
        }
        document.addEventListener('pointermove', move)
        document.addEventListener('pointerup', up)
        document.addEventListener('pointercancel', up)
      }

      const onSplitterKeyDown = (ev) => {
        if (ev.key === 'ArrowLeft') { ev.preventDefault(); setPercent((v) => clampRatio(v + AGENT_STEP)) }
        else if (ev.key === 'ArrowRight') { ev.preventDefault(); setPercent((v) => clampRatio(v - AGENT_STEP)) }
        else if (ev.key === 'Home') { ev.preventDefault(); setPercent(AGENT_MAX) }
        else if (ev.key === 'End') { ev.preventDefault(); setPercent(AGENT_MIN) }
      }

      const agentLabel = !hasConversation ? 'AI 对话暂不可用' : paneOpen ? '收起 AI 对话' : '打开 AI 对话'
      const hintText = !hasConversation
        ? '宿主没有提供会话节点：业务区照常可用，AI 对话暂不可用。'
        : paneOpen
          ? '右侧是 DSH 原生会话：拖动中间分隔边调整宽度（25%–45%），收起不会结束会话。'
          : '会话已收起：点「打开 AI 对话」回到同一会话，草稿还在。'
      const versionLabel = health ? `v${health.version}` : '版本待连接'
      const statusText = error || (health ? '接入骨架：服务已连接，业务功能待按 spec 实现。' : '正在连接本机服务…')
      const noteText = note || (!hasConversation ? 'AI 对话入口暂不可用：宿主没有提供原生会话节点；业务区与连接检查不受影响。' : '')

      const headerStyle = {
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '0 0 auto',
        padding: '6px 12px', paddingInlineStart: 'calc(12px + var(--dsh-frame-leading-clearance, 0px))',
        borderBottom: '1px solid var(--wb-line, #dce7df)', background: 'var(--wb-surface, #fff)',
        font: '13px/1.5 -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
      }
      const brandStyle = { fontSize: 12.5, fontWeight: 700, color: '#22664e' }
      const versionStyle = {
        fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '1px 8px',
        background: '#eef2ef', color: '#596c62',
      }
      const hintStyle = { flex: 1, minWidth: 200, color: '#596c62', fontSize: 11.5 }
      const actionsStyle = { display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', marginLeft: 'auto' }
      const ghostButtonStyle = {
        minHeight: 28, padding: '3px 10px', borderRadius: 999, cursor: 'pointer',
        border: '1px solid #dce7df', background: '#fff', color: '#34413c',
      }
      const agentButtonStyle = {
        minHeight: 28, padding: '4px 14px', borderRadius: 999, fontWeight: 600,
        border: `1px solid ${hasConversation ? SPLITTER_BRAND : '#dce7df'}`,
        background: hasConversation ? SPLITTER_BRAND : '#f1f4f2',
        color: hasConversation ? '#fff' : '#8a9a91',
        cursor: hasConversation ? 'pointer' : 'not-allowed',
      }
      const bodyStyle = { position: 'relative', flex: 1, display: 'flex', minHeight: 0 }
      const businessStyle = { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }
      const paneStyle = {
        position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0,
        borderInlineStart: '1px solid var(--wb-line, #dce7df)', background: 'var(--wb-surface, #fff)',
        overflow: 'hidden',
      }
      const drawerStyle = {
        position: 'absolute', insetBlock: 0, insetInlineEnd: 0, zIndex: 30,
        boxShadow: '-8px 0 24px rgba(0,0,0,.18)',
      }
      /* 1px 视觉细线，绝对定位在业务区与会话区边界上（不占布局宽度）；热区由内部 11px 透明子元素提供 */
      const splitterStyle = {
        position: 'absolute', top: 0, bottom: 0, width: 1, marginRight: -0.5,
        zIndex: 2, background: '#dce7df', cursor: 'col-resize', touchAction: 'none',
        transition: 'background .15s ease, box-shadow .15s ease',
      }
      const splitterHoverStyle = {
        ...splitterStyle, background: SPLITTER_BRAND,
        boxShadow: `0 0 6px ${splitterRgba(SPLITTER_BRAND, 0.55)}`,
      }
      const splitterDragStyle = {
        ...splitterHoverStyle,
        boxShadow: `0 0 10px ${splitterRgba(SPLITTER_BRAND, 0.8)}`,
      }
      const splitterHitStyle = {
        position: 'absolute', top: 0, bottom: 0, left: -5, width: 11,
        background: 'transparent', cursor: 'col-resize',
      }
      const splitterGripStyle = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 14, height: 22, borderRadius: 4, background: SPLITTER_BRAND,
        color: '#fff', fontSize: 11, lineHeight: '22px', letterSpacing: '-1px', textAlign: 'center',
        opacity: 0.95, pointerEvents: 'none', userSelect: 'none',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.18)',
      }
      const dragShieldStyle = {
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        zIndex: 4, cursor: 'col-resize',
      }

      /* 业务区：public/ 的界面经 iframe 装进来；探不到才退回占位骨架 */
      const frameStyle = { flex: 1, width: '100%', minHeight: 0, border: 0, display: 'block', background: '#fff' }
      const business = uiBroken
        ? h('main', { className: 'wb-biliary-tract-workbench', 'data-font': large ? 'large' : 'standard', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, overflow: 'auto' } },
          h('style', null, theme),
          h('section', { style: { background: 'var(--wb-surface)', border: '1px solid var(--wb-line)', borderRadius: 'var(--wb-radius)', padding: 20 } },
            h('h1', { style: { fontSize: '1.6em', margin: '0 0 12px' } }, metadata.title),
            h('p', null, metadata.description),
            h('p', { role: 'status' }, statusText),
            h('button', { type: 'button', className: 'wb-primary', onClick: () => setAttempt((value) => value + 1) }, '重新检查连接')))
        : h('iframe', {
            key: attempt,
            ref: frameRef,
            src: UI_ENTRY,
            title: '小胆宝 · 胆道癌工作台',
            style: frameStyle,
            sandbox: 'allow-scripts allow-same-origin allow-forms allow-downloads',
            onLoad: () => setNote(''),
          })

      return h('div', {
        ref: shellRef,
        style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--wb-paper, #f7faf8)' },
      },
        /* 根节点首个子元素：语义 header（customFrame 合同硬约束） */
        h('header', { style: headerStyle },
          h('strong', { style: brandStyle }, metadata.title),
          h('span', { style: versionStyle }, versionLabel),
          h('span', { style: hintStyle }, hintText),
          h('div', { style: actionsStyle },
            uiBroken ? h('button', {
              type: 'button',
              'aria-pressed': large,
              onClick: () => setLarge((value) => !value),
              style: ghostButtonStyle,
            }, large ? '标准字' : '大字') : null,
            h('button', {
              type: 'button',
              'aria-label': `AI 对话：${agentLabel}`,
              'aria-controls': 'biliary-agent-pane',
              'aria-expanded': hasConversation ? paneOpen : false,
              disabled: !hasConversation,
              onClick: () => { if (hasConversation) setPaneOpen((value) => !value) },
              style: agentButtonStyle,
            }, agentLabel))),

        noteText ? h('p', {
          role: 'status',
          style: { margin: 0, padding: '6px 12px', background: '#faf2d8', color: '#5a4a1a', fontSize: 12.5 },
        }, noteText) : null,

        h('div', { style: bodyStyle },
          /* 业务区：iframe（public/）或占位骨架；splitter 与 aside 顺序不变 */
          h('div', { style: businessStyle }, business),
          /* splitter 必须在 aside 之前：排在后面会贴到面板最右缘 */
          !narrow && paneOpen && h('div', {
            role: 'separator',
            'aria-orientation': 'vertical',
            'aria-label': '调整 AI 对话面板宽度',
            'aria-valuemin': Math.round(AGENT_MIN * 100),
            'aria-valuemax': Math.round(AGENT_MAX * 100),
            'aria-valuenow': Math.round(percent * 100),
            tabIndex: 0,
            style: {
              ...(dragging ? splitterDragStyle : hovering ? splitterHoverStyle : splitterStyle),
              right: `${percent * 100}%`,
            },
            onPointerDown: onSplitterPointerDown,
            onPointerEnter: () => setHovering(true),
            onPointerLeave: () => setHovering(false),
            onKeyDown: onSplitterKeyDown,
          },
            h('span', { style: splitterHitStyle, 'aria-hidden': 'true' }),
            (hovering || dragging) ? h('span', { style: splitterGripStyle, 'aria-hidden': 'true' }, '⠿') : null),
          /* 原生会话始终挂载：隐藏走 display，不卸载——卸载会丢输入框与草稿 */
          h('aside', {
            id: 'biliary-agent-pane',
            'aria-label': 'AI 对话',
            'aria-hidden': paneOpen ? undefined : 'true',
            style: {
              ...paneStyle,
              ...(narrow ? drawerStyle : null),
              width: narrow ? `min(92%, ${DRAWER_MAX}px)` : `${percent * 100}%`,
              display: paneOpen ? 'flex' : 'none',
            },
          }, conversation ?? h('div', { style: { padding: 20, display: 'flex', flexDirection: 'column', gap: 8, font: '14px/1.6 -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif', color: '#596c62' } },
            h('b', null, 'AI 对话还没开始'),
            h('span', null, '宿主的 DSH 原生会话节点会固定出现在这一侧。'),
            h('span', null, '没有会话也不影响业务区：连接检查与占位内容照常可用。'))),
          /* 拖动期间铺透明遮罩：指针掠过业务区时事件仍归文档，拖动不断 */
          dragging ? h('div', { style: dragShieldStyle, 'aria-hidden': 'true' }) : null))
    }

    function apply(ctx) {
      /* businessWidth 必须放在 layout 里：宿主只读 descriptor.layout.businessWidth，
         顶层写 businessWidth 会被忽略并退回默认 0.36（家族基线是 0.65）。 */
      ctx.effect(() => ctx.desktopWorkbenches.register({"title":"小胆宝 · 胆道癌工作台","repository":"https://github.com/xyb-openharness-dsh-plugins/biliary-tract-workbench","description":"本机优先的胆道癌（胆囊癌 / 肝内胆管癌 / 肝外胆管癌）分型与可切除性记录、黄疸与胆道引流照护、治疗线序与复查准备工作台","customFrame":layout.customFrame,"layout":{"businessWidth":layout.businessWidth}}, Panel))
    }
    return { apply, inject: ['desktopWorkbenches'] }
  }
})