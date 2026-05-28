import type { SettingsBaseMessages } from './settings-types'

export const settingsBaseZhCN: SettingsBaseMessages = {
common: {
    beta: 'Beta',
    optional: '可选',
    loadingSettings: '正在加载设置...',
    noSettingsFound: (query) => `没有找到与“${query}”匹配的设置`,
    importFromGhostty: '从 Ghostty 导入'
  },
  sidebar: {
    backToApp: '返回应用',
    searchPlaceholder: '搜索设置',
    projects: '项目',
    noMatchingProjects: '没有匹配的项目设置。',
    noProjects: '还没有添加项目。'
  },
  groups: {
    setup: '设置',
    workflows: '工作流',
    interface: '界面',
    capabilities: 'AI 能力',
    remote: '远程访问',
    safety: '安全',
    experimental: '实验功能'
  },
  sections: {
    general: {
      title: '通用',
      description: '工作区默认值、应用配置和维护选项。'
    },
    agents: {
      title: 'Agent',
      description: '管理 AI Agent、默认 Agent 和自定义命令。'
    },
    accounts: {
      title: 'AI 服务账号',
      description:
        '可选。Orca 会沿用你已有的服务登录；只有需要让 Orca 帮你切换账号时，才需要在这里添加。',
      badge: '可选'
    },
    integrations: {
      title: '集成',
      description: '连接 GitHub、GitLab、Linear 和代码托管服务。'
    },
    git: {
      title: 'Git 与源码管理',
      description: '分支命名、base ref、提交署名和 AI 提交消息。'
    },
    tasks: {
      title: '任务来源',
      description: '选择哪些任务服务显示在任务页和侧边栏中。'
    },
    'floating-workspace': {
      title: '浮动工作区',
      description: '全局终端、浏览器和 Markdown 标签页。'
    },
    appearance: {
      title: '外观',
      description: '主题、缩放、应用字体、侧边栏和状态栏。'
    },
    input: {
      title: '输入与编辑',
      description: '选择和编辑行为。'
    },
    terminal: {
      title: '终端',
      description: 'Shell、终端外观和 pane 行为。'
    },
    'quick-commands': {
      title: '快捷命令',
      description: '保存常用终端命令，可按全局或项目作用域使用。'
    },
    browser: {
      title: '浏览器',
      description: '主页、链接打开方式和会话 Cookie。'
    },
    notifications: {
      title: '通知',
      description: 'Agent 活动和终端事件的系统桌面通知。'
    },
    orchestration: {
      title: '编排',
      description: '通过 Orca 协调多个编程 Agent。'
    },
    servers: {
      title: '远程 Orca 服务',
      description: '在本地桌面模式和已配对的远程 Orca runtime 之间切换。',
      webDescription: '将这个浏览器连接到已保存的 Orca 服务。',
      badge: 'Beta'
    },
    ssh: {
      title: 'SSH 主机',
      description: '用于文件、终端和 Git 的远程 SSH 主机。'
    },
    mobile: {
      title: '移动端',
      description: '用手机控制终端和 Agent。',
      badge: 'Beta'
    },
    'computer-use': {
      title: 'Computer Use',
      description: '允许 Agent 控制这台电脑上的任意应用。',
      badge: 'Beta'
    },
    voice: {
      title: '语音',
      description: '使用本机模型进行本地语音转文字听写。',
      badge: 'Beta'
    },
    'developer-permissions': {
      title: 'macOS 权限',
      description: '终端启动的开发工具所需的 macOS 隐私访问权限。'
    },
    privacy: {
      title: '隐私与遥测',
      description: '匿名使用数据和遥测控制。'
    },
    shortcuts: {
      title: '快捷键',
      description: '常用操作的键盘快捷键。'
    },
    stats: {
      title: '统计与用量',
      description: 'Orca 统计，以及 Claude、Codex、OpenCode 的用量分析。'
    },
    experimental: {
      title: '实验功能',
      description: '仍在打磨的新功能，可以先试用。'
    }
  },
  repository: {
    sectionTitle: (name) => `项目设置 > ${name}`
  },
  computerUse: {
    platformLabel: {
      windows: 'Windows',
      linux: 'Linux',
      fallback: '当前平台'
    },
    previewDetailsAria: (platform) => `${platform} Computer Use 预览说明`,
    previewDetails: (platform) =>
      `${platform} Computer Use 仍处于早期预览阶段，部分应用或桌面环境可能表现不一致。`
  }
}
