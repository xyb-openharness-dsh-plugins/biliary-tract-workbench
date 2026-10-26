// 小胆宝 BiliPal · 演示数据唯一来源
// 规则：被 import 时只导出纯数据，不碰磁盘；直接执行时才写 demo/demo-data.sqlite 与 demo/demo-data.json。
// 全部为合成数据，不含任何真实患者信息。日期窗口：2026-04 至 2026-10。
//
// 两套档案是刻意选的，覆盖两条主路径：
//   p1 肝门部胆管癌 · 带 PTCD 减黄 → 限期手术 → 术后辅助     （A 轴压力最大的一段）
//   p2 胆囊癌术后 · 辅助化疗 → 影像提示复发                  （B 轴为主，无引流）
//
// 每套都必须能演示三件事：
//   ① 分型被更正过（p1 外院报「肝内」→ MDT 更正「肝门部」）——版本链不是摆设
//   ② 可切除性变过（p1 不可切除 → 临界 → 可切除；p2 可切除 → 复发后不可切除）
//   ③ 至少一个「未检测」而不是「阴性」（p1 KRAS tested=0）

const DAY = 86400000;

import { buildDemoTrials } from './trials-catalog.mjs';

export function buildDemoProfiles() {
  return [
    // ---------------------------------------------------------------------
    // p1 · 肝门部胆管癌，带 PTCD 减黄后手术
    // ---------------------------------------------------------------------
    {
      id: 'p1',
      name: '周慧兰',
      initial: '周',
      age: 62,
      sex: 'F',
      tag: '肝门部 · PTCD 减黄后手术 · 术后辅助',
      summary:
        '无痛性黄疸起病，外院 MRI 初报「肝内胆管癌可能」，MDT 结合 MRCP 与胆管受侵范围更正为肝门部胆管癌（Bismuth-Corlette IIIb）。' +
        'PTCD 减黄 6 周后总胆红素从 286 降到 28，重评由不可切除改为可切除，6 月行右半肝 + 尾状叶切除 + 胆管切除 + 胆肠吻合。' +
        '术后 7 月起卡培他滨辅助化疗，9 月首次术后复查未见复发。',
      subtype: [
        { subtype: 'icc', statedBy: '外院影像科 MRI 报告', statedOn: '2026-04-06', basis: '「肝内胆管扩张伴肝内占位」', current: false },
        { subtype: 'pcc', statedBy: 'XX 医院肝胆胰 MDT', statedOn: '2026-04-14', basis: 'MRCP 示肝门部胆管截断、Bismuth-Corlette IIIb，肝内病灶为继发扩张', current: true }
      ],
      // 化验单自带参考范围。×ULN 型指标必须用它，不借成人通用上限（M1）。
      labRef: { totalBilirubinHigh: 21, directBilirubinHigh: 8, alpHigh: 125, ggtHigh: 60, altHigh: 40, astHigh: 40, albuminLow: 40, ca19_9High: 37 },
      stage: [
        { system: 'AJCC8', stage: 'IIIB', statedBy: 'XX 医院肝胆胰 MDT', statedOn: '2026-05-28', basis: '肿瘤侵及门静脉分支、区域淋巴结阳性（影像）', current: true }
      ],
      resectability: [
        { conclusion: 'unresectable', context: 'initial', statedBy: 'XX 医院肝胆胰 MDT', statedOn: '2026-04-14', basis: '总胆红素 286 μmol/L、FLR 不足、需先减黄', flr: '未来残肝 34%', current: false },
        { conclusion: 'borderline', context: 'post_drainage', statedBy: 'XX 医院肝胆胰 MDT', statedOn: '2026-05-28', basis: '减黄后总胆红素 42 μmol/L，门静脉右支受累但可重建', flr: '未来残肝 41%', current: false },
        { conclusion: 'resectable', context: 'preop', statedBy: 'XX 医院肝胆胰 MDT', statedOn: '2026-06-16', basis: 'FLR 44%、无肝外转移、体能可耐受', flr: '未来残肝 44%', current: true }
      ],
      // A 轴：梗阻与黄疸
      labs: [
        { on: '2026-04-06', tb: 286, db: 198, alp: 682, ggt: 918, alt: 96, ast: 88, alb: 36, ca199: 412, cea: 3.2, wbc: 7.8, crp: 12, state: 'reported' },
        { on: '2026-04-20', tb: 148, db: 102, alp: 540, ggt: 612, alt: 72, ast: 66, alb: 35, ca199: 386, cea: 3.0, wbc: 8.4, crp: 18, state: 'reported' },
        { on: '2026-05-08', tb: 62, db: 41, alp: 388, ggt: 402, alt: 48, ast: 44, alb: 37, ca199: 244, cea: 2.8, wbc: 6.9, crp: 6, state: 'reported' },
        // 05-02 有过一次发热，当天只测了血常规与 CRP，肝功没做 —— 用 partial 表达，不拿 NULL 冒充正常
        { on: '2026-05-02', tb: null, db: null, alp: null, ggt: null, alt: null, ast: null, alb: null, ca199: null, cea: null, wbc: 13.6, crp: 62, state: 'partial' },
        { on: '2026-05-28', tb: 42, db: 27, alp: 302, ggt: 318, alt: 36, ast: 33, alb: 38, ca199: 168, cea: 2.6, wbc: 6.2, crp: 4, state: 'reported' },
        { on: '2026-06-16', tb: 28, db: 18, alp: 246, ggt: 244, alt: 31, ast: 29, alb: 39, ca199: 122, cea: 2.5, wbc: 5.8, crp: 3, state: 'reported' },
        { on: '2026-07-20', tb: 34, db: 22, alp: 288, ggt: 296, alt: 58, ast: 52, alb: 34, ca199: 96, cea: 2.4, wbc: 6.5, crp: 8, state: 'reported' },
        { on: '2026-08-24', tb: 22, db: 14, alp: 198, ggt: 176, alt: 42, ast: 38, alb: 36, ca199: 48, cea: 2.2, wbc: 5.4, crp: 3, state: 'reported' },
        { on: '2026-09-15', tb: 19, db: 12, alp: 168, ggt: 142, alt: 34, ast: 30, alb: 38, ca199: 22, cea: 2.0, wbc: 5.1, crp: 2, state: 'reported' },
        { on: '2026-10-12', tb: 17, db: 11, alp: 152, ggt: 128, alt: 30, ast: 27, alb: 39, ca199: 18, cea: 1.9, wbc: 5.0, crp: 2, state: 'reported' }
      ],
      // 置管是事件，不是属性：置入 → 换管 → 拔除，三次各一行
      drainageDevices: [
        { kind: 'ptcd', side: 'right', insertedOn: '2026-04-10', removedOn: '2026-04-24', event: 'insert', hospital: 'XX 医院介入科', note: '8.5F 外引流' },
        { kind: 'ptcd', side: 'right', insertedOn: '2026-04-24', removedOn: '2026-06-22', event: 'exchange', hospital: 'XX 医院介入科', note: '换 8.5F，梗阻减轻' },
        { kind: 'ptcd', side: 'right', insertedOn: '2026-06-22', removedOn: '2026-06-22', event: 'remove', hospital: 'XX 医院肝胆胰外科', note: '术前拔管' }
      ],
      // 每日引流量：只抽样 12 天（真实使用是天天记，演示不必铺满 60 天）
      drainageLogs: [
        { dev: 1, on: '2026-04-10', ml: 380, color: 'dark', patency: 'flowing' },
        { dev: 1, on: '2026-04-12', ml: 620, color: 'dark', patency: 'flowing' },
        { dev: 1, on: '2026-04-15', ml: 540, color: 'brown', patency: 'flowing' },
        { dev: 1, on: '2026-04-18', ml: 460, color: 'golden', patency: 'flowing' },
        { dev: 1, on: '2026-04-21', ml: 410, color: 'golden', patency: 'flowing' },
        { dev: 1, on: '2026-04-24', ml: 120, color: 'golden', patency: 'slow', note: '换管当天，量偏少' },
        { dev: 2, on: '2026-04-26', ml: 350, color: 'golden', patency: 'flowing' },
        { dev: 2, on: '2026-05-06', ml: 240, color: 'golden', patency: 'flowing' },
        { dev: 2, on: '2026-05-20', ml: 180, color: 'golden', patency: 'flowing' },
        { dev: 2, on: '2026-06-02', ml: 150, color: 'clear', patency: 'flowing' },
        { dev: 2, on: '2026-06-14', ml: 90, color: 'clear', patency: 'slow', note: '颜色变浅，医生说要复查造影' },
        { dev: 2, on: '2026-06-21', ml: 60, color: 'clear', patency: 'flowing' }
      ],
      // 观察项，不是判断：写「38.9℃、寒战」，不写「胆管炎发作」
      drainageObs: [
        { dev: 2, on: '2026-05-02', kind: 'fever', value: '38.9', severity: 6, action: '当晚去了急诊，医生给了抗生素', note: '先寒战后发热，持续约 4 小时' },
        { dev: 2, on: '2026-05-02', kind: 'chills', value: '', severity: 5, action: '', note: '发热前约 1 小时开始' },
        { dev: 1, on: '2026-04-17', kind: 'dressing_soaked', value: '', severity: 3, action: '自己换了敷料', note: '敷料湿透约 1/3' }
      ],
      tumor: [
        { on: '2026-04-06', modality: 'mri', count: 1, maxMm: 34, node: 'suspected', distant: 'no', vascular: '门静脉右支受压', duct: 'Bismuth-Corlette IIIb', ascites: 'none', lesions: [{ seq: 1, segment: '肝门部', size: 34 }] },
        { on: '2026-05-28', modality: 'mrcp', count: 1, maxMm: 31, node: 'suspected', distant: 'no', vascular: '门静脉右支受累', duct: 'Bismuth-Corlette IIIb', ascites: 'none', lesions: [] },
        { on: '2026-06-16', modality: 'ct', count: 1, maxMm: 29, node: 'no', distant: 'no', vascular: '可重建', duct: 'Bismuth-Corlette IIIb', ascites: 'none', lesions: [] },
        { on: '2026-09-15', modality: 'ct', count: 0, maxMm: null, node: 'no', distant: 'no', vascular: '术后改变', duct: '', ascites: 'none', lesions: [] }
      ],
      treatments: [
        { modality: 'resection', intent: 'curative', line: null, regimen: '右半肝 + 尾状叶切除 + 肝外胆管切除 + 胆肠吻合（R0）', startedOn: '2026-06-24', endedOn: '2026-06-24', cyclesPlanned: null, cyclesDone: null, response: '术后病理：中分化腺癌，切缘阴性，淋巴结 1/7 阳性（医生记录）', stopReason: '', institution: 'XX 医院肝胆胰外科' },
        { modality: 'systemic', intent: 'adjuvant', line: 1, regimen: '卡培他滨单药', startedOn: '2026-07-20', endedOn: '', cyclesPlanned: 8, cyclesDone: 4, response: '术后辅助，按计划进行（医生记录）', stopReason: '', institution: 'XX 医院肿瘤内科' },
        { modality: 'stent_palliative', intent: 'palliative', line: null, regimen: 'PTCD 外引流（减黄）', startedOn: '2026-04-10', endedOn: '2026-06-22', cyclesPlanned: null, cyclesDone: null, response: '总胆红素 286 → 28 μmol/L', stopReason: '术前拔管', institution: 'XX 医院介入科' }
      ],
      // 三态：KRAS 这一行是 tested=0（压根没测），不是「阴性」
      genomics: {
        test: { on: '2026-07-10', platform: 'tissue_ngs', lab: 'XX 医院病理科分子室', note: '手术标本' },
        results: [
          { gene: 'FGFR2', alteration: 'fusion', tested: 1, result: 'negative', value: '', raw: 'FGFR2 融合：未检出' },
          { gene: 'IDH1', alteration: 'R132', tested: 1, result: 'negative', value: '', raw: 'IDH1 R132：野生型' },
          { gene: 'HER2', alteration: 'amplification', tested: 1, result: 'negative', value: '', raw: 'HER2 扩增：阴性' },
          { gene: 'MSI', alteration: '', tested: 1, result: 'negative', value: '', raw: 'MSI：稳定（MSS）' },
          { gene: 'TMB', alteration: '', tested: 1, result: 'negative', value: '3.1 mut/Mb', raw: 'TMB：3.1 mut/Mb（低）' },
          { gene: 'KRAS', alteration: '', tested: 0, result: null, value: '', raw: '报告未包含该位点' }
        ]
      },
      safety: [
        { kind: 'cholangitis', onsetOn: '2026-05-02', resolvedOn: '2026-05-05', grade: '2 级（医生记录）', desc: '寒战、发热 38.9℃，引流液浑浊', action: '急诊留观，静脉抗生素 3 天', dev: 2 },
        { kind: 'liver_toxicity', onsetOn: '2026-07-20', resolvedOn: '2026-08-10', grade: '1 级（医生记录）', desc: 'ALT 58 U/L、AST 52 U/L', action: '按肿瘤内科交代观察，未停药' }
      ],
      symptoms: [
        { on: '2026-04-06', symptom: '皮肤瘙痒', severity: 6, note: '夜间明显' },
        { on: '2026-05-20', symptom: '皮肤瘙痒', severity: 2, note: '减黄后减轻' }
      ],
      body: [
        { on: '2026-04-06', weight: 54.2, appetite: 'fair' },
        { on: '2026-06-16', weight: 52.8, appetite: 'fair' },
        { on: '2026-08-24', weight: 50.4, appetite: 'poor' },
        { on: '2026-10-12', weight: 51.6, appetite: 'fair' }
      ],
      visits: [
        { on: '2026-04-14', dept: '肝胆胰 MDT', purpose: '定分型与减黄方案', summary: '更正为肝门部胆管癌，先做 PTCD 减黄 4–6 周再评估', next: '2026-05-28' },
        { on: '2026-05-28', dept: '肝胆胰 MDT', purpose: '减黄后重评可切除性', summary: '改为临界可切除，继续减黄', next: '2026-06-16' },
        { on: '2026-06-16', dept: '肝胆胰外科', purpose: '术前评估', summary: '定为可切除，排手术', next: '2026-06-24' },
        { on: '2026-09-15', dept: '肿瘤内科', purpose: '术后首次复查', summary: '影像未见复发，继续辅助化疗', next: '2026-12-15' },
        { on: '2026-12-15', dept: '肿瘤内科', purpose: '辅助化疗第 5 周期前复查', summary: '', next: '', planned: true }
      ],
      questions: [
        { on: '2026-09-10', body: '辅助化疗要做满 8 个周期吗？中途白细胞低怎么办？', forVisit: '2026-09-15', answered: '医生说按计划做，白细胞低于标准会调整' },
        { on: '2026-12-01', body: '这次复查要查哪些项目？需要空腹吗？', forVisit: '2026-12-15', answered: '' },
        { on: '2026-12-01', body: '引流管拔掉之后，扎的口子一直有点渗液，正常吗？', forVisit: '2026-12-15', answered: '' }
      ],
      tasks: [
        { title: '复查前空腹抽血', dueOn: '2026-12-15', kind: 'test' },
        { title: '带上 9 月的 CT 报告', dueOn: '2026-12-15', kind: 'visit' }
      ],
      viewpoints: [
        { on: '2026-05-02', topic: '发热那天', body: '急诊医生说是引流管引起的感染，我当时以为是感冒。以后发烧先看引流液。', source: 'self' },
        { on: '2026-08-24', topic: '体重', body: '吃不下，两个月掉了 2 公斤多，不知道算不算严重。', source: 'caregiver' }
      ],
      // 方案依据（U5 的落点）：只存医生原话 + 当时看了哪几个指标。
      // guideline 刻意留空 = 没拿到带页码原件，界面显示「未引入」。
      decisions: [
        { on: '2026-06-16', topic: '要不要做右半肝切除', reason: '残肝 44%、没有肝外转移、体力能耐受，可以按期做', statedBy: 'XX 医院肝胆胰 MDT', source: 'self', metrics: [['bilirubin_total', '2026-06-16'], ['albumin', '2026-06-16']] },
        { on: '2026-07-20', topic: '术后要不要做辅助化疗', reason: '淋巴结 1/7 阳性，按辅助化疗讨论，用卡培他滨单药', statedBy: 'XX 医院肿瘤内科', source: 'caregiver', metrics: [] }
      ],
      flags: [
        { metric: 'ca19_9', on: '2026-10-12', kind: 'value_question', note: '这次比 9 月又低了 4，是好事还是正常波动？' }
      ],
      // 报告清单（U6）：summary_line 一律原文抄录，不改写；feeds_trend 表示这份的值有没有进趋势
      docs: [
        { title: '血生化 + 肿瘤标志物', kind: 'lab', on: '2026-04-06', by: '外院门诊', line: 'TBIL 286 μmol/L，ALP 682 U/L，CA19-9 412 U/mL', trend: 1 },
        { title: '上腹部 MRI（含 MRCP）', kind: 'imaging', on: '2026-04-06', by: '外院影像科', line: '肝门部占位，肝内胆管扩张，考虑胆道来源', trend: 0 },
        { title: '手术病理报告', kind: 'pathology', on: '2026-06-30', by: 'XX 医院病理科', line: '中分化腺癌，切缘阴性，淋巴结 1/7 阳性', trend: 0 },
        { title: '出院小结', kind: 'discharge', on: '2026-07-02', by: 'XX 医院肝胆胰外科', line: '术后第 8 天出院，切口愈合良好，嘱 1 个月后门诊', trend: 0 },
        { title: '术后复查化验', kind: 'lab', on: '2026-09-15', by: 'XX 医院检验科', line: 'TBIL 19 μmol/L，CA19-9 22 U/mL', trend: 1 }
      ]
    },

    // ---------------------------------------------------------------------
    // p2 · 胆囊癌术后，辅助化疗，影像提示复发
    // ---------------------------------------------------------------------
    {
      id: 'p2',
      name: '郭长林',
      initial: '郭',
      age: 67,
      sex: 'M',
      tag: '胆囊癌术后 · 辅助化疗 · 影像提示复发',
      summary:
        '胆囊结石行胆囊切除，术后病理意外发现胆囊癌（pT3N1M0）。术后 5 月起卡培他滨辅助化疗。' +
        '9 月复查 CT 见肝内新发结节，可切除性由「已切除」改为「不可切除（复发）」，目前讨论下一步方案。全程无胆道引流，主诉是化疗后的乏力和食欲。',
      subtype: [
        { subtype: 'gbc', statedBy: 'XX 医院病理科', statedOn: '2026-04-03', basis: '术后病理：胆囊腺癌，侵透肌层至浆膜下', current: true }
      ],
      labRef: { totalBilirubinHigh: 23, directBilirubinHigh: 7, alpHigh: 120, ggtHigh: 55, altHigh: 45, astHigh: 40, albuminLow: 40, ca19_9High: 37 },
      stage: [
        { system: 'AJCC8', stage: 'IIIB', statedBy: 'XX 医院肿瘤内科', statedOn: '2026-05-06', basis: 'pT3N1M0（病理）', current: true }
      ],
      resectability: [
        { conclusion: 'resectable', context: 'initial', statedBy: 'XX 医院肝胆胰外科', statedOn: '2026-04-03', basis: '术中已行胆囊癌根治（胆囊床切除 + 淋巴结清扫）', flr: '', current: false },
        { conclusion: 'unresectable', context: 'post_treatment', statedBy: 'XX 医院肿瘤内科', statedOn: '2026-09-22', basis: '肝内新发两枚结节，考虑转移，不适合再次手术', flr: '', current: true }
      ],
      labs: [
        { on: '2026-05-06', tb: 14, db: 8, alp: 96, ggt: 78, alt: 38, ast: 34, alb: 41, ca199: 18, cea: 2.1, wbc: 6.4, crp: 3, state: 'reported' },
        { on: '2026-06-08', tb: 12, db: 7, alp: 88, ggt: 62, alt: 42, ast: 36, alb: 40, ca199: 15, cea: 2.0, wbc: 5.2, crp: 2, state: 'reported' },
        { on: '2026-07-06', tb: 13, db: 8, alp: 102, ggt: 70, alt: 46, ast: 39, alb: 39, ca199: 21, cea: 2.3, wbc: 4.6, crp: 3, state: 'reported' },
        { on: '2026-08-10', tb: 15, db: 9, alp: 118, ggt: 84, alt: 44, ast: 38, alb: 38, ca199: 34, cea: 2.6, wbc: 4.2, crp: 4, state: 'reported' },
        { on: '2026-09-22', tb: 19, db: 11, alp: 156, ggt: 112, alt: 40, ast: 35, alb: 37, ca199: 96, cea: 3.8, wbc: 4.8, crp: 6, state: 'reported' },
        // 10 月只查了肿瘤标志物，肝功待下次门诊
        { on: '2026-10-14', tb: null, db: null, alp: null, ggt: null, alt: null, ast: null, alb: null, ca199: 142, cea: 4.4, wbc: 5.0, crp: 5, state: 'partial' }
      ],
      drainageDevices: [],
      drainageLogs: [],
      drainageObs: [],
      tumor: [
        { on: '2026-04-03', modality: 'pathology', count: 1, maxMm: 42, node: 'yes', distant: 'no', vascular: '侵及浆膜下', duct: '', ascites: 'none', lesions: [] },
        { on: '2026-06-10', modality: 'ct', count: 0, maxMm: null, node: 'no', distant: 'no', vascular: '术后改变', duct: '', ascites: 'none', lesions: [] },
        { on: '2026-09-22', modality: 'mri', count: 2, maxMm: 18, node: 'no', distant: 'no', vascular: '无', duct: '', ascites: 'none', lesions: [{ seq: 1, segment: 'S6', size: 18 }, { seq: 2, segment: 'S7', size: 11 }] }
      ],
      treatments: [
        { modality: 'resection', intent: 'curative', line: null, regimen: '胆囊癌根治术（胆囊床切除 + 肝十二指肠韧带淋巴结清扫）', startedOn: '2026-04-03', endedOn: '2026-04-03', cyclesPlanned: null, cyclesDone: null, response: '术后病理：pT3N1M0，切缘阴性（医生记录）', stopReason: '', institution: 'XX 医院肝胆胰外科' },
        { modality: 'systemic', intent: 'adjuvant', line: 1, regimen: '卡培他滨单药', startedOn: '2026-05-06', endedOn: '2026-09-22', cyclesPlanned: 8, cyclesDone: 4, response: '9 月影像提示肝内新发结节（医生记录）', stopReason: '影像提示复发，转方案讨论', institution: 'XX 医院肿瘤内科' },
        { modality: 'systemic', intent: 'palliative', line: 2, regimen: '待定（10-20 门诊讨论）', startedOn: '', endedOn: '', cyclesPlanned: null, cyclesDone: null, response: '', stopReason: '', institution: '' }
      ],
      genomics: {
        test: { on: '2026-04-20', platform: 'tissue_ngs', lab: 'XX 医院病理科分子室', note: '胆囊癌根治标本' },
        results: [
          { gene: 'HER2', alteration: 'amplification', tested: 1, result: 'negative', value: 'IHC 2+ / FISH 阴性', raw: 'HER2：IHC 2+，FISH 未扩增' },
          { gene: 'MSI', alteration: '', tested: 1, result: 'negative', value: '', raw: 'MSI：稳定（MSS）' },
          { gene: 'MMR', alteration: '', tested: 1, result: 'positive', value: '', raw: 'MMR：蛋白表达完整（pMMR）' },
          { gene: 'TMB', alteration: '', tested: 1, result: 'negative', value: '4.2 mut/Mb', raw: 'TMB：4.2 mut/Mb（低）' },
          { gene: 'FGFR2', alteration: 'fusion', tested: 0, result: null, value: '', raw: '报告未包含该位点' }
        ]
      },
      safety: [
        { kind: 'neuropathy', onsetOn: '2026-07-06', resolvedOn: '', grade: '1 级（医生记录）', desc: '手指末端麻木，不影响持物', action: '按肿瘤内科交代观察' },
        { kind: 'other', onsetOn: '2026-08-10', resolvedOn: '', grade: '1 级（医生记录）', desc: '乏力、食欲下降', action: '记录饮食，未用药' }
      ],
      symptoms: [
        { on: '2026-08-10', symptom: '乏力', severity: 5, note: '下午明显' },
        { on: '2026-09-22', symptom: '右上腹隐痛', severity: 3, note: '持续约两周' }
      ],
      body: [
        { on: '2026-05-06', weight: 68.5, appetite: 'good' },
        { on: '2026-07-06', weight: 66.2, appetite: 'fair' },
        { on: '2026-09-22', weight: 64.0, appetite: 'poor' },
        { on: '2026-10-14', weight: 63.1, appetite: 'poor' }
      ],
      visits: [
        { on: '2026-05-06', dept: '肿瘤内科', purpose: '术后辅助方案', summary: '卡培他滨单药 8 周期', next: '2026-09-22' },
        { on: '2026-09-22', dept: '肿瘤内科', purpose: '复查', summary: '肝内新发结节，考虑复发，10-20 再讨论方案', next: '2026-10-20' },
        { on: '2026-10-20', dept: '肿瘤内科', purpose: '下一步方案讨论', summary: '', next: '', planned: true }
      ],
      questions: [
        { on: '2026-09-25', body: '肝上那两个结节一定是转移吗？要不要做 PET 确认？', forVisit: '2026-10-20', answered: '' },
        { on: '2026-10-10', body: '如果要换方案，之前的卡培他滨算第一线还是辅助治疗？', forVisit: '2026-10-20', answered: '' },
        { on: '2026-10-10', body: '现在这个体重掉得算快吗？要不要看营养门诊？', forVisit: '2026-10-20', answered: '' }
      ],
      tasks: [
        { title: '整理 4 月的手术病理报告', dueOn: '2026-10-20', kind: 'visit' },
        { title: '记录一周饮食与体重', dueOn: '2026-10-19', kind: 'other' }
      ],
      viewpoints: [
        { on: '2026-09-22', topic: '复发', body: '医生说影像上像转移，但没说是几期。我最想知道还能不能手术。', source: 'self' },
        { on: '2026-10-01', topic: '体重', body: '他自己不觉得瘦，是裤腰松了才发现。', source: 'caregiver' }
      ],
      decisions: [
        { on: '2026-09-22', topic: '影像提示复发后的处理', reason: '肝上两枚新发结节，考虑转移，不适合再做手术，先讨论下一步方案', statedBy: 'XX 医院肿瘤内科', source: 'caregiver', metrics: [['ca19_9', '2026-09-22'], ['cea', '2026-09-22']] }
      ],
      flags: [
        { metric: 'ca19_9', on: '2026-10-14', kind: 'value_question', note: '从 96 涨到 142，这说明什么？' }
      ],
      docs: [
        { title: '胆囊切除标本病理', kind: 'pathology', on: '2026-04-03', by: 'XX 医院病理科', line: '胆囊腺癌，侵透肌层至浆膜下，pT3N1M0', trend: 0 },
        { title: '分子检测报告', kind: 'pathology', on: '2026-04-20', by: 'XX 医院病理科分子室', line: 'HER2 IHC 2+/FISH 未扩增，MSS，TMB 4.2 mut/Mb', trend: 0 },
        { title: '上腹部 MRI 增强', kind: 'imaging', on: '2026-09-22', by: 'XX 医院影像科', line: '肝内新发两枚结节（S6 18 mm，S7 11 mm）', trend: 0 },
        { title: '肿瘤标志物', kind: 'lab', on: '2026-10-14', by: 'XX 医院检验科', line: 'CA19-9 142 U/mL，CEA 4.4 ng/mL', trend: 1 }
      ]
    }
  ];
}

