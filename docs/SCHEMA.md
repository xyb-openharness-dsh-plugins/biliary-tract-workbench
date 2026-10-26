# 数据主体—关系—表

状态：**草案（2026-10-24）**，对应 `schema/0001_initial.sql`（36 表 / 6 触发器 / 24 索引），G3 未签认。
哈希见 `schema/freeze-contract.md`；结构设计的三个理由也写在那里，此处不重复论证。

## 实体

| 实体 | 稳定 ID | 主体/外键 | 核心字段/类型 | 约束/索引 | 来源/确认 | 生命周期 |
| --- | --- | --- | --- | --- | --- | --- |
| `profile` | 文本 ID | — | 姓名/缩写/年龄/性别/标签 | `is_demo`、`is_archived` | 用户录入 | 长期；归档不删除 |
| `subtype_assertion` | 行 ID | profile | `subtype`（icc/pcc/dcc/gbc/unknown）、`stated_by/on`、`basis` | `ux_subtype_current`（每人一条 current）+ 冻结触发器 | 医生原话 | 版本链，只增不改 |
| `jaundice_lab` | 行 ID | profile | 胆红素/ALP/GGT/ALT/AST/白蛋白/CA19-9/CEA/WBC/CRP、`result_state` | 索引 `(profile_id, measured_on)`；`CHECK(direct_bilirubin <= total_bilirubin)`（M12） | 化验单 / 手录 | 追加 |
| `lab_ref` | 行 ID | jaundice_lab + metric_id | `ref_low`、`ref_high`、`needs_uln` | `UNIQUE(lab_id, metric_id)` | 化验单自带区间 | 随化验单 |
| `drainage_device` | 行 ID | profile | `kind`（ptcd/enbd/支架/内外/手术）、`side`、`inserted_on`、`event`、`exchanges_id` | 自引用 | 出院记录 / 用户 | 事件式追加 |
| `drainage_log` | 行 ID | profile + device | `volume_ml`、`color`、`patency`、`dressing` | `UNIQUE(profile, device, recorded_on)`（NULL 见冻结合同未完成项） | 用户每日录入 | 追加 |
| `drainage_observation` | 行 ID | profile + device | 观察词（fever/chills/pain/leak…）、`value_text`、`action_taken` | 索引 `(profile, observed_on)` | 用户 | 追加；**不含判断** |
| `tumor_assessment` | 行 ID | profile | 影像方式、病灶数、最大径、淋巴/远处转移、血管与胆管受侵原文、腹水 | 索引 `(profile, assessed_on)` | 报告原文 | 追加 |
| `tumor_lesion` | 行 ID | assessment | 段位、大小、备注 | `UNIQUE(assessment_id, seq)` | 报告原文 | 随评估 |
| `stage_assertion` | 行 ID | profile | `system`（AJCC8/other）、`stage`、`stated_by/on` | 同 subtype 的 current 唯一 + 冻结 | 医生原话 | 版本链 |
| `resectability_assertion` | 行 ID | profile | `conclusion`（resectable/borderline/unresectable/unknown）、`context`（initial/post_drainage/post_treatment/preop） | current 唯一 + 冻结 | 医生原话 | 版本链 |
| `treatment_event` | 行 ID | profile | `modality`、`intent`、`line_no`、`regimen`、周期数、`response`、`stop_reason` | 索引 `(profile, started_on)` | 医嘱 / 出院小结 | 追加；换线新增行 |
| `decision_record` | 行 ID | profile(+visit) | `discussed_on`、`doctor_reason`（原话）、`stated_by`、`source`（谁记的）、`guideline_id` | 索引 `(profile, discussed_on)` | 一次方案讨论 | 追加；不合并成"共识" |
| `decision_metric` | 行 ID | decision + metric | 这次讨论参考的指标 + `measured_on` | `UNIQUE(decision, metric, measured_on)` | 从已记录指标勾选 | 随依据记录 |
| `guideline_ref` | 行 ID | — | `org`、`title`、**`version`（NOT NULL）**、**`page`（NOT NULL）**、`rhythm`、`parallel_notes`、`checked_by` | 缺版本或页码即插不进（M8） | 指南原件 | 稳定 |
| `genomic_test` / `genomic_result` | 行 ID | profile / test | 基因、变异、`tested`、`result`、`value_text`、`raw_text` | `CHECK(tested=1 OR result IS NULL)` + 2 触发器 | 病理/分子报告 | 追加 |
| `safety_event` | 行 ID | profile(+tx/device) | `kind`、起止日、医生给的 `grade` 原文 | 索引 `(profile, onset_on)` | 医生记录 | 追加 |
| `symptom_record` / `body_record` | 行 ID | profile | 症状与 0–10 程度 / 体重与食欲 | 索引 | 用户 | 追加 |
| `viewpoint` | 行 ID | profile | 话题、正文、`source` | `is_conclusion` 恒 0 + 触发器 | 用户/照护者 | 追加；**不进趋势** |
| `document` | 行 ID | profile | 标题、类别、日期、**`issued_by`（谁开的）/ `summary_line`（结果原文首行）/ `feeds_trend`（是否进趋势）**、`file_sha256`、`status` | `UNIQUE(profile, sha256)` | 原始文件 | 四层之一 |
| `candidate` | 行 ID | document | 字段、值、单位、页码、置信度、`source_line` | 索引 `(document, field)` | 解析产出 | 待确认 → 接受/拒绝 |
| `trial` | 文本 ID | — | `registry_id`、`status`、`scope`、`subtypes`、`biomarker_gene/alt`、`requires_biopsy`、`placebo`、`verified_on`、`deadline` | 索引 `(status, scope)`；无 `verified_on` 时界面只能显示「未核验」（M13） | 注册平台 / 中心公告 | 外部事实快照，按核验更新 |
| `trial_criterion` | 行 ID | trial | `kind`（include/exclude）、`category`、原文 `text`、结构化 `field/op/value`、`hard` | `UNIQUE(trial_id, seq)`；`field` 空 = 无法自动判断 | 注册条目原文 | 随方案版本 |
| `trial_site` | 行 ID | trial | 城市、医院、联系人、状态、`updated_on` | 索引随 trial | 注册平台 | 按更新覆盖 |
| `trial_match` | 行 ID | profile + trial | `engine_version`、`fit_band`、`fit_pct`、met/unmet/unknown 计数、`criteria_snapshot`、`profile_snapshot` | 唯一键含 `computed_at`；**派生快照，不写回患者事实** | 计算产出 | 可回放，按需重算 |
| `trial_saved` | 复合主键 | profile + trial | `saved_on`、`state`（watching/asking/archived）、`note` | `PRIMARY KEY(profile_id, trial_id)` | 用户操作 | 可改状态，不删除历史 |
| `trial_track_event` | 行 ID | trial | `on_date`、`kind`、`text`、`from_value/to_value`、`source` | 索引 `(trial_id, on_date)` | 注册平台 / 中心 | 追加 |
| `metric_def` / `metric_reading` | 文本 ID / 行 ID | — / profile | 指标定义；读数含 `ref_low/ref_high/needs_uln/result_state` | 索引 `(profile, metric, measured_on)` | 字典 / 录入 | 定义稳定，读数追加 |
| `reading_flag` | 行 ID | profile + metric | `measured_on`、`kind`（unclear/unit_question/value_question）、`note`（用户原话） | `UNIQUE(profile, metric, measured_on, kind)` | 用户打标 | 可撤销 |
| `visit` / `question` / `task` | 行 ID | profile / visit | 复诊日期与小结、问题正文与答复、任务与到期 | `planned` 区分计划与已发生 | 用户 | 追加 |
| `workspace` | 单行 | — | 资料目录、云端同意位、token 掩码 | `CHECK(id=1)` | 设置页 | 单行更新 |

