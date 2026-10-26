-- 小胆宝 BiliPal · 胆道癌工作台业务库初始结构
-- 版本：v0.1.0（阶段 1 数据模型草案，**G3 未签认**；签认前不得用于生产）
-- 规模：30 张表 / 6 个触发器 / 22 个索引 / 17 条 metric_def 种子
--
-- 设计主脊：**双轴并列，永不加总**
--   A 轴「梗阻—黄疸」：胆红素 / 胆道引流（PTCD·ENBD·支架）/ 胆管炎观察
--   B 轴「肿瘤—治疗」：可切除性 / 肿瘤负荷 / 治疗线序 / 基因位点 / **方案依据**
--   两轴不互相折算，不合成单一「严重度分数」。这是本癌种与肝癌（肝功能×肿瘤负荷）
--   最根本的结构差异：胆道癌患者的日常风险主要来自**梗阻**，而不是肝储备。
--
-- 约定（与家族一致，逐条有前因）：
--   1. 本文件执行后冻结，改结构只能新增 0002_*.sql，不改 0001。
--   2. 缺测一律 NULL，不用 0 / '' 顶替；「未检测」由 result_state / tested 表达（M2）。
--   3. 分类变量（分型、AJCC 分期、可切除性、CTCAE 分级）只存原值，不做数值趋势。
--   4. 医生结论（分型、分期、可切除性）只新增版本，不覆盖旧值（见 no_rewrite 触发器）。
--   5. 事实四层不合并：document / candidate / record / metric 各自独立。
--   6. 看法恒不为结论：viewpoint 无 is_conclusion，不进趋势、不进摘要事实区。
--   7. 复合主键表在读取层必须 ORDER BY rowid，不依赖隐式顺序。
--   8. CA19-9 **不做 CTCAE 分级**（M3：CTCAE 无此条目，硬套等于编造），只存原值。
--   9. 黄疸与引流异常只记**观察项与用户原话**，不写「紧急 / 危险 / 立即就医」判断（M4）。
--  10. ×ULN 型指标必须用本化验单自带 ref_high；缺失则 needs_uln=1，**绝不借成人通用上限**（M1）。
--  11. **现状卡只填事实**：库里不存"稳定/好转/进展"这类字段，也不存任何聚合的严重度（M9）。
--  12. **指南条目必须同时有版本与页码**（NOT NULL）：缺一个就不是条目，是印象（M8）。

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- 工作区（单行）
-- ---------------------------------------------------------------------------
CREATE TABLE workspace (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  root_path      TEXT,                                    -- 资料目录绝对路径；未选为 NULL
  consent_mineru INTEGER NOT NULL DEFAULT 0 CHECK (consent_mineru IN (0, 1)),
  token_masked   TEXT,                                    -- 只存掩码，不存明文
  token_source   TEXT CHECK (token_source IS NULL OR token_source IN ('file','env','bundled','none')),
  backup_at      TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- 档案
-- 分型（subtype）**不放这里**：见 subtype_assertion —— 分型本身会被更正。
-- ---------------------------------------------------------------------------
CREATE TABLE profile (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  initial     TEXT NOT NULL,
  age         INTEGER CHECK (age IS NULL OR (age >= 0 AND age <= 130)),
  sex         TEXT CHECK (sex IS NULL OR sex IN ('F','M','X')),
  tag         TEXT,
  is_demo     INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at  TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- 分型断言（版本链）
-- 为什么单独一张表：肝内 vs 肝门部在影像与病理之间**经常打架**，患者手里
-- 前后两份报告写不同型是常态（H1）。若把 subtype 写进 profile 就只剩最后一次，
-- 用户问「上次医生说的是肝门部，这次怎么成肝内了」时没有答案。
-- 术语只用四型 + unknown，**壶腹癌不在本工作台范围**（M6）。
-- ---------------------------------------------------------------------------
CREATE TABLE subtype_assertion (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  subtype       TEXT NOT NULL CHECK (subtype IN (
                  'icc',        -- 肝内胆管癌 intrahepatic cholangiocarcinoma
                  'pcc',        -- 肝门部胆管癌 perihilar cholangiocarcinoma
                  'dcc',        -- 远端胆管癌 distal cholangiocarcinoma
                  'gbc',        -- 胆囊癌 gallbladder cancer
                  'unknown')),  -- 未明确：允许，不强制用户猜
  stated_by     TEXT,                                     -- 医生 / 机构，原样
  stated_on     TEXT,
  basis         TEXT,                                     -- 依据原文要点（影像描述 / 病理号）
  supersedes_id INTEGER REFERENCES subtype_assertion(id),
  is_current    INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0, 1)),
  created_at    TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_subtype_current ON subtype_assertion(profile_id) WHERE is_current = 1;
CREATE INDEX ix_subtype_profile ON subtype_assertion(profile_id, stated_on);

-- ---------------------------------------------------------------------------
-- A 轴 · 梗阻与黄疸（化验原值）
-- 全部字段可 NULL：一张化验单常常只做了肝功没做肿瘤标志物，反之亦然。
-- result_state 表达「这次到底做没做」，不要用 NULL 冒充「做了但正常」。
-- ---------------------------------------------------------------------------
CREATE TABLE jaundice_lab (
  id                 INTEGER PRIMARY KEY,
  profile_id         TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  measured_on        TEXT NOT NULL,
  total_bilirubin    REAL CHECK (total_bilirubin IS NULL OR total_bilirubin >= 0),   -- μmol/L
  direct_bilirubin   REAL CHECK (direct_bilirubin IS NULL OR direct_bilirubin >= 0),  -- μmol/L
  alp_u_l            REAL CHECK (alp_u_l IS NULL OR alp_u_l >= 0),
  ggt_u_l            REAL CHECK (ggt_u_l IS NULL OR ggt_u_l >= 0),
  alt_u_l            REAL,
  ast_u_l            REAL,
  albumin_g_l        REAL CHECK (albumin_g_l IS NULL OR albumin_g_l > 0),
  ca19_9_u_ml        REAL CHECK (ca19_9_u_ml IS NULL OR ca19_9_u_ml >= 0),   -- 不做分级（M3）
  cea_ng_ml          REAL CHECK (cea_ng_ml IS NULL OR cea_ng_ml >= 0),
  wbc_1e9_l          REAL CHECK (wbc_1e9_l IS NULL OR wbc_1e9_l >= 0),
  crp_mg_l           REAL CHECK (crp_mg_l IS NULL OR crp_mg_l >= 0),
  result_state       TEXT NOT NULL DEFAULT 'reported'
                     CHECK (result_state IN ('reported','partial','not_tested','unknown')),
  source_doc_id      INTEGER,
  note               TEXT,
  created_at         TEXT NOT NULL,
  -- 总胆红素 ≠ 直接胆红素：两项分别记录、分别显示。同一张单上直接胆红素不可能高于总胆红素
  -- （总 = 直接 + 间接）。写反了、抄串行了，在这里就挡住，不等到界面上再靠人眼发现。
  CHECK (direct_bilirubin IS NULL OR total_bilirubin IS NULL OR direct_bilirubin <= total_bilirubin)
);
CREATE INDEX ix_jaundice_lab_profile ON jaundice_lab(profile_id, measured_on);

-- 参考区间（H8）：随化验单走，不随指标定义走。
-- ref_high 缺失时 needs_uln=1 —— 表示「这行数值不能用来算 ×ULN」，
-- 不是「没有上限」。写入前必须挡掉 null / undefined / ''，三态不能塌成两态。
CREATE TABLE lab_ref (
  id           INTEGER PRIMARY KEY,
  lab_id       INTEGER NOT NULL REFERENCES jaundice_lab(id) ON DELETE CASCADE,
  metric_id    TEXT NOT NULL,                             -- 对应 metric_def.id
  ref_low      REAL,
  ref_high     REAL,
  needs_uln    INTEGER NOT NULL DEFAULT 0 CHECK (needs_uln IN (0, 1)),
  ref_unit     TEXT,
  created_at   TEXT NOT NULL,
  UNIQUE (lab_id, metric_id)
);

-- ---------------------------------------------------------------------------
-- A 轴 · 胆道引流（置管是**事件**，每日引流量是**序列**，拆两张表）
-- 为什么拆：一根管子会经历置入 → 换管 → 脱管 → 再置入，每次都是一件事；
-- 而引流量是每天一个数。塞进一张表就只能二选一。
-- ---------------------------------------------------------------------------
CREATE TABLE drainage_device (
  id              INTEGER PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL CHECK (kind IN (
                    'ptcd',        -- 经皮肝穿刺胆道引流
                    'enbd',        -- 内镜下鼻胆管引流
                    'stent_plastic',
                    'stent_metal',
                    'ptcd_internal', -- 内外引流
                    'surgical',    -- 手术引流/胆肠吻合
                    'other')),
  side            TEXT CHECK (side IS NULL OR side IN ('left','right','bilateral','na')),
  inserted_on     TEXT,
  removed_on      TEXT,
  hospital        TEXT,
  indwelling_note TEXT,                                   -- 型号/口径原文
  event           TEXT CHECK (event IS NULL OR event IN (
                    'insert','exchange','remove','dislodge','obstruct','reinsert','other')),
  exchanges_id    INTEGER REFERENCES drainage_device(id),  -- 换管指向上一根
  source_doc_id   INTEGER,
  note            TEXT,
  created_at      TEXT NOT NULL
);
CREATE INDEX ix_drain_dev_profile ON drainage_device(profile_id, inserted_on);

CREATE TABLE drainage_log (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  device_id     INTEGER REFERENCES drainage_device(id) ON DELETE SET NULL,
  recorded_on   TEXT NOT NULL,
  volume_ml     REAL CHECK (volume_ml IS NULL OR volume_ml >= 0),
  color         TEXT CHECK (color IS NULL OR color IN (
                  'golden','brown','dark','bloody','turbid','pus_like','clear','other','unknown')),
  odor          TEXT,
  patency       TEXT CHECK (patency IS NULL OR patency IN ('flowing','slow','stopped','unknown')),
  dressing      TEXT,                                     -- 敷料情况原样
  note          TEXT,
  created_at    TEXT NOT NULL,
  UNIQUE (profile_id, device_id, recorded_on)
);
CREATE INDEX ix_drain_log_profile ON drainage_log(profile_id, recorded_on);

-- 引流相关观察（不判急症，只记「发生了什么 + 用户怎么想」）
-- kind 用观察词，不用诊断词：'fever' 而不是 'cholangitis'（M4）。
CREATE TABLE drainage_observation (
  id          INTEGER PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  device_id   INTEGER REFERENCES drainage_device(id) ON DELETE SET NULL,
  observed_on TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN (
                'fever','chills','pain','leak','redness','wound','dressing_soaked','other')),
  value_text  TEXT,                                       -- 体温数值等原样
  severity    INTEGER CHECK (severity IS NULL OR (severity BETWEEN 0 AND 10)),
  action_taken TEXT,                                      -- 用户已做的处理，原样，不评价
  note        TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX ix_drain_obs_profile ON drainage_observation(profile_id, observed_on);

-- ---------------------------------------------------------------------------
-- B 轴 · 肿瘤负荷（影像评估）
-- 血管/胆管侵犯是独立字段，不塞进 note：这是可切除性判断的关键词。
-- ---------------------------------------------------------------------------
CREATE TABLE tumor_assessment (
  id                INTEGER PRIMARY KEY,
  profile_id        TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  assessed_on       TEXT NOT NULL,
  modality          TEXT NOT NULL CHECK (modality IN ('ct','mri','mrcp','eus','pet','pathology','other')),
  lesion_count      INTEGER CHECK (lesion_count IS NULL OR lesion_count >= 0),
  max_diameter_mm   REAL CHECK (max_diameter_mm IS NULL OR max_diameter_mm >= 0),
  intrahepatic_met  TEXT CHECK (intrahepatic_met IS NULL OR intrahepatic_met IN ('yes','no','unknown')),
  lymph_node        TEXT CHECK (lymph_node IS NULL OR lymph_node IN ('yes','no','suspected','unknown')),
  distant_met       TEXT CHECK (distant_met IS NULL OR distant_met IN ('yes','no','unknown')),
  vascular_invasion TEXT,                                  -- 门静脉/肝动脉受侵描述原文
  bile_duct_extent  TEXT,                                  -- 胆管受侵范围（Bismuth 分型原文）
  perineural        TEXT CHECK (perineural IS NULL OR perineural IN ('yes','no','unknown')),
  ascites           TEXT CHECK (ascites IS NULL OR ascites IN ('none','mild','moderate','severe','unknown')),
  source_doc_id     INTEGER,
  note              TEXT,
  created_at        TEXT NOT NULL
);
CREATE INDEX ix_tumor_profile ON tumor_assessment(profile_id, assessed_on);

CREATE TABLE tumor_lesion (
  id            INTEGER PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES tumor_assessment(id) ON DELETE CASCADE,
  seq           INTEGER NOT NULL,
  segment       TEXT,                                     -- Couinaud 段 / 胆管部位，原样
  size_mm       REAL,
  location_note TEXT,
  UNIQUE (assessment_id, seq)
);

-- 分期断言：只记「谁说的、哪天、原话」，工作台不推算（A4 / M5）
CREATE TABLE stage_assertion (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  system        TEXT NOT NULL CHECK (system IN ('AJCC8','other')),
  stage         TEXT NOT NULL,                            -- 如 II 或 IIIB，原样
  stated_by     TEXT,
  stated_on     TEXT,
  basis         TEXT,
  supersedes_id INTEGER REFERENCES stage_assertion(id),
  is_current    INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0, 1)),
  created_at    TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_stage_current ON stage_assertion(profile_id, system) WHERE is_current = 1;
