/* 小胆宝 BiliPal · 疾病概要数据（36 号）
 * 口径：docs/DISEASE-PRIMER.md；规范：starter docs/36-DISEASE-PRIMER.md（v2，含 §2.5 链接硬约束）。
 * 全部内容属第 ② 层（解释）：只写定义、文件、指南列举过的手段、已发生的变化。
 * 任何「你该怎么办」的判断都不在这里，固定出口是「这一句需要问你的医生」。
 *
 * 原件状态照实写：本项目未取得 NCCN / CSCO / AJCC 的任何原件。
 * 项目文档明确「未拿到带页码的原件前不做指南条目」（docs/DEV-REQUIREMENTS-2026-10-24.md M8），
 * 因此下面只写文件存在与版本记录，不引用具体条文，页码一律「页码待核」。
 *
 * §2.5：每一行「是否取得原件」都必须带可点链接——未取得原件的行给 secondaryUrl（出版方页面），
 * 逐条 curl 验证过 200 才写进来（2026-10-27）。项目内文档无法对外链接，标 nolink: true 并在 note 说明。
 */
window.DISEASE_PRIMER = {
  brand: '小胆宝 BiliPal',
  name: '胆道癌',
  en: 'Biliary Tract Cancer（BTC）',
  updated: '2026-10-27',
  sections: [
    {
      id: 'definition',
      title: '定义',
      intro: '胆道癌是发生在胆道系统的一组恶性肿瘤的统称。本项目按解剖部位分成四类记录：'
        + '肝内胆管癌、肝门部胆管癌、远端胆管癌与胆囊癌；同一个「胆道癌」下面，'
        + '部位不同，手术方式、引流路径与随访安排都不同。',
      points: [
        '部位口径：项目用户定义写的是「肝内胆管癌 / 肝门部胆管癌 / 远端胆管癌 / 胆囊癌」四类，不合并成一个病种统计。',
        '分型记录：肝门部按 Bismuth-Corlette 分型记录（演示档案为 IIIb）；这是医生写下的分型原文，本台不改写、不推导。',
        '可切除性：项目明确「可切除性判断随影像与黄疸处理动态变化」，工作台只记录「谁在什么时候说了可切除 / 不可切除」，不自己判断。',
        '两条线并行：梗阻—黄疸（总胆红素、直接胆红素、ALP、GGT、PTCD / ENBD 引流）与肿瘤—治疗（治疗线序、肝功、肿瘤标志物），本项目刻意不把两条线合成一个分数。',
        '病理与分子：档案记录病理类型、分化与基因检测位点（如 FGFR2 融合、IDH1 R132、HER2、MSI-H、KRAS），未检测的位点显示「未检测」而不是阴性。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Biliary Tract Cancers', version: '2.2025（据本项目 docs/SPEC.md 记录）', original: false, secondaryUrl: 'https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml', page: '待核', note: 'NCCN 官网 PDF 需登录；本条链接是 JNCCN 刊出版' },
        { org: '本项目', doc: 'docs/SPEC.md（用户与病种范围、可切除性口径）与 docs/PROTOTYPE-EVIDENCE.md', version: '2026-10-24 版', original: true, nolink: true, page: '不适用（项目文档）', note: '项目内文件，无对外链接' }
      ]
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      intro: '本台没有取得任何一份指南的原件：NCCN 官网 PDF 要登录，CSCO 与 AJCC 是纸书与图书。'
        + 'docs/DEV-REQUIREMENTS-2026-10-24.md 的 M8 定下规矩：缺少机构、版本、页码任一项，整条不显示，界面写「未引入」。'
        + '所以下表只说明文件存在与版本记录，每行给一个出版方页面，你可以自己点开核对；具体条文一律不引用。',
      table: {
        head: ['机构', '文件', '版本 / 年份', '原件', '本台的用途'],
        rows: [
          [
            'NCCN',
            { text: 'NCCN Guidelines · Biliary Tract Cancers', url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1517' },
            '2.2025（据 docs/SPEC.md）；官网详情页 2026-10-27 列 2.2026',
            { text: '未取得原件，据 JNCCN 刊出版', url: 'https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml' },
            '病种范围与治疗路径的并列参照；条目级引用待补，页码待核'
          ],
          [
            'CSCO',
            { text: 'CSCO 胆道恶性肿瘤诊疗指南 2024', url: 'https://www.pmphmall.com/gdsdetail/653359-331956' },
            '2024 版（出版方商城页：2024-08，ISBN 978-7-117-36675-5）',
            { text: '未取得原件，据出版方商城页', url: 'https://www.pmphmall.com/gdsdetail/653359-331956' },
            '国内可及药物与本土实践差异；本版暂不作引用依据'
          ],
          [
            'AJCC',
            { text: 'AJCC Cancer Staging Manual, 8th ed.', url: 'https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/' },
            '第 8 版（Springer，版权页记 2017）',
            { text: '未取得原件，据 AJCC 官网', url: 'https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/' },
            '试验入组条件里的分期口径（演示数据写作「AJCC 第 8 版」）；本台不生成分期'
          ]
        ]
      },
      points: [
        '指南给的是「通常怎么做」，不是「你该怎么做」。版本号必须写清：同一份指南换一版，条目会变。',
        'CSCO 的版本号原先在项目文档里没有记录。2026-10-27 补查人民卫生出版社商城页，登记为 2024 版（2024-08，ISBN 978-7-117-36675-5）；原件与页码仍缺。',
        'NCCN 这一行要留意版本：本项目文档登记的是 2.2025，2026-10-27 打开官网详情页看到的是 Version 2.2026，两次之间哪天换的版，本台未核实。',
        '本台对未取得原件的文件只记「存在」与「大致讲什么」，不引用具体条文，页码一律写待核。',
        '国内实践与 NCCN 在本病种不做条目换算；两套口径并存时并列，各自标出处。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Biliary Tract Cancers', version: '2.2025（未取得原件）', original: false, secondaryUrl: 'https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml', page: '待核', note: 'JNCCN 23(9): p403 刊出版' },
        { org: 'CSCO', doc: 'CSCO 胆道恶性肿瘤诊疗指南 2024', version: '2024 版（2024-08）', original: false, secondaryUrl: 'https://www.pmphmall.com/gdsdetail/653359-331956', page: '待核', note: '人民卫生出版社商城页' },
        { org: 'AJCC', doc: 'Cancer Staging Manual, 8th ed.', version: '第 8 版（2017）', original: false, secondaryUrl: 'https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/', page: '待核', note: 'AJCC 官网分期体系页' }
      ]
    },
    {
      id: 'landscape',
      title: '目前治疗全景概要',
      intro: '本项目尚未取得带页码的指南原件，所以这一段列的是「项目档案与试验页里出现过的治疗段落」，'
        + '不是指南清单的完整枚举，也不是给你排的先后顺序。每一项只说明「是什么、用在哪一段」，'
        + '不含剂量、疗程与适用条件——那些必须由医生按你的影像、肝功与病理决定。',
      groups: [
        {
          label: '减黄与胆道引流（先解决梗阻）',
          points: [
            'PTCD 外引流：项目档案里出现的减黄手段；带管期间的引流液颜色、量、发热与脱管是记录项，本台不判断管子是否堵。',
            'ENBD 与胆道支架：项目文档把它们与 PTCD 并列为带管生活的三种情形；具体选哪种由介入或内镜团队决定。'
          ]
        },
        {
          label: '手术切除',
          points: [
            '根治性切除：演示档案里的写法是「右半肝 + 尾状叶切除 + 肝外胆管切除 + 胆肠吻合」，胆囊癌为「胆囊癌根治术（胆囊床切除 + 肝十二指肠韧带淋巴结清扫）」；术式与范围由外科按影像与术中判断决定。',
            '切缘与淋巴结：病理报告原文照抄（如 R0 / R1、淋巴结 x/y 阳性），本台不改写、不解读。'
          ]
        },
        {
          label: '术后辅助治疗',
          points: [
            '辅助化疗：演示档案记录为卡培他滨单药、按周期记录；是否做、做几个周期由肿瘤内科按病理与恢复情况决定。',
            '辅助阶段的记录重点：肝功、血象与手足反应，按日期与分级原文记录。'
          ]
        },
        {
          label: '晚期 / 不可切除后的系统治疗',
          points: [
            '系统治疗按线序记录：项目用「线」组织治疗史（如 1 线、2 线），每条带开始日期、方案原文与依据三栏（医生原话 / 当时看的指标 / 指南条目）。',
            '分子分型与后线选择：试验库按「分型 × 位点 × 治疗线数」列条件，涉及 FGFR2 融合、IDH1 R132、HER2、MSI-H、KRAS 等位点；本台只做逐条三态对照（符合 / 不符合 / 待确认），不排优先级。',
            '临床试验：项目把它做成独立页，只整理登记信息与入排条件，不判断哪个试验「更适合」。'
          ]
        },
        {
          label: '贯穿全程的两件事',
          points: [
            '两条线分开记：梗阻—黄疸线与肿瘤—治疗线各自成轨，不合成一个总分。',
            '复查节奏：按主诊医嘱记录「约在哪天、做了没有」，本台不生成复查间隔。'
          ]
        }
      ],
      points: [
        '以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Biliary Tract Cancers', version: '2.2025（未取得原件，条目级引用待补）', original: false, secondaryUrl: 'https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml', page: '待核' },
        { org: '本项目', doc: 'prototypes/v0.2/demo-data.js（演示档案的治疗段落）与 docs/SPEC.md（临床试验匹配页口径）', version: '2026-10-24', original: true, nolink: true, page: '不适用（项目文档）', note: '项目内文件，无对外链接' }
      ]
    },
    {
      id: 'trend',
      title: '发展趋势',
      intro: '这一段只写已经发生的事：哪份文件登记了什么版本、哪一天查到的页面写着什么。'
        + '不写预测，不做评价，也不给任何倾向。',
      points: [
        '2025 年：本项目文档记录的 NCCN 胆道癌指南版本为 2.2025（docs/SPEC.md），同年 JNCCN 23 卷 9 期以该版本号刊出（p403，DOI 10.6004/jnccn.2025.0042）。',
        '2026-10-27：NCCN 官网指南详情页所列版本为 Version 2.2026；从 2.2025 到 2.2026 的生效日期，本台未核实。',
        '2024-08：CSCO 胆道恶性肿瘤诊疗指南 2024 由人民卫生出版社出版（ISBN 978-7-117-36675-5）；本台未取得原件，页码待核。',
        '分期体系：AJCC 官网公告 Version 9 分期协议发布，并给出「8th Edition 或 Version 9」的按病种对照表（PDF 链在分期体系页）；胆道癌适用哪一版，本台未逐病种核对。',
        '截至 2026-10-27：本台未对胆道癌的登记平台做专项检索，在研登记数量与阶段分布未整理。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Biliary Tract Cancers', version: '2.2025 → 2.2026（据官网详情页，生效日未核实）', original: false, secondaryUrl: 'https://jnccn.org/view/journals/jnccn/23/9/article-p403.xml', page: '待核' },
        { org: '本项目', doc: 'docs/SPEC.md（证据分级与指南版本记录）', version: '2026-10-24 版', original: true, nolink: true, page: '不适用（项目文档）', note: '项目内文件，无对外链接' }
      ]
    }
  ]
}
