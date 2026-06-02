const DIRECT_RUN_PREFIXES = ['run', '/run', '任务', '开发任务', '创建任务', '帮我', '请帮我']

const ACTION_KEYWORDS = [
  '修复',
  '实现',
  '开发',
  '新增',
  '添加',
  '改造',
  '修改',
  '优化',
  '重构',
  '排查',
  '定位',
  '测试',
  '验证',
  '启动',
  '运行',
  '部署',
  'fix',
  'implement',
  'add',
  'update',
  'change',
  'refactor',
  'debug',
  'test',
  'run',
  'deploy'
]

const TARGET_KEYWORDS = [
  '代码',
  '项目',
  '软件',
  '页面',
  '界面',
  '组件',
  '功能',
  '按钮',
  '面板',
  '接口',
  '服务',
  '配置',
  '报错',
  'bug',
  '白屏',
  '崩溃',
  '消息',
  '通信',
  '实时',
  '刷新',
  'agent',
  'agents',
  'cli',
  'dev',
  'app',
  'ui',
  'api',
  'ipc',
  'electron',
  'react',
  'typescript',
  'ts'
]

const CASUAL_PATTERNS = [
  /^你?好[啊呀]?[。.!！?？]*$/i,
  /^hi[。.!！?？]*$/i,
  /^hello[。.!！?？]*$/i,
  /^在吗[。.!！?？]*$/i,
  /^收到[。.!！?？]*$/i,
  /^ok[。.!！?？]*$/i,
  /^好的[。.!！?？]*$/i,
  /^谢谢[。.!！?？]*$/i,
  /^辛苦了[。.!！?？]*$/i
]

export type FeishuDevelopmentTaskIntent =
  | { shouldCreate: true; spec: string }
  | { shouldCreate: false; reason: 'empty' | 'casual' | 'unclear' }

export function classifyFeishuDevelopmentTaskIntent(text: string): FeishuDevelopmentTaskIntent {
  const normalized = normalizeIntentText(text)
  if (!normalized) {
    return { shouldCreate: false, reason: 'empty' }
  }
  if (CASUAL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { shouldCreate: false, reason: 'casual' }
  }

  const directSpec = stripDirectRunPrefix(normalized)
  if (directSpec) {
    return { shouldCreate: true, spec: directSpec }
  }

  const lowered = normalized.toLowerCase()
  const hasAction = ACTION_KEYWORDS.some((keyword) => lowered.includes(keyword.toLowerCase()))
  const hasTarget = TARGET_KEYWORDS.some((keyword) => lowered.includes(keyword.toLowerCase()))
  if (hasAction && hasTarget) {
    return { shouldCreate: true, spec: normalized }
  }

  return { shouldCreate: false, reason: 'unclear' }
}

function normalizeIntentText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

function stripDirectRunPrefix(text: string): string | null {
  for (const prefix of DIRECT_RUN_PREFIXES) {
    const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:\\s+|[:：])(.+)$`, 'i')
    const match = pattern.exec(text)
    const spec = match?.[1]?.trim()
    if (spec) {
      return spec
    }
  }
  return null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
