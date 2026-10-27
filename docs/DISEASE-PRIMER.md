# 疾病概要 · 胆道癌

> 本项目实例文件，由 `xyb-workbench-starter` 的 `templates/DISEASE-PRIMER.md` 复制而来。
> 规范：starter 仓 `docs/36-DISEASE-PRIMER.md`（v2，§2.5 指南链接 / §2.6 看板状态卡）。四段固定、顺序不变，缺段不合格。

- 项目 / 品牌：小胆宝 BiliPal
- 病种：胆道癌（Biliary Tract Cancer，BTC）
- 最后更新：2026-10-27（36 号 v2：指南可点链接 + 看板状态卡）
- 数据文件：`prototypes/v0.2/primer-data.js`（`window.DISEASE_PRIMER`）
- README 对应段：`## 疾病概要`
- 实现：`prototypes/v0.2/primer.js` + `primer.css`（starter `assets/patterns/` 最新版，含 §2.5 链接渲染；逻辑未改）
- 状态卡：`prototypes/v0.2/app.js` 的 `stageCard()`（§2.6 四件），样式在 `style.css` 的 `.stagecard`
- 探针：`node scripts/probe-disease-primer.mjs --port 8131 --url http://127.0.0.1:8131/prototypes/v0.2/index.html` → 9/9 PASS（`--self-test` 注入缺陷后 3 条 FAIL）

## 0 原件状态（本项目的前提）

NCCN / CSCO / AJCC 的**原件均未取得**：NCCN 官网 PDF 要登录，CSCO 与 AJCC 是纸书与图书。

36 号 §2.5（2026-10-27）要求「是否取得原件」这一列不许只写文字，所以每一行都给了一个**逐条 curl 验证过 200 的出版方页面**：

| 文件 | 二次来源链接 | 2026-10-27 查到的事实 |
|---|---|---|
| NCCN · Biliary Tract Cancers | `https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml`（JNCCN 23(9): p403 刊出版） | 刊出版标题写明 Version 2.2025；NCCN 官网详情页现列 Version 2.2026 |
| CSCO · 胆道恶性肿瘤诊疗指南 | `https://www.pmphmall.com/gdsdetail/653359-331956`（人民卫生出版社商城页） | 2024 版，2024-08，ISBN 978-7-117-36675-5 |
| AJCC · Cancer Staging Manual 8th ed. | `https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/` | 官网分期体系页；另公告 Version 9 协议发布，并给「8th Edition 或 Version 9」按病种对照表 |

两条口径不变：项目内文件（`docs/*.md`、`demo-data.js`）没有对外链接，在数据里标 `nolink: true` + note 说明，不硬凑 URL；
页码仍然一个都没有，一律写「页码 待核」。

项目自身的规矩更严：`docs/DEV-REQUIREMENTS-2026-10-24.md` M8 要求指南条目必须「机构 + 版本 + 页码」三样齐全，
缺任一项整条不显示、界面写「未引入」。疾病概要因此只写文件存在与版本，不引用任何具体条文。

## 1 定义（`definition`）

胆道癌是发生在胆道系统的一组恶性肿瘤的统称。本项目按解剖部位分成四类记录：肝内胆管癌、肝门部胆管癌、
远端胆管癌与胆囊癌；部位不同，手术方式、引流路径与随访安排都不同。

- 分型：肝门部按 Bismuth-Corlette 记录（演示档案为 IIIb），医生写什么就记什么。
- 可切除性：项目明确「随影像与黄疸处理动态变化」；工作台只记录「谁在什么时候说了可切除 / 不可切除」，不自己判断。
- 两条线：梗阻—黄疸（总胆红素、直接胆红素、ALP、GGT、PTCD / ENBD）与肿瘤—治疗（线序、肝功、标志物），不合成一个分数。
- 分子：档案记录病理类型、分化与基因位点（FGFR2 融合、IDH1 R132、HER2、MSI-H、KRAS 等），未检测的写「未检测」而不是阴性。

**来源**：NCCN · NCCN Guidelines · Biliary Tract Cancers（2.2025，据本项目 docs/SPEC.md 记录）· 未取得原件，据二次来源 · 页码待核 ｜ 本项目 · docs/SPEC.md 与 docs/PROTOTYPE-EVIDENCE.md · 2026-10-24 版 · 项目文档

## 2 医学资料规范和指南情况（`evidence`）

