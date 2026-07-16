import { Layout, Menu, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

const { Sider, Header, Content } = Layout

const menuItems = [
  {
    key: 'points',
    label: '积分管理',
    children: [
      { key: 'billing', label: '结算中心' },
      { key: 'simplified', label: '对账明细 (Dev版)' }
    ]
  }
]

export default function BasicLayout({ activeKey, onNavigate, children }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} collapsible={false} theme="dark">
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            whiteSpace: 'nowrap'
          }}
        >
          AIGC 管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          defaultOpenKeys={['points']}
          items={menuItems}
          onClick={({ key }) => onNavigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Avatar icon={<UserOutlined />} />
          <span>平台管理员</span>
        </Header>
        <Content style={{ padding: 24, background: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
