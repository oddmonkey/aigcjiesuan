import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js'

dayjs.extend(isoWeek)
dayjs.extend(quarterOfYear)
dayjs.locale('zh-cn')

export { dayjs }

// 周一~周日 中文标签(下标 0=周一)
const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/**
 * 根据时间维度 + 具体周期计算时间范围与时间桶
 * - start/end:该周期的严格起止(用于 filterDetails)
 * - prevStart/prevEnd:上一同长度周期(用于环比)
 * - points:降级钻取后的下一级颗粒度桶(用于趋势图 X 轴)
 * @param {string} dimension day|week|month|quarter|year|custom
 * @param {dayjs.Dayjs} [period] day/week/month/quarter/year 时表示用户选定的具体周期
 * @param {{start: dayjs.Dayjs, end: dayjs.Dayjs}} [customRange] custom 时必填
 * @returns {{start, end, prevStart, prevEnd, days, granularity, points}}
 */
export function getRangeByDimension(dimension, period, customRange) {
  let start, end, prevStart, prevEnd, granularity, points

  switch (dimension) {
    case 'day': {
      // period = 某一天
      const p = dayjs(period)
      start = p.startOf('day')
      end = p.endOf('day')
      prevStart = p.subtract(1, 'day').startOf('day')
      prevEnd = p.subtract(1, 'day').endOf('day')
      granularity = 'hour'
      points = buildPoints(start, end, 'hour')
      break
    }
    case 'week': {
      // period = 某周(周一开始)
      const monday = startOfWeekMonday(dayjs(period))
      start = monday.startOf('day')
      end = start.add(6, 'day').endOf('day')
      prevStart = start.subtract(7, 'day').startOf('day')
      prevEnd = prevStart.add(6, 'day').endOf('day')
      granularity = 'day'
      // 7 个日桶,带中文星期 label
      points = []
      for (let i = 0; i < 7; i++) {
        const dStart = start.add(i, 'day').startOf('day')
        const dEnd = start.add(i, 'day').endOf('day')
        points.push({
          label: `${WEEKDAY_LABELS[i]} ${dStart.format('MM-DD')}`,
          start: dStart,
          end: dEnd
        })
      }
      break
    }
    case 'month': {
      // period = 某月
      const p = dayjs(period)
      start = p.startOf('month')
      end = p.endOf('month')
      prevStart = p.subtract(1, 'month').startOf('month')
      prevEnd = p.subtract(1, 'month').endOf('month')
      granularity = 'day'
      points = buildPoints(start, end, 'day')
      break
    }
    case 'quarter': {
      // period = 某季度
      const p = dayjs(period)
      start = p.startOf('quarter')
      end = p.endOf('quarter')
      prevStart = p.subtract(1, 'quarter').startOf('quarter')
      prevEnd = p.subtract(1, 'quarter').endOf('quarter')
      granularity = 'month'
      points = buildPoints(start, end, 'month')
      break
    }
    case 'year': {
      // period = 某年
      const p = dayjs(period)
      start = p.startOf('year')
      end = p.endOf('year')
      prevStart = p.subtract(1, 'year').startOf('year')
      prevEnd = p.subtract(1, 'year').endOf('year')
      granularity = 'month'
      points = buildPoints(start, end, 'month')
      break
    }
    case 'custom': {
      // customRange 为空时默认取最近 30 天,避免页面崩溃
      const range = (customRange && customRange.start && customRange.end)
        ? customRange
        : { start: dayjs().subtract(29, 'day'), end: dayjs() }
      const cStart = dayjs(range.start).startOf('day')
      const cEnd = dayjs(range.end).endOf('day')
      const rangeDays = getDaysInRange(cStart, cEnd)
      if (rangeDays < 60) {
        granularity = 'day'
      } else if (rangeDays < 180) {
        granularity = 'week'
      } else {
        granularity = 'month'
      }
      start = cStart
      end = cEnd
      prevEnd = start.subtract(1, 'day').endOf('day')
      prevStart = start.subtract(rangeDays, 'day').startOf('day')
      points = buildPoints(start, end, granularity)
      break
    }
    default: {
      throw new Error(`未知的时间维度: ${dimension}`)
    }
  }

  const days = getDaysInRange(start, end)
  return { start, end, prevStart, prevEnd, days, granularity, points }
}

/**
 * 返回区间天数(含首尾)
 */
export function getDaysInRange(start, end) {
  const s = dayjs(start).startOf('day')
  const e = dayjs(end).startOf('day')
  return e.diff(s, 'day') + 1
}

/**
 * 取以周一开始的本周周一
 */
function startOfWeekMonday(d) {
  // isoWeek 周一为 1,周日为 7
  const wd = d.isoWeekday() // 1..7
  return d.subtract(wd - 1, 'day').startOf('day')
}

/**
 * 切分时间桶
 * 支持 hour / day / week / month / quarter / year
 */
function buildPoints(start, end, granularity) {
  const pts = []
  if (granularity === 'hour') {
    // hour 模式下 start/end 是同一天,切 24 个小时桶
    const cur = dayjs(start).startOf('day')
    for (let h = 0; h < 24; h++) {
      const hStart = cur.hour(h).startOf('hour')
      const hEnd = cur.hour(h).endOf('hour')
      pts.push({ label: `${String(h).padStart(2, '0')}:00`, start: hStart, end: hEnd })
    }
  } else if (granularity === 'day') {
    const s = dayjs(start).startOf('day')
    const e = dayjs(end).startOf('day')
    let cur = s
    while (cur.isBefore(e) || cur.isSame(e, 'day')) {
      pts.push({
        label: cur.format('MM-DD'),
        start: cur.startOf('day'),
        end: cur.endOf('day')
      })
      cur = cur.add(1, 'day')
    }
  } else if (granularity === 'week') {
    // 以周一开始切分
    let cur = startOfWeekMonday(dayjs(start))
    const endDay = dayjs(end).endOf('day')
    let idx = 1
    while (cur.isBefore(endDay)) {
      const wStart = cur.startOf('day')
      const wEnd = cur.add(6, 'day').endOf('day')
      pts.push({
        label: `第${idx}周 ${wStart.format('YYYY-MM-DD')}~${wEnd.format('YYYY-MM-DD')}`,
        start: wStart,
        end: wEnd
      })
      cur = cur.add(7, 'day')
      idx += 1
    }
  } else if (granularity === 'month') {
    let cur = dayjs(start).startOf('month')
    const endMonth = dayjs(end).endOf('month')
    while (cur.isBefore(endMonth) || cur.isSame(endMonth, 'month')) {
      pts.push({
        label: cur.format('YYYY-MM'),
        start: cur.startOf('month'),
        end: cur.endOf('month')
      })
      cur = cur.add(1, 'month')
    }
  } else if (granularity === 'quarter') {
    let cur = dayjs(start).startOf('quarter')
    const endQ = dayjs(end).endOf('quarter')
    while (cur.isBefore(endQ) || cur.isSame(endQ, 'quarter')) {
      const q = cur.quarter()
      pts.push({
        label: `${cur.format('YYYY')}-Q${q}`,
        start: cur.startOf('quarter'),
        end: cur.endOf('quarter')
      })
      cur = cur.add(1, 'quarter')
    }
  } else if (granularity === 'year') {
    let cur = dayjs(start).startOf('year')
    const endY = dayjs(end).endOf('year')
    while (cur.isBefore(endY) || cur.isSame(endY, 'year')) {
      pts.push({
        label: cur.format('YYYY'),
        start: cur.startOf('year'),
        end: cur.endOf('year')
      })
      cur = cur.add(1, 'year')
    }
  }
  return pts
}
