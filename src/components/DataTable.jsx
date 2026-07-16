import { Card, Table, Button, Empty, Tag } from 'antd'
import { PAGE_SIZE, MODEL_COLORS } from '../constants/index.js'
import { formatNumber } from '../utils/format.js'

export default function DataTable({ aggregate, onViewDetail, levelLabel, showAction = true, expandedModelBreakdown }) {
  const columns = [
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
      sorter: (a, b) => a.points - b.points,
      render: (v) => formatNumber(v)
    },
    {
      title: '消耗次数',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      sorter: (a, b) => a.count - b.count,
      render: (v) => formatNumber(v)
    },
    {
      title: '最近消耗时间',
      dataIndex: 'lastTime',
      key: 'lastTime'
    }
  ]
  if (showAction) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => onViewDetail && onViewDetail(record)}>
          查看明细
        </Button>
      )
    })
  }

  return (
    <Card
      title="数据列表"
      extra={levelLabel ? <span style={{ color: '#8c8c8c' }}>{levelLabel}</span> : null}
    >
      {(!Array.isArray(aggregate) || aggregate.length === 0) ? (
        <Empty />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={aggregate}
          sticky={{ offsetHeader: 0 }}
          pagination={{
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`
          }}
          expandable={expandedModelBreakdown ? {
            expandedRowRender: (record) => {
              const rows = expandedModelBreakdown(record)
              if (!rows || rows.length === 0) {
                return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无模型数据" />
              }
              const subColumns = [
                { title: '模型', dataIndex: 'model', key: 'model', render: (v) => <Tag color={MODEL_COLORS[v] || 'default'}>{v}</Tag> },
                { title: '消耗积分', dataIndex: 'points', key: 'points', align: 'right', render: (v) => formatNumber(v) },
                { title: '消耗次数', dataIndex: 'count', key: 'count', align: 'right', render: (v) => formatNumber(v) },
                { title: '积分占比', dataIndex: 'percent', key: 'percent', align: 'right', render: (v) => `${(v * 100).toFixed(1)}%` }
              ]
              return <Table columns={subColumns} dataSource={rows} pagination={false} size="small" rowKey="model" />
            },
            rowExpandable: (record) => expandedModelBreakdown(record) && expandedModelBreakdown(record).length > 0
          } : undefined}
        />
      )}
    </Card>
  )
}
