import type { CommitMessageAiMessages } from './settings-panes-types'

export const commitMessageAiZhCN: CommitMessageAiMessages = {
  header: {
    title: 'AI Commit Message',
    description: '使用本地 Agent CLI 根据暂存变更生成 commit message。'
  },
  enable: {
    title: '启用 AI Commit Message',
    description: '在源码管理面板中显示 Generate 按钮。',
    rowDescription:
      '在源码管理面板中显示 Generate 按钮，根据暂存变更草拟 commit message。本地工作区会在本机运行 Agent CLI；远程工作区会在对应 SSH 主机上运行，并等待返回结果。',
    keywords: [
      'ai',
      'commit',
      'message',
      'generate',
      'agent',
      'claude',
      'codex',
      'source control',
      'enabled',
      '提交',
      '生成'
    ]
  },
  agent: {
    title: 'Agent',
    description: '生成 commit message 时调用的 Agent。',
    rowDescription:
      '选择负责草拟 commit message 的 Agent。Orca 会在后台调用它的 CLI，因此该 Agent 必须安装在托管 worktree 的机器上：本地 worktree 在本机，远程 worktree 在对应 SSH 主机。',
    keywords: ['agent', 'claude', 'codex', 'opencode', 'gemini', 'cursor', '智能体'],
    notConfigured: '未配置',
    comingSoon: '即将支持',
    custom: '自定义',
    unsupportedDefault: (agent) => `你的默认 Agent 是 ${agent}，它暂不支持生成 commit message。`,
    unsupportedSelectedComingSoon: (agent) => `${agent} 的 commit message 生成功能即将支持。`,
    unsupportedSelected: (agent) => `${agent} 暂不支持生成 commit message。`,
    chooseSupported: '请选择受支持的 Agent 或自定义命令。'
  },
  customCommand: {
    title: '自定义命令',
    label: '自定义命令',
    description: 'Orca 用来生成 commit message 的命令行。',
    keywords: ['custom', 'command', 'cli', 'binary', 'prompt', 'placeholder', 'ollama', '自定义', '命令'],
    help: {
      beforePlaceholder: '使用',
      afterPlaceholder: '表示 prompt 插入位置，它会作为单个参数传入。',
      stdin: '不写它时，prompt 会通过 stdin 传入，适合 claude -p 这类 CLI。',
      quoting:
        '引号只用于组合参数；Orca 不会调用 shell，因此 $VAR 和反引号不会展开。'
    },
    placeholder: (placeholder) => `例如 ollama run llama3.1 ${placeholder}`
  },
  model: {
    title: '模型',
    description: '所选 Agent 用来生成消息的模型。',
    keywords: ['model', 'haiku', 'sonnet', 'opus', 'gpt', '模型'],
    dynamicDescription: '当所选 CLI 支持模型发现时，可从该 CLI 刷新模型列表。',
    staticDescription: '这个 Agent 不支持模型发现，Orca 会使用手动维护的模型列表。',
    refresh: '刷新模型',
    discoveryFailed: '模型发现失败'
  },
  thinking: {
    title: '思考强度',
    description: '所选模型的推理强度。强度越高通常越慢。',
    rowDescription: '更高强度会生成更谨慎的消息，但耗时更长，也会消耗更多 token。',
    keywords: ['thinking', 'effort', 'reasoning', '思考', '推理'],
    levels: {
      off: '关闭',
      low: '低',
      medium: '中',
      high: '高',
      xhigh: '超高',
      max: '最大'
    }
  },
  customPrompt: {
    title: '自定义 Prompt',
    description: '追加到基础 prompt 后面的可选指令，例如 Conventional Commits 风格。',
    rowDescription:
      '这段内容会原样追加到基础 prompt。可用来约束 Conventional Commits、gitmoji、工单前缀或团队偏好的其他格式。',
    keywords: ['prompt', 'conventional commits', 'gitmoji', 'style', '提示词', '风格'],
    placeholder: '使用 Conventional Commits 格式（feat:、fix: 等）。如果有关联工单，请引用工单 key。',
    unsavedChanges: '有未保存的更改',
    saved: '已保存',
    discard: '放弃',
    saving: '保存中...',
    save: '保存'
  }
}
