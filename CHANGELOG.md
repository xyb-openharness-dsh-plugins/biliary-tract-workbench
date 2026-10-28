# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

## 0.1.3 — 2026-10-28

- **修装机后业务区空白（根因，三处半成品）**：
  1. 本仓没有 `public/`，`dsh/index.js` 也只注册了 `/health`——装机后没有任何可加载的业务页。新增
     `scripts/build-public.mjs`（从 `prototypes/v0.2` 产出 7 个文件，只改 index.html 两处版本字面量）、`dsh/server.js`
     （静态层，只从 `public/` 出文件，拦 `..`/绝对路径/符号链接逃逸），并注册 `/api/biliary-tract-workbench/ui`
     静态前缀路由（注册路径不带尾斜杠：宿主 `match()` 以 `prefix + '/'` 判子路径，带尾斜杠会让 `/ui/app.js`、
     `/ui/style.css` 落到 SPA 兜底，浏览器把 HTML 当 JS/CSS 解析）。
  2. `lib/client.js` 的业务区此前是占位 `<main>`，从不加载原型；现改为 iframe 装 `public/`（HEAD 探活失败或收到非
     `text/html` 才退回占位骨架，占位里的「大字」按钮也只在兜底时出现）。
  3. 注册描述符把 `businessWidth` 写在顶层，宿主只读 `descriptor.layout.businessWidth`，等于一直退回默认 0.36；
     改为 `layout: { businessWidth: 0.65 }`，与家族基线一致。
  `package.json` 的 `files` 增加 `public`，`check` 增加 `node --check dsh/server.js` 与 `build-public.mjs --check`。
  用户可见结果：装机后业务区显示原型界面（分型/可切除性、黄疸与引流、化验与复查），不再是空白或占位卡。
- `scripts/check-wording.mjs`：`public/demo-data.js` 是事实层（医生原话与检验原文），与 `prototypes` 下同名文件一样
  不参与文案红线扫描；此前只因 public 刚出现才被误扫。
- 版本升 0.1.3（VERSION / package.json / lib/version.js 同步）。

## 0.1.1 — 2026-10-27

### 36 号 v2 补齐（指南可点 + 状态卡）

按 starter 的 `prompts/PRIMER-BACKFILL.md` 六步补齐，先出 HTML demo 供确认。

- **模式层对齐**：`prototypes/v0.2/primer.js` / `primer.css` 换成 starter 最新版（原文件是纯增量差异，无本地改动会被覆盖）。
  新增 `safeHref()`（只认 `https://`）、原件/二次来源链接渲染（`.dp-link`）、缺链接红标（`.dp-miss`）、表格单元格 `{text, url}` 支持。
- **§2.5 数据补链接**：指南表三行 + 四段来源逐行补 `url` / `secondaryUrl`，**每条都 curl 验证过 200**：
  - NCCN → JNCCN 23(9): p403 刊出版（标题写明 Version 2.2025，DOI 10.6004/jnccn.2025.0042）；官网详情页现列 2.2026，版本差如实写进表与趋势段。
  - CSCO → 人民卫生出版社商城页（2024 版，2024-08，ISBN 978-7-117-36675-5）。原先「版本未核实」据此改为 2024 版。
  - AJCC → facs.org 分期体系页（官网公告 Version 9 协议发布、「8th Edition 或 Version 9」对照表）。
  - 项目内文档没有对外链接，标 `nolink: true` + note，不硬凑 URL；页码仍全部「待核」。
  - 三个「看着很对但打不开」的地址已排除：NCCN `.../pdf/btc.pdf` 302 到登录页、Springer 书页 404、`cancerstaging.org` 证书域名不匹配。