// ===========================================================================
// 以下只在直接执行时运行
// ===========================================================================
async function main() {
  const { DatabaseSync } = await import('node:sqlite');
  const { readFileSync, writeFileSync, readdirSync, unlinkSync } = await import('node:fs');
  const { createHash } = await import('node:crypto');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const profiles = buildDemoProfiles();
  const { trials, saved } = buildDemoTrials();
  const now = '2026-10-24T00:00:00+08:00';

  // 1) 纯数据 JSON（给原型 / 单测用，不依赖 sqlite）
  writeFileSync(
    join(root, 'demo/demo-data.json'),
    JSON.stringify({ generatedAt: '2026-10-24', trials, profiles }, null, 2) + '\n'
  );

  // 2) 演示库：迁移必须按目录顺序全跑，不硬编码文件名
  const dbPath = join(root, 'demo/demo-data.sqlite');
  try { unlinkSync(dbPath); } catch {}
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`CREATE TABLE IF NOT EXISTS _migration (
    name TEXT PRIMARY KEY, sha256 TEXT NOT NULL, applied_at TEXT NOT NULL)`);
  for (const name of readdirSync(join(root, 'schema')).filter((f) => /^\d{4}_.+\.sql$/.test(f)).sort()) {
    const buf = readFileSync(join(root, 'schema', name));
    db.exec(buf.toString('utf8'));
    db.prepare('INSERT INTO _migration (name, sha256, applied_at) VALUES (?, ?, ?)')
      .run(name, createHash('sha256').update(buf).digest('hex'), now);
  }

  db.prepare('INSERT INTO workspace (id, root_path, created_at, updated_at) VALUES (1, NULL, ?, ?)').run(now, now);

  const insProfile = db.prepare('INSERT INTO profile (id,name,initial,age,sex,tag,is_demo,created_at) VALUES (?,?,?,?,?,?,1,?)');
  const insSubtype = db.prepare('INSERT INTO subtype_assertion (profile_id,subtype,stated_by,stated_on,basis,is_current,created_at) VALUES (?,?,?,?,?,?,?)');
  const insStage = db.prepare('INSERT INTO stage_assertion (profile_id,system,stage,stated_by,stated_on,basis,is_current,created_at) VALUES (?,?,?,?,?,?,?,?)');
  const insResect = db.prepare('INSERT INTO resectability_assertion (profile_id,conclusion,context,stated_by,stated_on,basis,flr_note,is_current,created_at) VALUES (?,?,?,?,?,?,?,?,?)');
  const insLab = db.prepare(`INSERT INTO jaundice_lab (profile_id,measured_on,total_bilirubin,direct_bilirubin,alp_u_l,ggt_u_l,alt_u_l,ast_u_l,albumin_g_l,ca19_9_u_ml,cea_ng_ml,wbc_1e9_l,crp_mg_l,result_state,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insRef = db.prepare('INSERT INTO lab_ref (lab_id,metric_id,ref_high,needs_uln,created_at) VALUES (?,?,?,0,?)');
  const insDev = db.prepare(`INSERT INTO drainage_device (profile_id,kind,side,inserted_on,removed_on,event,hospital,indwelling_note,exchanges_id,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const insDrain = db.prepare(`INSERT INTO drainage_log (profile_id,device_id,recorded_on,volume_ml,color,patency,note,created_at)
    VALUES (?,?,?,?,?,?,?,?)`);
  const insDrainObs = db.prepare(`INSERT INTO drainage_observation (profile_id,device_id,observed_on,kind,value_text,severity,action_taken,note,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)`);
  const insTumor = db.prepare(`INSERT INTO tumor_assessment (profile_id,assessed_on,modality,lesion_count,max_diameter_mm,lymph_node,distant_met,vascular_invasion,bile_duct_extent,ascites,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const insLesion = db.prepare('INSERT INTO tumor_lesion (assessment_id,seq,segment,size_mm) VALUES (?,?,?,?)');
  const insTx = db.prepare(`INSERT INTO treatment_event (profile_id,modality,intent,line_no,regimen,started_on,ended_on,cycles_planned,cycles_done,response,stop_reason,institution,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insGTest = db.prepare('INSERT INTO genomic_test (profile_id,tested_on,platform,lab,note,created_at) VALUES (?,?,?,?,?,?)');
  const insGRes = db.prepare('INSERT INTO genomic_result (test_id,gene,alteration,tested,result,value_text,raw_text,created_at) VALUES (?,?,?,?,?,?,?,?)');
  const insSafety = db.prepare(`INSERT INTO safety_event (profile_id,kind,onset_on,resolved_on,grade,description,action_recorded,related_dev_id,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)`);
  const insSymptom = db.prepare('INSERT INTO symptom_record (profile_id,recorded_on,symptom,severity,note,created_at) VALUES (?,?,?,?,?,?)');
  const insBody = db.prepare('INSERT INTO body_record (profile_id,recorded_on,weight_kg,appetite,created_at) VALUES (?,?,?,?,?)');
  const insVisit = db.prepare('INSERT INTO visit (profile_id,visited_on,department,purpose,summary,next_on,planned,created_at) VALUES (?,?,?,?,?,?,?,?)');
  const insQuestion = db.prepare('INSERT INTO question (profile_id,created_on,body,for_visit_id,answered,created_at) VALUES (?,?,?,?,?,?)');
  const insTask = db.prepare('INSERT INTO task (profile_id,title,due_on,kind,created_at) VALUES (?,?,?,?,?)');
  const insViewpoint = db.prepare('INSERT INTO viewpoint (profile_id,recorded_on,topic,body,source,created_at) VALUES (?,?,?,?,?,?)');
  const insDecision = db.prepare('INSERT INTO decision_record (profile_id,discussed_on,topic,doctor_reason,stated_by,source,guideline_id,created_at) VALUES (?,?,?,?,?,?,NULL,?)');
  const insDecisionMetric = db.prepare('INSERT INTO decision_metric (decision_id,metric_id,measured_on) VALUES (?,?,?)');
  const insFlag = db.prepare('INSERT INTO reading_flag (profile_id,metric_id,measured_on,kind,note,created_at) VALUES (?,?,?,?,?,?)');
  const insDoc = db.prepare(`INSERT INTO document (profile_id,title,kind,doc_date,issued_by,summary_line,feeds_trend,status,uploaded_at)
    VALUES (?,?,?,?,?,?,?,'parsed',?)`);
  const insTrial = db.prepare(`INSERT INTO trial (id,registry_id,source,title,short_title,phase,status,scope,subtypes,
      biomarker_gene,biomarker_alt,requires_biopsy,placebo,sponsor,summary,updated_on,verified_on,deadline,url,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insCrit = db.prepare(`INSERT INTO trial_criterion (trial_id,seq,kind,category,text,field,op,value,hard,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const insSite = db.prepare(`INSERT INTO trial_site (trial_id,city,hospital,contact,status,updated_on,created_at)
    VALUES (?,?,?,?,?,?,?)`);
  const insTrack = db.prepare(`INSERT INTO trial_track_event (trial_id,on_date,kind,text,from_value,to_value,source,created_at)
    VALUES (?,?,?,?,?,?,?,?)`);
  const insSaved = db.prepare(`INSERT INTO trial_saved (profile_id,trial_id,saved_on,state,note,updated_at)
    VALUES (?,?,?,?,?,?)`);

  // 参考区间只给「这张化验单真的测了的指标」登记 —— 没测的指标没有参考区间可言，
  // 登记一堆空区间会让 ×ULN 计算误以为"有上限但值为空"。
  const refMap = {
    p1: [['bilirubin_total', 'tb', 21], ['bilirubin_direct', 'db', 8], ['alp', 'alp', 125], ['ggt', 'ggt', 60], ['alt', 'alt', 40], ['ast', 'ast', 40], ['albumin', 'alb', 40], ['ca19_9', 'ca199', 37]],
    p2: [['bilirubin_total', 'tb', 23], ['bilirubin_direct', 'db', 7], ['alp', 'alp', 120], ['ggt', 'ggt', 55], ['alt', 'alt', 45], ['ast', 'ast', 40], ['albumin', 'alb', 40], ['ca19_9', 'ca199', 37]]
  };

  for (const p of profiles) {
    insProfile.run(p.id, p.name, p.initial, p.age, p.sex, p.tag, now);

    for (const s of p.subtype) insSubtype.run(p.id, s.subtype, s.statedBy, s.statedOn, s.basis, s.current ? 1 : 0, now);
    for (const s of p.stage) insStage.run(p.id, s.system, s.stage, s.statedBy, s.statedOn, s.basis, s.current ? 1 : 0, now);
    for (const r of p.resectability) insResect.run(p.id, r.conclusion, r.context, r.statedBy, r.statedOn, r.basis, r.flr || null, r.current ? 1 : 0, now);

    for (const l of p.labs) {
      const info = insLab.run(p.id, l.on, l.tb, l.db, l.alp, l.ggt, l.alt, l.ast, l.alb, l.ca199, l.cea, l.wbc, l.crp, l.state, now);
      const labId = Number(info.lastInsertRowid);
      for (const [metric, field, high] of refMap[p.id]) {
        if (l[field] === null || l[field] === undefined || l[field] === '') continue;
        insRef.run(labId, metric, high, now);
      }
    }

    const devIds = [];
    for (const d of p.drainageDevices) {
      const prev = d.event === 'exchange' || d.event === 'reinsert' ? devIds[devIds.length - 1] : null;
      const info = insDev.run(p.id, d.kind, d.side, d.insertedOn, d.removedOn, d.event, d.hospital, d.note, prev ?? null, now);
      devIds.push(Number(info.lastInsertRowid));
    }
    for (const g of p.drainageLogs) insDrain.run(p.id, devIds[g.dev - 1], g.on, g.ml, g.color, g.patency, g.note || null, now);
    for (const o of p.drainageObs) insDrainObs.run(p.id, devIds[o.dev - 1], o.on, o.kind, o.value, o.severity, o.action, o.note, now);

    const assessmentIds = [];
    for (const t of p.tumor) {
      const info = insTumor.run(p.id, t.on, t.modality, t.count, t.maxMm, t.node, t.distant, t.vascular, t.duct, t.ascites, now);
      const aid = Number(info.lastInsertRowid);
      assessmentIds.push(aid);
      for (const le of t.lesions) insLesion.run(aid, le.seq, le.segment, le.size);
    }

    for (const t of p.treatments) {
      insTx.run(p.id, t.modality, t.intent, t.line, t.regimen, t.startedOn, t.endedOn, t.cyclesPlanned, t.cyclesDone, t.response, t.stopReason, t.institution, now);
    }

    const gt = insGTest.run(p.id, p.genomics.test.on, p.genomics.test.platform, p.genomics.test.lab, p.genomics.test.note, now);
    const gtId = Number(gt.lastInsertRowid);
    for (const g of p.genomics.results) insGRes.run(gtId, g.gene, g.alteration, g.tested, g.result, g.value, g.raw, now);

    for (const s of p.safety) {
      insSafety.run(p.id, s.kind, s.onsetOn, s.resolvedOn || null, s.grade, s.desc, s.action, s.dev ? devIds[s.dev - 1] : null, now);
    }
    for (const s of p.symptoms) insSymptom.run(p.id, s.on, s.symptom, s.severity, s.note || null, now);
    for (const b of p.body) insBody.run(p.id, b.on, b.weight, b.appetite, now);

    const visitIds = new Map();
    for (const v of p.visits) {
      const info = insVisit.run(p.id, v.on, v.dept, v.purpose, v.summary, v.next || null, v.planned ? 1 : 0, now);
      visitIds.set(v.on, Number(info.lastInsertRowid));
    }
    for (const q of p.questions) insQuestion.run(p.id, q.on, q.body, visitIds.get(q.forVisit) ?? null, q.answered, now);
    for (const t of p.tasks) insTask.run(p.id, t.title, t.dueOn, t.kind, now);
    for (const vp of p.viewpoints) insViewpoint.run(p.id, vp.on, vp.topic, vp.body, vp.source, now);
    // 方案依据：guideline_id 一律 NULL —— 没拿到带页码原件，界面显示「未引入」
    for (const d of p.decisions) {
      const info = insDecision.run(p.id, d.on, d.topic, d.reason, d.statedBy, d.source, now);
      const did = Number(info.lastInsertRowid);
      for (const [metric, on] of d.metrics) insDecisionMetric.run(did, metric, on);
    }
    for (const f of p.flags) insFlag.run(p.id, f.metric, f.on, f.kind, f.note, now);
    for (const d of p.docs) insDoc.run(p.id, d.title, d.kind, d.on, d.by, d.line, d.trend, now);
  }

  // 临床试验条目：全部为合成演示数据（DEMO- 开头），与原型同源
  for (const t of trials) {
    insTrial.run(t.id, t.registry, t.source, t.title, t.short, t.phase, t.status, t.scope,
      (t.subtypes || []).join(','), t.biomarker ? t.biomarker.gene : null, t.biomarker ? t.biomarker.alt : null,
      t.requiresBiopsy ? 1 : 0, t.placebo ? 1 : 0, t.sponsor, t.summary,
      t.updatedOn, t.verifiedOn || null, t.deadline, t.url, now);
    t.criteria.forEach((c, i) => insCrit.run(t.id, i + 1, c.kind, c.category, c.text, c.field || null, c.op || null,
      Array.isArray(c.value) ? c.value.join(',') : (c.value ?? null), c.hard ? 1 : 0, now));
    for (const s of t.sites || []) insSite.run(t.id, s.city, s.hospital, s.contact, s.status, s.updatedOn || null, now);
    for (const u of t.updates || []) insTrack.run(t.id, u.on, u.kind, u.text, u.from || null, u.to || null, u.source || null, now);
  }
  for (const [pid, list] of Object.entries(saved)) {
    for (const s of list) insSaved.run(pid, s.trialId, s.savedOn, s.state, s.note || null, now);
  }

  // 自检：外键、各表行数、关键不变量
  const fk = db.prepare('PRAGMA foreign_key_check').all();
  if (fk.length) {
    console.error('外键检查失败：', fk);
    process.exit(1);
  }
  const count = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  const summary = {};
  for (const t of ['profile', 'subtype_assertion', 'stage_assertion', 'resectability_assertion', 'jaundice_lab', 'lab_ref',
    'drainage_device', 'drainage_log', 'drainage_observation', 'tumor_assessment', 'treatment_event',
    'genomic_test', 'genomic_result', 'safety_event', 'visit', 'question', 'viewpoint',
    'decision_record', 'decision_metric', 'reading_flag', 'document',
    'trial', 'trial_criterion', 'trial_site', 'trial_saved', 'trial_track_event']) {
    summary[t] = count(t);
  }
  // 不变量 1：每套档案只有一条 current 可切除性
  const cur = db.prepare('SELECT profile_id, COUNT(*) AS n FROM resectability_assertion WHERE is_current=1 GROUP BY profile_id').all();
  if (cur.some((r) => r.n !== 1)) { console.error('不变量失败：可切除性 current 不唯一', cur); process.exit(1); }
  // 不变量 2：tested=0 的行 result 必须为空
  const bad = db.prepare('SELECT COUNT(*) AS n FROM genomic_result WHERE tested=0 AND result IS NOT NULL').get().n;
  if (bad) { console.error('不变量失败：未检测被写成结果'); process.exit(1); }

  db.close();
  console.log('演示库已生成：demo/demo-data.sqlite');
  console.log(JSON.stringify(summary, null, 2));
}

if (process.argv[1] && process.argv[1].endsWith('build-demo-data.mjs')) {
  await main();
}
