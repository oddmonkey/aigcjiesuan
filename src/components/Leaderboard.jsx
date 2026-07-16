import { useMemo, useState } from 'react'
import { Card, Table, Segmented, Tag, Empty } from 'antd'
import { formatNumber, formatPercent } from '../utils/format.js'

const MEDAL_COLORS = ['#faad14', '#d9d9d9', '#d48806']

export default function Leaderboard({ aggregate, levelLabel }) {
  const [sortBy, setSortBy] = useState('points')

  const top10 = useMemo(() => {
    if (!Array.isArray(aggregate) || aggregate.length === 0) return []
    const list = aggregate.slice().sort((a, b) => {
      if (sortBy === 'count') return b.count - a.count
      return b.points - a.points
    })
    return list.slice(0, 10)
  }, [aggregate, sortBy])

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (_, __, index) => {
        if (index < 3) {
          return <Tag color={MEDAL_COLORS[index]}>No.{index + 1}</Tag>
        }
        return index + 1
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '消耗积分',
      dataIndex: 'points',
      key: 'points',
      align: 'right',
      render: (v) => formatNumber(v)
    },
    {
      title: '消耗次数',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (v) => formatNumber(v)
    },
    {
      title: '占比',
      dataIndex: 'percent',
      key: 'percent',
      align: 'right',
      render: (v) => formatPercent(v)
    }
  ]

  return (
    <Card
      title="消耗排行榜"
      extra={levelLabel ? <span style={{ color: '#8c8c8c' }}>{levelLabel}</span> : null}
    >
      <div style={{ marginBottom: 12 }}>
        <Segmented
          value={sortBy}
          onChange={setSortBy}
          options={[
            { label: '消耗积分', value: 'points' },
            { label: '消耗次数', value: 'count' }
          ]}
        />
      </div>
      {top10.length === 0 ? (
        <Empty />
      ) : (
        <Table
          size="small"
          columns={columns}
          dataSource={top10}
          rowKey="id"
          pagination={false}
        />
      )}
    </Card>
  )
}
