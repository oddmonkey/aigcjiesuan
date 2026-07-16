import { Row, Col, Card, Statistic, Popover, Tag, Button } from 'antd'
import { formatNumber, formatChange } from '../utils/format.js'
import { MODEL_COLORS } from '../constants/index.js'

export default function SummaryCards({ summary, modelBreakdown }) {
  const change = formatChange(summary.changePercent)
  const hasBreakdown = modelBreakdown && Object.keys(modelBreakdown).length > 0

  return (
    <Row gutter={16}>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderLeft: '4px solid #1677ff' }}>
          <Statistic title="总消耗积分" value={formatNumber(summary.totalPoints)} />
          {hasBreakdown && (
            <Popover
              trigger="hover"
              placement="bottom"
              content={
                <div style={{ minWidth: 220 }}>
                  {Object.entries(modelBreakdown)
                    .sort((a, b) => b[1].points - a[1].points)
                    .map(([m, v]) => {
                      const pct = summary.totalPoints > 0 ? (v.points / summary.totalPoints * 100).toFixed(1) : '0.0'
                      return (
                        <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                          <Tag color={MODEL_COLORS[m] || 'default'}>{m}</Tag>
                          <span style={{ color: '#595959' }}>
                            {formatNumber(v.points)} 分 ({pct}%)
                          </span>
                        </div>
                      )
                    })}
                </div>
              }
            >
              <Button type="link" size="small" style={{ padding: 0, marginTop: 4, color: '#8c8c8c' }}>
                📊 模型分布
              </Button>
            </Popover>
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderLeft: '4px solid #52c41a' }}>
          <Statistic title="消耗次数" value={summary.totalCount} />
          {hasBreakdown && (
            <Popover
              trigger="hover"
              placement="bottom"
              content={
                <div style={{ minWidth: 220 }}>
                  {Object.entries(modelBreakdown)
                    .sort((a, b) => b[1].points - a[1].points)
                    .map(([m, v]) => {
                      const pct = summary.totalCount > 0 ? (v.count / summary.totalCount * 100).toFixed(1) : '0.0'
                      return (
                        <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                          <Tag color={MODEL_COLORS[m] || 'default'}>{m}</Tag>
                          <span style={{ color: '#595959' }}>
                            {formatNumber(v.count)} 次 ({pct}%)
                          </span>
                        </div>
                      )
                    })}
                </div>
              }
            >
              <Button type="link" size="small" style={{ padding: 0, marginTop: 4, color: '#8c8c8c' }}>
                📊 模型分布
              </Button>
            </Popover>
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderLeft: '4px solid #faad14' }}>
          <Statistic title="日均消耗" value={formatNumber(Math.round(summary.dailyAvg))} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderLeft: '4px solid #722ed1' }}>
          <Statistic
            title="环比变化"
            value={change.text}
            valueStyle={{ color: change.color }}
          />
        </Card>
      </Col>
    </Row>
  )
}
