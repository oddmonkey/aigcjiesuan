import dayjs from 'dayjs'
import { TASK_TYPES, LEVEL_FIELDS, MODELS } from '../constants/index.js'
import { getRangeByDimension } from '../utils/date.js'

// ============================================================
// 固定种子的伪随机数生成器(Mulberry32),保证数据稳定可复现
// ============================================================
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20240715)

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)]
}

// ============================================================
// 1) 层级实体生成(用于命名与继承)
// ============================================================

// 合作伙伴(6 个)
const partners = [
  { partnerId: 'P01', partnerName: '华影传媒' },
  { partnerId: 'P02', partnerName: '智绘科技' },
  { partnerId: 'P03', partnerName: '星辰创意' },
  { partnerId: 'P04', partnerName: '光年视觉' },
  { partnerId: 'P05', partnerName: '墨白工坊' },
  { partnerId: 'P06', partnerName: '云图互动' }
]

// 团队(12 个,每个 partner 2 个团队)
const teamNames = [
  '创意一组', '视频二组', '设计三组', '创意四组', '动效五组', '视效六组',
  '插画七组', '三维八组', '短视频九组', '后期十组', '运营十一组', '策划十二组'
]
const teams = []
let teamIdx = 0
partners.forEach((p) => {
  for (let i = 0; i < 2; i++) {
    const teamId = `T${String(teamIdx + 1).padStart(2, '0')}`
    teams.push({
      teamId,
      teamName: teamNames[teamIdx],
      partnerId: p.partnerId,
      partnerName: p.partnerName
    })
    teamIdx++
  }
})

// 项目组(18 个):前 6 个团队各 2 个项目组,后 6 个团队各 1 个项目组
const groupNames = [
  '品牌项目组', '电商项目组', '广告项目组', '内容项目组', '视觉项目组', '交互项目组',
  '影像项目组', '动画项目组', '包装项目组', '美陈项目组', '模型项目组', '特效项目组',
  '短剧项目组', '海报项目组', '物料项目组', '剪辑项目组', '投放项目组', '文案项目组'
]
const groups = []
let groupIdx = 0
teams.forEach((t, ti) => {
  const count = ti < 6 ? 2 : 1
  for (let i = 0; i < count; i++) {
    const groupId = `G${String(groupIdx + 1).padStart(2, '0')}`
    groups.push({
      groupId,
      groupName: groupNames[groupIdx],
      teamId: t.teamId,
      teamName: t.teamName,
      partnerId: t.partnerId,
      partnerName: t.partnerName
    })
    groupIdx++
  }
})

// 项目(24 个):前 6 个项目组各 2 个项目,其余各 1 个项目
const projectNames = [
  '官网改版', '双11主图', '产品宣传片', '品牌活动页', '节日海报', '短视频内容',
  '电商详情页', '直播素材', '品牌VI设计', 'APP界面', '摄影后期', 'H5互动',
  '影视调色', '栏目包装', '产品建模', '活动主视觉', '3D特效', 'MG动画',
  '短剧剪辑', '海报合成', '物料延展', '视频剪辑', '投放素材', '文案撰写'
]
const projects = []
let projectIdx = 0
groups.forEach((g, gi) => {
  const count = gi < 6 ? 2 : 1
  for (let i = 0; i < count; i++) {
    const projectId = `PR${String(projectIdx + 1).padStart(2, '0')}`
    const projectUuid =
      'pr-' +
      Array.from({ length: 4 }, () =>
        Math.floor(rand() * 0xffff)
          .toString(16)
          .padStart(4, '0')
      ).join('-')
    projects.push({
      projectId,
      projectUuid,
      projectName: projectNames[projectIdx],
      groupId: g.groupId,
      groupName: g.groupName,
      teamId: g.teamId,
      teamName: g.teamName,
      partnerId: g.partnerId,
      partnerName: g.partnerName
    })
    projectIdx++
  }
})

