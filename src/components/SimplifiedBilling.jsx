import { useState, useEffect } from 'react'
import { Table, Tag, Tooltip, Popover, Button, Descriptions, Tabs, Card } from 'antd'
import { formatNumber } from '../utils/format.js'
import { PAGE_SIZE, TASK_TYPES } from '../constants/index.js'
import FilterBar from './FilterBar.jsx'
import SummaryCards from './SummaryCards.jsx'
import DataTable from './DataTable.jsx'

const TASK_TYPE_COLOR = {
  文生图: 'blue',
  视频生成: 'purple',
  语音合成: 'cyan',
  画质增强: 'gold',
  去字幕: 'magenta'
}

const MODEL_COLORS = {
  '香蕉3.0-Beta版': 'geekblue',
  '西瓜2.0': 'green',
  '葡萄1.5': 'purple',
  '橙子3.0': 'orange',
  '芒果2.5-Pro': 'magenta',
  '椰子1.0': 'cyan'
}

export default function SimplifiedBilling({
  level, setLevel, dimension, setDimension, period, setPeriod,
  customRange, setCustomRange, keyword, setKeyword, status, setStatus,
  model, setModel, modelOptions,
  summary, aggregate, filteredDetails, levelLabel, timeRangeLabel,
  onExport, modelBreakdown, expandedModelBreakdown
}) {
  return (
    <>
      <FilterBar
        level={level}
        setLevel={setLevel}
        dimension={dimension}
        setDimension={setDimension}
        period={period}
        setPeriod={setPeriod}
        customRange={customRange}
        setCustomRange={setCustomRange}
        keyword={keyword}
        setKeyword={setKeyword}
        model={model}
        setModel={setModel}
        modelOptions={modelOptions}
        status={status}
        setStatus={setStatus}
        onExport={onExport}
      />
      <div style={{ marginTop: 16 }}>
        <SummaryCards summary={summary} modelBreakdown={modelBreakdown} />
      </div>
      <Card style={{ marginTop: 16 }}>
        <Tabs
          defaultActiveKey="summary"
          size="large"
          items={[
            {
              key: 'summary',
              label: '汇总',
              children: <DataTable aggregate={aggregate} levelLabel={levelLabel} showAction={false} expandedModelBreakdown={expandedModelBreakdown} />
            },
            {
              key: 'details',
              label: `消耗明细 (${filteredDetails.length})`,
              children: <InlineDetailTable details={filteredDetails} levelLabel={levelLabel} />
            }
          ]}
        />
      </Card>
    </>
  )
}

