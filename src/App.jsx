import { useMemo, useState, useCallback } from 'react'
import { Row, Col } from 'antd'
import BasicLayout from './components/Layout.jsx'
import FilterBar from './components/FilterBar.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import TrendChart from './components/TrendChart.jsx'
import DistributionChart from './components/DistributionChart.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import DataTable from './components/DataTable.jsx'
import DetailModal from './components/DetailModal.jsx'
import ExportModal from './components/ExportModal.jsx'
import SimplifiedBilling from './components/SimplifiedBilling.jsx'
import { LEVELS, LEVEL_FIELDS } from './constants/index.js'
import { dayjs } from './utils/date.js'
import {
  getDetailsData,
  getTimeRange,
  filterDetails,
  computeSummary,
  aggregateByLevel,
  getTrend,
  getDistribution
} from './data/mockData.js'
import './App.css'

export default function App() {
  const [level, setLevel] = useState('user')
  const [dimension, setDimension] = useState('month')
  const [period, setPeriod] = useState(() => dayjs())
  const [customRange, setCustomRange] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [model, setModel] = useState('')
  const [status, setStatus] = useState('')

  const [detailModal, setDetailModal] = useState({ open: false, memberId: '', memberName: '' })
  const [exportOpen, setExportOpen] = useState(false)
  const [route, setRoute] = useState('simplified')

  const details = useMemo(() => getDetailsData(), [])

  const timeRange = useMemo(
    () => getTimeRange(dimension, period, customRange),
    [dimension, period, customRange]
  )

  const prevTimeRange = useMemo(
    () => ({ start: timeRange.prevStart, end: timeRange.prevEnd, days: timeRange.days }),
    [timeRange]
  )

  // 关键修复:keyword + model 在最底层过滤,作用于所有下游
  const nameKey = LEVEL_FIELDS[level]?.nameKey

  const modelOptions = useMemo(
    () => [...new Set(details.map((d) => d.model).filter(Boolean))],
    [details]
  )

  const scopedDetails = useMemo(() => {
    let r = details
    if (keyword) r = r.filter((d) => String(d[nameKey] || '').includes(keyword))
    if (model) r = r.filter((d) => d.model === model)
    return r
  }, [details, keyword, nameKey, model])

  const summary = useMemo(
    () => computeSummary(scopedDetails, timeRange, prevTimeRange, { status }),
    [scopedDetails, timeRange, prevTimeRange, status]
  )

  const filteredDetails = useMemo(
    () => filterDetails(scopedDetails, { timeRange, status }),
    [scopedDetails, timeRange, status]
  )

  // 模型分布(基于 filteredDetails,用于 SummaryCards 的 Popover)
  const modelBreakdown = useMemo(() => {
    const m = {}
    for (const d of filteredDetails) {
      if (!d.model) continue
      if (!m[d.model]) m[d.model] = { points: 0, count: 0 }
      m[d.model].points += d.points || 0
      m[d.model].count += 1
    }
    return m
  }, [filteredDetails])

  const aggregate = useMemo(
    () => aggregateByLevel(filteredDetails, level),
    [filteredDetails, level]
  )

  // 每个成员的模型拆分(基于 filteredDetails 按当前 level 聚合,用于导出宽表)
  const aggregateModelMap = useMemo(() => {
    const map = {}
    const nameKeyL = LEVEL_FIELDS[level]?.nameKey
    for (const d of filteredDetails) {
      const name = d[nameKeyL]
      if (!name) continue
      if (!map[name]) map[name] = {}
      if (!map[name][d.model]) map[name][d.model] = { points: 0, count: 0 }
      map[name][d.model].points += d.points || 0
      map[name][d.model].count += 1
    }
    return map
  }, [filteredDetails, level])

  // DataTable 展开行:按成员返回模型数组
  const expandedModelBreakdown = useCallback((record) => {
    const md = aggregateModelMap[record.name]
    if (!md) return []
    const totalPoints = record.points || 0
    return Object.entries(md)
      .map(([m, v]) => ({ model: m, points: v.points, count: v.count, percent: totalPoints > 0 ? v.points / totalPoints : 0 }))
      .sort((a, b) => b.points - a.points)
  }, [aggregateModelMap])

  const trend = useMemo(
    () => getTrend(filteredDetails, level, timeRange),
    [filteredDetails, level, timeRange]
  )

  const distribution = useMemo(() => getDistribution(aggregate), [aggregate])

  const levelLabel = LEVELS.find((l) => l.value === level)?.label

  const timeRangeLabel = useMemo(() => {
    if (dimension === 'custom') {
      return customRange
        ? `${customRange.start.format('YYYY-MM-DD')}~${customRange.end.format('YYYY-MM-DD')}`
        : '自定义'
    }
    if (!period) return dimension
    switch (dimension) {
      case 'day':
        return period.format('YYYY-MM-DD')
      case 'week':
        return `${period.isoWeek()}周`
      case 'month':
        return period.format('YYYY-MM')
      case 'quarter':
        return `${period.format('YYYY')}-Q${period.quarter()}`
      case 'year':
        return period.format('YYYY')
      default:
        return dimension
    }
  }, [dimension, period, customRange])

  const openDetail = (record) =>
    setDetailModal({ open: true, memberId: record.id, memberName: record.name })

  return (
    <BasicLayout activeKey={route} onNavigate={setRoute}>
      {route === 'simplified' ? (
        <SimplifiedBilling
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
          summary={summary}
          aggregate={aggregate}
          filteredDetails={filteredDetails}
          levelLabel={levelLabel}
          timeRangeLabel={timeRangeLabel}
          onExport={() => setExportOpen(true)}
          modelBreakdown={modelBreakdown}
          expandedModelBreakdown={expandedModelBreakdown}
        />
      ) : (
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
            onExport={() => setExportOpen(true)}
          />
          <div style={{ marginTop: 16 }}>
            <SummaryCards summary={summary} modelBreakdown={modelBreakdown} />
          </div>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
              <TrendChart trend={trend} granularity={timeRange.granularity} />
            </Col>
            <Col xs={24} lg={8}>
              <DistributionChart distribution={distribution} levelLabel={levelLabel} />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} lg={10}>
              <Leaderboard aggregate={aggregate} levelLabel={levelLabel} />
            </Col>
            <Col xs={24} lg={14}>
              <DataTable aggregate={aggregate} onViewDetail={openDetail} levelLabel={levelLabel} />
            </Col>
          </Row>
          <DetailModal
            open={detailModal.open}
            onClose={() => setDetailModal((m) => ({ ...m, open: false }))}
            level={level}
            memberId={detailModal.memberId}
            memberName={detailModal.memberName}
            details={filteredDetails}
          />
        </>
      )}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        levelLabel={levelLabel}
        timeRangeLabel={timeRangeLabel}
        aggregate={aggregate}
        details={filteredDetails}
        modelOptions={modelOptions}
        aggregateModelMap={aggregateModelMap}
      />
    </BasicLayout>
  )
}
