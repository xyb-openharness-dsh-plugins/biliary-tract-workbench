# 实施任务与当前交接

规格版本：`docs/SPEC.md` 第十版（十页 56 条 / ACC-001–ACC-056，2026-10-24）
原型版本：`prototypes/v0.2/`（11 个一级页 + 9 个二级页签 = 20 屏），`app.js` sha256 `45a82441…`
数据模型：`schema/0001_initial.sql` 草案 36 表 / 6 触发器 / 24 索引，sha256 `711ffefc…`（**G3 未签**）
当前分支/包版本：`main` · `@xyb-community/biliary-tract-workbench@0.1.0`
闸口：**G1 ✅ 已签**（2026-10-24 19:27）· **G2 🟡 逐条走查中 11/56**（dash 4 / type 4 / jaundice 3 已通过）· **G3 ⬜ 未做**

> 硬约束：**G2 未签之前，`dsh/` 与 `lib/` 里不得写任何真实业务逻辑**。
> T02 及之后的单元都处于「未获准开工」，不是「还没排期」。

| ID | 业务单元 | 前置依赖 | 拥有文件/模块 | 实现/检查要求 | 证据 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| T00 | 家族结构（P0） | — | `lib/version.js`、`lib/layout.js`、`test/`、`docs/DEV-PLAN.md` | `npm run audit` 0 fail；版本/布局/单测进检查链 | audit 30/32 · 0 fail · 2 待人工（T10 未开工，已在 DEV-REQUIREMENTS §八 逐条回复） | ✅ 已具备 |
| T01 | 接入基线 | BRIEF/SPEC | `dsh/index.js`、`lib/client.js`、`cordis.patch.yml`、`package.json` | 实际包可被目标宿主加载；健康接口可用；包结构校验通过 | 脚手架产物，仅注册骨架、无业务逻辑；`npm run check` 绿 | ✅ 已具备（脚手架） |
| T02 | 数据层与迁移 | T01 + G3 签认 | `src/store/`、`src/migrations/`、schema 冻结副本 | 旧库兼容、`_migration` 记账、触发器与 CHECK 生效；以 `schema/0001_initial.sql` 为唯一来源，不手改库 | 演示库已能按 36 表建起（`npm run build:demo`）；**G3 未签，不得开工** | ⛔ 阻塞（G3） |
| T03 | 共享 UI 组件 | 原型冻结 + API 合同 | `src/components/` | 翻面卡、折线图、状态徽章、弹窗、空态、三态、折叠；视觉对齐 `prototypes/v0.2/style.css` 的令牌 | 原型已验证组件形态（`22-chart-flip.png` 等）；未迁到 `src/` | ⛔ 阻塞（G2） |
| T04 | 看板与双轴（DASH/TYPE/JAU/DR） | T02/T03 | 按页分配 | 输入→操作→结果→回顾闭环；事实层带日期与说话人；禁用词表零命中 | 原型 4 屏可走查；无落库 | ⛔ 阻塞（G2） |
| T05 | 治疗与化验（TRT/LAB/IMG） | T02/T03 | 按页分配 | 线序时间轴、方案依据三栏、位点三态、本单上限、报告只索引不解读 | 原型 `sub-treat-1/2/3`、`sub-labs-1/2/3`、`07-imaging` | ⛔ 阻塞（G2） |
| T06 | 临床试验（TRL-01~12） | T02/T03 | `src/trials/`（匹配引擎、检索、收藏跟踪） | 匹配引擎独立可测：`pct = met/(met+unmet+unknown)`，未知按 0；硬性不满足判 `ineligible`；`verified_on` 为空不得显示在招；**不做入组判定** | 原型三页签 + 引擎逻辑在 `app.js` 内（约 300 行），尚未抽成可单测模块；数据 10 条全为合成 | ⛔ 阻塞（G2） |
| T07 | 一图秀与复查（CHT/CARE/SET/CROSS） | T02/T03 | 按页分配 | 多序列归一化、上限 4 条、导出预览带声明、字号三档 | 原型 `08-chart`、`09-care`、`10-settings` | ⛔ 阻塞（G2） |
| T08 | 跨页集成与安装验收 | T04–T07 | 集成层、发布记录 | 官方自测清单跑通；实际包安装、版本号三处一致 | 待做 | ⬜ 未开始 |
| T09 | 发布与市场（按授权） | T08 + 明确授权 | `docs/RELEASE.md`、发行仓库、市场 PR | 选定来源；记录授权、tag/包/hash、Profile、PR 及可见状态；未授权标「不适用」 | 待定 | ⬜ 未开始/待授权 |
| T10 | 原生 Agent 面板（适用时） | T01 + 目标 Desktop 合同 + UI 状态稿确认 | 全局入口、宿主面板状态适配 | 拉起、隐藏/重开、调宽、窄窗与会话复用；不仿制聊天 UI | 原型 AI 面板仅是静态清单 + 词表自检 | ⬜ 未定 |

## 当前失败/复现

无。`npm run check` 全绿：语法 / 版本布局一致 / 13 条单测 / 冻结合同哈希 / 11 条口径 / 文案红线 / 包结构。
`npm run audit` = 30/32 · 0 fail · 2 待人工（两条都因原生 Agent 面板未实现，处置见 `DEV-REQUIREMENTS` §八）。

## 未验证项

1. **G2 未签完**：56 条功能中 11 条已按 ACC 号打勾（ACC-001~011），其余 45 条未走查（见 `docs/G2-CONFIRM-SHEET.md`）。
2. **10 条临床试验全是合成数据**（注册号 `DEMO-` 前缀），不是真实试验；无后台同步任务，`trial_track_event` 靠手工写入。
3. **没有临床核对人**：M1–M13 全部标「未核实」；`guideline_ref` 仍是空表，三条解释通道在界面上显示「未引入」。
4. **移动端只做降级布局**（`@media max-width:900px`），未逐屏实测。
5. `docs/ONE-CHART-SPEC.md` 的 C1–C12 未逐条评分。

## 下一步具体动作/命令

1. 维护者按 `docs/FEATURE-INVENTORY.csv` 的 ACC-001–ACC-056 逐条确认原型（材料见 `docs/PROTOTYPE-REVIEW.md` + `prototypes/_evidence/` 27 张截图）。
2. 通过后在 `docs/GATE-RECORDS.md` 的 G2 段写清确认人 / 原话 / 时间 / 版本 / 返工条目 → 签 G2。
3. 复核 schema 与原型是否一致 → 在 `schema/freeze-contract.md` 顶部补确认人与结构变更清单 → 签 G3。
4. 签完 G3 才开 T02：先做迁移与 `_migration` 记账，再按页接 T03–T07。
5. 每次改 `schema/*.sql` 后必须 `npm run build:demo && npm run check`，并同步 `freeze-contract.md` 的哈希。

## 用户已确认的偏好与授权

- 「**胆红素和总胆红素不可能一样**」→ 已落为 M12（全站改称 + 库层 CHECK），不可回退。
- 「**临床试验需要补齐，参考小胰宝 workbench，从病理特点、匹配内容、个性化搜索、自动符合度、收藏和跟踪**」→ 已落为 M13 与 TRL-01~12。
- 三层信息边界（事实 / 解释 / 判断）为最高约束：判断一句不生成，出口固定「这一句需要问你的医生」。
- 双轴并列不加总；三态「未检测 ≠ 阴性」；×ULN 只取本单上限。
