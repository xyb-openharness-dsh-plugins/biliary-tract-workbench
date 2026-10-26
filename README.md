# 小胆宝 · 胆道癌工作台

本机优先的胆道癌（胆囊癌 / 肝内胆管癌 / 肝外胆管癌）分型与可切除性记录、黄疸与胆道引流照护、治疗线序与复查准备工作台

这是接入骨架，业务代码尚未开始：已交付 **HTML 交互原型（20 屏）**，正在按 ACC 号逐条走查（G2）。初始化后先将 [项目设计提示词](docs/DESIGN-PROMPT.md) 交给当前Agent；它应展示实际路径并以已有用户/场景/流程素材对齐设计者、研究与取舍原则。癌种项目另有 [完整专用提示词](prompts/NEW-CANCER-WORKBENCH.md)。需求见 [BRIEF](docs/BRIEF.md)，规格见 [SPEC](docs/SPEC.md)，任务见 [TASKS](docs/TASKS.md)；先读 [AGENTS](AGENTS.md)。CLI输出交接与首问，实际对话由Agent接续。

## 疾病概要

看板右上角的「?」能展开同一份内容（数据源 `prototypes/v0.2/primer-data.js`）。四段只做公开信息的整理，不是对任何一份档案的判断。

### 定义

胆道癌是发生在胆道系统的一组恶性肿瘤的统称。本项目按解剖部位分成四类记录：肝内胆管癌、肝门部胆管癌、远端胆管癌与胆囊癌；同一个「胆道癌」下面，部位不同，手术方式、引流路径与随访安排都不同。肝门部按 Bismuth-Corlette 分型记录（演示档案为 IIIb），这是医生写下的分型原文，本台不改写。项目明确「可切除性判断随影像与黄疸处理动态变化」，工作台只记录谁在什么时候说了可切除 / 不可切除，不自己判断。梗阻—黄疸与肿瘤—治疗两条线并行，刻意不合成一个分数。

**来源**：NCCN · NCCN Guidelines · Biliary Tract Cancers（2.2025，据本项目 docs/SPEC.md 记录）· 未取得原件，据二次来源 · 页码待核 ｜ 本项目 · docs/SPEC.md 与 docs/PROTOTYPE-EVIDENCE.md · 2026-10-24 版 · 项目文档

### 医学资料规范和指南情况

| 机构 | 文件 | 版本 / 年份 | 原件 | 本台的用途 |
|---|---|---|---|---|
| NCCN | NCCN Guidelines · Biliary Tract Cancers | 2.2025（据 docs/SPEC.md，生效日未核实） | 未取得原件 | 病种范围与治疗路径的并列参照；条目级引用待补，页码待核 |
| CSCO | CSCO 胆道系统肿瘤指南 | 版本未核实 | 未取得原件 | 国内可及药物与本土实践差异；本版暂不作引用依据 |
| AJCC | Cancer Staging Manual, 8th ed. | 第 8 版（出版年份未核实） | 未取得原件 | 试验入组条件里的分期口径（演示数据写作「AJCC 第 8 版」）；本台不生成分期 |

- `docs/DEV-REQUIREMENTS-2026-10-24.md` 的 M8 定下规矩：缺少机构、版本、页码任一项，整条不显示，界面写「未引入」。因此本表只说明文件存在与版本记录，不引用具体条文。
- CSCO 的版本号在项目文档里没有记录，本表写「版本未核实」，不按印象补一个年份。

**来源**：见上表逐行。

### 目前治疗全景概要

本项目尚未取得带页码的指南原件，所以这一段列的是「项目档案与试验页里出现过的治疗段落」，不是指南清单的完整枚举，也不是给你排的先后顺序。

- 减黄与胆道引流：PTCD 外引流、ENBD 与胆道支架，项目文档把它们并列为带管生活的三种情形；选哪种由介入或内镜团队决定。
- 手术切除：演示档案写法为「右半肝 + 尾状叶切除 + 肝外胆管切除 + 胆肠吻合」，胆囊癌为「胆囊癌根治术（胆囊床切除 + 肝十二指肠韧带淋巴结清扫）」；切缘与淋巴结按病理原文照抄。
- 术后辅助治疗：演示档案记录为卡培他滨单药、按周期记录；是否做、做几个周期由肿瘤内科决定。
- 晚期 / 不可切除后的系统治疗：按线序记录，每条带开始日期、方案原文与依据三栏；试验库按「分型 × 位点 × 治疗线数」列条件（FGFR2 融合、IDH1 R132、HER2、MSI-H、KRAS 等），只做三态对照，不排优先级。
- 贯穿全程：梗阻—黄疸线与肿瘤—治疗线分开记录；复查按主诊医嘱记录。

> 以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。

**来源**：NCCN · NCCN Guidelines · Biliary Tract Cancers（2.2025，未取得原件，条目级引用待补）· 页码待核 ｜ 本项目 · prototypes/v0.2/demo-data.js 与 docs/SPEC.md · 2026-10-24 · 项目文档