- **§2.6 看板状态卡**：`app.js` 新增 `stageCard()` 作为 `dash` 首卡——卡头 `D+122 术后状态卡 · 距辅助化疗第 5 周期前复查`／大字「第 122 天」（由手术日 2026-06-24 派生，34px 品牌色）／现状行（`1 线 · 卡培他滨单药` + `进行中 · 已完成 4 / 8 周期` + `下次 2026-12-15（…）还有 52 天`）／出口按钮（看治疗线序 + 疾病概要）。
  无手术记录时整卡「待初始化」并指向三步向导（已实测）。
- **去重**：下次门诊改由状态卡承担后，提醒位不再重复同一句日期（同一屏出现两遍「52 天」会让人以为是两件事），提醒位由四条变三条。
- **顶栏「?」改为手写按钮**：模块自动插入发生在 `app.js` 渲染之前，接管不到已有顶栏，导致「?」没有落到 `.top-actions`（实测首屏只剩状态卡里的副按钮）。现在 `index.html` 显式声明 `data-primer-open`。
- **验证**：`probe-disease-primer.mjs` 9/9 PASS（P1–P8 + E0）；`--self-test` 注入缺陷后 3 条 FAIL，闸门确实会报红；`npm run check` 全绿。
- **没做的事**：`src/` 数据层与 `lib/client.js` 业务页未接（等 demo 确认后再做）；README 的 27 张截图未重拍（状态卡会改变首屏，确认后统一重拍）。

## 0.1.0 — 2026-10-24

- 由社区脚手架 dsh-wb-cli@1.5.0 (ce410fb) 初始化，仅有注册骨架与健康接口，无业务功能。

### 阶段 0–1 产物（同日，仍无业务功能）

- **认领**：`.github` 的 BACKLOG 目标池第 15 项「胆道癌」认领，Issue #18 + `/claim`，PR #19。
- **强约束文档**：`docs/DEV-REQUIREMENTS-2026-10-24.md`（R0–R5 / H1–H21 / M1–M8）、`docs/PATIENT-FLOW.md`（三条流程 + H1–H6 待核实清单）、`docs/DIFF-MATRIX.md`（与肝癌 v0.3.4 逐项对照）、`docs/SPEC.md`（重写，全部场景标注为假设）。
- **数据模型草案**：`schema/0001_initial.sql`（26 表 / 6 触发器 / 17 条指标定义），`schema/freeze-contract.md`（**G3 未签**）。
  主脊是「梗阻—黄疸」与「肿瘤—治疗」双轴并列不加总；分型单独成版本链表（icc/pcc/dcc/gbc，**壶腹癌不在范围**）；
  基因位点在库层保证「未检测 ≠ 阴性」。
- **演示数据**：`demo/build-demo-data.mjs` → `demo/demo-data.sqlite` + `demo/demo-data.json`，两套 6 个月档案
  （肝门部带 PTCD 减黄后手术 / 胆囊癌术后辅助化疗后影像复发），覆盖分型更正、可切除性三连变、未检测三态。
- **检查链**：新增 `scripts/check-schema.mjs`（冻结合同哈希 + 演示库 `_migration` 核对）、`npm run build:demo`；`npm run check` 绿。
- **没有做的事**：没有任何页面、没有 `prototypes/`、没有 API；G1/G2/G3 全部未签。此版本不可安装使用。
- **编号修正（仅文档）**：用户假设原写作 H1–H6，与硬约束 H1–H21 撞号（同一 `H6` 在两份文档里一个是「线序不覆盖」、一个是「会不会记引流量」）。已统一改为 **U1–U6**（U = 用户假设），并在 `PATIENT-FLOW.md` 开头写明三套编号的分工。
- **U5/U6 改写（2026-10-24 晚，收到一条 n=1 输入）**：
  - U6 从「会不会主动记引流量」改为「**太多不同的检测报告看不懂，病人病情怎么样了**」→ `dash` 现状卡四行事实 + `labs` 报告清单 + 「我不懂的」打标。
  - U5 从「对能不能切理解不一致」改为「**对后续治疗策略的指标依据与影响判断依据不了解，不懂指南**」→ `treat/依据`：医生原话 + 涉及指标 + 指南条目（机构/版本/页码缺一即「未引入」）。
  - 数据模型随之扩到 **30 表**：新增 `guideline_ref` / `decision_record` / `decision_metric` / `reading_flag`，`document` 增 `issued_by` / `summary_line` / `feeds_trend` 三列。哈希 `62709f0a…`（未签认期允许整体改写 0001）。
  - 新增硬约束 **M9**（现状卡只答事实、禁用词表）、**M10**（报告只索引不解读）；新增 ADR **A7–A9**、差异条款 **D6–D8**。
  - 演示库补 3 条方案依据、9 份报告清单、2 条打标；`npm run check` 仍绿。