**实体图（文字版）**

```
profile ─┬─ subtype_assertion*      （版本链，current 唯一）
         ├─ jaundice_lab* ─ lab_ref*
         ├─ drainage_device* ─┬─ drainage_log*
         │                    └─ drainage_observation*
         ├─ tumor_assessment* ─ tumor_lesion*
         ├─ stage_assertion* / resectability_assertion*   （版本链）
         ├─ treatment_event* ── safety_event*
         ├─ decision_record* ── decision_metric* / guideline_ref?
         ├─ genomic_test* ── genomic_result*
         ├─ document* ── candidate*
         ├─ metric_reading* ── reading_flag*
         └─ visit* ── question* / task*
```

**扩展策略**：新增指标 → 加 `metric_def` 行（定义目录），不算结构迁移；新增事实类型 → 新表或新列（只能新增 `0002_*.sql`）；
**核心关系一律外键 + 约束，不塞 JSON**。`note` 只放自由文本，不放任何需要查询的字段。

## 四条数据契约在本模型里的落点

| 契约 | 落点 |
| --- | --- |
| 看法恒不为结论 | `viewpoint.is_conclusion` 只有 0，触发器挡 UPDATE |
| 四点位缺健侧不生成差值 | 本癌种无左右健侧配对指标（引流 `side` 是装置属性，不是健患对照）；将来若加，NULL≠0 的规则同样适用 |
| 更正只新增版本 | `subtype_assertion` / `stage_assertion` / `resectability_assertion` 三张版本链表 + `trg_*_no_update` |
| 事实四层不合并 | `document` / `candidate` / `metric_reading` / 领域事实表各自独立；`candidate` 只能转成 `metric_reading` 或丢弃，不能直接改事实表 |

