// 小胆宝 · 临床试验条目的演示目录
//
// ⚠️ 全部是**合成条目**，registry 以 DEMO- 开头：用于演示匹配规则、收藏与跟踪的交互，
//    不代表真实在招试验，也不含任何真实中心联系人。
//    上线前必须换成 ClinicalTrials.gov / ChiCTR 的注册号，并显示 verified_on（核验日期）；
//    没有核验日期的条目在界面上只能显示「未核验」，不得显示为「招募中」。
//
// 条目里的 criteria 只写**可对照的条件**，且必须给 field/op/value 才能自动判断；
// 无法结构化的条目 field 留空，界面显示「需人工核对」，不能默认算符合。

const NOW = '2026-10-24';
const t = (o) => ({ created_at: NOW, ...o });

const ALL = ['icc', 'pcc', 'dcc', 'gbc'];

export function buildDemoTrials() {
  const trials = [
    {
      id: 'BTC-ADJ-01',
      registry: 'DEMO-BTC-ADJ-01',
      source: 'demo',
      title: '根治性切除后胆道癌辅助化疗对比观察（III 期）',
      short: '术后辅助化疗 vs 观察',
      phase: 'III',
      status: 'recruiting',
      scope: 'adjuvant',
      subtypes: ALL,
      biomarker: null,
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某肿瘤协作组',
      summary: '根治性切除（R0/R1）后 8 周内入组，随机接受辅助化疗或观察。',
      updatedOn: '2026-10-18',
      verifiedOn: '2026-10-20',
      deadline: '2027-06-30',
      url: 'https://example.org/DEMO-BTC-ADJ-01',
      sites: [
        { city: '上海', hospital: 'XX 医院肝胆胰外科', contact: '研究护士（演示）', status: 'open', updatedOn: '2026-10-18' },
        { city: '杭州', hospital: 'XX 医院肿瘤内科', contact: '研究医生（演示）', status: 'planned', updatedOn: '2026-10-18' }
      ],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊为肝内胆管癌、肝门部胆管癌、远端胆管癌或胆囊癌', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'resectability', text: '已完成根治性切除，影像未见残留或复发', field: 'resected_now', op: 'eq', value: 'true', hard: true },
        { kind: 'include', category: 'stage', text: '术后病理分期 II–III 期（AJCC 第 8 版）', field: 'stage_major', op: 'in', value: ['II', 'III'], hard: true },
        { kind: 'include', category: 'age', text: '入组时年龄 ≥ 18 岁', field: 'age', op: 'gte', value: '18', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 体力状态 0–1', field: 'ecog', op: 'lte', value: '1', hard: true },
        { kind: 'include', category: 'organ', text: '总胆红素 ≤ 1.5 × 本中心参考上限', field: 'tb_uln', op: 'lte', value: '1.5', hard: true },
        { kind: 'include', category: 'organ', text: '白蛋白 ≥ 30 g/L', field: 'albumin', op: 'gte', value: '30', hard: true },
        { kind: 'exclude', category: 'prior_tx', text: '既往接受过针对胆道癌的系统治疗（辅助化疗除外）', field: 'prior_palliative', op: 'eq', value: '0', hard: true }
      ],
      updates: [
        { on: '2026-09-30', kind: 'deadline', text: '入组截止日期由 2027-03-31 延至 2027-06-30', from: '2027-03-31', to: '2027-06-30', source: '注册平台（演示）' },
        { on: '2026-10-18', kind: 'site_update', text: '新增杭州中心（计划启动）', from: '', to: '杭州 · 计划启动', source: '注册平台（演示）' }
      ]
    },
    {
      id: 'BTC-FGFR2-01',
      registry: 'DEMO-BTC-FGFR2-01',
      source: 'demo',
      title: 'FGFR2 融合阳性胆管癌靶向治疗（II 期）',
      short: 'FGFR2 融合 · 后线靶向',
      phase: 'II',
      status: 'recruiting',
      scope: 'advanced_2l',
      subtypes: ['icc', 'pcc'],
      biomarker: { gene: 'FGFR2', alt: 'fusion' },
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某生物制药',
      summary: '既往至少一线系统治疗后进展的 FGFR2 融合阳性胆管癌。',
      updatedOn: '2026-10-11',
      verifiedOn: '2026-10-15',
      deadline: '2027-12-31',
      url: 'https://example.org/DEMO-BTC-FGFR2-01',
      sites: [{ city: '上海', hospital: 'XX 医院肿瘤内科', contact: '研究医生（演示）', status: 'open', updatedOn: '2026-10-11' }],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的肝内或肝门部胆管癌', field: 'subtype', op: 'in', value: ['icc', 'pcc'], hard: true },
        { kind: 'include', category: 'genomic', text: '检测报告证实 FGFR2 融合阳性', field: 'gene:FGFR2', op: 'positive', value: 'fusion', hard: true },
        { kind: 'include', category: 'prior_tx', text: '既往至少 1 线系统治疗后进展', field: 'prior_systemic', op: 'gte', value: '1', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–1', field: 'ecog', op: 'lte', value: '1', hard: true },
        { kind: 'include', category: 'organ', text: '总胆红素 ≤ 2 × 本中心参考上限', field: 'tb_uln', op: 'lte', value: '2', hard: true }
      ],
      updates: [
        { on: '2026-10-11', kind: 'status_change', text: '状态由「即将招募」改为「招募中」', from: '即将招募', to: '招募中', source: '注册平台（演示）' }
      ]
    },
    {
      id: 'BTC-IDH1-01',
      registry: 'DEMO-BTC-IDH1-01',
      source: 'demo',
      title: 'IDH1 R132 突变胆管癌口服靶向对比化疗（III 期）',
      short: 'IDH1 R132 · 后线',
      phase: 'III',
      status: 'recruiting',
      scope: 'advanced_2l',
      subtypes: ['icc'],
      biomarker: { gene: 'IDH1', alt: 'R132' },
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某跨国药企',
      summary: 'IDH1 R132 突变、既往一线治疗后进展的肝内胆管癌。',
      updatedOn: '2026-09-26',
      verifiedOn: '2026-10-01',
      deadline: '2028-03-31',
      url: 'https://example.org/DEMO-BTC-IDH1-01',
      sites: [{ city: '北京', hospital: 'XX 医院肿瘤内科', contact: '研究护士（演示）', status: 'open', updatedOn: '2026-09-26' }],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的肝内胆管癌', field: 'subtype', op: 'in', value: ['icc'], hard: true },
        { kind: 'include', category: 'genomic', text: '检测报告证实 IDH1 R132 突变', field: 'gene:IDH1', op: 'positive', value: 'R132', hard: true },
        { kind: 'include', category: 'prior_tx', text: '既往 1 线系统治疗后进展', field: 'prior_systemic', op: 'gte', value: '1', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–1', field: 'ecog', op: 'lte', value: '1', hard: true }
      ],
      updates: []
    },
    {
      id: 'BTC-HER2-01',
      registry: 'DEMO-BTC-HER2-01',
      source: 'demo',
      title: 'HER2 表达胆道癌抗体偶联药物（II 期）',
      short: 'HER2 表达 · ADC',
      phase: 'II',
      status: 'suspended',
      scope: 'advanced_2l',
      subtypes: ALL,
      biomarker: { gene: 'HER2', alt: 'amplification' },
      requiresBiopsy: true,
      placebo: false,
      sponsor: '（演示）某生物制药',
      summary: 'HER2 IHC 3+ 或 IHC 2+/ISH 阳性的胆道癌；需提供蜡块或重新活检。',
      updatedOn: '2026-09-20',
      verifiedOn: '2026-09-22',
      deadline: '2027-09-30',
      url: 'https://example.org/DEMO-BTC-HER2-01',
      sites: [{ city: '广州', hospital: 'XX 医院肝胆胰外科', contact: '研究医生（演示）', status: 'closed', updatedOn: '2026-09-20' }],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的胆道癌（含胆囊癌）', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'genomic', text: 'HER2 IHC 3+，或 IHC 2+ 且 ISH 阳性', field: 'gene:HER2', op: 'positive', value: 'amplification', hard: true },
        { kind: 'include', category: 'other', text: '可提供存档蜡块，或同意重新活检', field: 'biopsy_ok', op: 'eq', value: 'true', hard: true },
        { kind: 'include', category: 'prior_tx', text: '既往至少 1 线系统治疗', field: 'prior_systemic', op: 'gte', value: '1', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–1', field: 'ecog', op: 'lte', value: '1', hard: true }
      ],
      updates: [
        { on: '2026-09-20', kind: 'status_change', text: '状态由「招募中」改为「暂停招募」', from: '招募中', to: '暂停招募', source: '注册平台（演示）' },
        { on: '2026-09-20', kind: 'site_update', text: '广州中心暂停入组', from: '开放', to: '暂停', source: '中心公告（演示）' }
      ]
    },
    {
      id: 'BTC-KRAS-01',
      registry: 'DEMO-BTC-KRAS-01',
      source: 'demo',
      title: 'KRAS G12C/G12D 抑制剂治疗 KRAS 突变实体瘤（I/II 期）',
      short: 'KRAS 突变 · 篮子试验',
      phase: 'I/II',
      status: 'recruiting',
      scope: 'agnostic',
      subtypes: ALL,
      biomarker: { gene: 'KRAS', alt: 'G12C/G12D' },
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某创新药企',
      summary: '携带 KRAS G12C 或 G12D 的晚期实体瘤，包含胆道癌队列。',
      updatedOn: '2026-10-08',
      verifiedOn: '2026-10-10',
      deadline: '2027-12-31',
      url: 'https://example.org/DEMO-BTC-KRAS-01',
      sites: [
        { city: '上海', hospital: 'XX 医院肿瘤内科', contact: '研究护士（演示）', status: 'open', updatedOn: '2026-10-08' },
        { city: '成都', hospital: 'XX 医院肿瘤科', contact: '研究医生（演示）', status: 'open', updatedOn: '2026-10-08' }
      ],
      criteria: [
        { kind: 'include', category: 'diagnosis', text: '经病理确诊的晚期实体瘤，含胆道癌队列', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'genomic', text: '检测证实 KRAS G12C 或 G12D 突变', field: 'gene:KRAS', op: 'positive', value: 'G12C/G12D', hard: true },
        { kind: 'include', category: 'prior_tx', text: '标准治疗失败或不耐受', field: 'prior_systemic', op: 'gte', value: '1', hard: true },
        { kind: 'include', category: 'organ', text: '总胆红素 ≤ 1.5 × 本中心参考上限', field: 'tb_uln', op: 'lte', value: '1.5', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–1', field: 'ecog', op: 'lte', value: '1', hard: true }
      ],
      updates: [
        { on: '2026-10-08', kind: 'status_change', text: '状态由「即将招募」改为「招募中」', from: '即将招募', to: '招募中', source: '注册平台（演示）' }
      ]
    },
    {
      id: 'BTC-MSI-01',
      registry: 'DEMO-BTC-MSI-01',
      source: 'demo',
      title: 'MSI-H/dMMR 胆道癌免疫治疗（II 期）',
      short: 'MSI-H/dMMR · 免疫',
      phase: 'II',
      status: 'recruiting',
      scope: 'advanced_2l',
      subtypes: ALL,
      biomarker: { gene: 'MSI', alt: 'MSI-H' },
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某肿瘤协作组',
      summary: 'MSI-H 或 dMMR 的晚期胆道癌，既往系统治疗后。',
      updatedOn: '2026-08-30',
      verifiedOn: '2026-09-05',
      deadline: '2027-05-31',
      url: 'https://example.org/DEMO-BTC-MSI-01',
      sites: [{ city: '北京', hospital: 'XX 医院肿瘤内科', contact: '研究护士（演示）', status: 'open', updatedOn: '2026-08-30' }],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的胆道癌', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'genomic', text: 'MSI-H 或 dMMR（IHC / PCR / NGS 任一）', field: 'gene:MSI', op: 'positive', value: 'MSI-H', hard: true },
        { kind: 'include', category: 'prior_tx', text: '既往至少 1 线系统治疗', field: 'prior_systemic', op: 'gte', value: '1', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–1', field: 'ecog', op: 'lte', value: '1', hard: true }
      ],
      updates: []
    },
    {
      id: 'BTC-1L-01',
      registry: 'DEMO-BTC-1L-01',
      source: 'demo',
      title: '晚期胆道癌一线免疫联合化疗对比化疗（III 期）',
      short: '晚期一线 · 免疫联合',
      phase: 'III',
      status: 'recruiting',
      scope: 'advanced_1l',
      subtypes: ALL,
      biomarker: null,
      requiresBiopsy: false,
      placebo: true,
      sponsor: '（演示）某跨国药企',
      summary: '不可切除或转移性胆道癌，未接受过系统治疗。',
      updatedOn: '2026-10-02',
      verifiedOn: '2026-10-06',
      deadline: '2028-06-30',
      url: 'https://example.org/DEMO-BTC-1L-01',
      sites: [
        { city: '上海', hospital: 'XX 医院肿瘤内科', contact: '研究医生（演示）', status: 'open', updatedOn: '2026-10-02' },
        { city: '广州', hospital: 'XX 医院肝胆胰外科', contact: '研究护士（演示）', status: 'open', updatedOn: '2026-10-02' }
      ],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的胆道癌', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'resectability', text: '不可切除或转移性，未接受过针对晚期的系统治疗', field: 'advanced_tx_naive', op: 'eq', value: 'true', hard: true },
        { kind: 'include', category: 'organ', text: '总胆红素 ≤ 1.5 × 本中心参考上限', field: 'tb_uln', op: 'lte', value: '1.5', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–1', field: 'ecog', op: 'lte', value: '1', hard: true }
      ],
      updates: [
        { on: '2026-10-02', kind: 'criteria_change', text: '方案 v3：允许既往辅助化疗结束 ≥ 6 个月者入组', from: '排除任何既往化疗', to: '辅助化疗结束 ≥ 6 个月可入组', source: '方案修订（演示）' }
      ]
    },
    {
      id: 'BTC-2L-01',
      registry: 'DEMO-BTC-2L-01',
      source: 'demo',
      title: '胆道癌二线化疗联合靶向（II 期）',
      short: '二线 · 化疗联合',
      phase: 'II',
      status: 'recruiting',
      scope: 'advanced_2l',
      subtypes: ALL,
      biomarker: null,
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某肿瘤中心',
      summary: '一线治疗后影像提示进展的晚期胆道癌，无明确可靶向位点亦可入组。',
      updatedOn: '2026-10-12',
      verifiedOn: '2026-10-14',
      deadline: '2027-10-31',
      url: 'https://example.org/DEMO-BTC-2L-01',
      sites: [
        { city: '上海', hospital: 'XX 医院肿瘤内科', contact: '研究护士（演示）', status: 'open', updatedOn: '2026-10-12' },
        { city: '广州', hospital: 'XX 医院肿瘤内科', contact: '研究医生（演示）', status: 'open', updatedOn: '2026-10-12' }
      ],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的胆道癌（含胆囊癌）', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'prior_tx', text: '一线系统治疗后影像提示进展', field: 'recurrent', op: 'eq', value: 'true', hard: true },
        { kind: 'include', category: 'prior_tx', text: '既往系统治疗线数 ≤ 2', field: 'prior_systemic', op: 'lte', value: '2', hard: true },
        { kind: 'include', category: 'organ', text: '总胆红素 ≤ 2 × 本中心参考上限', field: 'tb_uln', op: 'lte', value: '2', hard: true },
        { kind: 'include', category: 'performance', text: 'ECOG 0–2', field: 'ecog', op: 'lte', value: '2', hard: true }
      ],
      updates: [
        { on: '2026-10-05', kind: 'criteria_change', text: '方案 v2：既往治疗线数上限由 1 改为 2', from: '≤ 1 线', to: '≤ 2 线', source: '方案修订（演示）' },
        { on: '2026-10-12', kind: 'site_update', text: '新增广州中心', from: '', to: '广州 · 开放', source: '注册平台（演示）' }
      ]
    },
    {
      id: 'BTC-OBS-01',
      registry: 'DEMO-BTC-OBS-01',
      source: 'demo',
      title: '胆道癌术后随访登记研究（观察性）',
      short: '术后随访登记',
      phase: '—',
      status: 'recruiting',
      scope: 'registry',
      subtypes: ALL,
      biomarker: null,
      requiresBiopsy: false,
      placebo: false,
      sponsor: '（演示）某医院肝胆胰中心',
      summary: '不改变治疗，只按常规复查节点登记影像、化验与治疗信息。',
      updatedOn: '2026-07-15',
      verifiedOn: '2026-07-20',
      deadline: '2029-12-31',
      url: 'https://example.org/DEMO-BTC-OBS-01',
      sites: [{ city: '上海', hospital: 'XX 医院肝胆胰外科', contact: '随访专员（演示）', status: 'open', updatedOn: '2026-07-15' }],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的胆道癌', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'resectability', text: '已完成根治性手术', field: 'resected_ever', op: 'eq', value: 'true', hard: true },
        { kind: 'include', category: 'age', text: '年龄 ≥ 18 岁', field: 'age', op: 'gte', value: '18', hard: true },
        { kind: 'include', category: 'other', text: '能按常规复查节点提供资料', field: '', op: '', value: '', hard: false }
      ],
      updates: [
        { on: '2026-07-20', kind: 'note', text: '登记研究不提供试验药物，也不改变随访方案', from: '', to: '', source: '中心说明（演示）' }
      ]
    },
    {
      id: 'BTC-CLDN-01',
      registry: 'DEMO-BTC-CLDN-01',
      source: 'demo',
      title: 'CLDN18.2 阳性胆道癌 ADC 治疗（II 期）',
      short: 'CLDN18.2 · ADC',
      phase: 'II',
      status: 'not_yet_recruiting',
      scope: 'advanced_2l',
      subtypes: ALL,
      biomarker: { gene: 'CLDN18', alt: 'IHC ≥ 75%' },
      requiresBiopsy: true,
      placebo: false,
      sponsor: '（演示）某生物制药',
      summary: '需近期活检标本做 CLDN18.2 IHC 中央检测。',
      updatedOn: '2026-10-16',
      verifiedOn: '2026-10-18',
      deadline: '2028-01-31',
      url: 'https://example.org/DEMO-BTC-CLDN-01',
      sites: [{ city: '上海', hospital: 'XX 医院肿瘤内科', contact: '研究医生（演示）', status: 'planned', updatedOn: '2026-10-16' }],
      criteria: [
        { kind: 'include', category: 'subtype', text: '病理确诊的胆道癌', field: 'subtype', op: 'in', value: ALL, hard: true },
        { kind: 'include', category: 'genomic', text: 'CLDN18.2 IHC ≥ 75%（中央实验室）', field: 'gene:CLDN18', op: 'positive', value: 'IHC≥75%', hard: true },
        { kind: 'include', category: 'prior_tx', text: '既往至少 1 线系统治疗', field: 'prior_systemic', op: 'gte', value: '1', hard: true },
        { kind: 'include', category: 'other', text: '同意重新活检（存档标本不足时）', field: 'biopsy_ok', op: 'eq', value: 'true', hard: true }
      ],
      updates: [
        { on: '2026-10-16', kind: 'status_change', text: '状态由「未开始招募」改为「即将招募」', from: '未开始招募', to: '即将招募', source: '注册平台（演示）' }
      ]
    }
  ];

  const saved = {
    p1: [
      { trialId: 'BTC-ADJ-01', savedOn: '2026-09-28', state: 'watching', note: '术后辅助方案，等下次门诊问研究护士是否还招' },
      { trialId: 'BTC-KRAS-01', savedOn: '2026-10-09', state: 'asking', note: 'KRAS 报告里没有这一项，先问能不能补测' }
    ],
    p2: [
      { trialId: 'BTC-2L-01', savedOn: '2026-10-02', state: 'watching', note: '10-20 门诊带着这条去问' },
      { trialId: 'BTC-HER2-01', savedOn: '2026-09-25', state: 'archived', note: 'HER2 阴性，医生说不适用；保留记录，不再跟' },
      { trialId: 'BTC-KRAS-01', savedOn: '2026-10-12', state: 'asking', note: '想确认 KRAS 没测过能不能入组' }
    ]
  };

  return { trials: trials.map(t), saved };
}