- **三层信息边界定为最高约束（2026-10-24 维护者确认）**：原话「医疗结论是医生的判断，信息解释和提醒是工作台提供的支持能力」。
  `SPEC.md` 新增 §零（事实 / 解释 / 判断三层 + 提醒的四条可否对照表）；`DEV-REQUIREMENTS` 新增 **M11**，M9 / M10 作为其实例。
  新增 `scripts/check-wording.mjs` 把禁用词表变成扫描（只扫 `public/`、`src/`、`lib/client.js`，不扫 `docs/` 与 `demo/`；行内 `wording-ok` 可豁免），已接入 `npm run check`。
  实测：临时样例里「目前病情稳定」命中并 `exit 1`，而「2.4 倍参考上限…请咨询你的医疗团队」与带 `wording-ok` 的医生原话通过。
- **G1 通过（2026-10-24 19:27，项目维护者原话「G1通过」）**：新建 `docs/GATE-RECORDS.md` 留痕，写清覆盖范围（四条流程 + 三层边界 + 九条不做）与**没覆盖什么**（U1–U4 仍未核实、无临床核对人、无原型、schema 未冻结）。`SPEC.md` 头部与闸口表同步。通过后的直接后果：可以画原型（→G2）、可以继续改 schema（→G3），但仍不得写业务代码。
- **`docs/FEATURE-INVENTORY.csv` 改写（2026-10-24，G1 后的第一个动作）**：脚手架模板桩 → **44 条功能 / ACC-001–ACC-044**，覆盖 **10 个一级页**（dash / type / jaundice / drain / treat / labs / imaging / chart / care / settings）+ `treat`、`labs` 两个二级页签 + 跨页 3 项。
  13 列表头沿用模板；「状态记录」列逐条绑定对应硬约束（如 `DASH-01 … 受 M9 禁用词表约束`、`TRT-04 … M8；version/page NOT NULL 已在库层约束`、`LAB-05 … U6 落点；M10 只索引不解读`）。
  核验：13 列无错位、44 个 ID 无重复、ACC 号 001–044 连续、无空单元格。`npm run check` 四项仍绿（schema 哈希 / 文案红线 / 包结构 / 语法）。
  **这只是草案**：条目会随 G2 原型评审增删，但 ID 不改、删功能只标「已废弃」保留行。
- **阶段 2 原型落盘（2026-10-24，G2 待签）**：新建 `prototypes/v0.2/` 四件套 + `demo/build-prototype-data.mjs`。
  - 数据不手写：`npm run build:proto` 从 `buildDemoProfiles()` 生成 `demo-data.js`，与演示库同源；原型里 24 条指标序列、2 套档案。
  - 十页 + 六个二级页签（`treat` 线序/方案依据/检测位点，`labs` 值/报告/我不懂的），对应 `FEATURE-INVENTORY.csv` 的 44 条 / ACC-001–ACC-044。
  - 视觉沿用家族已确认骨架（结直肠 v0.2 的栅格、字号档位、卡片规格），配色重映射到小胆宝的胆汁琥珀 `#A9761C`，纸色偏暖；新增 `.nowcard` / `.axis-grid` / `.chain` / `.tri` / `.gate` 等专有组件。
  - **三个"空白"是刻意的**：分级对照、检查项目说明、指南条目三处都显示「未引入」，因为库里没有带页码的原件。原型最想让人看见的就是这个空白——它是规则在起作用，不是没做完。
  - 真机验证：Chrome 145.0.7632.75，1440×900 @dpr2，console 错误 0，三档宽度 × 三档字号无横向溢出，19 张截图。证据见 `docs/PROTOTYPE-EVIDENCE.md`；截图目录 `prototypes/_evidence/` 已忽略入库（9 MB，可 `npm run probe:proto` 重跑重现）。
  - 自查修掉的三个真问题：二级页签点了不切换（漏了 `data-action`）、品牌章字符还是模板里的「畅」、引流柱条日期标签被裁切。

