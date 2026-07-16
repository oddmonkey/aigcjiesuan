import { useMemo, useState, useEffect } from 'react'
import { Modal, Table, Tag, DatePicker, Tooltip, Popover, Button, Descriptions, Badge, message } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { getDetailByMember } from '../data/mockData.js'
import { dayjs } from '../utils/date.js'
import { formatNumber } from '../utils/format.js'
import { exportDetailExcel } from '../utils/export.js'
import { TASK_TYPES } from '../constants/index.js'

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

const PAGE_SIZE_DETAIL = 10

export default function DetailModal({ open, onClose, level, memberId, memberName, details }) {
  const [detailRange, setDetailRange] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([])

  const allDetails = useMemo(
    () => getDetailByMember(details || [], level, memberId),
    [details, level, memberId, open]
  )

  const displayDetails = useMemo(() => {
    if (!detailRange) return allDetails
    const [start, end] = detailRange
    if (!start || !end) return allDetails
    const s = dayjs(start).startOf('day')
    const e = dayjs(end).endOf('day')
    return allDetails.filter((d) => {
      const t = dayjs(d.consumeTime)
      return (t.isAfter(s) || t.isSame(s)) && (t.isBefore(e) || t.isSame(e))
    })
  }, [allDetails, detailRange])

  useEffect(() => {
    setFilteredData(displayDetails)
    setCurrentPage(1)
  }, [displayDetails])

  const onTableChange = (pagination, filters, sorter, extra) => {
    setCurrentPage(pagination.current || 1)
    setFilteredData(extra.currentDataSource || [])
  }

  const totalSum = useMemo(
    () => (filteredData.length ? filteredData : displayDetails).reduce((s, d) => s + (d.points || 0), 0),
    [filteredData, displayDetails]
  )

  const pageSum = useMemo(() => {
    const data = filteredData.length ? filteredData : displayDetails
    const startIdx = (currentPage - 1) * PAGE_SIZE_DETAIL
    const pageList = data.slice(startIdx, startIdx + PAGE_SIZE_DETAIL)
    return pageList.reduce((s, d) => s + (d.points || 0), 0)
  }, [filteredData, displayDetails, currentPage])

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
      filters: [...new Set(displayDetails.map((d) => d.projectName))].map((v) => ({ text: v, value: v })),
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
      filters: [...new Set(displayDetails.map((d) => d.groupName))].map((v) => ({ text: v, value: v })),
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
      filters: [...new Set(displayDetails.map((d) => d.teamName))].map((v) => ({ text: v, value: v })),
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
      filters: [...new Set(displayDetails.map((d) => d.partnerName))].map((v) => ({ text: v, value: v })),
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
      filters: [...new Set(displayDetails.map((d) => d.model))].map((m) => ({ text: m, value: m })),
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
    <Modal
      open={open}
      onCancel={onClose}
      width={1200}
      title={`明细记录 - ${memberName || ''}`}
      footer={null}
      destroyOnHidden
    >
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DatePicker.RangePicker
          allowClear
          value={detailRange}
          onChange={(range) => {
            setDetailRange(range)
            setCurrentPage(1)
          }}
        />
        <Button
          icon={<ExportOutlined />}
          onClick={() => {
            const data = filteredData.length ? filteredData : displayDetails
            exportDetailExcel({ memberName, details: data })
            message.success(`已导出 ${data.length} 条明细`)
          }}
        >
          导出 Excel
        </Button>
      </div>
      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={displayDetails}
        onChange={onTableChange}
        scroll={{ x: 1700 }}
        pagination={{
          pageSize: PAGE_SIZE_DETAIL,
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
    </Modal>
  )
}
