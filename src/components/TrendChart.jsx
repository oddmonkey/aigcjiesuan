import { Card } from 'antd'
import ReactECharts from 'echarts-for-react'

export default function TrendChart({ trend, granularity }) {
  const option = {
    color: ['#1677ff'],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        const idx = p.dataIndex
        const points = p.value
        const count = trend[idx] ? trend[idx].count : 0
        return `${p.axisValue}<br/>消耗积分：${points}<br/>消耗次数：${count}`
      }
    },
    grid: { left: 50, right: 24, top: 40, bottom: 60 },
    xAxis: {
      type: 'category',
      data: trend.map((t) => t.label),
      axisLabel: { rotate: trend.length > 12 ? 45 : 0 }
    },
    yAxis: {
      type: 'value',
      name: '消耗积分'
    },
    series: [
      {
        name: '消耗积分',
        type: 'line',
        smooth: false,
        data: trend.map((t) => t.points),
        areaStyle: { opacity: 0.05 }
      }
    ]
  }

  return (
    <Card title="消耗趋势" style={{ minHeight: 360, marginTop: 16 }}>
      <ReactECharts option={option} style={{ height: 320 }} />
    </Card>
  )
}
