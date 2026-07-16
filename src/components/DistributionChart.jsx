import { useState } from 'react'
import { Card, Segmented, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'

export default function DistributionChart({ distribution, levelLabel }) {
  const [type, setType] = useState('pie')

  const buildOption = () => {
    if (type === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: (p) => `${p.name}：${p.value}（${p.percent}%）`
        },
        legend: { type: 'scroll', bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: distribution.map((d) => ({ name: d.name, value: d.value })),
            label: { formatter: '{b} {d}%' }
          }
        ]
      }
    }
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const p = params[0]
          const idx = p.dataIndex
          const percent = distribution[idx] ? distribution[idx].percent : 0
          return `${p.name}：${p.value}（${percent}%）`
        }
      },
      grid: { left: 50, right: 24, top: 40, bottom: 60 },
      xAxis: {
        type: 'category',
        data: distribution.map((d) => d.name),
        axisLabel: { rotate: 30 }
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: distribution.map((d) => d.value)
        }
      ]
    }
  }

  return (
    <Card
      title={`消耗分布(按${levelLabel})`}
      extra={
        <Segmented
          options={[
            { value: 'pie', label: '饼图' },
            { value: 'bar', label: '柱状图' }
          ]}
          value={type}
          onChange={setType}
        />
      }
      style={{ marginTop: 16 }}
    >
      {distribution && distribution.length > 0 ? (
        <ReactECharts option={buildOption()} style={{ height: 320 }} />
      ) : (
        <Empty style={{ padding: 60 }} />
      )}
    </Card>
  )
}