- **文案红线扩到原型（同日）**：`scripts/check-wording.mjs` 的 `SCAN_FILES` 加入 `prototypes/v0.2/app.js`，**不**把整个 `prototypes/` 加进 `SCAN` —— 同目录的 `demo-data.js` 是报告原文，属事实层，扫了全是假阳性。
  主程序里 5 处"说明不写什么"的元用途行（含禁用词表本身）加 `wording-ok` 显式豁免，扫描结果 2 个源文件 0 命中。
  期间踩到一个自造坑：把 `// wording-ok` 写在同一行数组开头，注释把整行数组吃掉，`node --check` 报 `Unexpected token 'function'` —— 豁免标记要放在语句结尾。

- **检查链与脚本**：`npm run check` 增加 `node --check prototypes/v0.2/app.js`；新增 `build:proto`、`probe:proto` 两个脚本。`.gitignore` 补 `prototypes/_evidence/` 与 `.workbuddy/`。

### 阶段 2 第二批：胆红素口径修正 + 临床试验页（2026-10-24，G2 待签）

- **M12 · 总胆红素 ≠ 胆红素（维护者原话：「胆红素和总胆红素不可能一样」）**
  - 原型 4 处改称：页副标题、看板入口、`bilirubinChart()` 标题与 tooltip、卡片标题，统一为「总胆红素（TBIL）」；
    图表下方新增并列说明，同屏给出同一张单上的直接胆红素（DBIL）数值与日期，并写明"差值是间接胆红素"。
  - 数据侧：两套档案 `labRef` 增 `directBilirubinHigh`（p1 = 8、p2 = 7），`refMap` 增 `bilirubin_direct`；
    `schema/0001_initial.sql` 的 `jaundice_lab` 加库层兜底
    `CHECK (direct_bilirubin IS NULL OR total_bilirubin IS NULL OR direct_bilirubin <= total_bilirubin)`
    —— 抄串行、写反了在入库时就挡住，不靠界面上人眼发现。
  - 写进口径文档 `DEV-REQUIREMENTS` 的 **M12**：不得写孤立「胆红素」；差值只作算术展示，不推断病因。

- **M13 · 临床试验只做条件对照，不做入组判断（维护者第三轮指令）**
  - 新增一级页 `trials`，三个二级页签：**匹配**（8 项病理特点带日期与来源 → 逐条三态对照）、
    **检索**（关键词 / 病理类型 / 治疗场景 / 状态四维筛选）、**收藏与跟踪**（收藏状态 + 外部变化时间线 + 待确认项摘要）。
  - 满足度算法：`pct = met / (met + unmet + unknown)`，**未知项按 0 计，因此只会偏低、不会偏高**；
    有硬性不满足项直接判 `ineligible` 并单独折叠；同屏固定声明「这不是入组资格，也不代表效果」。
  - 三态沿用全站纪律：基因位点 `tested=0` → 「未检测（报告原文：报告未包含该位点）」，不得显示为阴性；
    ECOG 记录里没有就显示「待确认 · 记录里是：未记录」。
  - 硬边界：不做入组判定、不替用户联系中心、不排序成"最该去的那一个"；所有条目必须带登记号 / 状态 / 核验日期，
    `verified_on` 为空不得显示为在招。

