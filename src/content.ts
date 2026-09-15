/* ============================================================
 * 象罔社团官网 · 主页内容补充模块
 * 动态流 / 语录 / 方向 / 数据 —— 只服务于首页「橱窗」层
 * ⚠️ 所有带（占位）标注的内容上线前需替换为社团真实信息
 * ============================================================ */

/** 社团动态：首页「最近我们在干嘛」时间线 */
export interface FeedItem {
  date: string;
  tag: string;
  title: string;
  desc: string;
}

export const FEED: FeedItem[] = [
  {
    date: '09.14', tag: '组会',
    title: '各组进度汇报会',
    desc: '本学期第一次正式汇报，五个组各 8 分钟：做完了什么、卡在什么地方、下周打算做什么，代码和截图直接投屏，讲完当场演示。',
  },
  {
    date: '09.07', tag: '小组会',
    title: '各组自行开会',
    desc: '不开全员大会的一周，五个组在图书馆、实验室和线上各开各的，把学期目标拆成一周能推进完的小块，会议记录统一归档。',
  },
  {
    date: '08.16', tag: '研读',
    title: '论文研读会：从读得懂到讲得出',
    desc: '每周日晚一次的线上研读，本期精读 RAG 与向量检索的两篇经典工作，读完要能对着白板讲清“解决了什么、怎么解决、我们哪块能用”。',
  },
  {
    date: '08.02', tag: '智能体',
    title: '智能体小组中期检查',
    desc: '暑期过半集中演示，要求不是讲思路而是当场跑通完整链路；跑不通的方向当场降级为技术预研，不再占用人手。',
  },
  {
    date: '07.11', tag: '暑期',
    title: '暑期学习任务启动',
    desc: '社长发出暑期学习任务清单，RAG 检索、向量数据库、各智能体三条主线同时铺开，明确负责人、交付物与节点，并定下每周碰头、每周研读、开学汇报的节奏。',
  },
];

/** 首页打字机文案 */
export const HERO_PHRASES: string[] = [
  '我们在 A302 写代码、打比赛、也一起吃晚饭。',
  '有人第一次上线自己的网站，有人第一次打进区域赛。',
  '零基础有带教，有基础有项目。',
  '招新进行中——下一张活动照片里，可以有你。',
];

/** 成员语录：id 对应 data.ts 中的 MEMBERS */
export const QUOTES: { id: string; text: string }[] = [
  { id: 'L1', text: '在这里我第一次看到自己写的东西，被不认识的同学真正用起来。' },
  { id: 'L2', text: '周五分享会是我每周最期待的两小时，比追剧还上头。' },
  { id: 'L10', text: '原以为是技术宅聚集地，其实是一群想把想法做成真东西的人。' },
];

/** 四个培养方向（精简为胶囊，完整介绍放详情/宣讲） */
export const DIRECTIONS: { icon: string; name: string; tags: string }[] = [
  { icon: '🌐', name: 'Web 开发', tags: 'Vue / React / Node' },
  { icon: '🤖', name: '人工智能', tags: 'Python / LLM' },
  { icon: '🏆', name: '竞赛战队', tags: 'ACM / 蓝桥杯' },
  { icon: '🚀', name: '开源实践', tags: 'Git / Linux' },
];

/** 数字滚动统计 */
export const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 120, suffix: '+', label: '在册成员' },
  { value: 30, suffix: '+', label: '完成项目' },
  { value: 15, suffix: ' 项', label: '竞赛奖项' },
  { value: 98, suffix: '%', label: '就业 / 升学' },
];
