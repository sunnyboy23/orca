import type { FloatingWorkspaceMessages } from './settings-floating-workspace-types'

export const floatingWorkspaceZhCN: FloatingWorkspaceMessages = {
  search: {
    title: '浮动工作区',
    description: '启用浮动工作区，设置新标签页的起始位置，并选择切换按钮显示在哪里。',
    keywords: [
      'floating workspace',
      'floating terminal',
      'quick terminal',
      'global',
      'terminal',
      'browser',
      'markdown',
      'note',
      'notes',
      'quick panel',
      'launch directory',
      'toggle button',
      'status bar',
      '浮动',
      '工作区',
      '终端',
      '笔记',
      '按钮',
      '状态栏'
    ]
  },
  enable: {
    label: '启用浮动工作区',
    description: '显示浮动工作区按钮和面板。'
  },
  directory: {
    label: '终端目录',
    description: '新的浮动终端标签页会从这里启动。Markdown 笔记会保存在 Orca 管理的浮动工作区中。',
    chooseAria: '选择浮动工作区目录'
  },
  toggleLocation: {
    label: '切换按钮位置',
    description: '无论按钮显示在哪里，键盘快捷键都会生效。',
    floatingButton: '浮动按钮',
    statusBar: '状态栏'
  }
}