- **数据模型扩到 36 表**（C 轴 6 张：`trial` / `trial_criterion` / `trial_site` / `trial_match` / `trial_saved` / `trial_track_event`）。
  新哈希 `711ffefc417595255080b34afb146054a05cec47f5014f4c3d0c69120a4f9b43`，`schema/freeze-contract.md` 已登记（未签认期允许整体改写 0001）。
  演示库：10 条合成试验（`DEMO-` 前缀，**不是真实试验**）、48 条判据、14 个中心、5 条收藏、11 条跟踪事件。
- **`FEATURE-INVENTORY.csv`** 追加 TRL-01–TRL-12（ACC-045–ACC-056），现 **57 行 / 56 条功能 / 13 列**；校验：列数一致、ID 无重复、ACC 连续至 056。
- **探针扩容**：`prototypes/_probe/probe.mjs` 加 `trials` 一级页与 3 个二级页签，截图 19 → **27 张（20 屏）**；
  实测 `临床试验 {"cards":10,"fits":["88%","75%","75%"],"facts":8,"unknownMarks":11}`、`跟踪 {"rows":1,"cards":1}`，console 错误 0、无横向溢出。
- **文档同步**：`SPEC.md`（十页 56 条 + 临床试验整节 + 不做清单第 10 条）、`SCHEMA.md`（36 表 / 6 触发器 / 24 索引）、
  `PROTOTYPE-EVIDENCE.md`（11 页 + 9 页签 / 20 屏 / 27 张 / 已知未做完 8 条）、`PROTOTYPE-REVIEW.md`（填四件套 SHA-256 与逐模块走查表）、
  `GATE-RECORDS.md` 的 G2 段（材料清单补第二批）、`TASKS.md`（模板桩 → 真实实施单元）。
- **仍未做**：G2 未签、业务代码未写；10 条试验全为合成数据，无后台同步任务；移动端只做降级布局未逐屏实测。

### 口径机器化 + README 截图（2026-10-24 晚，G2 逐页走查中）

- **新增 `scripts/check-medical-rules.mjs`**，把 **M2–M9** 从文档表格变成会失败的检查，并附 **M12** 回归项；已接入 `npm run check`（也可 `npm run check:medical`）。
  9 条规则全绿：16 条化验记录上限可解析、CA19-9 无分级、黄疸/引流页 0 禁用词、无可切除判定函数、分型值全在四型内、治疗页 0 推荐词、`guideline_ref` 三列 NOT NULL 且界面显示「未引入」、看板 0 禁用词、无孤立「胆红素」。
  **做过负向测试**：向 `vDash` 注入"目前病情稳定，问题不大"，M9 立刻报错并 `exit 1`，还原后复绿。
  边界写进 `docs/MEDICAL-RULES.md`：M5 是近似判定、词表只看字面、只覆盖原型与演示数据，M1/M10/M11/M13 待结构化解法。
- **G2 逐页走查 · 第 2 页分型（ACC-005~008）通过**：按 ACC-005 的要求补上「这一段通常指什么」——属解释层，缺页码，
  所以整块按「未引入」显示（`<div class="gate">`），不拿"一般认为"顶上。ACC-004 的文档口径由「三枚」更正为「四个入口」。
- **倒计时负数文案修掉**：新增 `gapText()`（`还有 N 天` / `就是今天` / `已经过了 N 天`），看板提醒与复查页 pill 共用；p2 现在显示「已经过了 4 天」。
- **README 加原型截图**：新增「原型截图（20 屏 / 27 张）」一节，按 12 个页面分组，每组一段"这一屏在证明什么"。
  图片放 `docs/screenshots/`（27 张 JPEG，7.1 MB，**入库**），原图 PNG 仍在 `prototypes/_evidence/`（21 MB，不入库，`npm run probe:proto` 可重现）。
  新增 `scripts/sync-screenshots.mjs`（`npm run shots:sync`）：从原图批量压到 1440 宽，macOS 用 `sips`，其它平台用 ImageMagick。