CREATE INDEX ix_stage_profile ON stage_assertion(profile_id, system, stated_on);

-- 可切除性断言：胆道癌最核心也最容易变的一件事
-- context 用来区分「初诊时说的」「减黄后重评的」「术前最后定的」——
-- 患者最常问的就是「为什么上次说能切，这次说不能」。
CREATE TABLE resectability_assertion (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  conclusion    TEXT NOT NULL CHECK (conclusion IN ('resectable','borderline','unresectable','unknown')),
  context       TEXT CHECK (context IS NULL OR context IN ('initial','post_drainage','post_treatment','preop','other')),
  stated_by     TEXT,
  stated_on     TEXT,
  basis         TEXT,                                     -- 依据原文要点（残肝体积、受侵范围等）
  flr_note      TEXT,                                     -- 未来残肝比例原文
  pve_note      TEXT,                                     -- 门静脉栓塞等术前处理，原样
  supersedes_id INTEGER REFERENCES resectability_assertion(id),
  is_current    INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0, 1)),
  created_at    TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_resect_current ON resectability_assertion(profile_id) WHERE is_current = 1;
CREATE INDEX ix_resect_profile ON resectability_assertion(profile_id, stated_on);

-- ---------------------------------------------------------------------------
-- B 轴 · 治疗线序（H6：换线是**新增行**，不是编辑旧行）
-- 患者说「我这是第几线」时，答案必须来自一条条真实记录，而不是一个被改过的数字。
-- ---------------------------------------------------------------------------
CREATE TABLE treatment_event (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  modality      TEXT NOT NULL CHECK (modality IN (
                  'resection','transplant','ablation','rt','systemic','drainage_palliative',
                  'stent_palliative','supportive','other')),
  intent        TEXT CHECK (intent IS NULL OR intent IN ('curative','palliative','adjuvant','neoadjuvant','conversion','unknown')),
  line_no       INTEGER CHECK (line_no IS NULL OR line_no >= 1),
  regimen       TEXT,                                     -- 方案/药名原样，不推荐、不算剂量
  started_on    TEXT,
  ended_on      TEXT,
  cycles_planned INTEGER,
  cycles_done   INTEGER,
  response      TEXT,                                     -- 医生记录的疗效原文
  stop_reason   TEXT,
  institution   TEXT,
  source_doc_id INTEGER,
  note          TEXT,
  created_at    TEXT NOT NULL
);
CREATE INDEX ix_tx_profile ON treatment_event(profile_id, started_on);