// 用户(30 个):前 6 个项目各 2 个用户,其余各 1 个用户
const userNames = [
  '张明', '李婷', '王浩', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴芳',
  '徐强', '孙雪', '朱涛', '何敏', '郭鹏', '林燕', '高翔', '罗琳', '梁宇', '宋佳',
  '谢斌', '韩梅', '唐辉', '冯娜', '邓超', '曹阳', '彭涛', '蒋雯', '蔡明', '邱婷'
]
const users = []
let userIdx = 0
projects.forEach((p, pi) => {
  const count = pi < 6 ? 2 : 1
  for (let i = 0; i < count; i++) {
    const userId = `U${String(userIdx + 1).padStart(2, '0')}`
    const userPhone =
      '1' +
      pick(['3', '5', '7', '8', '9']) +
      randInt(0, 9) +
      String(randInt(10000000, 99999999))
    users.push({
      userId,
      userName: userNames[userIdx],
      userPhone,
      projectId: p.projectId,
      projectUuid: p.projectUuid,
      projectName: p.projectName,
      groupId: p.groupId,
      groupName: p.groupName,
      teamId: p.teamId,
      teamName: p.teamName,
      partnerId: p.partnerId,
      partnerName: p.partnerName
    })
    userIdx++
  }
})

// 导出层级实体(供 UI 下拉等使用)
export const PARTNERS = partners
export const TEAMS = teams
export const GROUPS = groups
export const PROJECTS = projects
export const USERS = users

// ============================================================
// 2) detailsData 生成(唯一一份明细,300 条左右)
// ============================================================

// 任务名称候选(按 taskType)
const TASK_NAME_MAP = {
  文生图: ['产品海报生成', '广告图生成', '电商主图生成', '插画生成', 'Banner生成'],
  视频生成: ['宣传片剪辑', '短视频制作', '产品演示视频', '广告片制作', '片头动画'],
  语音合成: ['旁白配音', '广告配音', '解说配音', '有声书生成', '播客音频'],
  画质增强: ['老照片修复', '视频画质提升', '低清转高清', '图片超分', '降噪处理'],
  去字幕: ['视频去字幕', '水印去除', '字幕擦除', '台标去除', '贴纸去除']
}

// 积分范围(按 taskType)
const POINTS_RANGE = {
  文生图: [5, 20],
  视频生成: [50, 200],
  语音合成: [3, 15],
  画质增强: [10, 30],
  去字幕: [8, 25]
}

// 参数模板(按 taskType)
const PARAMS_TEMPLATES = {
  文生图: [
    { 模式: '组图', 分辨率: '2K', 数量: '4', 风格: '写实' },
    { 模式: '单图', 分辨率: '4K', 数量: '1', 风格: '动漫' },
    { 模式: '组图', 分辨率: '1080P', 数量: '2', 风格: '赛博朋克' }
  ],
  视频生成: [
    { 时长: '10秒', 分辨率: '1080P', 帧率: '30fps' },
    { 时长: '30秒', 分辨率: '4K', 帧率: '60fps' },
    { 时长: '15秒', 分辨率: '720P', 帧率: '24fps' }
  ],
  语音合成: [
    { 音色: '女声-温柔', 语速: '1.0x', 时长: '30秒' },
    { 音色: '男声-磁性', 语速: '1.2x', 时长: '60秒' },
    { 音色: '女声-活泼', 语速: '0.8x', 时长: '15秒' }
  ],
  画质增强: [
    { 模式: '超分辨率', 倍数: '4x', 输入: '720P' },
    { 模式: '降噪', 倍数: '2x', 输入: '480P' },
    { 模式: '超分辨率', 倍数: '8x', 输入: '1080P' }
  ],
  去字幕: [
    { 模式: '智能擦除', 精度: '高', 区域: '自动检测' },
    { 模式: '手动框选', 精度: '中', 区域: '全屏' },
    { 模式: '智能擦除', 精度: '极高', 区域: '底部1/3' }
  ]
}

// 失败原因候选
const FAIL_MESSAGES = [
  '内容违规,已被拦截',
  '生成超时,请重试',
  '模型服务异常',
  '参数错误',
  '账户额度不足',
  '内容审核未通过'
]

// 退款原因候选
const REFUND_MESSAGES = ['用户申请退款', '系统自动退款', '超时自动退款']

const RECORD_COUNT = 320

