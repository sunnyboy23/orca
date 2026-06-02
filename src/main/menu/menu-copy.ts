import type { AppLanguage } from '../../shared/types'

export type AppMenuCopy = {
  checkForUpdates: string
  settings: string
  exploreOrca: string
  reportCrash: string
  exportPdf: string
  file: string
  exit: string
  edit: string
  appearance: string
  toggleLeftSidebar: string
  toggleRightSidebar: string
  showStatusBar: string
  showTasksButton: string
  showMobileButton: string
  showTitlebarAppName: string
  view: string
  reload: string
  forceReload: string
  resetSize: string
  zoomIn: string
  zoomOut: string
  openWorktreePalette: string
  window: string
  help: string
}

const EN_MENU_COPY: AppMenuCopy = {
  checkForUpdates: 'Check for Updates...',
  settings: 'Settings',
  exploreOrca: 'Explore Orca',
  reportCrash: 'Report Crash...',
  exportPdf: 'Export as PDF...',
  file: 'File',
  exit: 'Exit',
  edit: 'Edit',
  appearance: 'Appearance',
  toggleLeftSidebar: 'Toggle Left Sidebar',
  toggleRightSidebar: 'Toggle Right Sidebar',
  showStatusBar: 'Show Status Bar',
  showTasksButton: 'Show Tasks Button',
  showMobileButton: 'Show Orca Mobile Button',
  showTitlebarAppName: 'Show Titlebar App Name',
  view: 'View',
  reload: 'Reload',
  forceReload: 'Force Reload',
  resetSize: 'Reset Size',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  openWorktreePalette: 'Open Worktree Palette',
  window: 'Window',
  help: 'Help'
}

const ZH_CN_MENU_COPY: AppMenuCopy = {
  checkForUpdates: '检查更新...',
  settings: '设置',
  exploreOrca: '了解 Orca',
  reportCrash: '报告崩溃...',
  exportPdf: '导出为 PDF...',
  file: '文件',
  exit: '退出',
  edit: '编辑',
  appearance: '外观',
  toggleLeftSidebar: '切换左侧边栏',
  toggleRightSidebar: '切换右侧边栏',
  showStatusBar: '显示状态栏',
  showTasksButton: '显示任务按钮',
  showMobileButton: '显示 Orca Mobile 按钮',
  showTitlebarAppName: '显示标题栏应用名称',
  view: '视图',
  reload: '重新加载',
  forceReload: '强制重新加载',
  resetSize: '重置大小',
  zoomIn: '放大',
  zoomOut: '缩小',
  openWorktreePalette: '打开 Worktree 面板',
  window: '窗口',
  help: '帮助'
}

export function resolveAppMenuCopy({
  appLanguage,
  systemLocale
}: {
  appLanguage?: AppLanguage
  systemLocale: string
}): AppMenuCopy {
  if (appLanguage === 'zh-CN') {
    return ZH_CN_MENU_COPY
  }
  if (appLanguage === 'en') {
    return EN_MENU_COPY
  }
  return systemLocale.toLowerCase().startsWith('zh') ? ZH_CN_MENU_COPY : EN_MENU_COPY
}