-- ---------------------------------------------------------------------------
-- B 轴 · 方案依据（U5 的落点）
-- 用户原话：「对后续治疗策略的重要指标依据和影响判断依据，不了解指南，不知道该怎么做理解。」
-- 于是这里只存三样东西：医生说了什么（原话）、当时看了哪几个指标、指南里对应的哪一条。
-- **不存"符合/不符合"的判断**——那是临床结论，工作台不产生（M8）。
-- ---------------------------------------------------------------------------
CREATE TABLE guideline_ref (
  id         INTEGER PRIMARY KEY,
  org        TEXT NOT NULL,                               -- NCCN / CSCO / 其他机构
  title      TEXT NOT NULL,                               -- 文件名，原样
  version    TEXT NOT NULL,                               -- 版本号，如 2.2025（不许写"最新版"）
  page       TEXT NOT NULL,                               -- 页码/条目号（缺页码的条目不许引）
  rhythm     TEXT,                                        -- 复查节奏原文（多久评一次）
  parallel_notes TEXT,                                    -- 并列口径原文（多条平行说法一起列）
  retrieved_on TEXT,                                      -- 拿到原件/核对的日期
  checked_by TEXT,                                        -- 核对人；空表示未核实
  note       TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE decision_record (
  id             INTEGER PRIMARY KEY,
  profile_id     TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  discussed_on   TEXT NOT NULL,
  topic          TEXT,                                    -- 例如「二线方案讨论」「是否再次手术」
  doctor_reason  TEXT,                                    -- 医生说的理由，原话优先，不改写
  stated_by      TEXT,                                    -- 谁说的（医院/科室）
  source         TEXT NOT NULL DEFAULT 'self'
                 CHECK (source IN ('self','caregiver','clinician_summary')),  -- 谁记的；不合并成"共识"
  guideline_id   INTEGER REFERENCES guideline_ref(id),     -- 空 = 当时没有可引的指南条目
  visit_id       INTEGER REFERENCES visit(id),
  created_at     TEXT NOT NULL
);
CREATE INDEX ix_decision_profile ON decision_record(profile_id, discussed_on);

-- 这条依据当时参考了哪几个指标（指向具体某一天的值，不是"某指标"这种模糊关联）
CREATE TABLE decision_metric (
  id           INTEGER PRIMARY KEY,
  decision_id  INTEGER NOT NULL REFERENCES decision_record(id) ON DELETE CASCADE,
  metric_id    TEXT NOT NULL REFERENCES metric_def(id),
  measured_on  TEXT,
  UNIQUE (decision_id, metric_id, measured_on)
);


-- 胆道癌的靶点检出直接决定有没有可用药，所以「测了没测」比「阴性」更重要。
-- tested=0 时 result 必须为 NULL —— 用触发器挡住「未检测写成阴性」。
-- ---------------------------------------------------------------------------
CREATE TABLE genomic_test (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  tested_on     TEXT,
  platform      TEXT CHECK (platform IS NULL OR platform IN ('tissue_ngs','liquid_ngs','ihc','fish','pcr','other','unknown')),
  lab           TEXT,
  source_doc_id INTEGER,
  note          TEXT,
  created_at    TEXT NOT NULL
);
CREATE INDEX ix_gt_profile ON genomic_test(profile_id, tested_on);

CREATE TABLE genomic_result (
  id           INTEGER PRIMARY KEY,
  test_id      INTEGER NOT NULL REFERENCES genomic_test(id) ON DELETE CASCADE,
  gene         TEXT NOT NULL CHECK (gene IN (
                 'FGFR2','IDH1','IDH2','HER2','BRAF','KRAS','NRAS','MSI','MMR','TMB','NTRK','RET','other')),
  alteration   TEXT,                                      -- fusion / V600E / amplification，原样
  tested       INTEGER NOT NULL DEFAULT 1 CHECK (tested IN (0, 1)),
  result       TEXT CHECK (result IS NULL OR result IN ('positive','negative','equivocal','failed')),
  value_text   TEXT,                                      -- TMB 数值 / 百分比原样
  raw_text     TEXT,                                      -- 报告原文行，供人核对
  created_at   TEXT NOT NULL,
  UNIQUE (test_id, gene, alteration),
  CHECK (tested = 1 OR result IS NULL)
);

-- ---------------------------------------------------------------------------
-- 安全线（胆道癌专属事件类型）
-- 只存医生给的 CTCAE 原文或事件描述，不自行分级。
-- ---------------------------------------------------------------------------
CREATE TABLE safety_event (
  id             INTEGER PRIMARY KEY,
  profile_id     TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN (
                   'cholangitis','biliary_infection','post_drainage_fever','bleeding',
                   'pancreatitis','liver_toxicity','irae','neuropathy','rash','other')),
  onset_on       TEXT NOT NULL,
  resolved_on    TEXT,
  grade          TEXT,                                    -- CTCAE 原文或医生记录
  related_tx_id  INTEGER REFERENCES treatment_event(id),
  related_dev_id INTEGER REFERENCES drainage_device(id),
  description    TEXT,
  action_recorded TEXT,                                   -- 医生已采取的措施，原样记录
  source_doc_id  INTEGER,
  created_at     TEXT NOT NULL
);
CREATE INDEX ix_safety_profile ON safety_event(profile_id, onset_on);

