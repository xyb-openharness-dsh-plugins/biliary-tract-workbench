# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

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
