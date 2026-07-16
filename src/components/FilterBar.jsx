import { Card, Select, Segmented, DatePicker, Input, Button, Space } from 'antd'
import { LEVELS, TIME_DIMENSIONS, STATUS_OPTIONS } from '../constants/index.js'
import { dayjs } from '../utils/date.js'

const { RangePicker } = DatePicker

const labelStyle = { color: '#595959', fontSize: 13, whiteSpace: 'nowrap' }

export default function FilterBar({
  level,
  setLevel,
  dimension,
  setDimension,
  period,
  setPeriod,
  customRange,
  setCustomRange,
  keyword,
  setKeyword,
  model,
  setModel,
  modelOptions,
  status,
  setStatus,
  onExport
}) {
  const statusOptions = [{ value: '', label: '全部状态' }].concat(STATUS_OPTIONS)

  const handleDimensionChange = (value) => {
    setDimension(value)
    // 切换维度时默认选中"当前"周期,避免空值
    setPeriod(dayjs())
  }

  // 根据 dimension 渲染第二级具体周期选择器
  const renderPeriodPicker = () => {
    switch (dimension) {
      case 'day':
        return (
          <DatePicker
            value={period}
            onChange={setPeriod}
            placeholder="选择日期"
          />
        )
      case 'week':
        return (
          <DatePicker
            picker="week"
            value={period}
            onChange={(d) => setPeriod(d)}
            placeholder="选择周"
          />
        )
      case 'month':
        return (
          <DatePicker
            picker="month"
            value={period}
            onChange={setPeriod}
            placeholder="选择月份"
          />
        )
      case 'quarter':
        return (
          <DatePicker
            picker="quarter"
            value={period}
            onChange={setPeriod}
            placeholder="选择季度"
          />
        )
      case 'year':
        return (
          <DatePicker
            picker="year"
            value={period}
            onChange={setPeriod}
            placeholder="选择年份"
          />
        )
      case 'custom':
        return (
          <RangePicker
            value={customRange ? [customRange.start, customRange.end] : null}
            onChange={(dates) => {
              if (dates) {
                setCustomRange({ start: dates[0], end: dates[1] })
              } else {
                setCustomRange(null)
              }
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap size={[12, 12]}>
        <Space size={6}>
          <span style={labelStyle}>层级</span>
          <Select
            options={LEVELS}
            value={level}
            onChange={setLevel}
            style={{ width: 140 }}
          />
        </Space>
        <Space size={6}>
          <span style={labelStyle}>时间</span>
          <Segmented
            options={TIME_DIMENSIONS}
            value={dimension}
            onChange={handleDimensionChange}
          />
        </Space>
        {renderPeriodPicker()}
        <Input.Search
          placeholder="搜索名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          style={{ width: 200 }}
        />
        <Space size={6}>
          <span style={labelStyle}>模型</span>
          <Select
            value={model}
            onChange={setModel}
            style={{ width: 160 }}
            options={[{ value: '', label: '全部模型' }, ...(modelOptions || []).map((m) => ({ value: m, label: m }))]}
          />
        </Space>
        <Button type="primary" onClick={onExport}>
          导出 Excel
        </Button>
      </Space>
    </Card>
  )
}