-- ---------------------------------------------------------------------------
-- 症状 / 体重 / 看法
-- 不设营养支持独立页，但允许记录体重与食欲：主诉重心在黄疸与引流（A3、D3）
-- ---------------------------------------------------------------------------
CREATE TABLE symptom_record (
  id          INTEGER PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  recorded_on TEXT NOT NULL,
  symptom     TEXT NOT NULL,
  severity    INTEGER CHECK (severity IS NULL OR (severity BETWEEN 0 AND 10)),
  duration    TEXT,
  note        TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX ix_symptom_profile ON symptom_record(profile_id, recorded_on);

CREATE TABLE body_record (
  id          INTEGER PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  recorded_on TEXT NOT NULL,
  weight_kg   REAL CHECK (weight_kg IS NULL OR weight_kg > 0),
  appetite    TEXT CHECK (appetite IS NULL OR appetite IN ('good','fair','poor','unknown')),
  note        TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX ix_body_profile ON body_record(profile_id, recorded_on);

-- 看法：永远不是结论
CREATE TABLE viewpoint (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  recorded_on   TEXT NOT NULL,
  topic         TEXT NOT NULL,
  body          TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'self' CHECK (source IN ('self','caregiver','clinician_summary')),
  is_conclusion INTEGER NOT NULL DEFAULT 0 CHECK (is_conclusion = 0),
  created_at    TEXT NOT NULL
);
CREATE INDEX ix_viewpoint_profile ON viewpoint(profile_id, recorded_on);

-- ---------------------------------------------------------------------------
-- 事实四层：文档 / 候选 / 记录 / 指标
-- ---------------------------------------------------------------------------
CREATE TABLE document (
  id          INTEGER PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('lab','imaging','pathology','discharge','prescription','other')),
  doc_date    TEXT,
  issued_by   TEXT,                                       -- 谁开的（医院/科室），报告清单要显示
  summary_line TEXT,                                      -- 结果原文首行，原样抄，不改写
  feeds_trend INTEGER NOT NULL DEFAULT 0 CHECK (feeds_trend IN (0, 1)),  -- 这份的值有没有进趋势
  file_path   TEXT,
  file_sha256 TEXT,
  status      TEXT NOT NULL DEFAULT 'pending_parse'
              CHECK (status IN ('pending_parse','pending_review','parsed','parse_failed')),
  uploaded_at TEXT NOT NULL,
  UNIQUE (profile_id, file_sha256)
);

CREATE TABLE candidate (
  id          INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  field       TEXT NOT NULL,
  value_text  TEXT,
  value_num   REAL,
  unit        TEXT,
  page_no     INTEGER,
  confidence  REAL,
  source_line TEXT,                                       -- 命中的原文行，供人核对
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at  TEXT NOT NULL
);
CREATE INDEX ix_candidate_doc ON candidate(document_id, field);

CREATE TABLE metric_def (
  id       TEXT PRIMARY KEY,
  label_zh TEXT NOT NULL,
  unit     TEXT,
  kind     TEXT NOT NULL CHECK (kind IN ('numeric','grade','qual')),
  track    TEXT NOT NULL CHECK (track IN ('obstruction','tumor','treatment','safety','body','other')),
  decimals INTEGER
);

CREATE TABLE metric_reading (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  metric_id     TEXT NOT NULL REFERENCES metric_def(id),
  measured_on   TEXT NOT NULL,
  value_num     REAL,
  value_text    TEXT,
  unit          TEXT,
  is_missing    INTEGER NOT NULL DEFAULT 0 CHECK (is_missing IN (0, 1)),
  result_state  TEXT NOT NULL DEFAULT 'reported'
                CHECK (result_state IN ('reported','not_tested','unknown')),
  ref_low       REAL,
  ref_high      REAL,
  needs_uln     INTEGER NOT NULL DEFAULT 0 CHECK (needs_uln IN (0, 1)),
  source_doc_id INTEGER,
  note          TEXT,
  created_at    TEXT NOT NULL
);
CREATE INDEX ix_reading_profile ON metric_reading(profile_id, metric_id, measured_on);

-- 「我不懂的」打标（U6）：用户对某个点的数值/单位/含义看不懂时打一个标，
-- 复查准备页会自动把这些点带进问题清单。
-- 按 (profile, metric, 日期) 定位，不绑定具体存储表 —— 因为同一个值可能来自
-- jaundice_lab 的列，也可能来自 metric_reading 的行。
CREATE TABLE reading_flag (
  id          INTEGER PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  metric_id   TEXT NOT NULL REFERENCES metric_def(id),
  measured_on TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'unclear' CHECK (kind IN ('unclear','unit_question','value_question')),
  note        TEXT,                                       -- 用户原话：哪里看不懂
  created_at  TEXT NOT NULL,
  UNIQUE (profile_id, metric_id, measured_on, kind)
);

-- ---------------------------------------------------------------------------
-- 复诊 / 问题 / 任务
-- 复查准备是本工作台的出口：一次复查 = 一次 visit + 一组 question
-- ---------------------------------------------------------------------------
CREATE TABLE visit (
  id         INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  visited_on TEXT NOT NULL,
  department TEXT,
  purpose    TEXT,
  summary    TEXT,
  next_on    TEXT,
  planned    INTEGER NOT NULL DEFAULT 0 CHECK (planned IN (0, 1)),  -- 计划中 vs 已发生
  created_at TEXT NOT NULL
);
CREATE INDEX ix_visit_profile ON visit(profile_id, visited_on);

CREATE TABLE question (
  id            INTEGER PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  created_on    TEXT NOT NULL,
  body          TEXT NOT NULL,
  for_visit_id  INTEGER REFERENCES visit(id),
  answered      TEXT,
  created_at    TEXT NOT NULL
);
CREATE INDEX ix_question_profile ON question(profile_id, created_on);

CREATE TABLE task (
  id         INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  due_on     TEXT,
  done_on    TEXT,
  kind       TEXT CHECK (kind IS NULL OR kind IN ('visit','test','drain','med','other')),
  created_at TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- 版本链防改写：分型 / 分期 / 可切除性（更正只新增行）
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_subtype_no_update
BEFORE UPDATE ON subtype_assertion
WHEN OLD.is_current = 0
BEGIN
  SELECT RAISE(ABORT, 'subtype_assertion: 历史版本不可修改，请新增一行');
END;

CREATE TRIGGER trg_stage_no_update
BEFORE UPDATE ON stage_assertion
WHEN OLD.is_current = 0
BEGIN
  SELECT RAISE(ABORT, 'stage_assertion: 历史版本不可修改，请新增一行');
END;

CREATE TRIGGER trg_resect_no_update
BEFORE UPDATE ON resectability_assertion
WHEN OLD.is_current = 0
BEGIN
  SELECT RAISE(ABORT, 'resectability_assertion: 历史版本不可修改，请新增一行');
END;

-- 看法不可被改成结论
CREATE TRIGGER trg_viewpoint_no_conclusion
BEFORE UPDATE ON viewpoint
WHEN NEW.is_conclusion <> 0
BEGIN
  SELECT RAISE(ABORT, 'viewpoint: 看法不得标记为结论');
END;

-- 未检测不得写成阴性（H7 的数据库层兜底）
CREATE TRIGGER trg_genomic_tested_result
BEFORE INSERT ON genomic_result
WHEN NEW.tested = 0 AND NEW.result IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'genomic_result: tested=0 表示未检测，result 必须为 NULL');
END;

CREATE TRIGGER trg_genomic_tested_result_upd
BEFORE UPDATE ON genomic_result
WHEN NEW.tested = 0 AND NEW.result IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'genomic_result: tested=0 表示未检测，result 必须为 NULL');
END;