function InlineDetailTable({ details }) {
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setFilteredData(details)
    setCurrentPage(1)
  }, [details])

  const onTableChange = (pagination, filters, sorter, extra) => {
    setCurrentPage(pagination.current || 1)
    setFilteredData(extra.currentDataSource || [])
  }

  const dataForCalc = filteredData.length ? filteredData : details
  const totalSum = dataForCalc.reduce((s, d) => s + (d.points || 0), 0)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const pageSum = dataForCalc
    .slice(startIdx, startIdx + PAGE_SIZE)
    .reduce((s, d) => s + (d.points || 0), 0)

  const columns = [
    {
      title: '记录 ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (v, record) => (
        <Tooltip title={record.id}>
          <span style={{ fontFamily: 'monospace', cursor: 'pointer' }}>
            {record.id.slice(0, 8)}
          </span>
        </Tooltip>
      )
    },
    {
      title: '使用人',
      dataIndex: 'userName',
      key: 'userName',
      width: 130,
      render: (v, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{record.userName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.userPhone}</div>
        </div>
      )
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 160,
      filters: [...new Set(details.map((d) => d.projectName))].map((v) => ({ text: v, value: v })),
      filterMultiple: true,
      onFilter: (value, record) => record.projectName === value,
      render: (v, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{record.projectName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'monospace' }}>
            {record.projectUuid}
          </div>
        </div>
      )
    },
    {
      title: '项目组',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 140,
      filters: [...new Set(details.map((d) => d.groupName))].map((v) => ({ text: v, value: v })),
      filterMultiple: true,
      onFilter: (value, record) => record.groupName === value,
      render: (v, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{record.groupName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'monospace' }}>
            {record.groupId}
          </div>
        </div>
      )
    },
    {
      title: '团队',
      dataIndex: 'teamName',
      key: 'teamName',
      width: 130,
      filters: [...new Set(details.map((d) => d.teamName))].map((v) => ({ text: v, value: v })),
      filterMultiple: true,
      onFilter: (value, record) => record.teamName === value,
      render: (v, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{record.teamName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'monospace' }}>
            {record.teamId}
          </div>
        </div>
      )
    },
    {
      title: '合作伙伴',
      dataIndex: 'partnerName',
      key: 'partnerName',
      width: 140,
      filters: [...new Set(details.map((d) => d.partnerName))].map((v) => ({ text: v, value: v })),
      filterMultiple: true,
      onFilter: (value, record) => record.partnerName === value,
      render: (v, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{record.partnerName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'monospace' }}>
            {record.partnerId}
          </div>
        </div>
      )
    },
    {
      title: '生成类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 110,
      filters: TASK_TYPES.map((t) => ({ text: t, value: t })),
      filterMultiple: true,
      onFilter: (value, record) => record.taskType === value,
      render: (v) => <Tag color={TASK_TYPE_COLOR[v] || 'default'}>{v}</Tag>
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 140,
      filters: [...new Set(details.map((d) => d.model))].map((m) => ({ text: m, value: m })),
      onFilter: (value, record) => record.model === value,
      render: (v) => <Tag color={MODEL_COLORS[v] || 'default'}>{v}</Tag>
    },
    {
      title: '参数摘要',
      dataIndex: 'params',
      key: 'params',
      width: 110,
      render: (v, record) => (
        <Popover
          trigger="hover"
          placement="left"
          content={
            <Descriptions column={1} size="small" bordered style={{ minWidth: 200 }}>
              {Object.entries(record.params || {}).map(([k, v]) => (
                <Descriptions.Item key={k} label={k}>{v}</Descriptions.Item>
              ))}
            </Descriptions>
          }
        >
          <Button type="link" size="small">查看参数</Button>
        </Popover>
      )
    },
    {
      title: '积分消耗',
      dataIndex: 'points',
      key: 'points',
      width: 130,
      align: 'right',
      render: (v, record) => (
        <Tooltip
          title={
            <div style={{ lineHeight: 1.8 }}>
              <div>预扣: {formatNumber(record.pointsBreakdown?.preDeduct || 0)}</div>
              <div>补扣: {formatNumber(record.pointsBreakdown?.supplement || 0)}</div>
              <div>退还: {formatNumber(record.pointsBreakdown?.refund || 0)}</div>
              <div style={{ borderTop: '1px solid #555', marginTop: 4, paddingTop: 4 }}>
                实际消耗: {formatNumber(record.points)}
              </div>
            </div>
          }
        >
          <span style={{ borderBottom: '1px dashed #999', cursor: 'pointer' }}>
            实际消耗: {formatNumber(record.points)}
          </span>
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '成功', value: 'success' },
        { text: '失败', value: 'fail' },
        { text: '退款', value: 'refund' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (v, record) => {
        if (v === 'success') return <Tag color="green">成功</Tag>
        if (v === 'fail')
          return (
            <Tooltip title={record.errorMessage}>
              <Tag color="red">失败</Tag>
            </Tooltip>
          )
        if (v === 'refund')
          return (
            <Tooltip title={record.errorMessage}>
              <Tag color="orange">退款</Tag>
            </Tooltip>
          )
        return <Tag>{v}</Tag>
      }
    },
    {
      title: '消耗时间',
      dataIndex: 'consumeTime',
      key: 'consumeTime',
      width: 170,
      render: (v) => v
    }
  ]

  return (
    <>
      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={details}
        onChange={onTableChange}
        scroll={{ x: 1700 }}
        pagination={{
          pageSize: PAGE_SIZE,
          showTotal: (t) => `共 ${t} 条`,
          showSizeChanger: false
        }}
      />
      <div style={{ marginTop: 12, color: '#595959', display: 'flex', gap: 32 }}>
        <span>
          小计(当前页): <b style={{ marginLeft: 4 }}>{formatNumber(pageSum)}</b>
        </span>
        <span>
          总计(全部): <b style={{ marginLeft: 4 }}>{formatNumber(totalSum)}</b>
        </span>
      </div>
    </>
  )
}
