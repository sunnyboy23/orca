import type { SettingsGeneralMessages } from './settings-types'

export const settingsGeneralZhCN: SettingsGeneralMessages = {
    workspace: {
      title: '工作区',
      description: '配置新工作区的创建位置和默认行为。'
    },
    editor: {
      title: '编辑器',
      description: '配置 Orca 如何保存文件编辑。'
    },
    updates: {
      title: '更新',
      currentVersion: (version) => `当前版本：${version ?? '...'}`,
      check: {
        title: '检查更新',
        description: '检查应用更新，并安装新的 Orca 版本。',
        keywords: ['更新', '版本', '发布说明', '下载', 'update', 'version', 'release notes']
      },
      checkButton: '检查更新',
      installUpdate: (version) => `安装更新（${version}）`,
      restartToUpdate: (version) => `重启并更新（${version}）`,
      idle: 'Orca 会在启动时自动检查更新。',
      checking: '正在检查更新...',
      available: (version) => `发现新版本 ${version}。`,
      releaseNotes: '发布说明',
      latest: '当前已经是最新版本。',
      downloading: (version, percent) => `正在下载 v${version}... ${percent}%`,
      downloaded: (version) => `版本 ${version} 已准备好安装。`,
      updateError: (message) => `更新失败。${message}`,
      checkError: (message) => `检查更新失败。${message}`,
      downloadStartError: '无法开始下载更新。'
    },
    cacheTimer: {
      header: {
        title: 'Prompt 缓存计时器',
        description:
          'Claude 会缓存对话以降低成本。空闲太久后缓存会过期，下一条消息需要重新发送完整上下文，成本更高。这里会显示倒计时，方便你知道何时继续。',
        keywords: ['缓存', '计时器', 'prompt', 'ttl', 'claude', '成本', 'token']
      },
      cacheTimer: {
        title: '缓存计时器',
        description: 'Claude Agent 空闲后显示倒计时。',
        keywords: ['缓存', '计时器', 'prompt', 'ttl', 'claude', '成本', 'token']
      },
      timerDescription: 'Claude Agent 空闲后，在侧边栏显示倒计时。',
      duration: {
        title: '计时时长',
        description: '与服务商的缓存 TTL 保持一致。',
        keywords: ['缓存', '计时器', '时长', 'ttl']
      },
      durationDescription: '与服务商的缓存 TTL 保持一致。默认是 5 分钟。',
      fiveMinutes: '5 分钟',
      oneHour: '1 小时'
    },
    support: {
      title: '支持 Orca',
      star: {
        title: '在 GitHub 上 Star Orca',
        description: '通过 gh CLI 给项目点 Star，支持 Orca 继续改进。',
        keywords: ['star', 'github', '支持', '反馈', '喜欢']
      },
      starring: '正在 Star...',
      tryAgain: '重试',
      starButton: 'Star',
      thanks: '感谢支持！'
    },
    fields: {
      workspaceDirectory: {
        title: '工作区目录',
        description: '创建工作区文件夹的根目录。',
        keywords: ['工作区', '目录', '路径', 'workspace', 'folder', 'path', 'worktree']
      },
      nestWorkspaces: {
        title: '按仓库归类工作区',
        description: '在以仓库命名的子文件夹中创建工作区。',
        keywords: ['嵌套', '子目录', '仓库', 'nested', 'subfolder', 'directory']
      },
      askBeforeDeletingWorkspaces: {
        title: '删除工作区前确认',
        description: '删除工作区前显示确认对话框。',
        keywords: ['删除', 'worktree', '确认', '对话框', 'delete', 'confirm', 'dialog']
      },
      askBeforeDeletingWorkspacesToggle:
        '从右键菜单删除工作区前先确认。删除失败时仍会显示“强制删除”选项。',
      askBeforeDeletingAutomations: {
        title: '删除自动化前确认',
        description: '删除自动化及其运行历史前显示确认对话框。',
        keywords: ['删除', '自动化', '确认', '对话框', 'delete', 'automation', 'confirm']
      },
      askBeforeDeletingAutomationsToggle: '删除自动化及其运行历史前先确认。',
      openInMenu: {
        title: '“打开方式”菜单',
        description: '向工作区的“打开方式”菜单添加自定义启动器。',
        keywords: ['打开方式', '编辑器', '启动器', 'cursor', 'zed', '命令', 'vscode', 'open in']
      },
      openInMenuDescription:
        'VS Code 会始终排在第一位。添加可执行命令后，每个工作区的“打开方式”菜单都会显示对应入口。',
      openInMenuCommandNote:
        '命令不会经过 shell 解析。这里只填写可执行命令名；如果需要参数，请使用包装脚本。',
      labelPlaceholder: '名称',
      executableCommandPlaceholder: '可执行命令',
      addCursor: '添加 Cursor',
      addZed: '添加 Zed',
      addCustomLauncher: '添加自定义启动器',
      autoSaveFiles: {
        title: '自动保存文件',
        description: '在短暂停顿后自动保存编辑器和可编辑 diff 中的更改。',
        keywords: ['自动保存', '保存', 'autosave', 'save']
      },
      autoSaveDelay: {
        title: '自动保存延迟',
        description: '最后一次编辑后，Orca 等待多久再自动保存。',
        keywords: ['自动保存', '延迟', '毫秒', 'autosave', 'delay']
      },
      autoSaveDelayDescription: (defaultMs) =>
        `最后一次编辑后，Orca 等待多久再自动保存。首次启动默认 ${defaultMs} ms。`,
      defaultDiffView: {
        title: '默认 diff 视图',
        description: '默认展示 Git diff 时使用的视图形式。',
        keywords: ['diff', '视图', 'inline', 'side-by-side', 'split']
      },
      defaultDiffFileTree: {
        title: '默认 diff 文件树',
        description: '打开组合 diff 视图时默认显示或隐藏文件树。',
        keywords: ['diff', '文件树', 'combined diff', 'sidebar']
      },
      minimap: {
        title: '缩略图',
        description: '编辑文件时显示代码缩略概览。',
        keywords: ['缩略图', '概览', '代码', '滚动', 'minimap']
      },
      markdownReviewNotes: {
        title: 'Markdown 审阅备注',
        description: '在富文本编辑模式中显示本地 Markdown 备注控件和 Agent 交接操作。',
        keywords: ['markdown', '审阅', '备注', '批注', 'agent']
      }
    },
    actions: {
      browse: '浏览',
      remove: '移除'
    },
    options: {
      inline: '行内',
      sideBySide: '并排',
      shown: '显示',
      hidden: '隐藏'
    }
  }