- **文档同步**：`PROTOTYPE-REVIEW.md` / `TASKS.md` / `G2-CONFIRM-SHEET.md` 的原型哈希更新为 `96d176a9…`（本轮改了 `app.js`）。

### 家族结构补齐 + git 首次提交（2026-10-26）

- **`npm run audit` 从 23/30·7 fail → 30/32·0 fail·2 待人工**。补齐项：
  - `lib/version.js`（生成物）：版本四处一致的第三处，由 `npm run build:version` 从 `VERSION` 生成。
  - `lib/layout.js`（面板唯一来源，H15）：`PANEL.customFrame=true`、`businessWidth=0.65`、`AGENT_PANE 0.28–0.45`；
    由构建注入 `lib/client.js` 的 `layout:begin/end` 标记块，客户端注册改用 `layout.customFrame`，不再自带第二份默认值。
  - `test/`：13 条用例——布局区间 4 条、版本一致 3 条、演示数据不变量 6 条（DBIL≤TBIL、ULN 上限可解析、分型四型、可切除性无判定字段、试验无核验日期不得标招募中、硬性条件必须有结构化判据）。
  - 检查链补齐「单测」`node --test test/*.test.mjs` 与「版本一致」`build-version.mjs --check`。
  - `docs/DEV-PLAN.md`：从「怎么排、每步怎么算做完」写到风险与 DoD，含 P4 内部实施顺序（先 labs）。
- **口径校验扩到 11 条**：新增 **M1**（不自创轻/中/重，引用 CTCAE 与 ×ULN 区间）与 **M10**（报告只索引不解读）。
  期间修掉两处误判：整文件扫描替代按函数切片（页面正文多在 helper 里，`vLabs` 切片只有 146 字符）、
  「提示复发」属试验入排条件的标准写法不计违规。
- **git 首次提交**：`3336f46`（`main`），211 个文件、`.git` 9.4 MB；`.gitignore` 已挡住 `node_modules/`、`*.sqlite`、`prototypes/_evidence/`、`.workbuddy/`。
  **未配置远端、未 push。**
- **两条 audit warn 的处置**记入 `docs/DEV-REQUIREMENTS-2026-10-24.md` 第八节：会话归属/常挂载属「确实没有」（T10 未开工），并写明 T10 一开工必须转 pass、不许继续引用该表。

### 折线重做 + G2 第 3 页通过（2026-10-26）

用户原话：「折线需要优化，体现指标点，点击点悬浮可见信息。这个图质量不行。」——截图里折线平滑但没有任何数据点，
鼠标无处可放，界面等于只画了一条"形状"却没提供任何可查的事实。

- **一图秀（CHT-01）**：每个数据点画可见圆点（末点 5.6px、其余 4.2px，白描边），外面再套 13px 透明命中圈，鼠标不用瞄准；
  悬浮 / 键盘 Tab 聚焦 / 点按都弹出气泡，内容是「日期 · 指标名」+「值 单位」+「本单参考上限 21 μmol/L」。
  气泡靠近页面顶部时自动翻到指针下方。
- **末点标签**：从只有数字（`17` / `18` / `152`，看不出是哪条线）改为「短名 + 值」，加引线连回数据点，
  并把堆叠下界从 `CY1 + 2` 收到 `CY1 - 8`——原先最下面那个标签会压住「10月」坐标轴文字。
- **指标卡迷你折线**：补上数据点。点用 HTML 绝对定位（`left/top` 百分比）而不是 SVG `<circle>`，
  因为 `preserveAspectRatio="none"` 会把圆拉成椭圆；点同样带气泡。
- **黄疸页**：柱条气泡补上「本单参考上限」；ACC-009 补 0–10 程度折线（只连同一种症状自己的记录，缺记留白不插值）；
  ACC-011 说明块由常显改成 `<details>` 折叠（文档要求的就是折叠块）。