function generateConsumeTime() {
  // 以 dayjs() 为基准向前随机推算
  // 35% 落在最近 30 天内(密集),65% 落在 31-365 天(分散)
  const r = rand()
  let daysBack
  if (r < 0.35) {
    daysBack = 1 + Math.floor(rand() * 30) // 1-30 天(35%,密集)
  } else {
    daysBack = 31 + Math.floor(rand() * 335) // 31-365 天(65%,分散)
  }
  const hour = randInt(0, 23)
  const minute = randInt(0, 59)
  const second = randInt(0, 59)
  return dayjs()
    .subtract(daysBack, 'day')
    .hour(hour)
    .minute(minute)
    .second(second)
    .millisecond(0)
    .format('YYYY-MM-DD HH:mm:ss')
}

const detailsData = []
for (let i = 0; i < RECORD_COUNT; i++) {
  const user = pick(users)
  const taskType = pick(TASK_TYPES)
  const [pMin, pMax] = POINTS_RANGE[taskType]

  // 积分明细:预扣 / 补扣 / 退还 / 实际
  const preDeduct = randInt(pMin, pMax)
  let supplement = 0
  let refund = 0

  // 状态与实际消耗重新生成(替换原逻辑)
  const r = rand()
  let status, points
  if (r < 0.8) {
    status = 'success'
    if (rand() < 0.2) supplement = randInt(1, 8)
    points = preDeduct + supplement
  } else if (r < 0.92) {
    status = 'fail'
    refund = preDeduct
    points = 0
  } else {
    status = 'refund'
    refund = Math.floor(preDeduct * 0.7)
    points = preDeduct - refund
  }

  // 错误信息
  let errorMessage = ''
  if (status === 'fail') {
    errorMessage = pick(FAIL_MESSAGES)
  } else if (status === 'refund') {
    errorMessage = pick(REFUND_MESSAGES)
  }

  detailsData.push({
    id: `D${String(i + 1).padStart(4, '0')}`,
    userId: user.userId,
    userName: user.userName,
    userPhone: user.userPhone,
    projectId: user.projectId,
    projectUuid: user.projectUuid,
    projectName: user.projectName,
    groupId: user.groupId,
    groupName: user.groupName,
    teamId: user.teamId,
    teamName: user.teamName,
    partnerId: user.partnerId,
    partnerName: user.partnerName,
    consumeTime: generateConsumeTime(),
    taskType,
    taskName: pick(TASK_NAME_MAP[taskType]),
    model: pick(MODELS),
    params: pick(PARAMS_TEMPLATES[taskType]),
    points,
    status,
    pointsBreakdown: { preDeduct, supplement, refund, actual: points },
    errorMessage
  })
}

// 按时间升序排一下(便于查看),不影响后续 filter+reduce
detailsData.sort((a, b) => {
  return dayjs(a.consumeTime).valueOf() - dayjs(b.consumeTime).valueOf()
})

// ============================================================
// 3) 计算函数(全部从 detailsData 实时 filter+reduce)
// ============================================================

/**
 * 返回完整明细数据(单一数据源)
 */
export function getDetailsData() {
  return detailsData
}

/**
 * 委托给 utils/date.js
 * @param {string} dimension day|week|month|quarter|year|custom
 * @param {dayjs.Dayjs} [period] 具体周期(day/week/month/quarter/year 时)
 * @param {{start: dayjs.Dayjs, end: dayjs.Dayjs}} [customRange] custom 时
 */
export function getTimeRange(dimension, period, customRange) {
  return getRangeByDimension(dimension, period, customRange)
}

/**
 * 按时间段与状态筛选明细
 * @param {Array} details 明细数组
 * @param {{timeRange?: {start,end}, status?: string}} opts
 */
export function filterDetails(details, { timeRange, status } = {}) {
  return details.filter((d) => {
    if (status && d.status !== status) return false
    if (timeRange && timeRange.start && timeRange.end) {
      const t = dayjs(d.consumeTime)
      if (t.isBefore(dayjs(timeRange.start)) || t.isAfter(dayjs(timeRange.end))) {
        return false
      }
    }
    return true
  })
}