### 发展趋势

只写已发生的事实，每条带日期或版本号。

1. 2025 年：本项目文档记录的 NCCN 胆道癌指南版本为 2.2025（docs/SPEC.md）；原件未取得，生效日期与此前版本的版本号未核实。
2. 截至 2026-10-25：CSCO 胆道系统肿瘤指南在项目文档里只登记了「存在」，版本号与年份未核实。
3. 截至 2026-10-25：本台未对胆道癌的登记平台做专项检索，在研登记数量与阶段分布未整理。
4. 分期体系：项目试验入组条件使用 AJCC 第 8 版；第 7 版何时被取代、是否有更新版本，本台未核实。

**来源**：NCCN · Biliary Tract Cancers（2.2025，据 docs/SPEC.md）· 未取得原件 · 页码待核 ｜ 本项目 · docs/SPEC.md · 2026-10-24 版 · 项目文档

## 开发顺序

先共创SPEC和候选数据关系，再交付HTML交互工作台；由用户确认对应版本/模块后，复核SCHEMA/API并实现生产功能。确认记录见docs/PROTOTYPE-REVIEW.md；模型不依赖前端Tab/流程。模板骨架不是业务已确认。

## 当前能力

- 一个 DSH 工作台注册、认证的健康接口、版本展示与标准/大字切换。
- 已明确选择布局：business-first。business-first 使用 customFrame；模板不创建会话或复制聊天。需要 AI 协助时按官方合同接入原生 conversation 和会话管理。
- **没有业务代码**：`dsh/` 与 `lib/` 仍只有注册骨架，G2 通过前不写业务逻辑。
- **有演示数据，但不是真实患者**：`demo/` 里两套**合成**档案（肝门部 pCC 减黄后手术 / 胆囊癌术后影像复发）与 10 条**合成**试验（注册号 `DEMO-` 前缀），只用于原型走查与库结构验证；`*.sqlite` 不入库，随时可由 `npm run build:demo` 重建。

## 原型截图（20 屏 / 27 张）

当前原型的实机截图（Chrome 145 真实内核，1440×900）；每张都可以点开看原尺寸。原型**不接 DSH、不落库、无 AI**，刷新即重置。逐条走查进度见 [G2 确认表](docs/G2-CONFIRM-SHEET.md)，证据与限制见 [原型证据](docs/PROTOTYPE-EVIDENCE.md)。

三句话先说清这一版在做什么：**只记事实**（值 / 日期 / 谁说的）、**不生成判断**（"现在怎么样"一处都没有）、**两轴并列不加总**（梗阻—黄疸 与 肿瘤—治疗 分开看）。

### 看板
四行事实 + 两条线并列 + 四条提醒（都来自你自己记的日期）。

<img src="docs/screenshots/01-dash.jpg" width="49%"> <img src="docs/screenshots/20-dash-p2.jpg" width="49%">

*左：p1 周慧兰（带 PTCD，A 轴三格有值）；右：p2 郭长林（无引流，A 轴写"无记录"而不是 0）。*

### 分型与可切除性
分型是解剖位置，可切除性是某人在某个日期说的——两件事常被当成一件，所以分开放；被更正的旧结论留痕不删。

<img src="docs/screenshots/02-type.jpg" width="100%">

### 黄疸与梗阻
胆红素柱条不连线（缺测的日子不被填平）；"检查项目说明"整块显示**未引入**，因为库里没有带页码的原件。

<img src="docs/screenshots/03-jaundice.jpg" width="100%">

### 引流照护
管子拆成置入 / 换管 / 拔除三条事件；每日量用柱条；观察项只写体温与当时的处理。

<img src="docs/screenshots/04-drain.jpg" width="49%"> <img src="docs/screenshots/21-drain-p2-empty.jpg" width="49%">

*左：p1 有管；右：p2 没有胆道引流记录——显示一句说明，而不是一张空表。*

### 治疗：线序 / 方案依据 / 检测位点
当前进度（计划 8 / 已完成 4）；方案依据三栏（医生原话 / 当时看的指标带日期与倍数 / 指南条目）；检测位点三态，`KRAS` 显示「未检测」而不是阴性。

<img src="docs/screenshots/05-treat.jpg" width="100%">
<img src="docs/screenshots/sub-treat-1.jpg" width="49%"> <img src="docs/screenshots/sub-treat-2.jpg" width="49%">
<img src="docs/screenshots/sub-treat-3.jpg" width="49%">

### 化验与报告：值 / 报告 / 我不懂的
参考上限只取本单；缺上限显示「需参考上限」且倍数留空；报告只索引原文首行、不解读；打标只转成问题，不给答案。

<img src="docs/screenshots/06-labs.jpg" width="100%">
<img src="docs/screenshots/sub-labs-1.jpg" width="49%"> <img src="docs/screenshots/sub-labs-2.jpg" width="49%">
<img src="docs/screenshots/sub-labs-3.jpg" width="49%">

