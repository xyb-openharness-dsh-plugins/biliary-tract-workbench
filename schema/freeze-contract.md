# 冻结合同 · schema/0001_initial.sql

- 草案日期：2026-10-24
- **状态：G3 未签认** —— 本文件只是把「当前这一版的哈希」钉住，便于发现无意的改动。
  它**不是**冻结生效的凭据；签认前允许整体重写 0001，签认后才只能新增迁移。
- 签认方式（G3 通过时必须补齐）：确认人 / 原话 / 日期 / 版本 / 结构变更清单，写进本文件顶部。
  截图不算签认。

| 文件 | sha256 | 内容 |
| --- | --- | --- |
| `schema/0001_initial.sql` | `711ffefc417595255080b34afb146054a05cec47f5014f4c3d0c69120a4f9b43` | 36 张业务表、6 个触发器、24 个索引、17 条 `metric_def` 种子 |

> **哈希已变更三次，都在未签认期内**：`f230c30a…`（26 表初稿）→ `62709f0a…`（+`guideline_ref` / `decision_record` / `decision_metric` / `reading_flag`，`document` 增 3 列）→ `711ffefc…`（2026-10-24 晚）。
> 第三次变更两项：① `jaundice_lab` 增加 `CHECK (direct_bilirubin <= total_bilirubin)`——总胆红素与直接胆红素是两项检查，抄串行必须在库层挡住；
> ② 新增 C 轴 6 张表：`trial` / `trial_criterion` / `trial_site` / `trial_match`（派生快照）/ `trial_saved` / `trial_track_event`。
> 原因：维护者指出「胆红素与总胆红素不可能一样」，并要求补齐临床试验匹配（病理特点 → 逐条对照 → 收藏跟踪）。
> **未签认期允许整体改写 0001；一旦 G3 签认，这里只能追加 `0002_*.sql`。**

## 这份 schema 的五条设计决定（不是随手加的）

### 一、双轴并列，不加总

`jaundice_lab` / `drainage_device` / `drainage_log` / `drainage_observation` 属于 **A 轴（梗阻—黄疸）**；
`tumor_assessment` / `stage_assertion` / `resectability_assertion` / `treatment_event` / `genomic_test` 属于 **B 轴（肿瘤—治疗）**。

两轴**没有任何派生合成列**，读模型也不得生成「综合严重度」。理由：胆道癌患者当下最危险的事情
是胆道感染与引流失败（A 轴），而长期预后看的是可切除性与治疗线序（B 轴）；把两者折算成一个分数，
在任何一次真实就诊里都没有对应物——医生不会问「你的分数是多少」，只会问「管子通不通、黄疸退没退」。

`metric_def.track` 用 `obstruction` / `tumor` / `treatment` / `safety` / `body` 五个值把这条边界写进数据。

### 二、分型单独成表（`subtype_assertion`），不放 `profile`

肝内 vs 肝门部在影像与病理之间经常不一致，患者手里前后两份报告写不同型是常态。
写进 `profile.subtype` 就只剩最后一次，「上次医生说是肝门部，这次怎么成肝内了」没有答案。
版本链 + `ux_subtype_current` 保证同时只有一条 `is_current=1`，历史行由触发器冻结。

术语固定四型 + `unknown`：`icc` / `pcc` / `dcc` / `gbc`。**壶腹癌（ampullary）不在本工作台范围**（M6），
所以枚举里没有它——不是漏写。`unknown` 是允许的真实状态，不强制用户猜。

### 三、基因位点三态，数据库层兜底

`genomic_result.tested` + `CHECK (tested = 1 OR result IS NULL)` + 两个触发器，
保证「没测」不会被写成「阴性」。胆道癌的靶点（FGFR2 融合、IDH1、HER2、BRAF V600E、MSI/dMMR）
直接决定有没有可用药，把「未检测」误记成「阴性」会实实在在地让人放弃一次机会。

### 四、"方案依据"存三样，不存判断（U5 的落点）

`decision_record` 只存：医生说的理由原话、这次讨论参考了哪几个指标（`decision_metric`，指到具体某一天的值）、
以及可选的指南条目（`guideline_ref`）。

**为什么不存一个 `is_appropriate` 或 `guideline_match` 字段**：那正是用户最想问的（"这个方案适不适合我"），
也是工作台最没有资格回答的。存了这个字段，早晚会被一条 SQL 变成一个绿色对勾。

`guideline_ref` 的 `version` 与 `page` 是 **NOT NULL**：缺版本叫"印象"，缺页码叫"听说"。两者都齐才配叫条目（M8）。
实测：插入缺版本 / 缺页码的条目均被 `NOT NULL constraint failed` 挡住。

### 五、报告索引靠 `document` 三列，不另开表

`issued_by`（谁开的）、`summary_line`（结果原文首行）、`feeds_trend`（有没有进趋势）三列加在 `document` 上。
理由：这三件事都是**一份文件本身的属性**，不是独立事实；另开 `report_index` 表会与 `document` 一对一，纯属分裂。
`summary_line` 明确是**原文抄录**，不是改写或总结（M10）。

## 已知未完成（签认前必须处理）

| 项 | 说明 |
| --- | --- |
| 无 `_migration` 登记表 | 演示库尚未建立（`demo/` 为空），哈希只对文件不对库 |
| 无迁移 ledger | 目前只有 0001，第二份迁移出现时必须同时建 ledger |
| `lab_ref` 与 `metric_reading` 重复表达参考区间 | 前者随化验单（H8 的落地），后者给手工单条录入用；阶段 2 原型确认后二选一收敛，**不许两套都写** |
| `drainage_log` 唯一键含 `device_id` | SQLite 中 NULL 不参与唯一约束，未绑定管子的行会重复；阶段 2 前确认是否改为 `COALESCE(device_id,0)` 表达式索引 |
| `reading_flag` 的定位是 (metric, 日期)，不是某一行 ID | 同一个值可能来自 `jaundice_lab` 的列或 `metric_reading` 的行；将来两条路径都写同一 (metric, 日期) 时会产生歧义，需在读模型层定优先级 |
| `guideline_ref` 目前无种子数据 | 未拿到带页码原件前一条都不许插，界面显示「未引入」 |
| 未做性能基线 | 代表数据量与查询延迟未测，不宣称可用 |
