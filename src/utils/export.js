import * as XLSX from 'xlsx'
import { dayjs } from './date.js'

/**
 * 导出结算中心数据为 Excel
 * @param {Object} params
 * @param {string} params.levelLabel 层级标签(用于文件名)
 * @param {string} params.timeRangeLabel 时间范围标签(用于文件名)
 * @param {Array<{name,points,count,percent}>} params.aggregate 汇总数据
 * @param {Array} params.details 明细数据(含 consumeTime/taskType/taskName/points/status/projectName)
 * @param {boolean} params.withDetail 是否包含明细 Sheet
 * @param {Array<string>} [params.modelOptions] 模型名数组(用于宽表列)
 * @param {Object} [params.aggregateModelMap] { [memberName]: { [modelName]: { points, count } } }
 */
export function exportBillingExcel({ levelLabel, timeRangeLabel, aggregate, details, withDetail, modelOptions, aggregateModelMap }) {
  const wb = XLSX.utils.book_new()

  const hasModelColumns = Array.isArray(modelOptions) && modelOptions.length > 0
  let summaryHeader
  let summaryRows
  if (hasModelColumns) {
    summaryHeader = ['名称', '总消耗积分', '总消耗次数', ...modelOptions.flatMap((m) => [`[${m}]消耗积分`, `[${m}]消耗次数`])]
    summaryRows = (Array.isArray(aggregate) ? aggregate : []).map((x) => {
      const modelData = (aggregateModelMap && aggregateModelMap[x.name]) || {}
      return [
        x.name,
        x.points,
        x.count,
        ...modelOptions.flatMap((m) => (modelData[m] ? [modelData[m].points, modelData[m].count] : [0, 0]))
      ]
    })
  } else {
    summaryHeader = ['名称', '消耗积分', '消耗次数', '占比(%)']
    summaryRows = (Array.isArray(aggregate) ? aggregate : []).map((x) => [
      x.name,
      x.points,
      x.count,
      Number((x.percent || 0).toFixed(2))
    ])
  }
  const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows])
  XLSX.utils.book_append_sheet(wb, summarySheet, '汇总')

  if (withDetail) {
    const detailHeader = ['记录ID', '消耗时间', '生成类型', '任务名称', '模型', '使用人', '手机号', '项目', '项目ID', '项目组', '项目组ID', '团队', '团队ID', '合作伙伴', '合作伙伴ID', '参数摘要', '预扣积分', '补扣积分', '退还积分', '实际消耗', '状态']
    const detailRows = (Array.isArray(details) ? details : []).map((d) => {
      const paramsStr = d.params ? Object.entries(d.params).map(([k, v]) => `${k}:${v}`).join('; ') : ''
      const statusText = d.status === 'success' ? '成功' : d.status === 'fail' ? '失败' : '退款'
      return [
        d.id,
        d.consumeTime,
        d.taskType,
        d.taskName,
        d.model || '',
        d.userName,
        d.userPhone || '',
        d.projectName,
        d.projectUuid || '',
        d.groupName,
        d.groupId,
        d.teamName,
        d.teamId,
        d.partnerName,
        d.partnerId,
        paramsStr,
        d.pointsBreakdown?.preDeduct || 0,
        d.pointsBreakdown?.supplement || 0,
        d.pointsBreakdown?.refund || 0,
        d.points,
        statusText
      ]
    })
    const detailSheet = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows])
    XLSX.utils.book_append_sheet(wb, detailSheet, '明细')
  }

  const filename = `结算中心_${levelLabel || ''}_${timeRangeLabel || ''}_${dayjs().format('YYYYMMDDHHmm')}.xlsx`
  XLSX.writeFile(wb, filename)
}

/**
 * 导出明细弹窗数据为 Excel(单 sheet)
 * @param {Object} params
 * @param {string} params.memberName 成员名称(用于文件名)
 * @param {Array} params.details 明细记录数组
 */
export function exportDetailExcel({ memberName, details }) {
  const wb = XLSX.utils.book_new()

  const detailHeader = [
    '记录ID', '消耗时间', '生成类型', '任务名称', '模型',
    '使用人', '手机号', '项目', '项目ID', '项目组', '项目组ID', '团队', '团队ID', '合作伙伴', '合作伙伴ID',
    '参数摘要', '预扣积分', '补扣积分', '退还积分', '实际消耗', '状态', '错误信息'
  ]
  const detailRows = (Array.isArray(details) ? details : []).map((d) => {
    const paramsStr = d.params
      ? Object.entries(d.params).map(([k, v]) => `${k}:${v}`).join('; ')
      : ''
    const statusText = d.status === 'success' ? '成功' : d.status === 'fail' ? '失败' : '退款'
    return [
      d.id,
      d.consumeTime,
      d.taskType,
      d.taskName,
      d.model || '',
      d.userName,
      d.userPhone || '',
      d.projectName,
      d.projectUuid || '',
      d.groupName,
      d.groupId,
      d.teamName,
      d.teamId,
      d.partnerName,
      d.partnerId,
      paramsStr,
      d.pointsBreakdown?.preDeduct || 0,
      d.pointsBreakdown?.supplement || 0,
      d.pointsBreakdown?.refund || 0,
      d.points,
      statusText,
      d.errorMessage || ''
    ]
  })
  const detailSheet = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows])
  XLSX.utils.book_append_sheet(wb, detailSheet, '明细')

  const filename = `明细_${memberName || ''}_${dayjs().format('YYYYMMDDHHmm')}.xlsx`
  XLSX.writeFile(wb, filename)
}