-- ---------------------------------------------------------------------------
-- 基础字典（只放指标定义，不放临床建议）
-- track: obstruction = A 轴，tumor / treatment = B 轴，body = 体重等
-- ---------------------------------------------------------------------------
INSERT INTO metric_def (id, label_zh, unit, kind, track, decimals) VALUES
  ('bilirubin_total', '总胆红素',   'μmol/L', 'numeric', 'obstruction', 1),
  ('bilirubin_direct','直接胆红素', 'μmol/L', 'numeric', 'obstruction', 1),
  ('alp',             'ALP',        'U/L',    'numeric', 'obstruction', 0),
  ('ggt',             'GGT',        'U/L',    'numeric', 'obstruction', 0),
  ('alt',             'ALT',        'U/L',    'numeric', 'obstruction', 0),
  ('ast',             'AST',        'U/L',    'numeric', 'obstruction', 0),
  ('albumin',         '白蛋白',     'g/L',    'numeric', 'obstruction', 1),
  ('drain_volume',    '引流量',     'mL',     'numeric', 'obstruction', 0),
  ('wbc',             '白细胞',     '10⁹/L',  'numeric', 'safety',      1),
  ('crp',             'CRP',        'mg/L',   'numeric', 'safety',      1),
  ('ca19_9',          'CA19-9',     'U/mL',   'numeric', 'tumor',       1),
  ('cea',             'CEA',        'ng/mL',  'numeric', 'tumor',       1),
  ('max_diameter',    '最大病灶径', 'mm',     'numeric', 'tumor',       0),
  ('weight',          '体重',       'kg',     'numeric', 'body',        1),
  ('drain_color',     '引流液颜色', '',       'qual',    'obstruction', NULL),
  ('resectability',   '可切除性',   '',       'grade',   'tumor',       NULL),
  ('ajcc_stage',      'AJCC 分期',  '',       'grade',   'tumor',       NULL);