/**
 * 按层级聚合
 * @param {Array} details 明细数组
 * @param {string} level user|project|group|team|partner
 * @param {{keyword?: string}} opts
 * @returns {Array<{id, name, points, count, lastTime, percent}>}
 */
export function aggregateByLevel(details, level, { keyword } = {}) {
  const { idKey, nameKey } = LEVEL_FIELDS[level] || {}
  if (!idKey) return []

  const map = new Map()
  details.forEach((d) => {
    const id = d[idKey]
    const name = d[nameKey]
    if (!id) return
    if (keyword && !String(name).includes(keyword)) return
    if (!map.has(id)) {
      map.set(id, { id, name, points: 0, count: 0, lastTime: '' })
    }
    const item = map.get(id)
    item.points += d.points
    item.count += 1
    if (d.consumeTime > item.lastTime) {
      item.lastTime = d.consumeTime
    }
  })

  const totalPoints = Array.from(map.values()).reduce((s, x) => s + x.points, 0)
  const result = Array.from(map.values()).map((x) => ({
    ...x,
    percent: totalPoints === 0 ? 0 : (x.points / totalPoints) * 100
  }))

  result.sort((a, b) => b.points - a.points)
  return result
}

/**
 * 汇总统计(当前周期 vs 上一周期)
 * @param {Array} details 明细数组(完整或已筛选的超集)
 * @param {{start,end,days}} timeRange 当前周期
 * @param {{start,end}} prevTimeRange 上一周期
 * @param {{status?: string}} opts
 */
export function computeSummary(details, timeRange, prevTimeRange, { status } = {}) {
  const current = filterDetails(details, { timeRange, status })
  const prev = filterDetails(details, { timeRange: prevTimeRange, status })

  const totalPoints = current.reduce((s, d) => s + d.points, 0)
  const totalCount = current.length
  const days = timeRange && timeRange.days ? timeRange.days : 1
  const dailyAvg = totalPoints / Math.max(1, days)

  const prevTotalPoints = prev.reduce((s, d) => s + d.points, 0)
  const changePercent =
    prevTotalPoints === 0 ? null : ((totalPoints - prevTotalPoints) / prevTotalPoints) * 100

  return {
    totalPoints,
    totalCount,
    dailyAvg,
    prevTotalPoints,
    changePercent
  }
}

/**
 * 趋势(按时间桶聚合)
 * @param {Array} details 明细数组(通常已按时间筛选)
 * @param {string} level 层级(预留,聚合按时间桶)
 * @param {{points: Array}} timeRange 含 points 时间桶
 * @returns {Array<{label, points, count}>}
 */
export function getTrend(details, level, timeRange) {
  const buckets = (timeRange && timeRange.points) || []
  return buckets.map((b) => {
    const inBucket = details.filter((d) => {
      const t = dayjs(d.consumeTime)
      return (
        (t.isAfter(dayjs(b.start)) || t.isSame(dayjs(b.start))) &&
        (t.isBefore(dayjs(b.end)) || t.isSame(dayjs(b.end)))
      )
    })
    return {
      label: b.label,
      points: inBucket.reduce((s, d) => s + d.points, 0),
      count: inBucket.length
    }
  })
}

/**
 * 把聚合结果转为分布数据(饼图/柱状图)
 * @param {Array<{id,name,points,count,lastTime,percent}>} aggregateResult
 * @returns {Array<{name, value, percent}>}
 */
export function getDistribution(aggregateResult) {
  if (!Array.isArray(aggregateResult)) return []
  return aggregateResult.map((x) => ({
    name: x.name,
    value: x.points,
    percent: x.percent
  }))
}

/**
 * 获取某成员的全部明细(按时间降序)
 * @param {Array} details
 * @param {string} level
 * @param {string} memberId
 */
export function getDetailByMember(details, level, memberId) {
  const { idKey } = LEVEL_FIELDS[level] || {}
  if (!idKey) return []
  return details
    .filter((d) => d[idKey] === memberId)
    .sort((a, b) => dayjs(b.consumeTime).valueOf() - dayjs(a.consumeTime).valueOf())
}
