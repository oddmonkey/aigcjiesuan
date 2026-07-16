/**
 * 千分位整数格式化
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '0'
  return Math.round(Number(n)).toLocaleString('en-US')
}

/**
 * 百分比字符串
 * @param {number} n 0-100 之间的数值(传入已是百分比)
 * @param {number} digits 小数位数
 * @returns {string} 如 '12.34%'
 */
export function formatPercent(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '--'
  return `${Number(n).toFixed(digits)}%`
}

/**
 * 环比变化展示
 * @param {number|null} percent 百分比数值(如 12.34)
 * @returns {{text: string, color: string, arrow: string}}
 */
export function formatChange(percent) {
  if (percent === null || percent === undefined || Number.isNaN(Number(percent))) {
    return { text: '--', color: '#8c8c8c', arrow: '' }
  }
  const num = Number(percent)
  if (num > 0) {
    return { text: `↑ ${num.toFixed(2)}%`, color: '#f5222d', arrow: 'up' }
  }
  if (num < 0) {
    return { text: `↓ ${Math.abs(num).toFixed(2)}%`, color: '#52c41a', arrow: 'down' }
  }
  return { text: '0.00%', color: '#8c8c8c', arrow: '' }
}