-- ---------------------------------------------------------------------------
-- C 轴 · 临床试验匹配（2026-10-24 追加；G3 未签，仍在 0001 草案内）
--
-- 边界：
--   试验条目是**外部注册事实的快照**，不是我们的推荐；status / 中心 / 截止日期
--   必须带 source 与 verified_on，没有核验日期的条目在界面上只能显示「未核验」。
--   匹配结果是由「患者记录 × 试验条件」算出的**派生快照**，不写回患者事实，
--   也不等于入组资格——硬性条件不满足要显式列出，未知项必须保留为「未知」，
--   不得用「阴性」或「符合」填充。
-- ---------------------------------------------------------------------------
CREATE TABLE trial (
  id             TEXT PRIMARY KEY,                   -- 内部 ID，如 BTC-ADJ-01
  registry_id    TEXT,                               -- NCT / ChiCTR 号；合成条目以 DEMO- 开头
  source         TEXT NOT NULL,                      -- ctgov / chictr / hospital / demo
  title          TEXT NOT NULL,
  short_title    TEXT,
  phase          TEXT,
  status         TEXT NOT NULL CHECK (status IN (
                   'recruiting','not_yet_recruiting','active_not_recruiting',
                   'suspended','terminated','completed','unknown')),
  scope          TEXT NOT NULL CHECK (scope IN (
                   'adjuvant','neoadjuvant','advanced_1l','advanced_2l','agnostic','registry')),
  subtypes       TEXT,                               -- 逗号分隔：icc,pcc,dcc,gbc
  biomarker_gene TEXT,
  biomarker_alt  TEXT,
  requires_biopsy INTEGER NOT NULL DEFAULT 0 CHECK (requires_biopsy IN (0,1)),
  placebo        INTEGER NOT NULL DEFAULT 0 CHECK (placebo IN (0,1)),
  sponsor        TEXT,
  summary        TEXT,
  updated_on     TEXT,
  verified_on    TEXT,                               -- 空 = 未核验，界面不得显示为在招
  deadline       TEXT,
  url            TEXT,
  created_at     TEXT NOT NULL
);
CREATE INDEX ix_trial_status ON trial(status, scope);

