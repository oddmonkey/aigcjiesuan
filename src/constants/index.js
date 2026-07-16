// 层级定义(从细到粗)
export const LEVELS = [
  { value: 'platform', label: '平台' },
  { value: 'user', label: '用户' },
  { value: 'project', label: '项目' },
  { value: 'group', label: '项目组' },
  { value: 'team', label: '团队' },
  { value: 'partner', label: '合作伙伴' }
]

// 每个层级对应的 id / name 字段名
export const LEVEL_FIELDS = {
  platform: { idKey: 'partnerId', nameKey: 'partnerName' },
  user: { idKey: 'userId', nameKey: 'userName' },
  project: { idKey: 'projectId', nameKey: 'projectName' },
  group: { idKey: 'groupId', nameKey: 'groupName' },
  team: { idKey: 'teamId', nameKey: 'teamName' },
  partner: { idKey: 'partnerId', nameKey: 'partnerName' }
}

// 任务类型
export const TASK_TYPES = ['文生图', '视频生成', '语音合成', '画质增强', '去字幕']

// 状态选项
export const STATUS_OPTIONS = [
  { value: 'success', label: '成功' },
  { value: 'fail', label: '失败' },
  { value: 'refund', label: '退款' }
]

// 模型列表
export const MODELS = ['香蕉3.0-Beta版', '西瓜2.0', '葡萄1.5', '橙子3.0', '芒果2.5-Pro', '椰子1.0']

// 时间维度
export const TIME_DIMENSIONS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年' },
  { value: 'custom', label: '自定义' }
]

// 分页大小
export const PAGE_SIZE = 20

// 模型颜色字典(统一色板)
export const MODEL_COLORS = {
  '香蕉3.0-Beta版': 'gold',
  '西瓜2.0': 'green',
  '葡萄1.5': 'purple',
  '橙子3.0': 'orange',
  '芒果2.5-Pro': 'magenta',
  '椰子1.0': 'cyan'
}
