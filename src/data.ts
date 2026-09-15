/* ============================================================
 * 象罔社团官网 · 内容数据模块
 * 首页卡片与详情页共用；新增/修改内容只需改这里并重新打包
 * ⚠️ 隐私红线：成员只允许 姓名/学院/专业/编号/方向/简介，严禁录入
 *    身份证、手机号、学号、生日等敏感字段
 * ============================================================ */

export interface WorkItem {
  id: string;
  title: string;
  cat: string;
  icon: string;
  coverClass: string;
  status: string;
  stack: string[];
  desc: string;
  highlights: string[];
}

export interface MemberItem {
  id: string;
  name: string;
  college: string;
  major: string;
  no: string;
  hue: number;          // 头像配色 1-5
  dir: string[];        // 方向标签（占位）
  bio: string;          // 一句话介绍（占位）
}

export interface JobItem {
  id: string;
  title: string;
  org: string;
  status: 'open' | 'soon';
  statusText: string;
  duty: string[];
  reqs: string[];
}

export const WORKS: WorkItem[] = [
  {
    id: 'w1', title: '校园二手交易平台', cat: 'Web 全栈', icon: '🛰️', coverClass: 'c1', status: '运营中',
    stack: ['TypeScript', 'Vue3', 'Node.js', 'MySQL'],
    desc: '社团全栈组 flagship 项目：从需求分析、数据库设计到上线部署完整走了一遍生产流程，目前已服务全校区同学（占位数据：注册 2000+ 人，日均挂单 100+）。',
    highlights: [
      '完整走通「需求 → 设计 → 开发 → 上线 → 运维」全流程',
      '服务全校区 2000+ 同学（占位）',
      '获校级创新创业项目立项（占位）',
      '新旧两届成员接力维护，真实体验代码交接',
    ],
  },
  {
    id: 'w2', title: 'AI 校园问答助手', cat: '人工智能', icon: '🧠', coverClass: 'c2', status: '迭代中',
    stack: ['Python', 'LLM', 'RAG', 'Docker'],
    desc: '基于大模型 + 校园知识库的智能问答机器人，接入新生 QQ 群自动回答报到、选课、社团等高频问题（占位：日均回答 300+ 次）。',
    highlights: [
      '基于 RAG 检索增强，回答可溯源',
      '接入新生 QQ 群，日均回答 300+ 问（占位）',
      '核心检索模块开源，欢迎贡献',
    ],
  },
  {
    id: 'w3', title: '像素风小游戏', cat: '游戏开发', icon: '🎮', coverClass: 'c3', status: '已发布',
    stack: ['TypeScript', 'Canvas', 'Web Audio'],
    desc: '48 小时 Game Jam 的产物：从零手写游戏循环、碰撞检测与像素动画，不依赖游戏引擎，浏览器打开即玩（占位：GitHub 1k+ star）。',
    highlights: [
      '48 小时极限开发，Game Jam 获奖（占位）',
      '零引擎依赖，纯手写游戏循环',
      'GitHub 1k+ star（占位）',
    ],
  },
  {
    id: 'w4', title: '课表可视化工具', cat: '效率工具', icon: '📊', coverClass: 'c4', status: '迭代中',
    stack: ['TypeScript', 'ECharts', 'IndexedDB'],
    desc: '一键导入教务系统课表，自动生成周视图、冲突检测与导出图片，解决每学期排课手动对表的问题。',
    highlights: [
      '一键解析教务系统课表',
      '时间冲突自动高亮',
      '周视图一键导出分享图',
    ],
  },
  {
    id: 'w5', title: 'CTF 校队训练平台', cat: '网络安全', icon: '🛡️', coverClass: 'c5', status: '运营中',
    stack: ['Docker', 'Go', 'Nginx'],
    desc: '自建 CTF 靶机与动态 flag 题库，支撑社团每周内训与校队备战全国大学生网络安全竞赛（占位：靶机 20+，题目 200+）。',
    highlights: [
      'Docker 动态靶机，一键起环境',
      '题库 200+ 覆盖 Web/Pwn/Crypto/Misc（占位）',
      '每周内训 + 赛前特训',
    ],
  },
];