### 影像
每次影像一段，"谁报的"单列一行；没有原件的那次直接写「报告清单里没有这一天的原件」。

<img src="docs/screenshots/07-imaging.jpg" width="100%">

### 一图秀
三序列归一化折线 + 治疗色带 + 评估竖线；指标卡可翻面看记录清单；同时画的上限 4 条。

<img src="docs/screenshots/08-chart.jpg" width="49%"> <img src="docs/screenshots/22-chart-flip.jpg" width="49%">

### 临床试验：匹配 / 检索 / 收藏与跟踪
8 项病理特点带日期与来源 → 逐条三态对照；符合度 = 符合项 ÷ 已对照项，**未知项按 0 计，所以只会偏低、不会偏高**；硬性不满足单独折叠；**这不是入组资格，也不代表效果**。10 条全为合成数据。

<img src="docs/screenshots/09-trials.jpg" width="49%"> <img src="docs/screenshots/sub-trials-1.jpg" width="49%">
<img src="docs/screenshots/sub-trials-2.jpg" width="49%"> <img src="docs/screenshots/sub-trials-3.jpg" width="49%">
<img src="docs/screenshots/23-trials-saved.jpg" width="49%"> <img src="docs/screenshots/24-trials-track.jpg" width="49%">

*末两张：收藏后的状态与外部变化时间线。*

### 复查与准备
"还有多少天"只是日期减法；问题清单里已答复的照原话记；导出页固定声明"不是医疗结论"。

<img src="docs/screenshots/09-care.jpg" width="100%">

### 全局设置
资料目录、三档字号、演示数据开关（与真实档案物理隔离，关掉不删东西）。

<img src="docs/screenshots/10-settings.jpg" width="100%">

> 截图源文件在 `prototypes/_evidence/*.png`（27 张，可用 `npm run probe:proto` 重跑重现，不入库）；README 用的是压缩副本 `docs/screenshots/*.jpg`（1440 宽、7.1 MB）。


## 开发与本地验收

需要 Node.js 22+、Git、包管理器和可用 DSH Desktop；采用 SQLite 时另核验 node:sqlite 版本条件。宿主 peers 的范围仅是模板基线，请与目标 Desktop 实际依赖核对。

```bash
npm install
npm run check
npm run pack:check
npm pack
```

`npm run check` 只保证"能装"（语法 + 装包合同），第一天就该是绿的。`npm run audit` 管"还是不是家族里的一员"：版本三处一致、`lib/layout.js` 面板参数单一来源、检查链完整、文档与密钥卫生，**只看代码与文件，不看文档自述**。新项目刚生成时 audit 必然有 fail，那是待办清单；交付/发布前必须清零，存在 fail 不得发布（`npm run release:check` 一次跑完两者）。

跑的时间点：**每次改完**跑 `check`；**G2 原型确认后、写业务代码前**先跑一次 `audit`（这时缺的多是 `lib/layout.js`、`VERSION` 这类结构，越早补越便宜）；**交付/装机前**必须跑 `release:check`；**发布或投稿前**把 `npm run audit --json` 的 `xx/xx 通过 · N 失败 · M 待人工` 抄进 `docs/RELEASE.md` 的「家族一致性」一行。`✗` 是结构缺口（补齐，或在 `docs/DEV-REQUIREMENTS-<日期>.md` 写明偏离理由并由用户确认），`!` 是需人工判断的项（逐条给「已人工确认 / 确实没有」）。

`npm install` 可能按 npm 策略解析 peer；勿为消警告重复打包宿主 runtime。客户端本身是单文件；引入 TS/组件库后需添加构建步骤并保留单文件导出。

本地安装入口以当前 Desktop/CLI 帮助为准。安装后按 [docs/06-VALIDATION-AND-RELEASE.md](docs/06-VALIDATION-AND-RELEASE.md) 与官方自测完成真实 UI 验收，并填写 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。静态检查不代表已加载。

Logo 来源与使用限制见 assets/README.md。许可证、作者、仓库/发布策略由本项目维护者确认后填写；模板默认为 private/UNLICENSED。

感谢小x宝社区、DataElement 社区，以及 sam / hhx / 繁华的 ❤️ 贡献。

初始化来源记录见 `.dsh-wb-starter.json`。更新社区脚手架不会覆盖本项目；需要升级时先用相同确认配置在临时目录生成，再审阅差异。CLI 用法见 [docs/CLI-GIT.md](docs/CLI-GIT.md)。

## HTML先行与数据演进

业务开发前先交付HTML交互工作台原型、实际预览并由用户确认版本/hash和范围。数据设计先区分领域事实、流程状态和页面读模型，走查前端/流程变化、兼容与迁移；原型对象不直接作为表。见[规范](docs/14-HTML-AND-DATA-CONTRACT.md)。