| 机构 | 文件 | 版本 / 年份 | 原件（可点） | 本台的用途 |
|---|---|---|---|---|
| NCCN | [NCCN Guidelines · Biliary Tract Cancers](https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1517) | 2.2025（据 docs/SPEC.md）；官网详情页 2026-10-27 列 2.2026 | [未取得原件，据 JNCCN 刊出版](https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml) | 病种范围与治疗路径的并列参照；条目级引用待补，页码待核 |
| CSCO | [CSCO 胆道恶性肿瘤诊疗指南 2024](https://www.pmphmall.com/gdsdetail/653359-331956) | 2024 版（出版方商城页：2024-08，ISBN 978-7-117-36675-5） | [未取得原件，据出版方商城页](https://www.pmphmall.com/gdsdetail/653359-331956) | 国内可及药物与本土实践差异；本版暂不作引用依据 |
| AJCC | [AJCC Cancer Staging Manual, 8th ed.](https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/) | 第 8 版（Springer，版权页记 2017） | [未取得原件，据 AJCC 官网](https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/) | 试验入组条件里的分期口径（演示数据写作「AJCC 第 8 版」）；本台不生成分期 |

- 一台一表，不合并；未取得原件的必须标出来，且这一列**必须带链接**（36 号 §2.5）。
- 本项目 M8：缺机构、版本、页码任一项，整条不显示（界面写「未引入」）。
- CSCO 版本号原先没有记录。2026-10-27 补查人民卫生出版社商城页，登记为 2024 版；原件与页码仍缺。
- NCCN 这一行要留意版本差：文档登记 2.2025，官网详情页 2026-10-27 是 2.2026，哪天换的版未核实——不替它编一个生效日期。

**来源**：见上表逐行。

## 3 目前治疗全景概要（`landscape`）

本项目尚未取得带页码的指南原件，因此本段列的是「项目档案与试验页里出现过的治疗段落」，
不是指南清单的完整枚举，也不排序、不比优劣、不含剂量与疗程。

### 3.1 减黄与胆道引流（先解决梗阻）
- PTCD 外引流、ENBD、胆道支架：项目文档并列为带管生活的三种情形；选哪种由介入或内镜团队决定。

### 3.2 手术切除
- 根治性切除：演示档案写法为「右半肝 + 尾状叶切除 + 肝外胆管切除 + 胆肠吻合」；胆囊癌为「胆囊癌根治术（胆囊床切除 + 肝十二指肠韧带淋巴结清扫）」。
- 切缘与淋巴结：按病理报告原文照抄（R0 / R1、淋巴结 x/y 阳性），不改写、不解读。

### 3.3 术后辅助治疗
- 辅助化疗：演示档案记录为卡培他滨单药，按周期记录；是否做、做几个周期由肿瘤内科决定。

### 3.4 晚期 / 不可切除后的系统治疗
- 按线序记录，每条带开始日期、方案原文与依据三栏（医生原话 / 当时看的指标 / 指南条目）。
- 试验库按「分型 × 位点 × 治疗线数」列条件，涉及 FGFR2 融合、IDH1 R132、HER2、MSI-H、KRAS；只做三态对照（符合 / 不符合 / 待确认），不排优先级。

### 3.5 贯穿全程
- 两条线分开记，不合成总分；复查只记「约在哪天、做了没有」。

**固定出口（原话照抄）**：

> 以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。

**来源**：NCCN · NCCN Guidelines · Biliary Tract Cancers（2.2025，未取得原件，条目级引用待补）· 页码待核 ｜ 本项目 · prototypes/v0.2/demo-data.js 与 docs/SPEC.md · 2026-10-24 · 项目文档

## 4 发展趋势（`trend`）

只写已发生的事实，每条带日期或版本号。

1. 2025 年：本项目文档记录的 NCCN 胆道癌指南版本为 2.2025（docs/SPEC.md），同年 JNCCN 23 卷 9 期以该版本号刊出（p403，DOI 10.6004/jnccn.2025.0042）。
2. 2026-10-27：NCCN 官网指南详情页所列版本为 Version 2.2026；从 2.2025 到 2.2026 的生效日期，本台未核实。
3. 2024-08：CSCO 胆道恶性肿瘤诊疗指南 2024 由人民卫生出版社出版（ISBN 978-7-117-36675-5）；未取得原件，页码待核。
4. 分期体系：AJCC 官网公告 Version 9 分期协议发布，并给出「8th Edition 或 Version 9」的按病种对照表；胆道癌适用哪一版，本台未逐病种核对。
5. 截至 2026-10-27：本台未对胆道癌的登记平台做专项检索，在研登记数量与阶段分布未整理。

**来源**：NCCN · Biliary Tract Cancers（2.2025 → 2.2026，据官网详情页）· [未取得原件，据 JNCCN 刊出版](https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml) · 页码待核 ｜ 本项目 · docs/SPEC.md · 2026-10-24 版 · 项目文档

## 4.5 看板状态卡（36 号 §2.6，2026-10-27 补）

`dash` 第一张卡就是疾病概要的触发器，四件缺一不合格：

1. **卡头**：`D+122 术后状态卡 · 距辅助化疗第 5 周期前复查`（eyebrow 小字）；
2. **大字天数**：`第 122 天`，34px、品牌色，由**手术日**（本台锚点，D0 = 根治性切除那天）与「今天」做日期减法派生，不手填；
3. **现状行**：当前阶段原文（`1 线 · 卡培他滨单药`）+ 状态（`进行中 · 已完成 4 / 8 周期`）+ `下次：2026-12-15（辅助化疗第 5 周期前复查）· 还有 52 天`；
4. **出口按钮排**：主按钮「看治疗线序 →」进当前阶段核心页；副按钮「疾病概要：胆道癌是什么？」开浮窗。

- 没有手术记录时整卡显示「待初始化」并指向三步向导，不替用户猜一个起点（实测：删掉 resection 记录后仍渲染出这张卡）。
- 下次门诊由状态卡承担后，提醒位不再重复同一句日期——同一屏说两遍会让人以为是两件事；提醒位只剩管子天数、未答问题、打标三条。


## 5 落地清单

- [x] `prototypes/v0.2/primer.css`（starter 最新版原样复制，含 `.dp-link` / `.dp-miss`）
- [x] `prototypes/v0.2/primer.js`（starter 最新版原样复制，含 `safeHref` 与表格单元格 `{text, url}`，逻辑未改）
- [x] `prototypes/v0.2/primer-data.js`（四段数据；指南表与各段来源均带 `url` / `secondaryUrl`）
- [x] `index.html` 三处引用（style.css 后 / demo-data.js 与 app.js 之间）
- [x] 顶栏「?」改为手写按钮（`data-primer-open`）：模块自动插入的时机在 `app.js` 渲染之前，接管不到已有顶栏，改为显式声明
- [x] `app.js` 新增 `stageCard()`（§2.6 四件）+ `style.css` 的 `.stagecard`
- [x] README 的 `## 疾病概要` 四段正文，小标题与数据文件一致
- [x] `node scripts/probe-disease-primer.mjs --port 8131 --url …/prototypes/v0.2/index.html` → 9/9 PASS；`--self-test` → 3 FAIL（闸门会报红）
- [x] `node scripts/check-conformance.mjs .` 的 `primer/*` 四条 0 fail 0 warn

## 6 验收（P1–P8）

| 编号 | 判据 | 结果 |
|---|---|---|
| P1 | 顶栏有可点「?」，aria-label 说明四段 | ✅ 手写按钮（2026-10-27 起） |
| P2 | 整页面板，四段顺序 定义 → 指南 → 治疗全景 → 趋势 | ✅ |
| P3 | 面板宽高 ≥ 视口 90% | ✅ |
| P4 | 打开压一条 history，`history.back()` 收起 | ✅ |
| P5 | 「返回」「关闭」两个独立入口 | ✅ |
| P6 | 关闭后焦点回触发按钮、滚动位置不变 | ✅ |
| P7 | Esc 只退一层 | ✅ |
| P8 | 四段齐全、每段有来源、趋势段无禁止词 | ✅ |

## 7 本项目教训

- **本项目不能写「指南列举了……」，因为指南条目没引入**。项目自己有一条 M8：缺版本或页码就不显示。
  所以治疗全景段的每个手段后面都标了来源是「演示档案 / 试验页里出现过的」，段首写明「不是指南清单的完整枚举」。
  这一句不是免责套话，是防止读者把项目演示数据当成指南条目。
- **CSCO 版本号查不到就写查不到，但要去查一次再下这个结论**：docs/SPEC.md 只写「CSCO 胆道系统肿瘤指南」，没有年份。
  2026-10-27 补查出版方商城页，拿到 2024 版 / 2024-08 / ISBN，才把「版本未核实」改掉——改的是事实，不是印象。
  这里最容易顺手写成「2025 版」，因为 NCCN 是 2.2025，对齐一下就「看起来一致」——这正是要防的「凭印象填」。
- **链接必须点开验，不能凭搜索结果写**：NCCN 官网 PDF 直链 `…/pdf/btc.pdf` 会 302 到登录页，
  Springer 的书页当前 404，`cancerstaging.org` 证书域名对不上。这三个都是「看起来很对」但打不开的地址，
  真正能点开的是 JNCCN 刊出版、人卫社商城页、facs.org 分期体系页。逐条 `curl -w '%{http_code}'` 之后才写进数据。
- **胆道癌的「治疗」不止药**：减黄与引流（PTCD / ENBD / 支架）是这个病种患者最日常的一段，
  不能只列手术与化疗。但引流又容易写成护理建议（「引流量下降要警惕堵管」），
  这一段只写「是三种带管情形之一」，处置留给引流团队。