CREATE TABLE trial_criterion (
  id         INTEGER PRIMARY KEY,
  trial_id   TEXT NOT NULL REFERENCES trial(id) ON DELETE CASCADE,
  seq        INTEGER NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('include','exclude')),
  category   TEXT NOT NULL CHECK (category IN (
               'diagnosis','subtype','stage','resectability','prior_tx','genomic',
               'organ','lab','age','performance','other')),
  text       TEXT NOT NULL,                          -- 条目原文要点，不改写
  field      TEXT,                                   -- 结构化判据字段；空 = 无法自动判断
  op         TEXT,
  value      TEXT,
  hard       INTEGER NOT NULL DEFAULT 1 CHECK (hard IN (0,1)),  -- 硬性条件不满足 → 不推荐
  created_at TEXT NOT NULL,
  UNIQUE (trial_id, seq)
);

CREATE TABLE trial_site (
  id         INTEGER PRIMARY KEY,
  trial_id   TEXT NOT NULL REFERENCES trial(id) ON DELETE CASCADE,
  city       TEXT,
  hospital   TEXT,
  contact    TEXT,
  status     TEXT CHECK (status IS NULL OR status IN ('open','planned','closed','unknown')),
  updated_on TEXT,
  created_at TEXT NOT NULL
);

-- 派生快照：算过什么、依据哪一版引擎、当时患者记录长什么样，都要能回放
CREATE TABLE trial_match (
  id                INTEGER PRIMARY KEY,
  profile_id        TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  trial_id          TEXT NOT NULL REFERENCES trial(id) ON DELETE CASCADE,
  engine_version    TEXT NOT NULL,
  computed_at       TEXT NOT NULL,
  fit_band          TEXT NOT NULL CHECK (fit_band IN ('high','partial','needs_info','ineligible')),
  fit_pct           INTEGER CHECK (fit_pct IS NULL OR (fit_pct >= 0 AND fit_pct <= 100)),
  met_count         INTEGER NOT NULL,
  unmet_count       INTEGER NOT NULL,
  unknown_count     INTEGER NOT NULL,
  criteria_snapshot TEXT NOT NULL,                   -- JSON：逐条 state / 实际值 / 期望值
  profile_snapshot  TEXT NOT NULL,                   -- JSON：参与计算的字段与来源日期
  UNIQUE (profile_id, trial_id, engine_version, computed_at)
);

CREATE TABLE trial_saved (
  profile_id TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  trial_id   TEXT NOT NULL REFERENCES trial(id) ON DELETE CASCADE,
  saved_on   TEXT NOT NULL,
  state      TEXT NOT NULL DEFAULT 'watching' CHECK (state IN ('watching','asking','archived')),
  note       TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, trial_id)
);

CREATE TABLE trial_track_event (
  id         INTEGER PRIMARY KEY,
  trial_id   TEXT NOT NULL REFERENCES trial(id) ON DELETE CASCADE,
  on_date    TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN (
               'status_change','site_update','deadline','criteria_change','note')),
  text       TEXT NOT NULL,
  from_value TEXT,
  to_value   TEXT,
  source     TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX ix_trial_track ON trial_track_event(trial_id, on_date);
