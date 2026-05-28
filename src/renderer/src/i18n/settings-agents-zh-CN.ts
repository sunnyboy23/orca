import type { AgentsMessages } from './settings-agents-types'

const awakeKeywords = [
  'awake',
  'sleep',
  'power',
  'agent',
  'running',
  'working',
  'lid',
  'display',
  '唤醒',
  '睡眠',
  '电源',
  '运行',
  '合盖',
  '屏幕'
]

export const agentsZhCN: AgentsMessages = {
  search: {
    agents: {
      title: 'Agent',
      description: '配置 AI 编程 Agent、默认 Agent 和命令覆盖。',
      keywords: [
        'agent',
        'default',
        'claude',
        'codex',
        'opencode',
        'pi',
        'gemini',
        'aider',
        'goose',
        'amp',
        'kilocode',
        'kiro',
        'charm',
        'auggie',
        'cline',
        'codebuff',
        'continue',
        'cursor',
        'droid',
        'kimi',
        'mistral',
        'qwen',
        'rovo',
        'hermes',
        'openclaw',
        'copilot',
        'grok',
        'github',
        'github copilot',
        'command',
        'override',
        'install',
        'detected',
        '默认',
        '命令',
        '安装',
        '检测'
      ]
    },
    defaultAgent: {
      title: '默认 Agent',
      description: '在新建工作区输入框中预先选择 AI 编程 Agent。',
      keywords: [
        'agent',
        'default',
        'claude',
        'codex',
        'opencode',
        'pi',
        'gemini',
        'aider',
        'copilot',
        'grok',
        '默认',
        '新建工作区'
      ]
    },
    awake: {
      title: 'Agent 工作时保持电脑唤醒',
      description:
        'Agent 工作时保持电脑和屏幕唤醒。Orca 也会请求设备在合盖时保持唤醒，但最终仍受系统电源策略限制。',
      windowsDescription: 'Agent 工作时保持电脑和屏幕唤醒。合盖行为遵循这台设备的电源设置。',
      keywords: awakeKeywords
    }
  },
  defaultAgent: {
    title: '默认 Agent',
    description: '打开新工作区时预先选择的 Agent。',
    auto: '自动',
    blank: '无 Agent（空白终端）'
  },
  awake: {
    title: 'Agent 工作时保持电脑唤醒',
    description:
      'Agent 工作时保持电脑和屏幕唤醒。Orca 也会请求设备在合盖时保持唤醒，但最终仍受系统电源策略限制。',
    windowsDescription: 'Agent 工作时保持电脑和屏幕唤醒。合盖行为遵循这台设备的电源设置。'
  },
  row: {
    command: '命令',
    reset: '重置',
    detected: '已检测到',
    notInstalled: '未安装',
    defaultAgent: '默认 Agent',
    setDefault: '设为默认',
    default: '默认',
    customizeCommand: '自定义命令',
    docs: '文档',
    install: '安装',
    collapseCommand: '收起命令覆盖',
    expandCommand: '展开命令覆盖',
    overrideHelp: '覆盖启动这个 Agent 时使用的二进制路径或命令名。'
  },
  sections: {
    installed: '已安装',
    detectedCount: (count) => `已检测到 ${count} 个`,
    availableToInstall: '可安装',
    agentsCount: (count) => `${count} 个 Agent`,
    refreshTitle: '重新读取 shell PATH，并重新检测已安装的 Agent',
    refreshing: '刷新中...',
    refresh: '刷新',
    detecting: '正在检测已安装的 Agent...'
  }
}
