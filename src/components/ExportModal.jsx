import { useState } from 'react'
import { Modal, Radio, message } from 'antd'
import { exportBillingExcel } from '../utils/export.js'

export default function ExportModal({
  open,
  onClose,
  levelLabel,
  timeRangeLabel,
  aggregate,
  details,
  modelOptions,
  aggregateModelMap
}) {
  const [exportRange, setExportRange] = useState('summary')

  const handleOk = () => {
    try {
      exportBillingExcel({
        levelLabel,
        timeRangeLabel,
        aggregate,
        details,
        withDetail: exportRange === 'all',
        modelOptions,
        aggregateModelMap
      })
      message.success('导出成功')
      onClose && onClose()
    } catch (e) {
      message.error('导出失败')
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title="导出数据"
      okText="导出"
      cancelText="取消"
    >
      <div style={{ marginBottom: 12, color: '#8c8c8c' }}>
        导出当前筛选条件下的数据。
      </div>
      <Radio.Group
        value={exportRange}
        onChange={(e) => setExportRange(e.target.value)}
      >
        <Radio value="summary">仅汇总</Radio>
        <Radio value="all">汇总+明细</Radio>
      </Radio.Group>
    </Modal>
  )
}