- **顺带修掉一处"文案说有、图上没有"**：`bilirubinChart` 一直写「虚线来自本单上限」，但图上从来没有这条虚线。
  本次真的画出来，且 `bottom` 用 px 计算——`calc((100% - 10px) * 0.068)` 在 Chrome 里整条声明被丢弃，
  线会掉到柱底（第一次跑出来就是这样）。同时柱条从固定 26px 改为 `flex:1 1 0`（`min 16 / max 48`），
  9 根柱子不再挤在左边留一大片空白。
- **探针加两个用例**：`25-chart-hover.png`、`26-jaundice-hover.png`，并把气泡文本打到 stdout 便于回归比对：
  `27 个数据点 · 「2026-06-16 · CA19-9 / 122 U/mL / 本单参考上限 37 U/mL」`、`9 条柱 · 「2026-10-12 · 总胆红素 / 17 μmol/L / 本单参考上限 21 μmol/L」`。
- **G2 记账**：ACC-009 / ACC-010 / ACC-011 标为通过（2026-10-26），G2 进度 **11/56**。
  原型哈希同步为 `app.js 45a82441…` / `style.css f196859b…` / `index.html e1557e79…`（三份文档 + 确认单）。
- **截图**：29 张（新增 2 张悬浮态），`docs/screenshots/` 7.5 MB；README 的黄疸、一图秀两节各换上新图。

### README 截图清单对齐（2026-10-26）

- **发现两处死账**：README 的「复查与准备」「全局设置」引用的是 `09-care.jpg` / `10-settings.jpg`，
  而这两张是 **10-24 的旧编号**（当时还没有临床试验页，页面序号是 1–10）；探针现在按 11 页产出 `10-care` / `11-settings`。
  两张旧图既没被更新也没被删除，README 因此一直展示过期画面。
- **处理**：删掉 `docs/screenshots/09-care.jpg`、`10-settings.jpg` 与对应原图 `prototypes/_evidence/09-care.png`、`10-settings.png`；
  README 改指 `10-care.jpg` / `11-settings.jpg`。现在目录 27 张与 README 引用 **1:1 对平**。
- **加一道闸**：新增 `scripts/check-readme-shots.mjs`（`npm run check:shots`，已并入 `npm run check`）——
  目录里有、README 没引用 → 报错；README 引用但文件不存在 → 报错。带 `*` 的通配写法当说明文字忽略。
  负向测试：故意放一张没引用的图 + 一条死链，两条都能拦下并给出改法。
- 数量口径同步：README「20 屏 / 27 张」、证据文档「27 张 PNG，22 MB」「JPG 7.2 MB」、确认单与任务表同改。

### 首次装入 DSH Desktop 实测（2026-10-26）

- **包**：`npm pack` 产出 `dist/xyb-community-biliary-tract-workbench-0.1.0.tgz`（3.4 MB），清单只含 `dsh/`、`lib/`、`assets/`、`cordis.patch.yml`、`README.md`、`NOTICE.md`，无 `prototypes/`、无 `docs/`、无演示库。
- **第一次装错了 profile（已还原）**：按 `dsh plugin --profile desktop add -w file:…tgz` 装进了 `~/.dsh/profiles/desktop`。
  该目录名字里带 desktop，但 **DSH Desktop app 不读它**；app 读的是 `~/Library/Application Support/dsh-desktop/harness/profiles/web`。
  已用安装前的 `package.json.bak-biliary-*` 还原该 profile 的依赖与 `bundles`，并删掉误装的 `node_modules/@xyb-community/biliary-tract-workbench`，避免"另一 profile 有意外安装"。
