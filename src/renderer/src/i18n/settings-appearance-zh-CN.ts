import type { SettingsAppearanceMessages } from './settings-types'

export const settingsAppearanceZhCN: SettingsAppearanceMessages = {
    unassigned: '未分配',
    sections: {
      interface: '界面',
      layout: {
        title: '布局',
        description: '创建新 worktree 时使用的默认布局。'
      },
      titlebar: {
        title: '标题栏',
        description: '控制应用标题栏显示哪些内容。'
      },
      statusBar: {
        title: '状态栏',
        description: '选择窗口底部显示哪些状态项。你也可以右键状态栏进行同样的切换。'
      },
      sidebar: '侧边栏'
    },
    fields: {
      theme: {
        title: '主题',
        description: '选择 Orca 应用窗口的外观。',
        keywords: ['深色', '浅色', '系统', 'dark', 'light', 'system']
      },
      uiZoom: {
        title: '界面缩放',
        description: '缩放整个应用界面。',
        keywords: ['缩放', '比例', '快捷键', 'zoom', 'scale']
      },
      uiZoomDescription: '缩放整个应用界面。不在终端 pane 中时，也可以使用下面的快捷键。',
      ideFont: {
        title: '界面字体',
        description: '选择 Orca 界面使用的字体。',
        keywords: ['字体', '排版', '界面', 'font', 'typeface', 'typography', 'ui']
      },
      openRightSidebar: {
        title: '默认打开右侧边栏',
        description: '创建新 worktree 时自动展开文件浏览器面板。',
        keywords: ['布局', '文件浏览器', '侧边栏', 'layout', 'file explorer']
      },
      showGitIgnoredFiles: {
        title: '显示 Git 忽略文件',
        description: '在文件浏览器中显示被 .gitignore 匹配的文件。',
        keywords: ['git', 'gitignore', '忽略', '文件浏览器', '隐藏']
      },
      showGitIgnoredFilesToggle: '关闭后，文件浏览器会隐藏被 .gitignore 匹配的文件。',
      titlebarAppName: {
        title: '标题栏应用名',
        description: '在标题栏显示 Orca。',
        keywords: ['标题栏', 'orca', '应用名', '品牌', 'titlebar']
      },
      showTasksButton: {
        title: '显示任务按钮',
        description: '在左侧边栏顶部显示任务按钮。',
        keywords: ['任务', '侧边栏', '按钮', '显示', '隐藏', 'github', 'linear']
      },
      showMobileButton: {
        title: '显示 Orca Mobile 按钮',
        description: '在左侧边栏顶部显示 Orca Mobile 按钮。',
        keywords: ['移动端', '手机', '侧边栏', '按钮', '显示', '隐藏', 'toolbox']
      },
      showMobileButtonToggle: '在侧边栏显示 Orca Mobile 快捷入口。它仍可从工具箱打开。'
    },
    themeOptions: {
      system: '跟随系统',
      dark: '深色',
      light: '浅色'
    },
    statusBarToggles: {
      claude: {
        title: 'Claude 用量',
        description: '在状态栏显示 Claude token 和费用用量。',
        keywords: ['状态栏', 'claude', '用量', 'token', '费用', 'anthropic'],
        toggleDescription: '显示当前工作区的 Claude token 和费用用量。'
      },
      codex: {
        title: 'Codex 用量',
        description: '在状态栏显示 Codex token 和费用用量。',
        keywords: ['状态栏', 'codex', '用量', 'token', '费用', 'openai'],
        toggleDescription: '显示当前工作区的 Codex token 和费用用量。'
      },
      gemini: {
        title: 'Gemini 用量',
        description: '在状态栏显示 Gemini token 和费用用量。',
        keywords: ['状态栏', 'gemini', '用量', 'token', '费用', 'google'],
        toggleDescription: '显示当前工作区的 Gemini token 和费用用量。'
      },
      'opencode-go': {
        title: 'OpenCode Go 用量',
        description: '在状态栏显示 OpenCode Go token 和费用用量。',
        keywords: ['状态栏', 'opencode', 'opencode-go', '用量', 'token', '费用'],
        toggleDescription: '显示当前工作区的 OpenCode Go token 和费用用量。'
      },
      ssh: {
        title: 'SSH 状态',
        description: '在状态栏显示当前 SSH 连接状态。',
        keywords: ['状态栏', 'ssh', '远程', '连接', '主机'],
        toggleDescription: '显示当前 SSH 连接。仅在配置了 SSH 目标后可见。'
      },
      'resource-usage': {
        title: '资源管理器',
        description: '在状态栏显示 CPU、内存、终端会话和工作区磁盘用量。',
        keywords: ['状态栏', '资源', '内存', 'cpu', '终端', '磁盘', '空间'],
        toggleDescription:
          '显示资源管理器。点击后可查看 CPU、内存、会话、daemon 控制和工作区磁盘扫描。'
      },
      ports: {
        title: '端口',
        description: '在状态栏显示工作区中的实时端口。',
        keywords: ['状态栏', '端口', 'localhost', 'server', 'workspace'],
        toggleDescription: '显示工作区实时端口。点击后可查看工作区端口和外部监听端口。'
      }
    }
  }