## 持久化与记忆选型

- **等级 A（本机 SQLite，单文件，无云端）**。理由：单人单机、隐私强、离线可用、迁移成本低。备选（云端同步、浏览器 IndexedDB）的拒绝理由见 SPEC ADR A1。
- 规模预估：一人一年约 3–5 千行读数级，全库 < 50 MB。常用查询是「某指标按时间排序」「某区间内的引流记录」，均走 `(profile_id, measured_on)` 索引。
- 并发写入者：只有一个（宿主插件进程），不需要 WAL 调优；但打开时必须 `PRAGMA foreign_keys = ON`。
- 数据根：用户选定目录（`workspace.root_path`），库文件在根下，**不默认写死**。

| 数据类别 | 权威位置/格式 | 读写责任 | 来源/revision | 索引/失效/保留规则 |
| --- | --- | --- | --- | --- |
| 已确认业务事实 | SQLite 业务表 | 插件进程写，页面只读 | 用户录入 / 医生原话 | 永久保留，归档不删 |
| 文件与产物 | 用户资料目录下的原文件 | 用户放入，插件只登记 sha256 | `document.file_sha256` | 文件被移动则标记缺失，不自动删记录 |
| 偏好/摘要 | `workspace` 单行 + 前端 localStorage（字号档位） | 设置页 | 用户显式设置 | 可重建 |
| 可重建缓存 | 无 | — | — | 本版不做派生缓存，避免双真相 |

## 前端与业务流程变化矩阵

| 变化情境 | 不变的事实/关系 | 配置/投影/API 变化 | 迁移/旧记录读取与恢复 | 验收证据 |
| --- | --- | --- | --- | --- |
| 改导航/布局、同一事实多视图 | 全部业务表 | 只改读模型与页面 | 无需迁移 | 阶段 2 原型实测 |
| 新字段/新指标 | 已有列与约束 | `metric_def` 加行，或新增 `0002_*.sql` | 旧库执行新迁移即可 | 迁移后跑 `check-schema` |
| 流程插入/跳过/重开 | 事实表不变 | 前端状态机 | 不做数据迁移 | 待设计 |
| 来源更正/删除 | 版本链只增不改 | 读模型取 `is_current=1` | 旧 current 置 0，新增一行 | 触发器已覆盖 |
| 旧数据库/旧 API 客户端升级 | 表结构只增不改 | API 加字段不改语义 | 新列为 NULL 可读 | 待做 fixture |

## UI/流程变化的承受能力

- **页面拆合/移位**：不动表。九页分列是读模型的组织方式，不是存储结构。
- **新增普通指标**：`metric_def` 加一行 + 读数表追加，页面自动出现（一图秀按 `track` 分组）。
- **来源更正**：三张断言表走版本链；读数表走「新增一条并注明更正」，不 UPDATE 数值。
- **候选 → 接受**：`candidate.status` 变化 + 生成 `metric_reading`，两步在一个事务里。
- **未知字段/枚举**：`unknown` 是合法值（分型、结果、肝外转移都有），**不靠 NULL 表达不确定**。
- **隐私派生与快照失效**：本版无云端派生，无快照。

**性能证据**：未测。代表数据量与查询延迟在阶段 2 建演示库后补，**当前不宣称可用**。

确认人 / 日期：**待补（G3 未签）**。未决项见 `schema/freeze-contract.md` §已知未完成。