- **正确装法**：在 app 的 profile 里照抄同族 `file:` tgz 的登记方式——`package.json` 的 `dependencies` 与 `dsh.profile.bundles` **两处都加**，
  再用该 profile 自己声明的 pnpm 装（`packageManager: pnpm@10.34.5`，store 为 `~/Library/pnpm/store/v10`）：
  `NODE_OPTIONS= corepack pnpm@10.34.5 install --prefer-offline`，输出 `+1`。
  用全局 `pnpm 9.12.2` 会撞 `ERR_PNPM_UNEXPECTED_STORE`（store v3/v11 与 v10 不互通）。
- **重启后实证（4 条，都可复现）**：
  1. `GET /api/biliary-tract-workbench/health`（带 app 的 auth cookie）→ `{"ok":true,"version":"0.1.0","apiVersion":"v1","capabilities":["health"]}`；
     同一端口随机路径只回裸 `unauthorized`，说明这条路由确实是本包的 handler 在应答。
  2. 应用首页预载清单里出现 `@xyb-community/biliary-tract-workbench/client.js`，客户端模块被组合进宿主。
  3. `harness/desktop-workbenches/state.json` 的 `added` 里有 `xyb-openharness-dsh-plugins/biliary-tract-workbench`（注册键取自 `repository.url`）。
  4. 重启后的 harness 日志里没有本包的任何 error/warn；14:17 那两条 `cannot resolve profile bundle` 出现在装包完成之前，是 HMR 抢跑，不是安装失败。
- **仍未验的**：界面里点开工作台卡片后的真实渲染与业务功能——当前 `lib/client.js` 还是接入骨架（只有标题、版本、连接状态、大字开关），业务页尚未接上 `prototypes/v0.2`。

### README 改为读者视角 + 家族骨架契约（2026-10-26）

- **起因**：README 原本以「疾病概要」开头（定义 / 指南 / 治疗全景 / 趋势），第一次点进来的人读不到「这是什么、谁适合用、能干什么、解决什么痛点」。抽样同族 5 个仓库（liver 122 行 / lung 139 / ovarian 118 / thyroid 102 / bladder 108）**全部**是「疾病概要」或「Git开发快照」开头，属于家族级问题，不是本项目独有。
- **README 重排**：新增首屏六节 —— 这是什么（含"不是"对照表 5 行）、谁适合用（适合/不太适合）、主要功能（10 行表，对上 10 张页截图）、能解决哪些患者痛点（U1–U6 五列表，带「本台不做」与「核实状态」两列）、功能展现（原 27 张图与说明原样保留）、第一版不完美（5 条已知短板 + 需要什么贡献 + PR 最小形态 + 会被拒的 PR + 致谢）。原「疾病概要 / 开发顺序 / 当前能力 / 开发与本地验收 / HTML先行」全部下移，内容不改。
- **新增机制（回答"几十个仓库怎么统一"）**：
  - `docs/32-README-CONTRACT.md`：骨架层 / 项目层 / 资料层三层分工——只统一骨架层，内容仍各写各的；附四步落地（模板进脚手架 → 批量体检 → 按仓库改造 → 闸进发布前提）与可批量投喂的改写提示词。
  - `templates/README-family.md`：六节填空模板，标题文字与顺序固定，节内用 `{{…}}` 占位。
  - `scripts/check-readme.mjs`（`npm run check:readme`，已并入 `npm run check`）：R1 第一个二级标题必须是「这是什么」/ R2 六节顺序与实质字数 / R3 痛点表 ≥5 行 / R4 边界句在前 60 行 / R5 功能展现含真实截图 / R6 首版节有 PR 入口 / R7 资料层建议节。支持 `--json` 批量扫。
- **负向测试**：拿未迁移的 `liver-cancer-workbench` 跑，报 8 处（R1 + R2a–R2f + R4）并逐条给改法；本项目自检 0 fail。
- **未做**：没有改同族其它 4 个仓库的 README，也没有动 `dsh-wb-cli` 脚手架——那一步需要脚手架维护者合并，本文件只提供可直接复制的模板与脚本。