export const MEMBERS: MemberItem[] = [
  { id: 'L1',  name: '陈明睿', college: '雷丁学院',         major: '大气科学',             no: 'L1',  hue: 1, dir: ['Python', '科学计算'],      bio: '一句话介绍待补充（占位内容，例：喜欢用代码处理气象数据）。' },
  { id: 'L2',  name: '虞越',   college: '软件学院',         major: '软件工程',             no: 'L2',  hue: 2, dir: ['Java', 'Web 开发'],        bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L4',  name: '蔡泉佑', college: '雷丁学院',         major: '数据科学与大数据技术', no: 'L4',  hue: 3, dir: ['Python', '数据分析'],      bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L5',  name: '郑子鑫', college: '网络空间安全学院', major: '网络空间安全',         no: 'L5',  hue: 4, dir: ['CTF', 'Linux'],            bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L6',  name: '朱芫枚', college: '计算机/软件学院',  major: '软件工程',             no: 'L6',  hue: 5, dir: ['前端', 'Vue'],             bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L7',  name: '蔡僮',   college: '沃特福德学院',     major: '电气工程及其自动化',   no: 'L7',  hue: 1, dir: ['嵌入式', '硬件'],          bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L8',  name: '陈佳敏', college: '计算机学院',       major: '计算机科学与技术',     no: 'L8',  hue: 2, dir: ['算法', '竞赛'],            bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L9',  name: '陈致明', college: '人工智能学院',     major: '人工智能',             no: 'L9',  hue: 3, dir: ['Python', '机器学习'],      bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L10', name: '余思雨', college: '艺术学院',         major: '数字媒体艺术',         no: 'L10', hue: 4, dir: ['UI 设计', '创意编程'],     bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L11', name: '饶宇轩', college: '计算机与软件学院', major: '软件工程',             no: 'L11', hue: 5, dir: ['后端', 'Go'],              bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L12', name: '何泓全', college: '网络空间安全学院', major: '网络空间安全',         no: 'L12', hue: 1, dir: ['CTF', '逆向'],             bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L13', name: '秦梓源', college: '人工智能学院',     major: '人工智能',             no: 'L13', hue: 2, dir: ['大模型', 'LLM 应用'],      bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L14', name: '蔡凯',   college: '沃特福德学院',     major: '人工智能',             no: 'L14', hue: 3, dir: ['Python', '机器学习'],      bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L15', name: '丁博',   college: '自动化学院',       major: '测控技术与仪器',       no: 'L15', hue: 4, dir: ['嵌入式', '物联网'],        bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L16', name: '杨添龙', college: '计算机/软件学院',  major: '计算机科学与技术',     no: 'L16', hue: 5, dir: ['全栈', '小程序'],          bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L18', name: '张洪铖', college: '计算机与软件学院', major: '软件工程',             no: 'L18', hue: 1, dir: ['前端', 'React'],           bio: '一句话介绍待补充（占位内容）。' },
  { id: 'L19', name: '孙迦勒', college: '人工智能学院',     major: '人工智能',             no: 'L19', hue: 2, dir: ['大模型', 'RAG'],           bio: '一句话介绍待补充（占位内容）。' },
];

export const JOBS: JobItem[] = [
  {
    id: 'j1', title: '前端开发实习生', org: '合作企业（占位）', status: 'open', statusText: '报名中',
    duty: ['参与真实产品的前端迭代开发', '与设计师、后端工程师协作联调', '编写可复用、可维护的组件'],
    reqs: ['熟悉 HTML / CSS / JavaScript 基础', '了解 Vue 或 React 任一框架', '大二大三优先，一周到岗 3 天以上（占位）'],
  },
  {
    id: 'j2', title: '后端开发实习生', org: '合作企业（占位）', status: 'open', statusText: '报名中',
    duty: ['参与服务端接口设计与开发', '优化数据库查询与接口性能', '参与代码评审与技术分享'],
    reqs: ['熟悉 Java 或 Go 任一语言', '了解 MySQL / Redis 常用操作', '有社团项目经验者优先'],
  },
  {
    id: 'j3', title: '算法实习生（AI 方向）', org: '合作实验室（占位）', status: 'soon', statusText: '即将开放',
    duty: ['参与机器学习 / 大模型应用研发', '复现论文并做工程化落地', '搭建与维护实验评测流程'],
    reqs: ['Python 熟练，了解 PyTorch', '读过至少一个经典模型/论文', '对 LLM 应用方向有兴趣'],
  },
  {
    id: 'j4', title: '社团项目组 · 核心开发', org: '校内 · 社团自研项目', status: 'open', statusText: '长期招募',
    duty: ['参与官网、小程序等自研项目开发', '带教新成员完成新手任务', '优秀者可获合作企业内推'],
    reqs: ['社团正式成员', '每周可投入 4 小时以上', '有责任心，能坚持交付'],
  },
];
